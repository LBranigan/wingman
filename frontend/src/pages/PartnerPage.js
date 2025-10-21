import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Send, AlertCircle, Mail, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { goals as goalsApi, comments as commentsApi, match as matchApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { PartnerPageSkeleton } from '../components/SkeletonLoader';

const PartnerPage = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [goals, setGoals] = useState([]);
  const [commentText, setCommentText] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [sendingInvite, setSendingInvite] = useState(false);
  const [suggestedMatches, setSuggestedMatches] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [requestingMatch, setRequestingMatch] = useState(null);
  const [partnershipRequests, setPartnershipRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  useEffect(() => {
    console.log('[PartnerPage] User data:', user);
    console.log('[PartnerPage] Has partner?', !!user?.partner);

    if (user?.partner) {
      console.log('[PartnerPage] Loading partner goals for:', user.partner.name);
      loadPartnerGoals();
    } else {
      console.log('[PartnerPage] No partner, loading suggestions and requests');
      setLoading(false);
      loadSuggestedMatches();
      loadPartnershipRequests();
    }
  }, [user]);

  const loadSuggestedMatches = async () => {
    setLoadingMatches(true);
    try {
      const response = await matchApi.getSuggestions();
      setSuggestedMatches(response.data.matches);
    } catch (err) {
      if (err.response?.status !== 404) {
        toast.error('Failed to load match suggestions');
      }
    } finally {
      setLoadingMatches(false);
    }
  };

  const loadPartnershipRequests = async () => {
    setLoadingRequests(true);
    try {
      const response = await matchApi.getRequests();
      setPartnershipRequests(response.data.requests);
    } catch (err) {
      console.error('Failed to load requests:', err);
    } finally {
      setLoadingRequests(false);
    }
  };

  const loadPartnerGoals = async () => {
    try {
      const response = await goalsApi.getPartnerCurrentWeek();
      setGoals(response.data);
    } catch (err) {
      toast.error('Failed to load partner goals');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (goalId) => {
    const text = commentText[goalId]?.trim();
    if (!text) {
      toast.error('Please enter a comment');
      return;
    }

    try {
      const response = await commentsApi.create(goalId, text);

      setGoals(goals.map(g => {
        if (g.id === goalId) {
          return {
            ...g,
            comments: [...g.comments, response.data]
          };
        }
        return g;
      }));

      setCommentText({ ...commentText, [goalId]: '' });
      toast.success('Comment added! 💬');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add comment');
    }
  };

  const handleCommentChange = (goalId, value) => {
    setCommentText({ ...commentText, [goalId]: value });
  };

  const handleSendInvite = async (e) => {
    e.preventDefault();

    if (!inviteEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setSendingInvite(true);
    try {
      await matchApi.invite(inviteEmail);
      toast.success(`Invitation sent to ${inviteEmail}! 📧`);
      setInviteEmail('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send invitation');
    } finally {
      setSendingInvite(false);
    }
  };

  const handleRequestMatch = async (partnerId) => {
    setRequestingMatch(partnerId);
    try {
      await matchApi.request(partnerId);
      toast.success('Partnership request sent! 📨');
      await loadPartnershipRequests();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send partnership request');
    } finally {
      setRequestingMatch(null);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await matchApi.acceptRequest(requestId);
      toast.success('Partnership accepted! 🎉');
      await refreshUser();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to accept request');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await matchApi.rejectRequest(requestId);
      toast.success('Request rejected');
      await loadPartnershipRequests();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to reject request');
    }
  };

  const handleUnmatch = async () => {
    if (!window.confirm(`Are you sure you want to unmatch from ${user.partner.name}? This will remove the partnership for both of you.`)) {
      return;
    }

    try {
      await matchApi.unmatch();
      toast.success('Successfully unmatched');
      await refreshUser();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to unmatch');
    }
  };

  if (loading) {
    return <PartnerPageSkeleton />;
  }

  if (!user?.partner) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="text-6xl mb-4">👥</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Find Your Wingman Partner</h2>
          <p className="text-gray-600">
            Choose from compatible matches below or invite a friend to be your accountability partner.
          </p>
        </div>

        {/* Suggested Matches */}
        {loadingMatches ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        ) : suggestedMatches.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Suggested Partners</h3>
            <p className="text-gray-600 mb-6">
              Based on your profile, here are the top 3 most compatible accountability partners:
            </p>

            <div className="grid gap-4 md:grid-cols-3">
              {suggestedMatches.map((match) => (
                <div
                  key={match.id}
                  className="border-2 border-gray-200 rounded-lg p-5 hover:border-indigo-400 transition-all hover:shadow-md"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-2xl text-white">
                      👤
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-800 truncate">{match.name}</h4>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-indigo-600 font-semibold">
                          {match.compatibilityScore}% match
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {match.bio || 'No bio provided'}
                  </p>

                  <button
                    onClick={() => handleRequestMatch(match.id)}
                    disabled={requestingMatch === match.id}
                    className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {requestingMatch === match.id ? 'Connecting...' : 'Partner Up'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Pending Partnership Requests */}
        {partnershipRequests.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Partnership Requests</h3>
            <div className="space-y-4">
              {partnershipRequests.map((request) => {
                const isReceiver = request.receiverId === user.id;
                const otherUser = isReceiver ? request.sender : request.receiver;

                return (
                  <div
                    key={request.id}
                    className="border-2 border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-2xl text-white flex-shrink-0">
                          👤
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-800">{otherUser.name}</h4>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {otherUser.bio || 'No bio provided'}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {isReceiver ? (
                              <span className="text-indigo-600 font-medium">
                                ✉️ Wants to partner with you!
                              </span>
                            ) : (
                              <span className="text-gray-500">
                                ⏳ Request pending...
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      {isReceiver && (
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleAcceptRequest(request.id)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition text-sm"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleRejectRequest(request.id)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition text-sm"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Invite a Friend */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <Mail className="text-indigo-600" size={24} />
            <h3 className="text-xl font-bold text-gray-800">Reach Out to a Friend</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Know someone who would be a great accountability partner? Send them an invitation to join Wingman and automatically become partners!
          </p>

          <form onSubmit={handleSendInvite} className="flex gap-3">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="friend@example.com"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              disabled={sendingInvite}
            />
            <button
              type="submit"
              disabled={sendingInvite}
              className="bg-indigo-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
            >
              <Mail size={20} />
              {sendingInvite ? 'Sending...' : 'Send Invite'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-700">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-3xl text-white">
              👤
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{user.partner.name}</h2>
              <p className="text-gray-600">{user.partner.bio}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/partner/chat')}
              className="px-6 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition font-medium flex items-center gap-2"
            >
              <MessageCircle size={18} />
              Open Chat
            </button>
            <button
              onClick={handleUnmatch}
              className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 border border-red-300 rounded-lg transition font-medium"
            >
              Unmatch
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">This Week's Goals</h3>
        
        {goals.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p>Your partner hasn't set any goals yet for this week.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {goals.map((goal) => (
              <div key={goal.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-3 mb-3">
                  <CheckCircle2
                    size={24}
                    className={goal.completed ? 'text-green-600' : 'text-gray-400'}
                  />
                  <div className="flex-1">
                    <span
                      className={`text-lg ${
                        goal.completed ? 'text-gray-600' : 'text-gray-800 font-medium'
                      }`}
                    >
                      {goal.text}
                    </span>
                    {goal.completed && (
                      <span className="ml-2 text-sm text-green-600 font-medium">
                        ✓ Completed
                      </span>
                    )}
                  </div>
                </div>

                <div className="ml-9 space-y-2">
                  {goal.comments.map((comment) => (
                    <div
                      key={comment.id}
                      className={`rounded p-3 text-sm ${
                        comment.author.id === user.id
                          ? 'bg-indigo-50 border border-indigo-100'
                          : 'bg-gray-50 border border-gray-100'
                      }`}
                    >
                      <span className="font-semibold text-gray-900">
                        {comment.author.name}:{' '}
                      </span>
                      <span className="text-gray-700">{comment.text}</span>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(comment.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))}

                  <div className="flex gap-2 mt-3">
                    <input
                      type="text"
                      value={commentText[goal.id] || ''}
                      onChange={(e) => handleCommentChange(goal.id, e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddComment(goal.id)}
                      placeholder="Add encouragement or feedback..."
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      aria-label={`Comment on goal: ${goal.text}`}
                      maxLength={500}
                    />
                    <button
                      onClick={() => handleAddComment(goal.id)}
                      className="bg-indigo-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-indigo-700 transition flex items-center gap-1 min-h-[44px]"
                      aria-label="Send comment"
                    >
                      <Send size={16} aria-hidden="true" />
                      <span className="hidden sm:inline">Send</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6">
        <h4 className="font-semibold text-indigo-900 mb-2">💡 Tips for Great Feedback</h4>
        <ul className="text-sm text-indigo-800 space-y-1">
          <li>• Be specific about what you appreciate</li>
          <li>• Share how their progress inspires you</li>
          <li>• Offer constructive suggestions when appropriate</li>
          <li>• Celebrate their completed goals!</li>
        </ul>
      </div>
    </div>
  );
};

export default PartnerPage;