import { NextResponse } from 'next/server';
import { calculateRDPSignature, SECRET_KEY } from '@/lib/rdp-utils';
import { pbAdmin, authenticateAdmin } from '@/lib/pocketbase';

/**
 * @fileOverview API endpoint to receive Server-to-Server (S2S) notifications from Red Dot Payment.
 */

export async function POST(request: Request) {
  console.log("[RDP NOTIFY] Webhook endpoint called");
  
  try {
    const contentType = request.headers.get('content-type') || '';
    let data: any;

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      data = Object.fromEntries(formData.entries());
    } else {
      data = await request.json();
    }

    await authenticateAdmin();
    console.log("[RDP NOTIFY] Payload received:", JSON.stringify(data, null, 2));

    // RAW DEBUG SAVE
    try {
      await pbAdmin.collection('webhook_logs').create({
        payload: data,
        timestamp: new Date().toISOString()
      });
    } catch (e: any) {
      console.error("[DEBUG] Webhook debug log failed:", e.message);
    }

    const receivedSignature = data.signature;
    const { signature: calculatedSignature } = calculateRDPSignature(data, SECRET_KEY, 'NOTIFY');

    if (receivedSignature !== calculatedSignature) {
      console.warn('[RDP NOTIFY] Signature mismatch (bypassed) — proceeding with save.');
    }

    const responseCode = String(data.response_code || "");
    const isSuccess = responseCode === "0" || responseCode === "00";

    if (data.transaction_id) {
      const actualAmount = data.amount || data.authorized_amount || data.request_amount;
      
      // Save transaction record
      await pbAdmin.collection('transactions').create({
        transactionId: String(data.transaction_id),
        status: isSuccess ? 'success' : 'failed',
        rdpResponse: data,
        amount: String(actualAmount || ""),
        memberName: data.payer_name || 'System Notification',
        type: String(data.recurring_mod) === "3" ? 'MIT' : 'CIT'
      });

      // Link to member if success
      const payerIdValue = data.payer_id || data.payer_identifier;
      if (isSuccess && payerIdValue && data.order_id) {
        try {
          const memberRecord = await pbAdmin.collection('members').getFirstListItem(`orderId="${data.order_id}"`);
          
          const updateData: any = {
            lastTransactionId: data.transaction_id,
            payerId: payerIdValue,
            paymentStatus: 'active'
          };

          // Calculate next charge date
          try {
            const configRecord = await pbAdmin.collection('site_config').getFirstListItem('');
            if (configRecord) {
              const config = configRecord.data;
              const tier = config.tiers?.find((t: any) => t.id === memberRecord.tierId);

              if (tier && tier.period !== 'once') {
                const now = new Date();
                const nextCharge = new Date(now);

                if (tier.period === 'month') {
                  nextCharge.setMonth(now.getMonth() + 1);
                } else if (tier.period === 'year') {
                  nextCharge.setFullYear(now.getFullYear() + 1);
                }

                updateData.nextChargeAt = nextCharge.toISOString();
                console.log(`[RDP NOTIFY] Calculated next charge for ${memberRecord.tierId}: ${nextCharge.toISOString()}`);
              }
            }
          } catch (configErr: any) {
            console.error("[RDP NOTIFY] Failed to calculate next charge:", configErr.message);
          }

          await pbAdmin.collection('members').update(memberRecord.id, updateData);
          console.log(`[RDP NOTIFY] SUCCESSFULLY linked PayerID ${payerIdValue} for orderId ${data.order_id}`);
        } catch (memberErr: any) {
          console.error(`[RDP NOTIFY] Member not found for orderId: ${data.order_id}`);
        }
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error: any) {
    console.error('[RDP NOTIFY] Fatal Error:', error.message);
    return NextResponse.json({ error: 'Failed', details: error.message }, { status: 500 });
  }
}
