import React, { useState } from 'react';
import { useStoredChats } from '@/hooks/useStoredChats';
import { useChatTabsContext } from '@/context/chat-tabs-context';
import {
  getStorageStats,
  downloadChatData,
  uploadChatData,
} from '@/helpers/chat-storage';

export const ChatStorageDemo: React.FC = () => {
  const {
    chats,
    isLoading,
    error,
    deleteChat,
    updateChatTitle,
    clearAllChats,
    refreshChats,
    isSupported,
  } = useStoredChats();

  const { removeChatTab } = useChatTabsContext();

  const [stats, setStats] = useState<{
    chatCount: number;
    totalMessages: number;
    oldestChat?: Date;
    newestChat?: Date;
  } | null>(null);

  const [importError, setImportError] = useState<string | null>(null);
  const [isOperationLoading, setIsOperationLoading] = useState(false);

  const handleGetStats = async () => {
    try {
      setIsOperationLoading(true);
      const storageStats = await getStorageStats();
      setStats(storageStats);
    } catch (err) {
      console.error('Failed to get storage stats:', err);
    } finally {
      setIsOperationLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setIsOperationLoading(true);
      await downloadChatData();
    } catch (err) {
      console.error('Failed to export chat data:', err);
      setImportError('Failed to export chat data');
    } finally {
      setIsOperationLoading(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsOperationLoading(true);
      setImportError(null);
      await uploadChatData(file);
      refreshChats();
    } catch (err) {
      console.error('Failed to import chat data:', err);
      setImportError(
        'Failed to import chat data. Please check the file format.'
      );
    } finally {
      setIsOperationLoading(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    if (window.confirm('Are you sure you want to delete this chat?')) {
      await deleteChat(chatId);
      removeChatTab(chatId);
    }
  };

  const handleClearAll = async () => {
    if (
      window.confirm(
        'Are you sure you want to delete all chats? This action cannot be undone.'
      )
    ) {
      await clearAllChats();
      // Clear all chat tabs, keep only home tab
      const chatTabs = chats.map(chat => chat.id);
      chatTabs.forEach(chatId => removeChatTab(chatId));
    }
  };

  const handleUpdateTitle = async (chatId: string, currentTitle: string) => {
    const newTitle = window.prompt('Enter new title:', currentTitle);
    if (newTitle && newTitle !== currentTitle) {
      await updateChatTitle(chatId, newTitle);
    }
  };

  if (!isSupported) {
    return (
      <div className='p-4 bg-yellow-100 border border-yellow-400 rounded-md'>
        <h3 className='text-lg font-semibold text-yellow-800'>
          IndexedDB Not Supported
        </h3>
        <p className='text-yellow-700'>
          Your browser doesn't support IndexedDB. Chat history will not be
          saved.
        </p>
      </div>
    );
  }

  return (
    <div className='max-w-4xl mx-auto p-6 space-y-6'>
      <div className='bg-white shadow-lg rounded-lg p-6'>
        <h2 className='text-2xl font-bold mb-4'>Chat Storage Management</h2>

        {/* Storage Stats */}
        <div className='mb-6'>
          <button
            onClick={handleGetStats}
            disabled={isOperationLoading}
            className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50'
          >
            {isOperationLoading ? 'Loading...' : 'Get Storage Stats'}
          </button>

          {stats && (
            <div className='mt-4 p-4 bg-gray-100 rounded'>
              <h3 className='font-semibold mb-2'>Storage Statistics</h3>
              <ul className='space-y-1'>
                <li>Total Chats: {stats.chatCount}</li>
                <li>Total Messages: {stats.totalMessages}</li>
                {stats.oldestChat && (
                  <li>Oldest Chat: {stats.oldestChat.toLocaleDateString()}</li>
                )}
                {stats.newestChat && (
                  <li>Newest Chat: {stats.newestChat.toLocaleDateString()}</li>
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Import/Export */}
        <div className='mb-6 flex flex-wrap gap-4'>
          <button
            onClick={handleExport}
            disabled={isOperationLoading || chats.length === 0}
            className='bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50'
          >
            {isOperationLoading ? 'Exporting...' : 'Export All Chats'}
          </button>

          <label className='bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 cursor-pointer'>
            Import Chats
            <input
              type='file'
              accept='.json'
              onChange={handleImport}
              disabled={isOperationLoading}
              className='hidden'
            />
          </label>

          <button
            onClick={handleClearAll}
            disabled={isOperationLoading || chats.length === 0}
            className='bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50'
          >
            Clear All Chats
          </button>
        </div>

        {importError && (
          <div className='mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded'>
            {importError}
          </div>
        )}

        {/* Chat List */}
        <div>
          <h3 className='text-xl font-semibold mb-4'>
            Stored Chats ({chats.length})
          </h3>

          {isLoading ? (
            <p className='text-gray-500'>Loading chats...</p>
          ) : error ? (
            <p className='text-red-500'>Error: {error}</p>
          ) : chats.length === 0 ? (
            <p className='text-gray-500'>No chats stored yet.</p>
          ) : (
            <div className='space-y-3'>
              {chats.map(chat => (
                <div
                  key={chat.id}
                  className='border border-gray-200 rounded-lg p-4 flex justify-between items-start'
                >
                  <div className='flex-1'>
                    <h4 className='font-semibold text-lg'>{chat.title}</h4>
                    <p className='text-sm text-gray-600 mt-1'>ID: {chat.id}</p>
                    {chat.preview && (
                      <p className='text-sm text-gray-700 mt-2 line-clamp-2'>
                        {chat.preview}
                      </p>
                    )}
                    <div className='text-xs text-gray-500 mt-2'>
                      <span>Created: {chat.createdAt.toLocaleString()}</span>
                      <span className='ml-4'>
                        Updated: {chat.updatedAt.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className='flex gap-2 ml-4'>
                    <button
                      onClick={() => handleUpdateTitle(chat.id, chat.title)}
                      className='text-blue-600 hover:text-blue-800 text-sm'
                    >
                      Rename
                    </button>
                    <button
                      onClick={() => handleDeleteChat(chat.id)}
                      className='text-red-600 hover:text-red-800 text-sm'
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatStorageDemo;
