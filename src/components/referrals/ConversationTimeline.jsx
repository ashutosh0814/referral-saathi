/**
 * ConversationTimeline Component
 * Displays conversation history in a messaging-style timeline
 * Safely renders user-entered text with proper escaping
 */

import React, { useState, useEffect, useRef } from 'react';
import { Edit2, Trash2, MoreVertical, Send, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import { CONVERSATION_DIRECTION } from '../../utils/constants';

/**
 * Safely escape HTML to prevent XSS
 * React already does this automatically when rendering text content,
 * but we make it explicit for clarity
 */
const escapeHtml = (text) => {
  // React's JSX already escapes text content, but we can add extra safety
  if (typeof text !== 'string') return '';
  return text;
};

function ConversationTimeline({ 
  conversations = [], 
  onEdit, 
  onDelete, 
  isLoading = false,
  emptyMessage = "No conversations yet. Start by adding your first message below."
}) {
  const [activeMenu, setActiveMenu] = useState(null);
  const menuRefs = useRef({});

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (activeMenu && menuRefs.current[activeMenu]) {
        const menuElement = menuRefs.current[activeMenu];
        if (!menuElement.contains(e.target)) {
          setActiveMenu(null);
        }
      }
    };

    if (activeMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [activeMenu]);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return format(date, 'MMM dd, yyyy • h:mm a');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const handleMenuToggle = (conversationId, e) => {
    e.stopPropagation();
    setActiveMenu(activeMenu === conversationId ? null : conversationId);
  };

  const handleEdit = (conversation, e) => {
    e.stopPropagation();
    setActiveMenu(null);
    onEdit(conversation);
  };

  const handleDelete = (conversation, e) => {
    e.stopPropagation();
    setActiveMenu(null);
    onDelete(conversation);
  };

  // Sort conversations by timestamp (oldest first for chronological display)
  const sortedConversations = [...conversations].sort((a, b) => {
    const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
    const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
    return timeA - timeB;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <MessageCircle className="w-12 h-12 text-violet-200 mx-auto mb-3 animate-pulse" />
          <p className="text-sm text-gray-500">Loading conversations...</p>
        </div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center max-w-sm mx-auto px-4">
          <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500 leading-relaxed">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-4">
      {sortedConversations.map((conversation) => {
        const isSent = conversation.direction === CONVERSATION_DIRECTION.SENT;
        const showMenu = activeMenu === conversation.id;

        return (
          <div
            key={conversation.id}
            className={`flex ${isSent ? 'justify-end' : 'justify-start'} group`}
          >
            <div
              className={`max-w-[85%] sm:max-w-[75%] ${
                isSent ? 'items-end' : 'items-start'
              } flex flex-col gap-1`}
            >
              {/* Message bubble */}
              <div className="relative">
                <div
                  className={`px-4 py-3 rounded-2xl ${
                    isSent
                      ? 'bg-gradient-to-r from-violet-600 to-violet-700 text-white rounded-br-md'
                      : 'bg-gray-100 text-gray-900 rounded-bl-md'
                  } shadow-sm transition-shadow hover:shadow-md`}
                >
                  {/* Message text - safely rendered with proper wrapping */}
                  <p className="text-sm leading-relaxed whitespace-pre-wrap break-words break-word">
                    {escapeHtml(conversation.message)}
                  </p>

                  {/* Intent tag (if available) */}
                  {conversation.intent && (
                    <div className="mt-2 pt-2 border-t border-opacity-20 border-current">
                      <p className={`text-xs break-words ${isSent ? 'text-violet-100' : 'text-gray-500'}`}>
                        <span className="font-medium">Intent: </span>
                        {escapeHtml(conversation.intent)}
                      </p>
                    </div>
                  )}

                  {/* Suggested action (if available) */}
                  {conversation.suggestedAction && (
                    <div className="mt-2 pt-2 border-t border-opacity-20 border-current">
                      <p className={`text-xs break-words ${isSent ? 'text-violet-100' : 'text-gray-500'}`}>
                        <span className="font-medium">Next: </span>
                        {escapeHtml(conversation.suggestedAction)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions menu */}
                <div
                  ref={(el) => menuRefs.current[conversation.id] = el}
                  className={`absolute top-2 ${
                    isSent ? '-left-8 sm:-left-10' : '-right-8 sm:-right-10'
                  } opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity`}
                >
                  <button
                    onClick={(e) => handleMenuToggle(conversation.id, e)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
                    aria-label="Message options"
                    aria-expanded={showMenu}
                    aria-haspopup="true"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {/* Dropdown menu */}
                  {showMenu && (
                    <>
                      {/* Backdrop */}
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setActiveMenu(null)}
                        aria-hidden="true"
                      />
                      
                      {/* Menu */}
                      <div
                        className={`absolute ${
                          isSent ? 'right-full mr-2' : 'left-full ml-2'
                        } top-0 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden animate-slide-in-down`}
                        role="menu"
                      >
                        <button
                          onClick={(e) => handleEdit(conversation, e)}
                          className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                          role="menuitem"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        <button
                          onClick={(e) => handleDelete(conversation, e)}
                          className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                          role="menuitem"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Timestamp and direction indicator */}
              <div className={`flex items-center gap-2 px-2 ${isSent ? 'flex-row-reverse' : 'flex-row'}`}>
                {isSent ? (
                  <Send className="w-3 h-3 text-violet-400 flex-shrink-0" />
                ) : (
                  <MessageCircle className="w-3 h-3 text-gray-400 flex-shrink-0" />
                )}
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  {formatTimestamp(conversation.createdAt)}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ConversationTimeline;
