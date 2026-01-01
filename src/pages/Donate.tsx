import { useState } from 'react';
import { useDonations } from '../hooks/useDonations';
import { Heart, Trophy, Star, Gift, Users, Check, Sparkles } from 'lucide-react';

const BADGE_ICONS: Record<string, typeof Heart> = {
  supporter: Heart,
  champion: Trophy,
  hero: Star,
};

const BADGE_COLORS: Record<string, string> = {
  supporter: 'text-pink-500',
  champion: 'text-amber-500',
  hero: 'text-emerald-500',
};

export function Donate() {
  const { tiers, topDonors, recentDonors, totalRaised, donate, loading } = useDonations();
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDonate = async () => {
    const tier = tiers.find(t => t.id === selectedTier);
    const amount = tier?.amount_inr || parseInt(customAmount) || 0;

    if (amount < 10) {
      setError('Minimum donation amount is Rs 10');
      return;
    }

    setProcessing(true);
    setError(null);

    const result = await donate(amount, selectedTier || undefined, message || undefined, isAnonymous);

    setProcessing(false);

    if (result.success) {
      setSuccess(true);
      setSelectedTier(null);
      setCustomAmount('');
      setMessage('');
      setTimeout(() => setSuccess(false), 5000);
    } else {
      setError(result.error || 'Failed to process donation');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-pink-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-pink-500/10 text-pink-400 px-4 py-2 rounded-full mb-4">
          <Heart className="w-4 h-4" />
          <span className="text-sm font-medium">Support Free Education</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">Help Keep Education Free</h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Your contribution helps us maintain free access to quality tech education for everyone.
          Every rupee goes towards server costs, content creation, and keeping this platform ad-free.
        </p>
      </div>

      <div className="bg-gradient-to-r from-pink-900/20 to-rose-900/20 border border-pink-800/30 rounded-xl p-6 text-center">
        <p className="text-gray-400 mb-2">Total Raised</p>
        <p className="text-4xl font-bold text-white">
          Rs {totalRaised.toLocaleString()}
        </p>
        <p className="text-pink-400 text-sm mt-2">
          Thank you to all our amazing supporters!
        </p>
      </div>

      {success && (
        <div className="bg-emerald-900/20 border border-emerald-800 rounded-xl p-6 text-center">
          <Sparkles className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-white mb-2">Thank You!</h3>
          <p className="text-gray-400">
            Your generous donation helps keep education free for everyone.
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 text-red-400">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Choose Your Impact</h2>

            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              {tiers.map(tier => {
                const Icon = BADGE_ICONS[tier.badge_icon || 'supporter'] || Gift;
                const isSelected = selectedTier === tier.id;

                return (
                  <button
                    key={tier.id}
                    onClick={() => {
                      setSelectedTier(tier.id);
                      setCustomAmount('');
                    }}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      isSelected
                        ? 'border-pink-500 bg-pink-500/10'
                        : 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${
                      isSelected ? 'bg-pink-500/20' : 'bg-gray-700'
                    }`}>
                      <Icon className={`w-5 h-5 ${isSelected ? 'text-pink-400' : 'text-gray-400'}`} />
                    </div>
                    <h3 className="font-semibold text-white mb-1">{tier.name}</h3>
                    <p className="text-2xl font-bold text-white mb-2">Rs {tier.amount_inr}</p>
                    <ul className="space-y-1">
                      {tier.benefits.slice(0, 2).map((benefit, idx) => (
                        <li key={idx} className="text-gray-400 text-xs flex items-start gap-1">
                          <Check className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </button>
                );
              })}
            </div>

            <div className="mb-6">
              <label className="text-gray-400 text-sm mb-2 block">Or enter custom amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">Rs</span>
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setSelectedTier(null);
                  }}
                  placeholder="100"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="text-gray-400 text-sm mb-2 block">Leave a message (optional)</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Share why you're supporting free education..."
                rows={3}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 resize-none"
              />
            </div>

            <label className="flex items-center gap-3 mb-6 cursor-pointer">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-5 h-5 rounded border-gray-700 bg-gray-800 text-pink-500 focus:ring-pink-500"
              />
              <span className="text-gray-300">Make my donation anonymous</span>
            </label>

            <button
              onClick={handleDonate}
              disabled={processing || (!selectedTier && !customAmount)}
              className="w-full py-3 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2"
            >
              {processing ? (
                'Processing...'
              ) : (
                <>
                  <Heart className="w-5 h-5" />
                  Donate Rs {selectedTier ? tiers.find(t => t.id === selectedTier)?.amount_inr : customAmount || '0'}
                </>
              )}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              Top Supporters
            </h2>

            {topDonors.length > 0 ? (
              <div className="space-y-3">
                {topDonors.slice(0, 5).map((donor, idx) => {
                  const BadgeIcon = donor.badge_type ? BADGE_ICONS[donor.badge_type] : Gift;
                  const badgeColor = donor.badge_type ? BADGE_COLORS[donor.badge_type] : 'text-gray-400';

                  return (
                    <div key={donor.id} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        idx === 0 ? 'bg-amber-500 text-black' :
                        idx === 1 ? 'bg-gray-400 text-black' :
                        idx === 2 ? 'bg-orange-600 text-white' :
                        'bg-gray-700 text-gray-300'
                      }`}>
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <p className="text-white text-sm truncate">{donor.display_name}</p>
                          {donor.badge_type && (
                            <BadgeIcon className={`w-3 h-3 ${badgeColor}`} />
                          )}
                        </div>
                      </div>
                      <span className="text-emerald-400 text-sm font-medium">
                        Rs {donor.amount_inr}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                Be the first to donate!
              </p>
            )}
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              Recent Supporters
            </h2>

            {recentDonors.length > 0 ? (
              <div className="space-y-3">
                {recentDonors.slice(0, 5).map(donor => (
                  <div key={donor.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                      {donor.display_name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm">{donor.display_name}</p>
                      {donor.message && (
                        <p className="text-gray-500 text-xs truncate">{donor.message}</p>
                      )}
                    </div>
                    <span className="text-emerald-400 text-xs">
                      Rs {donor.amount_inr}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                No recent donations yet.
              </p>
            )}
          </div>

          <div className="bg-gradient-to-b from-gray-900 to-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h3 className="font-semibold text-white mb-3">Where Your Money Goes</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                Server and hosting costs
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                Content creation and updates
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                New feature development
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                Keeping the platform ad-free
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
