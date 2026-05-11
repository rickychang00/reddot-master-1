'use client';

import { pb } from './pocketbase';

export type FieldType = 'text' | 'number' | 'email' | 'file' | 'select' | 'textarea';

export interface NavLink {
  id: string;
  label: string;
  href: string;
}

export interface RegistrationField {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  options?: string[];
  placeholder?: string;
}

export interface FeatureSection {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  tip?: string;
  imageRight?: boolean;
}

export interface MembershipTier {
  id: string;
  name: string;
  price: string;
  period: 'month' | 'year' | 'once';
  description: string;
  features: string[];
  color: string;
  isPopular?: boolean;
  hidden?: boolean;
}

export interface SiteConfig {
  companyName: string;
  companyLogoUrl: string;
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl: string;
  heroButtons: NavLink[];
  pricingTitle: string;
  pricingSubtitle: string;
  features: FeatureSection[];
  tiers: MembershipTier[];
  navLinks: NavLink[];
  registrationFields: RegistrationField[];
}

export interface MemberProfile {
  id?: string;
  email: string;
  name: string;
  tierId: string;
  hasPaymentConsent: boolean;
  registeredAt?: string;
  selectedDate?: string;
  lastTransactionId?: string;
  payerId?: string;
  orderId?: string;
  nextChargeAt?: string;
  paymentStatus?: 'active' | 'inactive' | 'failed' | 'completed';
  rdpResponse?: any; // To store the full verification map
}

export interface TransactionRecord {
  id?: string;
  memberId: string;
  memberName: string;
  amount: string;
  tierName: string;
  type: 'CIT' | 'MIT';
  timestamp?: string;
  status: 'success' | 'pending' | 'failed';
  transactionId?: string;
  rdpResponse?: any;
}

export const INITIAL_CONFIG: SiteConfig = {
  companyName: 'Tiered Access Hub',
  companyLogoUrl: '',
  heroBadge: 'PREMIUM MEMBERSHIP HUB',
  heroTitle: 'Unlock Your Business Potential',
  heroSubtitle: 'Choose a membership tier that fits your professional needs and get access to premium tools and community insights.',
  heroImageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80',
  heroButtons: [
    { id: 'hero_primary', label: 'Join Now', href: '/register' },
    { id: 'hero_secondary', label: 'Explore Tiers', href: '/#tiers' },
  ],
  pricingTitle: 'Simple, Transparent Pricing',
  pricingSubtitle: 'Choose the membership that best supports your career or business goals.',
  features: [
    {
      id: 'feature_1',
      title: 'Powerful CMS Capabilities',
      description: 'As an administrator, you have complete control over this landing page. Modify tiers, update registration fields for business compliance, and change site messaging instantly without touching code.',
      imageUrl: 'https://picsum.photos/seed/cms-preview/800/600',
      tip: 'Use the custom registration fields to collect business IDs or professional certifications during onboarding.',
      imageRight: true
    }
  ],
  tiers: [
    {
      id: 'aircon',
      name: 'Aircon Lesson',
      price: '$150',
      period: 'once',
      description: 'Ideal for individuals exploring our platform',
      features: ['Basic community access', 'Standard support', 'Monthly newsletter'],
      color: '#9D4EDD',
      hidden: false,
    },
    {
      id: 'innovation',
      name: 'Product and Service Innovation',
      price: '$360',
      period: 'once',
      description: 'Best for growing businesses and serious professionals',
      features: ['Everything in Starter', 'Priority support', 'Advanced analytics', 'Exclusive webinars'],
      color: '#9D4EDD',
      isPopular: true,
      hidden: false,
    },
    {
      id: 'customer_excellence',
      name: 'Customer Service Excellence',
      price: '$360',
      period: 'once',
      description: 'Full-scale solutions for large organizations',
      features: ['Everything in Pro', 'Dedicated account manager', 'Custom API access', 'Onboarding training'],
      color: '#9D4EDD',
      hidden: false,
    }
  ],
  navLinks: [
    { id: 'nav_home', label: 'Home', href: '/' },
    { id: 'nav_pricing', label: 'Pricing', href: '/#tiers' },
  ],
  registrationFields: [
    { id: 'full_name', label: 'Full Name', type: 'text', required: true, placeholder: 'John Doe' },
    { id: 'email', label: 'Email Address', type: 'email', required: true, placeholder: 'john@example.com' },
    { id: 'business_reg', label: 'NRIC', type: 'text', required: false, placeholder: 'Optional for tax purposes' },
  ],
};

export async function updateSiteConfig(newConfig: SiteConfig) {
  try {
    // In PocketBase, we'll use a single record in 'site_config'
    const records = await pb.collection('site_config').getFullList({ limit: 1 });
    if (records.length > 0) {
      await pb.collection('site_config').update(records[0].id, { data: newConfig });
    } else {
      await pb.collection('site_config').create({ data: newConfig });
    }
  } catch (err: any) {
    console.error("Failed to update site config:", err.message);
    throw err;
  }
}

export async function saveMember(member: Omit<MemberProfile, 'registeredAt'>) {
  try {
    const record = await pb.collection('members').create(member);
    return record;
  } catch (err: any) {
    console.error("Failed to save member:", err.message);
    throw err;
  }
}

export async function linkTransactionToMember(memberId: string, transactionId: string, payerId?: string, rdpResponse?: any) {
  try {
    // 1. Fetch current member to get tierId
    const member = await pb.collection('members').getOne(memberId);
    
    const updateData: any = {
      lastTransactionId: transactionId,
      paymentStatus: 'active',
      rdpResponse: rdpResponse || null
    };
    if (payerId) updateData.payerId = payerId;

    // 2. Try to calculate nextChargeAt if it's a recurring tier
    try {
      const configRecords = await pb.collection('site_config').getFullList({ limit: 1 });
      if (configRecords.length > 0) {
        const config = configRecords[0].data as SiteConfig;
        const tier = config.tiers.find(t => t.id === member.tierId);
        
        if (tier && tier.period !== 'once') {
          const nextDate = new Date();
          if (tier.period === 'month') nextDate.setMonth(nextDate.getMonth() + 1);
          if (tier.period === 'year') nextDate.setFullYear(nextDate.getFullYear() + 1);
          updateData.nextChargeAt = nextDate.toISOString();
        }
      }
    } catch (e) {}

    await pb.collection('members').update(memberId, updateData);
    return true;
  } catch (error: any) {
    console.error("Failed to link transaction directly:", error.message);
    return false;
  }
}

export async function recordTransaction(record: Omit<TransactionRecord, 'timestamp' | 'status'>, transactionId?: string) {
  const data = {
    ...record,
    status: 'success'
  };

  try {
    if (transactionId) {
      // Use the provided transactionId as the custom ID if possible, 
      // but PocketBase IDs are auto-generated. We store RDP's transaction_id in a field.
      await pb.collection('transactions').create({
        ...data,
        transactionId: transactionId
      });
    } else {
      await pb.collection('transactions').create(data);
    }
  } catch (err: any) {
    console.error("Failed to record transaction:", err.message);
    throw err;
  }
}
