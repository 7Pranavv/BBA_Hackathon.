import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Users, Video, FileText, Briefcase, Clock, Zap, MessageCircle, Code, Star, Calendar, X, Check } from 'lucide-react';
import type { Database } from '../lib/database.types';

type Mentor = Database['public']['Tables']['mentor_profiles']['Row'];
type SessionType = Database['public']['Tables']['mentor_session_types']['Row'];

interface MentorWithProfile extends Mentor {
  profile?: { display_name: string; avatar_url: string | null };
}

export function Mentorship() {
  const { user } = useAuth();
  const [mentors, setMentors] = useState<MentorWithProfile[]>([]);
  const [sessionTypes, setSessionTypes] = useState<SessionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMentor, setSelectedMentor] = useState<MentorWithProfile | null>(null);
  const [selectedSessionType, setSelectedSessionType] = useState<SessionType | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [prepNotes, setPrepNotes] = useState('');
  const [booking, setBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [mentorsResult, typesResult] = await Promise.all([
      supabase
        .from('mentor_profiles')
        .select('*, profile:user_profiles(display_name, avatar_url)')
        .eq('accepts_quick_sessions', true)
        .order('hourly_rate'),
      supabase
        .from('mentor_session_types')
        .select('*')
        .eq('is_active', true)
        .order('display_order')
    ]);

    setMentors((mentorsResult.data as MentorWithProfile[]) || []);
    setSessionTypes(typesResult.data || []);
    setLoading(false);
  };

  const handleBookSession = async () => {
    if (!user || !selectedMentor || !selectedSessionType || !bookingDate || !bookingTime) {
      setError('Please fill in all required fields');
      return;
    }

    setBooking(true);
    setError(null);

    try {
      const scheduledAt = new Date(`${bookingDate}T${bookingTime}`).toISOString();

      const { data: transaction, error: txError } = await supabase
        .from('payment_transactions')
        .insert({
          user_id: user.id,
          amount_inr: selectedSessionType.price_inr,
          payment_type: 'quick_session',
          status: 'completed',
          metadata: {
            mentor_id: selectedMentor.id,
            session_type_id: selectedSessionType.id,
            session_type_name: selectedSessionType.name
          }
        })
        .select()
        .single();

      if (txError) throw txError;

      const { error: bookingError } = await supabase
        .from('quick_mentor_bookings')
        .insert({
          mentor_id: selectedMentor.id,
          student_id: user.id,
          session_type_id: selectedSessionType.id,
          scheduled_at: scheduledAt,
          duration_minutes: selectedSessionType.duration_minutes,
          prep_notes: prepNotes || null,
          payment_transaction_id: transaction.id,
          status: 'pending'
        });

      if (bookingError) throw bookingError;

      setBookingSuccess(true);
      setSelectedMentor(null);
      setSelectedSessionType(null);
      setBookingDate('');
      setBookingTime('');
      setPrepNotes('');

      setTimeout(() => setBookingSuccess(false), 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to book session');
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const quickSessionIcons: Record<string, typeof Clock> = {
    'Quick Doubt': MessageCircle,
    'Code Review': Code,
    'Career Chat': Briefcase
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Mentorship & Services</h1>
        <p className="text-gray-400">
          Get personalized guidance from experienced engineers. All core content remains free.
        </p>
      </div>

      {bookingSuccess && (
        <div className="bg-emerald-900/20 border border-emerald-800 rounded-lg p-4 flex items-center gap-3">
          <Check className="w-5 h-5 text-emerald-400" />
          <span className="text-emerald-400">Session booked successfully! The mentor will confirm shortly.</span>
        </div>
      )}

      {error && (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 text-red-400">
          {error}
        </div>
      )}

      <div className="bg-gradient-to-r from-emerald-900/20 to-teal-900/20 border border-emerald-800/30 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-lg">
            <Zap className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">Quick Sessions</h2>
            <p className="text-gray-400 mb-4">
              Need fast help? Book a quick 15-30 minute session starting at just Rs 50.
              Get your doubts cleared, code reviewed, or career advice instantly.
            </p>
            <div className="grid sm:grid-cols-3 gap-3">
              {sessionTypes.map(type => {
                const Icon = quickSessionIcons[type.name] || Clock;
                return (
                  <div
                    key={type.id}
                    className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 flex flex-col"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="w-5 h-5 text-emerald-400" />
                      <span className="text-white font-medium">{type.name}</span>
                    </div>
                    <p className="text-gray-500 text-sm flex-1">{type.description}</p>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700">
                      <span className="text-gray-400 text-sm">{type.duration_minutes} mins</span>
                      <span className="text-emerald-400 font-semibold">Rs {type.price_inr}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="inline-flex p-3 bg-blue-600/10 rounded-lg mb-4">
            <Video className="w-6 h-6 text-blue-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">1:1 Mentorship</h3>
          <p className="text-gray-400 mb-4">
            Book personalized sessions with experienced engineers to discuss concepts,
            career guidance, or solve specific problems.
          </p>
          <p className="text-sm text-gray-500">Starting from Rs 500/hour</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="inline-flex p-3 bg-green-600/10 rounded-lg mb-4">
            <Users className="w-6 h-6 text-green-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Group Doubt Sessions</h3>
          <p className="text-gray-400 mb-4">
            Join live group sessions where mentors clarify common doubts and concepts.
            More affordable and interactive.
          </p>
          <p className="text-sm text-gray-500">Rs 150/session</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="inline-flex p-3 bg-amber-600/10 rounded-lg mb-4">
            <FileText className="w-6 h-6 text-amber-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Resume Review</h3>
          <p className="text-gray-400 mb-4">
            Get detailed feedback on your resume from engineers working at top companies.
            Improve your chances of landing interviews.
          </p>
          <p className="text-sm text-gray-500">Rs 300/review</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="inline-flex p-3 bg-orange-600/10 rounded-lg mb-4">
            <Briefcase className="w-6 h-6 text-orange-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Mock Interviews</h3>
          <p className="text-gray-400 mb-4">
            Practice with real interview scenarios. Get feedback on your problem-solving
            approach, communication, and technical depth.
          </p>
          <p className="text-sm text-gray-500">Rs 600/session</p>
        </div>
      </div>

      {mentors.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Book a Quick Session</h2>
          <p className="text-gray-400 mb-6">Select a mentor and session type to get started</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mentors.map(mentor => (
              <div
                key={mentor.id}
                className={`bg-gray-900 border rounded-lg p-5 cursor-pointer transition-all ${
                  selectedMentor?.id === mentor.id
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                    : 'border-gray-800 hover:border-gray-700'
                }`}
                onClick={() => setSelectedMentor(mentor)}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-medium">
                    {mentor.profile?.display_name?.charAt(0) || 'M'}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold">
                      {mentor.profile?.display_name || 'Mentor'}
                    </h3>
                    <div className="flex items-center gap-1 text-amber-400 text-sm">
                      <Star className="w-3 h-3 fill-current" />
                      <span>4.8</span>
                    </div>
                  </div>
                </div>

                {mentor.bio && (
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">{mentor.bio}</p>
                )}

                <div className="flex flex-wrap gap-2 mb-3">
                  {mentor.expertise_areas.slice(0, 3).map((area, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-1 bg-gray-800 text-gray-300 rounded"
                    >
                      {area}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-800">
                  <span className="text-emerald-400 text-sm">Available for quick sessions</span>
                  {selectedMentor?.id === mentor.id && (
                    <Check className="w-5 h-5 text-emerald-400" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedMentor && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Book Quick Session</h3>
              <button
                onClick={() => {
                  setSelectedMentor(null);
                  setSelectedSessionType(null);
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-medium">
                  {selectedMentor.profile?.display_name?.charAt(0) || 'M'}
                </div>
                <div>
                  <p className="text-white font-medium">
                    {selectedMentor.profile?.display_name || 'Mentor'}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {selectedMentor.expertise_areas.slice(0, 2).join(', ')}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-2 block">Session Type</label>
                <div className="grid grid-cols-1 gap-2">
                  {sessionTypes.map(type => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedSessionType(type)}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                        selectedSessionType?.id === type.id
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <div className="text-left">
                          <p className="text-white text-sm">{type.name}</p>
                          <p className="text-gray-500 text-xs">{type.duration_minutes} minutes</p>
                        </div>
                      </div>
                      <span className="text-emerald-400 font-medium">Rs {type.price_inr}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Date</label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Time</label>
                  <input
                    type="time"
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-2 block">
                  What would you like to discuss? (Optional)
                </label>
                <textarea
                  value={prepNotes}
                  onChange={(e) => setPrepNotes(e.target.value)}
                  placeholder="Describe your question or topic..."
                  rows={3}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              {selectedSessionType && (
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">Session</span>
                    <span className="text-white">{selectedSessionType.name}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">Duration</span>
                    <span className="text-white">{selectedSessionType.duration_minutes} minutes</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                    <span className="text-gray-400 font-medium">Total</span>
                    <span className="text-emerald-400 font-bold text-lg">Rs {selectedSessionType.price_inr}</span>
                  </div>
                </div>
              )}

              <button
                onClick={handleBookSession}
                disabled={booking || !selectedSessionType || !bookingDate || !bookingTime}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2"
              >
                {booking ? (
                  'Booking...'
                ) : (
                  <>
                    <Calendar className="w-5 h-5" />
                    Confirm Booking
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 text-center">
        <p className="text-gray-400">
          These services help us sustain the platform while keeping education free.
          <br />
          <span className="text-sm">100% of proceeds go to mentors and platform maintenance.</span>
        </p>
      </div>
    </div>
  );
}
