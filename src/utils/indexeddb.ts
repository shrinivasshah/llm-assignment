import type { ConversationPair } from '@/context/types';

const DB_NAME = 'MerkleChatDB';
const DB_VERSION = 1;
const CHAT_STORE_NAME = 'chats';
const CHAT_MESSAGES_STORE_NAME = 'chatMessages';

export interface StoredChat {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  conversations: ConversationPair[];
}

export interface ChatMessage {
  chatId: string;
  conversationId: string;
  messageId: string;
  content: string;
  sender: string;
  timestamp: Date;
}

class IndexedDBManager {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = event => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains(CHAT_STORE_NAME)) {
          const chatStore = db.createObjectStore(CHAT_STORE_NAME, {
            keyPath: 'id',
          });
          chatStore.createIndex('title', 'title', { unique: false });
          chatStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        if (!db.objectStoreNames.contains(CHAT_MESSAGES_STORE_NAME)) {
          const messageStore = db.createObjectStore(CHAT_MESSAGES_STORE_NAME, {
            keyPath: 'messageId',
          });
          messageStore.createIndex('chatId', 'chatId', { unique: false });
          messageStore.createIndex('conversationId', 'conversationId', {
            unique: false,
          });
        }
      };
    });
  }

  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init();
    }
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    return this.db;
  }

  async saveChat(chat: StoredChat): Promise<void> {
    const db = await this.ensureDB();
    const transaction = db.transaction(
      [CHAT_STORE_NAME, CHAT_MESSAGES_STORE_NAME],
      'readwrite'
    );

    try {
      const chatStore = transaction.objectStore(CHAT_STORE_NAME);
      await new Promise<void>((resolve, reject) => {
        const request = chatStore.put(chat);
        request.onsuccess = () => resolve();
        request.onerror = () =>
          reject(new Error(request.error?.message || 'Failed to save chat'));
      });

      // Save individual messages for faster querying
      const messageStore = transaction.objectStore(CHAT_MESSAGES_STORE_NAME);
      for (const conversation of chat.conversations) {
        if (conversation.user) {
          const userMessage: ChatMessage = {
            chatId: chat.id,
            conversationId: conversation.id,
            messageId: conversation.user.id,
            content: conversation.user.content,
            sender: conversation.user.sender,
            timestamp: conversation.user.timestamp,
          };
          await new Promise<void>((resolve, reject) => {
            const request = messageStore.put(userMessage);
            request.onsuccess = () => resolve();
            request.onerror = () =>
              reject(
                new Error(
                  request.error?.message || 'Failed to save user message'
                )
              );
          });
        }

        if (conversation.system) {
          const systemMessage: ChatMessage = {
            chatId: chat.id,
            conversationId: conversation.id,
            messageId: conversation.system.id,
            content: conversation.system.content,
            sender: conversation.system.sender,
            timestamp: conversation.system.timestamp,
          };
          await new Promise<void>((resolve, reject) => {
            const request = messageStore.put(systemMessage);
            request.onsuccess = () => resolve();
            request.onerror = () =>
              reject(
                new Error(
                  request.error?.message || 'Failed to save system message'
                )
              );
          });
        }
      }

      await new Promise<void>((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () =>
          reject(new Error(transaction.error?.message || 'Transaction failed'));
      });
    } catch (error) {
      transaction.abort();
      throw error;
    }
  }

  // Load a specific chat by ID
  async loadChat(chatId: string): Promise<StoredChat | null> {
    const db = await this.ensureDB();
    const transaction = db.transaction([CHAT_STORE_NAME], 'readonly');
    const store = transaction.objectStore(CHAT_STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.get(chatId);
      request.onsuccess = () => {
        const result = request.result as StoredChat | undefined;
        if (result) {
          // Convert dates back from strings if needed
          result.createdAt = new Date(result.createdAt);
          result.updatedAt = new Date(result.updatedAt);
          result.conversations = result.conversations.map(conv => ({
            ...conv,
            timestamp: new Date(conv.timestamp),
            user: conv.user
              ? { ...conv.user, timestamp: new Date(conv.user.timestamp) }
              : undefined,
            system: conv.system
              ? { ...conv.system, timestamp: new Date(conv.system.timestamp) }
              : undefined,
          }));
        }
        resolve(result || null);
      };
      request.onerror = () =>
        reject(new Error(request.error?.message || 'Failed to load chat'));
    });
  }

  async loadAllChats(): Promise<StoredChat[]> {
    const db = await this.ensureDB();
    const transaction = db.transaction([CHAT_STORE_NAME], 'readonly');
    const store = transaction.objectStore(CHAT_STORE_NAME);
    const index = store.index('createdAt');

    return new Promise((resolve, reject) => {
      const request = index.getAll();
      request.onsuccess = () => {
        const chats = (request.result as StoredChat[]).map(chat => ({
          ...chat,
          createdAt: new Date(chat.createdAt),
          updatedAt: new Date(chat.updatedAt),
          conversations: chat.conversations.map(conv => ({
            ...conv,
            timestamp: new Date(conv.timestamp),
            user: conv.user
              ? { ...conv.user, timestamp: new Date(conv.user.timestamp) }
              : undefined,
            system: conv.system
              ? { ...conv.system, timestamp: new Date(conv.system.timestamp) }
              : undefined,
          })),
        }));
        chats.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
        resolve(chats);
      };
      request.onerror = () =>
        reject(new Error(request.error?.message || 'Failed to load chats'));
    });
  }

  async deleteChat(chatId: string): Promise<void> {
    const db = await this.ensureDB();
    const transaction = db.transaction(
      [CHAT_STORE_NAME, CHAT_MESSAGES_STORE_NAME],
      'readwrite'
    );

    try {
      const chatStore = transaction.objectStore(CHAT_STORE_NAME);
      await new Promise<void>((resolve, reject) => {
        const request = chatStore.delete(chatId);
        request.onsuccess = () => resolve();
        request.onerror = () =>
          reject(new Error(request.error?.message || 'Failed to delete chat'));
      });

      // Delete all messages for this chat
      const messageStore = transaction.objectStore(CHAT_MESSAGES_STORE_NAME);
      const index = messageStore.index('chatId');
      const range = IDBKeyRange.only(chatId);

      await new Promise<void>((resolve, reject) => {
        const request = index.openCursor(range);
        request.onsuccess = event => {
          const cursor = (event.target as IDBRequest<IDBCursorWithValue | null>)
            .result;
          if (cursor) {
            cursor.delete();
            cursor.continue();
          } else {
            resolve();
          }
        };
        request.onerror = () =>
          reject(
            new Error(request.error?.message || 'Failed to delete messages')
          );
      });

      await new Promise<void>((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () =>
          reject(
            new Error(transaction.error?.message || 'Delete transaction failed')
          );
      });
    } catch (error) {
      transaction.abort();
      throw error;
    }
  }

  async updateConversation(
    chatId: string,
    conversation: ConversationPair
  ): Promise<void> {
    const chat = await this.loadChat(chatId);
    if (!chat) {
      throw new Error(`Chat with ID ${chatId} not found`);
    }

    const conversationIndex = chat.conversations.findIndex(
      conv => conv.id === conversation.id
    );

    if (conversationIndex === -1) {
      chat.conversations.push(conversation);
    } else {
      chat.conversations[conversationIndex] = conversation;
    }

    chat.updatedAt = new Date();
    await this.saveChat(chat);
  }

  async clearAllData(): Promise<void> {
    const db = await this.ensureDB();
    const transaction = db.transaction(
      [CHAT_STORE_NAME, CHAT_MESSAGES_STORE_NAME],
      'readwrite'
    );

    const chatStore = transaction.objectStore(CHAT_STORE_NAME);
    const messageStore = transaction.objectStore(CHAT_MESSAGES_STORE_NAME);

    await Promise.all([
      new Promise<void>((resolve, reject) => {
        const request = chatStore.clear();
        request.onsuccess = () => resolve();
        request.onerror = () =>
          reject(new Error(request.error?.message || 'Failed to clear chats'));
      }),
      new Promise<void>((resolve, reject) => {
        const request = messageStore.clear();
        request.onsuccess = () => resolve();
        request.onerror = () =>
          reject(
            new Error(request.error?.message || 'Failed to clear messages')
          );
      }),
    ]);
  }

  // Check if IndexedDB is supported
  static isSupported(): boolean {
    return typeof indexedDB !== 'undefined';
  }
}

// Create singleton instance
export const indexedDBManager = new IndexedDBManager();

// Utility functions for easier usage
export const chatStorage = {
  // Initialize the database
  init: () => indexedDBManager.init(),

  // Save chat conversations for a specific chat ID
  saveChat: async (
    chatId: string,
    title: string,
    conversations: ConversationPair[]
  ): Promise<void> => {
    const now = new Date();
    const existingChat = await indexedDBManager.loadChat(chatId);

    const chat: StoredChat = {
      id: chatId,
      title,
      createdAt: existingChat?.createdAt || now,
      updatedAt: now,
      conversations,
    };

    await indexedDBManager.saveChat(chat);
  },

  // Load conversations for a specific chat ID
  loadChat: (chatId: string) => indexedDBManager.loadChat(chatId),

  // Load all chats
  loadAllChats: () => indexedDBManager.loadAllChats(),

  // Delete a chat
  deleteChat: (chatId: string) => indexedDBManager.deleteChat(chatId),

  // Update a single conversation within a chat
  updateConversation: (chatId: string, conversation: ConversationPair) =>
    indexedDBManager.updateConversation(chatId, conversation),

  // Clear all stored data
  clearAll: () => indexedDBManager.clearAllData(),

  // Check if storage is available
  isSupported: () => IndexedDBManager.isSupported(),
};
