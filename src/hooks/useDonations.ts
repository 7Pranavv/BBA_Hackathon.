import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type DonationTier = Database['public']['Tables']['donation_tiers']['Row'];
type Donation = Database['public']['Tables']['donations']['Row'];
type SupporterBadge = Database['public']['Tables']['supporter_badges']['Row'];

interface DonorDisplay {
  id: string;
  display_name: string;
  avatar_url: string | null;
  amount_inr: number;
  message: string | null;
  created_at: string;
  badge_type: string | null;
}

interface DonationsState {
  tiers: DonationTier[];
  myDonations: Donation[];
  myBadges: SupporterBadge[];
  topDonors: DonorDisplay[];
  recentDonors: DonorDisplay[];
  totalRaised: number;
  loading: boolean;
}

export function useDonations() {
  const { user } = useAuth();
  const [state, setState] = useState<DonationsState>({
    tiers: [],
    myDonations: [],
    myBadges: [],
    topDonors: [],
    recentDonors: [],
    totalRaised: 0,
    loading: true,
  });

  useEffect(() => {
    loadDonationsData();
  }, [user]);

  const loadDonationsData = async () => {
    const { data: tiers } = await supabase
      .from('donation_tiers')
      .select('*')
      .order('display_order');

    const { data: publicDonations } = await supabase
      .from('donations')
      .select(`
        id,
        amount_inr,
        message,
        created_at,
        user_id,
        profile:user_profiles(display_name, avatar_url)
      `)
      .eq('is_anonymous', false)
      .order('created_at', { ascending: false })
      .limit(50);

    const recentDonors: DonorDisplay[] = (publicDonations || []).slice(0, 10).map((d: any) => ({
      id: d.id,
      display_name: d.profile?.display_name || 'Anonymous',
      avatar_url: d.profile?.avatar_url,
      amount_inr: d.amount_inr,
      message: d.message,
      created_at: d.created_at,
      badge_type: getBadgeType(d.amount_inr),
    }));

    const donorTotals = new Map<string, { total: number; profile: any; latestMessage: string | null }>();
    (publicDonations || []).forEach((d: any) => {
      const current = donorTotals.get(d.user_id) || { total: 0, profile: d.profile, latestMessage: null };
      current.total += d.amount_inr;
      if (!current.latestMessage) current.latestMessage = d.message;
      donorTotals.set(d.user_id, current);
    });

    const topDonors: DonorDisplay[] = Array.from(donorTotals.entries())
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 10)
      .map(([userId, data]) => ({
        id: userId,
        display_name: data.profile?.display_name || 'Anonymous',
        avatar_url: data.profile?.avatar_url,
        amount_inr: data.total,
        message: data.latestMessage,
        created_at: '',
        badge_type: getBadgeType(data.total),
      }));

    const totalRaised = (publicDonations || []).reduce((sum: number, d: any) => sum + d.amount_inr, 0);

    let myDonations: Donation[] = [];
    let myBadges: SupporterBadge[] = [];

    if (user) {
      const { data: userDonations } = await supabase
        .from('donations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      myDonations = userDonations || [];

      const { data: badges } = await supabase
        .from('supporter_badges')
        .select('*')
        .eq('user_id', user.id);

      myBadges = badges || [];
    }

    setState({
      tiers: tiers || [],
      myDonations,
      myBadges,
      topDonors,
      recentDonors,
      totalRaised,
      loading: false,
    });
  };

  const donate = async (amount: number, tierId?: string, message?: string, isAnonymous = false) => {
    if (!user) return { success: false, error: 'Not authenticated' };

    try {
      const { data: transaction, error: txError } = await supabase
        .from('payment_transactions')
        .insert({
          user_id: user.id,
          amount_inr: amount,
          payment_type: 'donation',
          status: 'completed',
          metadata: { tier_id: tierId, message },
        })
        .select()
        .single();

      if (txError) throw txError;

      const { error: donationError } = await supabase
        .from('donations')
        .insert({
          user_id: user.id,
          tier_id: tierId || null,
          amount_inr: amount,
          message: message || null,
          is_anonymous: isAnonymous,
          payment_transaction_id: transaction.id,
        });

      if (donationError) throw donationError;

      const badgeType = getBadgeType(amount);
      if (badgeType) {
        await supabase
          .from('supporter_badges')
          .upsert({
            user_id: user.id,
            badge_type: badgeType as any,
          }, { onConflict: 'user_id,badge_type' });
      }

      await loadDonationsData();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  return {
    ...state,
    donate,
    refresh: loadDonationsData,
  };
}

function getBadgeType(amount: number): string | null {
  if (amount >= 1000) return 'hero';
  if (amount >= 500) return 'champion';
  if (amount >= 100) return 'supporter';
  return null;
}
