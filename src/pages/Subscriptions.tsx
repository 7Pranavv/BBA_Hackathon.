import { useState } from 'react';
import { useSubscription } from '../hooks/useSubscription';
import { Check, Crown, Zap, Shield, Users, Target, Calendar, CreditCard, X } from 'lucide-react';

const BASIC_FEATURES = [
  { icon: Target, text: 'Daily personalized goals' },
  { icon: Shield, text: 'Basic streak protection (1/month)' },
  { icon: Calendar, text: 'Weekly progress reports' },
];

const PRO_FEATURES = [
  { icon: Target, text: 'Daily personalized goals' },
  { icon: Shield, text: 'Full streak protection (unlimited)' },
  { icon: Calendar, text: 'Weekly progress reports' },
  { icon: Users, text: 'Access to learning cohorts' },
  { icon: Zap, text: 'Priority support' },
  { icon: Crown, text: 'Early access to new features' },
];

export function Subscriptions() {
  const { tiers, currentSubscription, isSubscribed, subscribe, cancelSubscription, loading } = useSubscription();
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubscribe = async (tierId: string) => {
    setProcessing(true);
    setError(null);
    const result = await subscribe(tierId);
    setProcessing(false);

    if (result.success) {
      setSuccess('Successfully subscribed! Welcome aboard.');
      setTimeout(() => setSuccess(null), 3000);
    } else {
      setError(result.error || 'Failed to subscribe');
    }
  };

  const handleCancel = async () => {
    setProcessing(true);
    setError(null);
    const result = await cancelSubscription();
    setProcessing(false);
    setShowCancelModal(false);

    if (result.success) {
      setSuccess('Subscription cancelled. You will retain access until the end of your billing period.');
      setTimeout(() => setSuccess(null), 5000);
    } else {
      setError(result.error || 'Failed to cancel subscription');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const basicTier = tiers.find(t => t.name === 'Basic');
  const proTier = tiers.find(t => t.name === 'Pro');

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-3">Stay Accountable, Stay Ahead</h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Our free education remains free forever. Subscriptions unlock accountability features
          to help you build consistent learning habits.
        </p>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-emerald-900/20 border border-emerald-800 rounded-lg p-4 text-emerald-400">
          {success}
        </div>
      )}

      {isSubscribed && currentSubscription && (
        <div className="bg-gradient-to-r from-emerald-900/30 to-teal-900/30 border border-emerald-800/50 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-5 h-5 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">Active Subscription</span>
              </div>
              <h3 className="text-xl font-bold text-white">
                {currentSubscription.tier?.name} Plan
              </h3>
              <p className="text-gray-400 text-sm mt-1">
                {currentSubscription.status === 'cancelled'
                  ? `Access until ${new Date(currentSubscription.expires_at).toLocaleDateString()}`
                  : `Renews on ${new Date(currentSubscription.expires_at).toLocaleDateString()}`
                }
              </p>
            </div>
            {currentSubscription.status === 'active' && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="text-gray-400 hover:text-red-400 transition-colors text-sm"
              >
                Cancel Subscription
              </button>
            )}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {basicTier && (
          <div
            className={`bg-gray-900 border rounded-xl p-6 transition-all ${
              selectedTier === basicTier.id
                ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                : 'border-gray-800 hover:border-gray-700'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Basic</h3>
              <div className="bg-gray-800 px-3 py-1 rounded-full">
                <span className="text-gray-300 text-sm">Starter</span>
              </div>
            </div>

            <div className="mb-6">
              <span className="text-4xl font-bold text-white">Rs {basicTier.price_inr}</span>
              <span className="text-gray-400">/month</span>
            </div>

            <ul className="space-y-3 mb-8">
              {BASIC_FEATURES.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-3 text-gray-300">
                  <div className="p-1 bg-emerald-500/10 rounded">
                    <feature.icon className="w-4 h-4 text-emerald-500" />
                  </div>
                  {feature.text}
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSubscribe(basicTier.id)}
              disabled={processing || (isSubscribed && currentSubscription?.tier_id === basicTier.id)}
              className={`w-full py-3 rounded-lg font-medium transition-all ${
                isSubscribed && currentSubscription?.tier_id === basicTier.id
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-800 hover:bg-gray-700 text-white'
              }`}
            >
              {isSubscribed && currentSubscription?.tier_id === basicTier.id
                ? 'Current Plan'
                : processing ? 'Processing...' : 'Get Basic'
              }
            </button>
          </div>
        )}

        {proTier && (
          <div
            className={`relative bg-gradient-to-b from-emerald-900/20 to-gray-900 border rounded-xl p-6 transition-all ${
              selectedTier === proTier.id
                ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                : 'border-emerald-800/50 hover:border-emerald-700/50'
            }`}
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-1 rounded-full">
                <span className="text-white text-sm font-medium">Most Popular</span>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4 mt-2">
              <h3 className="text-xl font-bold text-white">Pro</h3>
              <div className="bg-emerald-500/10 px-3 py-1 rounded-full">
                <span className="text-emerald-400 text-sm">Best Value</span>
              </div>
            </div>

            <div className="mb-6">
              <span className="text-4xl font-bold text-white">Rs {proTier.price_inr}</span>
              <span className="text-gray-400">/month</span>
            </div>

            <ul className="space-y-3 mb-8">
              {PRO_FEATURES.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-3 text-gray-300">
                  <div className="p-1 bg-emerald-500/10 rounded">
                    <feature.icon className="w-4 h-4 text-emerald-500" />
                  </div>
                  {feature.text}
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSubscribe(proTier.id)}
              disabled={processing || (isSubscribed && currentSubscription?.tier_id === proTier.id)}
              className={`w-full py-3 rounded-lg font-medium transition-all ${
                isSubscribed && currentSubscription?.tier_id === proTier.id
                  ? 'bg-emerald-800 text-emerald-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white'
              }`}
            >
              {isSubscribed && currentSubscription?.tier_id === proTier.id
                ? 'Current Plan'
                : processing ? 'Processing...' : 'Get Pro'
              }
            </button>
          </div>
        )}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-gray-400" />
          Payment Information
        </h3>
        <div className="text-gray-400 space-y-2 text-sm">
          <p>All payments are processed securely. Your subscription will automatically renew each month unless cancelled.</p>
          <p>You can cancel anytime and retain access until the end of your billing period.</p>
        </div>
      </div>

      {showCancelModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Cancel Subscription</h3>
              <button onClick={() => setShowCancelModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-400 mb-6">
              Are you sure you want to cancel? You'll lose access to accountability features
              at the end of your current billing period.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Keep Subscription
              </button>
              <button
                onClick={handleCancel}
                disabled={processing}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                {processing ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
