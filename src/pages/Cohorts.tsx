import { useState } from 'react';
import { useCohort } from '../hooks/useCohort';
import { useSubscription } from '../hooks/useSubscription';
import { Users, Calendar, Trophy, MessageSquare, Crown, Lock, ChevronRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Cohorts() {
  const {
    availableCohorts,
    myCohort,
    myMembership,
    members,
    activities,
    leaderboard,
    loading,
    isInCohort,
    joinCohort,
    leaveCohort
  } = useCohort();
  const { isSubscribed, tierName, hasFeature } = useSubscription();
  const [joining, setJoining] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canAccessCohorts = hasFeature('cohort_access');

  const handleJoinCohort = async (cohortId: string) => {
    setJoining(cohortId);
    setError(null);
    const result = await joinCohort(cohortId);
    setJoining(null);

    if (!result.success) {
      setError(result.error || 'Failed to join cohort');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!canAccessCohorts && !isInCohort) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-gradient-to-b from-gray-900 to-gray-900/50 border border-gray-800 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Unlock Learning Cohorts</h2>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Join a cohort of learners on the same journey. Get peer accountability,
            compete on leaderboards, and achieve your goals together.
          </p>
          <Link
            to="/subscriptions"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium px-6 py-3 rounded-lg transition-all"
          >
            <Crown className="w-5 h-5" />
            Upgrade to Pro
          </Link>
          <p className="text-gray-500 text-sm mt-4">
            Cohort access requires a Pro subscription (Rs 100/month)
          </p>
        </div>
      </div>
    );
  }

  if (isInCohort && myCohort) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">{myCohort.name}</h1>
            <p className="text-gray-400">Batch #{myCohort.batch_number}</p>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <Users className="w-5 h-5" />
            <span>{myCohort.current_members}/{myCohort.max_members} members</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 text-red-400">
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                Weekly Leaderboard
              </h2>

              {leaderboard.length > 0 ? (
                <div className="space-y-3">
                  {leaderboard.map((entry, idx) => (
                    <div
                      key={entry.id}
                      className={`flex items-center gap-4 p-3 rounded-lg ${
                        idx === 0 ? 'bg-amber-500/10 border border-amber-500/20' :
                        idx === 1 ? 'bg-gray-500/10 border border-gray-500/20' :
                        idx === 2 ? 'bg-orange-500/10 border border-orange-500/20' :
                        'bg-gray-800/50'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        idx === 0 ? 'bg-amber-500 text-black' :
                        idx === 1 ? 'bg-gray-400 text-black' :
                        idx === 2 ? 'bg-orange-600 text-white' :
                        'bg-gray-700 text-gray-300'
                      }`}>
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">
                          {entry.profile?.display_name || 'Anonymous'}
                        </p>
                        <p className="text-gray-500 text-sm">
                          {entry.topics_completed} topics, {entry.problems_solved} problems
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-emerald-400 font-bold">{entry.points}</p>
                        <p className="text-gray-500 text-xs">points</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No leaderboard data for this week yet. Start learning to earn points!
                </p>
              )}
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-emerald-500" />
                Active Challenges
              </h2>

              {activities.length > 0 ? (
                <div className="space-y-4">
                  {activities.slice(0, 5).map(activity => (
                    <div
                      key={activity.id}
                      className="bg-gray-800/50 border border-gray-700 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-white font-medium">{activity.title}</h3>
                        <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded text-xs">
                          +{activity.points_reward} pts
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm">{activity.description}</p>
                      {activity.end_date && (
                        <p className="text-gray-500 text-xs mt-2">
                          Ends: {new Date(activity.end_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No active challenges at the moment.
                </p>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                Cohort Members
              </h2>

              <div className="space-y-3">
                {members.slice(0, 8).map(member => (
                  <div key={member.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-sm font-medium">
                      {member.profile?.display_name?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm">
                        {member.profile?.display_name || 'Anonymous'}
                      </p>
                      {member.role !== 'member' && (
                        <span className="text-xs text-emerald-400 capitalize">{member.role}</span>
                      )}
                    </div>
                  </div>
                ))}
                {members.length > 8 && (
                  <p className="text-gray-500 text-sm text-center">
                    +{members.length - 8} more members
                  </p>
                )}
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-500" />
                Cohort Info
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Status</span>
                  <span className={`capitalize ${
                    myCohort.status === 'active' ? 'text-emerald-400' : 'text-gray-300'
                  }`}>
                    {myCohort.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Started</span>
                  <span className="text-white">
                    {new Date(myCohort.start_date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Ends</span>
                  <span className="text-white">
                    {new Date(myCohort.end_date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Join a Learning Cohort</h1>
        <p className="text-gray-400">
          Learn alongside peers, compete on leaderboards, and stay accountable together.
        </p>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 text-red-400">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {availableCohorts.map(cohort => {
          const isFull = cohort.current_members >= cohort.max_members;
          const spotsLeft = cohort.max_members - cohort.current_members;

          return (
            <div
              key={cohort.id}
              className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{cohort.name}</h3>
                  <p className="text-gray-500 text-sm">Batch #{cohort.batch_number}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  cohort.status === 'active'
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-blue-500/10 text-blue-400'
                }`}>
                  {cohort.status === 'active' ? 'In Progress' : 'Upcoming'}
                </span>
              </div>

              <p className="text-gray-400 text-sm mb-4">{cohort.description}</p>

              <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(cohort.start_date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{cohort.current_members}/{cohort.max_members}</span>
                </div>
              </div>

              {!isFull && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2 mb-4">
                  <p className="text-emerald-400 text-sm">
                    {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} remaining
                  </p>
                </div>
              )}

              <button
                onClick={() => handleJoinCohort(cohort.id)}
                disabled={isFull || joining === cohort.id}
                className={`w-full py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                  isFull
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white'
                }`}
              >
                {joining === cohort.id ? (
                  'Joining...'
                ) : isFull ? (
                  'Cohort Full'
                ) : (
                  <>
                    Join Cohort
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {availableCohorts.length === 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
          <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Cohorts Available</h3>
          <p className="text-gray-400">
            New cohorts are announced regularly. Check back soon!
          </p>
        </div>
      )}
    </div>
  );
}
