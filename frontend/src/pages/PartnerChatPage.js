import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { chat as chatApi, goalSets as goalSetsApi } from '../services/api';
import PartnerPage from './PartnerPage';

const PartnerChatPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [myGoalSets, setMyGoalSets] = useState([]);
  const [partnerGoalSets, setPartnerGoalSets] = useState([]);
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [viewingGoalsFor, setViewingGoalsFor] = useState(null); // 'me' or 'partner'
  const [selectedGoalSet, setSelectedGoalSet] = useState(null);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const messageInputRef = useRef(null);

  useEffect(() => {
    if (!user?.partner) {
      setLoading(false);
      return;
    }

    loadMessages();
    loadGoalSets();

    // Poll for new messages every 3 seconds
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [user]);

  const loadMessages = async () => {
    try {
      const response = await chatApi.getMessages();
      setMessages(response.data.messages);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load messages:', err);
      setLoading(false);
    }
  };

  const loadGoalSets = async () => {
    try {
      // Load current user's goal sets
      const myResponse = await goalSetsApi.getAll();
      const mySets = Array.isArray(myResponse.data) ? myResponse.data : (myResponse.data.goalSets || []);
      console.log('[Chat] My goal sets:', mySets);
      setMyGoalSets(mySets);

      // Load partner's goal sets
      try {
        const partnerResponse = await goalSetsApi.getPartner();
        console.log('[Chat] Partner response:', partnerResponse);
        const partnerSets = Array.isArray(partnerResponse.data) ? partnerResponse.data : (partnerResponse.data.goalSets || []);
        console.log('[Chat] Partner goal sets count:', partnerSets.length);
        console.log('[Chat] Partner goal sets:', partnerSets);
        setPartnerGoalSets(partnerSets);
      } catch (partnerErr) {
        console.error('Failed to load partner goal sets:', partnerErr);
        console.error('Error details:', partnerErr.response?.data || partnerErr.message);
        setPartnerGoalSets([]);
      }
    } catch (err) {
      console.error('Failed to load goal sets:', err);
    }
  };

  const openGoalsModal = (owner) => {
    setViewingGoalsFor(owner);
    const goalSets = owner === 'me' ? myGoalSets : partnerGoalSets;
    const defaultSet = goalSets.find(gs => gs.isActive) || goalSets[0];
    setSelectedGoalSet(defaultSet);
    setShowGoalsModal(true);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const response = await chatApi.sendMessage(newMessage);
      setMessages([...messages, response.data]);
      setNewMessage('');
      scrollToBottom();
    } catch (err) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatGoalSetLabel = (goalSet) => {
    const startDate = new Date(goalSet.startDate);
    const endDate = new Date(goalSet.endDate);
    const startMonth = startDate.toLocaleDateString('en-US', { month: 'short' });
    const endMonth = endDate.toLocaleDateString('en-US', { month: 'short' });
    const startDay = startDate.getDate();
    const endDay = endDate.getDate();

    // Format: "1 week • Oct 20 - 27" or "1 week • Oct 20 - Nov 3"
    if (startMonth === endMonth) {
      return `${goalSet.duration} • ${startMonth} ${startDay} - ${endDay}`;
    } else {
      return `${goalSet.duration} • ${startMonth} ${startDay} - ${endMonth} ${endDay}`;
    }
  };

  const handleGoalClick = (goalText, ownerName) => {
    // Format the quoted text with the goal and owner
    const quotedText = `> ${ownerName}: "${goalText}"\n\n`;
    setNewMessage(quotedText);
    // Focus the input field
    messageInputRef.current?.focus();
  };

  const renderMessageText = (text, isMyMessage) => {
    // Check if message contains quoted text (starts with >)
    const lines = text.split('\n');
    const hasQuote = lines.some(line => line.trim().startsWith('>'));

    if (!hasQuote) {
      return <p className="text-sm whitespace-pre-wrap break-words">{text}</p>;
    }

    return (
      <div className="space-y-2">
        {lines.map((line, index) => {
          if (line.trim().startsWith('>')) {
            const quoteText = line.replace(/^>\s*/, '');
            return (
              <div
                key={index}
                className={`border-l-4 pl-3 py-1 italic ${
                  isMyMessage
                    ? 'border-indigo-300 bg-indigo-500/20'
                    : 'border-purple-300 bg-purple-100'
                }`}
              >
                <p className="text-xs font-semibold mb-1 opacity-80">Quoted Goal</p>
                <p className="text-sm">{quoteText}</p>
              </div>
            );
          } else if (line.trim()) {
            return (
              <p key={index} className="text-sm whitespace-pre-wrap break-words">
                {line}
              </p>
            );
          }
          return null;
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  // If no partner, show the old PartnerPage content
  if (!user?.partner) {
    return <PartnerPage />;
  }

  return (
    <div className="h-[calc(100vh-120px)] flex">
      {/* Left Sidebar - Partners */}
      <div className="w-64 bg-white border-r border-gray-300 flex flex-col">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4">
          <h2 className="font-bold text-lg">Partners</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* Current User */}
          <div className="bg-white border-2 border-indigo-200 rounded-xl overflow-hidden">
            <div className="p-4 bg-indigo-50">
              <div className="flex items-center gap-3 mb-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-gray-800 truncate">{user?.name}</div>
                  <div className="text-xs text-gray-500">You</div>
                </div>
              </div>
              <button
                onClick={() => openGoalsModal('me')}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition"
              >
                View My Goals
              </button>
            </div>
          </div>

          {/* Partner */}
          <div className="bg-white border-2 border-purple-200 rounded-xl overflow-hidden">
            <div className="p-4 bg-purple-50">
              <div className="flex items-center gap-3 mb-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                    {user?.partner?.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-gray-800 truncate">{user?.partner?.name}</div>
                  <div className="text-xs text-green-600">Online</div>
                </div>
              </div>
              <button
                onClick={() => openGoalsModal('partner')}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition"
              >
                View {user?.partner?.name}'s Goals
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {/* Chat Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-lg font-bold">
              {user.partner?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold">{user.partner?.name}</h1>
              <p className="text-sm text-white/80">Online</p>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-3"
          style={{
            backgroundImage: 'linear-gradient(to bottom, rgba(245, 245, 245, 0.5) 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}
        >
          {messages.length === 0 ? (
            <div className="text-center text-gray-400 mt-8">
              <p className="text-lg">No messages yet</p>
              <p className="text-sm mt-2">Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => {
              const isMyMessage = message.senderId === user.id;
              return (
                <div
                  key={message.id}
                  className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-md ${isMyMessage ? 'order-2' : 'order-1'}`}>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className={`text-xs font-bold ${isMyMessage ? 'text-indigo-700' : 'text-purple-700'}`}>
                        {message.sender.name}
                      </span>
                      <span className="text-xs text-gray-500">{formatTime(message.createdAt)}</span>
                    </div>
                    <div
                      className={`rounded-lg px-4 py-2 ${
                        isMyMessage
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white text-gray-800 border border-gray-200'
                      }`}
                    >
                      {renderMessageText(message.text, isMyMessage)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="bg-white border-t border-gray-300 p-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <textarea
              ref={messageInputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              disabled={sending}
              maxLength={1000}
              rows={3}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
            />
            <button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send size={18} />
              Send
            </button>
          </form>
        </div>
      </div>

      {/* Goals Modal */}
      {showGoalsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowGoalsModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className={`p-6 ${viewingGoalsFor === 'me' ? 'bg-gradient-to-r from-indigo-600 to-purple-600' : 'bg-gradient-to-r from-purple-600 to-pink-600'} text-white`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-xl font-bold">
                    {viewingGoalsFor === 'me' ? user?.name?.[0]?.toUpperCase() : user?.partner?.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{viewingGoalsFor === 'me' ? user?.name : user?.partner?.name}'s Goals</h2>
                    <p className="text-sm text-white/80">View and select goals to discuss</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowGoalsModal(false)}
                  className="text-white hover:bg-white/20 rounded-full p-2 transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
              {/* Goal Set Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Goal Set</label>
                <select
                  value={selectedGoalSet?.id || ''}
                  onChange={(e) => {
                    const goalSets = viewingGoalsFor === 'me' ? myGoalSets : partnerGoalSets;
                    const selected = goalSets.find(gs => gs.id === e.target.value);
                    setSelectedGoalSet(selected);
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base"
                >
                  {((viewingGoalsFor === 'me' ? myGoalSets : partnerGoalSets).length === 0) && (
                    <option value="">No goal sets available</option>
                  )}
                  {(viewingGoalsFor === 'me' ? myGoalSets : partnerGoalSets).map((goalSet) => (
                    <option key={goalSet.id} value={goalSet.id}>
                      {formatGoalSetLabel(goalSet)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Goals Display */}
              {selectedGoalSet && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Goals</h3>
                    <div className="text-sm text-gray-500">
                      {new Date(selectedGoalSet.startDate).toLocaleDateString()} - {new Date(selectedGoalSet.endDate).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {selectedGoalSet.goals?.map((goal) => (
                      <div
                        key={goal.id}
                        className={`flex items-start gap-4 p-4 rounded-lg border-2 transition cursor-pointer ${
                          viewingGoalsFor === 'me'
                            ? 'border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50'
                            : 'border-purple-200 hover:border-purple-400 hover:bg-purple-50'
                        }`}
                        onClick={() => {
                          handleGoalClick(goal.text, viewingGoalsFor === 'me' ? user?.name : user?.partner?.name);
                          setShowGoalsModal(false);
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={goal.completed}
                          readOnly
                          className="mt-1 w-5 h-5 pointer-events-none"
                        />
                        <div className="flex-1">
                          <p className={`text-base ${goal.completed ? 'line-through text-gray-500' : 'text-gray-800 font-medium'}`}>
                            {goal.text}
                          </p>
                          {goal.completed && (
                            <p className="text-xs text-green-600 mt-1">✓ Completed</p>
                          )}
                        </div>
                      </div>
                    ))}
                    {(!selectedGoalSet.goals || selectedGoalSet.goals.length === 0) && (
                      <div className="text-center py-12">
                        <div className="text-4xl mb-2">📝</div>
                        <p className="text-gray-400 text-lg">No goals in this set</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerChatPage;
