import { NextResponse } from 'next/server';
import { pbAdmin, authenticateAdmin } from '@/lib/pocketbase';
import { requestRDPMITPayment } from '@/app/actions/payment';

/**
 * @fileOverview Daily cron job to process recurring subscription charges.
 */

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response('Unauthorized', { status: 401 });
    }

    await authenticateAdmin();
    const now = new Date();
    const nowStr = now.toISOString().replace('T', ' ').replace('Z', ''); // PocketBase format

    console.log(`[CRON] Execution started at ${now.toISOString()}`);

    try {
        // 1. Fetch site config
        const configRecord = await pbAdmin.collection('site_config').getFirstListItem('');
        if (!configRecord) {
            return NextResponse.json({ error: 'System Configuration not found' }, { status: 500 });
        }
        const config = configRecord.data;

        // 2. Find all active members due for renewal
        const members = await pbAdmin.collection('members').getFullList({
            filter: `nextChargeAt <= "${nowStr}" && paymentStatus = "active"`,
        });

        console.log(`[CRON] Found ${members.length} members due for charge.`);
        const results = [];

        for (const member of members) {
            const tier = config.tiers?.find((t: any) => t.id === member.tierId);

            if (!tier) {
                console.warn(`[CRON] Member ${member.id} skipped - Tier ${member.tierId} not found.`);
                continue;
            }

            if (!member.payerId || !member.lastTransactionId) {
                console.warn(`[CRON] Member ${member.id} skipped - Missing payerId or token.`);
                continue;
            }

            const amount = parseInt(tier.price.replace(/[^0-9]/g, ''));
            const orderId = `M${member.id.slice(-6)}${Date.now()}`;

            console.log(`[CRON] Charging ${member.name} (${member.id}): ${tier.price}`);

            const paymentResult = await requestRDPMITPayment({
                payerName: member.name,
                payerEmail: member.email,
                orderId: orderId,
                amount: amount,
                parentTransactionId: member.lastTransactionId,
                payerId: member.payerId
            });

            if (paymentResult.success) {
                const nextChargeDate = new Date();
                if (tier.period === 'month') {
                    nextChargeDate.setMonth(nextChargeDate.getMonth() + 1);
                } else if (tier.period === 'year') {
                    nextChargeDate.setFullYear(nextChargeDate.getFullYear() + 1);
                } else {
                    await pbAdmin.collection('members').update(member.id, { paymentStatus: 'completed' });
                    results.push({ memberId: member.id, status: 'converted_to_once' });
                    continue;
                }

                const transactionId = paymentResult.data.transaction_id;

                await pbAdmin.collection('members').update(member.id, {
                    nextChargeAt: nextChargeDate.toISOString(),
                    lastTransactionId: transactionId,
                    lastChargeResult: 'success',
                    lastChargeDate: new Date().toISOString()
                });

                await pbAdmin.collection('transactions').create({
                    status: 'success',
                    rdpResponse: paymentResult.data,
                    amount: String(amount),
                    memberName: member.name,
                    memberId: member.id,
                    type: 'MIT',
                    orderId: orderId,
                    tierName: tier.name,
                    transactionId: String(transactionId)
                });

                results.push({ memberId: member.id, status: 'success', transactionId });
            } else {
                await pbAdmin.collection('members').update(member.id, {
                    paymentStatus: 'failed',
                    lastChargeResult: 'failed',
                    lastError: paymentResult.error,
                    lastChargeDate: new Date().toISOString()
                });
                results.push({ memberId: member.id, status: 'failed', error: paymentResult.error });
            }
        }

        return NextResponse.json({ success: true, processed: members.length, results });

    } catch (error: any) {
        console.error('[CRON FATAL] Execution failed:', error.message);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
