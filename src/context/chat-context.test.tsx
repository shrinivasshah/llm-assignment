import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { ChatProvider, useChatContext } from './chat-context';
import { EChatUserType } from './enums';
import type { ConversationPair } from './types';

vi.mock('@/utils/openai', () => ({
  client: {
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          async *[Symbol.asyncIterator]() {
            yield {
              choices: [{ delta: { content: 'Test response chunk 1' } }],
            };
            yield {
              choices: [{ delta: { content: ' Test response chunk 2' } }],
            };
          },
        }),
      },
    },
  },
  getConfigurationError: vi.fn().mockReturnValue(null),
  isConfigured: vi.fn().mockReturnValue(true),
}));

const mockAbort = vi.fn();
Object.defineProperty(global, 'AbortController', {
  value: class AbortController {
    signal = { aborted: false };
    abort = mockAbort;
  },
});

const createWrapper = ({ children }: { children: ReactNode }) => (
  <ChatProvider>{children}</ChatProvider>
);

describe('ChatContext CRUD Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Tab Management (Create, Read, Delete)', () => {
    it('should create a new tab', () => {
      const { result } = renderHook(() => useChatContext(), {
        wrapper: createWrapper,
      });

      act(() => {
        result.current.handleCreateTab('test-tab-1');
      });

      expect(result.current.tabs['test-tab-1']).toBeDefined();
      expect(result.current.tabs['test-tab-1']).toEqual([]);
      expect(result.current.activeTabId).toBe('test-tab-1');
    });

    it('should create multiple tabs and maintain state', () => {
      const { result } = renderHook(() => useChatContext(), {
        wrapper: createWrapper,
      });

      act(() => {
        result.current.handleCreateTab('tab-1');
      });

      // First tab should become active
      expect(result.current.activeTabId).toBe('tab-1');

      act(() => {
        result.current.handleCreateTab('tab-2');
        result.current.handleCreateTab('tab-3');
      });

      const tabIds = result.current.getTabIds();
      expect(tabIds).toHaveLength(3);
      expect(tabIds).toContain('tab-1');
      expect(tabIds).toContain('tab-2');
      expect(tabIds).toContain('tab-3');
      // First tab should remain active (logic is: only set active if no active tab exists)
      expect(result.current.activeTabId).toBe('tab-1');
    });

    it('should set active tab', () => {
      const { result } = renderHook(() => useChatContext(), {
        wrapper: createWrapper,
      });

      act(() => {
        result.current.handleCreateTab('tab-1');
        result.current.handleCreateTab('tab-2');
        result.current.handleSetActiveTab('tab-2');
      });

      expect(result.current.activeTabId).toBe('tab-2');
    });

    it('should remove a tab', () => {
      const { result } = renderHook(() => useChatContext(), {
        wrapper: createWrapper,
      });

      act(() => {
        result.current.handleCreateTab('tab-1');
        result.current.handleCreateTab('tab-2');
        result.current.handleRemoveTab('tab-1');
      });

      const tabIds = result.current.getTabIds();
      expect(tabIds).toHaveLength(1);
      expect(tabIds).toContain('tab-2');
      expect(tabIds).not.toContain('tab-1');
    });

    it('should get active tab conversations', () => {
      const { result } = renderHook(() => useChatContext(), {
        wrapper: createWrapper,
      });

      const testConversation: Omit<ConversationPair, 'timestamp'> = {
        id: 'conv-1',
        user: {
          id: 'user-1',
          content: 'Hello',
          sender: EChatUserType.USER,
          timestamp: new Date(),
        },
      };

      act(() => {
        result.current.handleCreateTab('test-tab');
        result.current.handleSetActiveTab('test-tab');
        result.current.handleAddConversation(testConversation);
      });

      const conversations = result.current.getActiveTabConversations();
      expect(conversations).toHaveLength(1);
      expect(conversations[0].id).toBe('conv-1');
      expect(conversations[0].user?.content).toBe('Hello');
    });
  });

  describe('Message Management (Create, Update)', () => {
    it('should set current message', () => {
      const { result } = renderHook(() => useChatContext(), {
        wrapper: createWrapper,
      });

      act(() => {
        result.current.handleSetCurrentMessage('Test message');
      });

      expect(result.current.currentMessage).toBe('Test message');
    });

    it('should clear current message', () => {
      const { result } = renderHook(() => useChatContext(), {
        wrapper: createWrapper,
      });

      act(() => {
        result.current.handleSetCurrentMessage('Test message');
        result.current.handleClearCurrentMessage();
      });

      expect(result.current.currentMessage).toBe('');
    });

    it('should add conversation to specific tab', () => {
      const { result } = renderHook(() => useChatContext(), {
        wrapper: createWrapper,
      });

      const testConversation: Omit<ConversationPair, 'timestamp'> = {
        id: 'conv-1',
        user: {
          id: 'user-1',
          content: 'Hello World',
          sender: EChatUserType.USER,
          timestamp: new Date(),
        },
        system: {
          id: 'system-1',
          content: 'Hello! How can I help you?',
          sender: EChatUserType.SYSTEM,
          timestamp: new Date(),
        },
      };

      act(() => {
        result.current.handleCreateTab('target-tab');
        result.current.handleAddConversation(testConversation, 'target-tab');
      });

      expect(result.current.tabs['target-tab']).toHaveLength(1);
      expect(result.current.tabs['target-tab'][0].user?.content).toBe(
        'Hello World'
      );
      expect(result.current.tabs['target-tab'][0].system?.content).toBe(
        'Hello! How can I help you?'
      );
    });

    it('should add conversation to active tab when no tab specified', () => {
      const { result } = renderHook(() => useChatContext(), {
        wrapper: createWrapper,
      });

      const testConversation: Omit<ConversationPair, 'timestamp'> = {
        id: 'conv-1',
        user: {
          id: 'user-1',
          content: 'Auto tab message',
          sender: EChatUserType.USER,
          timestamp: new Date(),
        },
      };

      act(() => {
        result.current.handleCreateTab('active-tab');
        result.current.handleSetActiveTab('active-tab');
        result.current.handleAddConversation(testConversation);
      });

      // Check if conversation was added to the active tab
      const conversations = result.current.getActiveTabConversations();
      expect(conversations).toHaveLength(1);
      expect(conversations[0].user?.content).toBe('Auto tab message');
    });

    it('should create default tab when adding conversation with no active tab', () => {
      const { result } = renderHook(() => useChatContext(), {
        wrapper: createWrapper,
      });

      const testConversation: Omit<ConversationPair, 'timestamp'> = {
        id: 'conv-1',
        user: {
          id: 'user-1',
          content: 'Default tab message',
          sender: EChatUserType.USER,
          timestamp: new Date(),
        },
      };

      act(() => {
        result.current.handleAddConversation(testConversation);
      });

      const tabIds = result.current.getTabIds();
      expect(tabIds).toHaveLength(1);
      expect(result.current.activeTabId).toBeTruthy();

      const conversations = result.current.getActiveTabConversations();
      expect(conversations).toHaveLength(1);
      expect(conversations[0].user?.content).toBe('Default tab message');
    });
  });

  describe('Message Editing', () => {
    it('should set editing message id', () => {
      const { result } = renderHook(() => useChatContext(), {
        wrapper: createWrapper,
      });

      act(() => {
        result.current.handleSetEditingMessageId('message-123');
      });

      expect(result.current.editingMessageId).toBe('message-123');
    });

    it('should clear editing message id', () => {
      const { result } = renderHook(() => useChatContext(), {
        wrapper: createWrapper,
      });

      act(() => {
        result.current.handleSetEditingMessageId('message-123');
        result.current.handleSetEditingMessageId(null);
      });

      expect(result.current.editingMessageId).toBeNull();
    });

    it('should update editing message content', async () => {
      const { result } = renderHook(() => useChatContext(), {
        wrapper: createWrapper,
      });

      // Create tab and conversation
      const testConversation: Omit<ConversationPair, 'timestamp'> = {
        id: 'conv-1',
        user: {
          id: 'user-1',
          content: 'Original message',
          sender: EChatUserType.USER,
          timestamp: new Date(),
        },
        system: {
          id: 'system-1',
          content: 'Original response',
          sender: EChatUserType.SYSTEM,
          timestamp: new Date(),
        },
      };

      act(() => {
        result.current.handleCreateTab('test-tab');
        result.current.handleSetActiveTab('test-tab');
        result.current.handleAddConversation(testConversation, 'test-tab');
      });

      await act(async () => {
        await result.current.handleUpdateEditingMessage(
          'system-1',
          'Updated system message'
        );
      });

      const conversations = result.current.getActiveTabConversations();
      expect(conversations[0].system?.content).toBe('Updated system message');
    });
  });

  describe('State Management', () => {
    it('should handle loading state', () => {
      const { result } = renderHook(() => useChatContext(), {
        wrapper: createWrapper,
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.isStreaming).toBe(false);
    });

    it('should handle error state', () => {
      const { result } = renderHook(() => useChatContext(), {
        wrapper: createWrapper,
      });

      expect(result.current.error).toBeNull();
    });

    it('should clear messages for specific tab', () => {
      const { result } = renderHook(() => useChatContext(), {
        wrapper: createWrapper,
      });

      const testConversation: Omit<ConversationPair, 'timestamp'> = {
        id: 'conv-1',
        user: {
          id: 'user-1',
          content: 'Message to clear',
          sender: EChatUserType.USER,
          timestamp: new Date(),
        },
      };

      act(() => {
        result.current.handleCreateTab('test-tab');
        result.current.handleAddConversation(testConversation, 'test-tab');
        result.current.handleClearMessages('test-tab');
      });

      expect(result.current.tabs['test-tab']).toHaveLength(0);
    });

    it('should clear messages for active tab when no tab specified', () => {
      const { result } = renderHook(() => useChatContext(), {
        wrapper: createWrapper,
      });

      const testConversation: Omit<ConversationPair, 'timestamp'> = {
        id: 'conv-1',
        user: {
          id: 'user-1',
          content: 'Message to clear',
          sender: EChatUserType.USER,
          timestamp: new Date(),
        },
      };

      act(() => {
        result.current.handleCreateTab('active-tab');
        result.current.handleSetActiveTab('active-tab');
        result.current.handleAddConversation(testConversation);
        result.current.handleClearMessages();
      });

      const conversations = result.current.getActiveTabConversations();
      expect(conversations).toHaveLength(0);
    });
  });

  describe('Send Message Integration', () => {
    it('should send message and create conversation pair', async () => {
      const { result } = renderHook(() => useChatContext(), {
        wrapper: createWrapper,
      });

      act(() => {
        result.current.handleCreateTab('test-tab');
        result.current.handleSetActiveTab('test-tab');
      });

      await act(async () => {
        await result.current.handleSendMessage('Hello, AI!', 'test-tab');
      });

      await waitFor(() => {
        const conversations = result.current.getActiveTabConversations();
        expect(conversations).toHaveLength(1);
        expect(conversations[0].user?.content).toBe('Hello, AI!');
        expect(conversations[0].system?.content).toContain(
          'Test response chunk'
        );
      });
    });

    it('should not send empty message', async () => {
      const { result } = renderHook(() => useChatContext(), {
        wrapper: createWrapper,
      });

      act(() => {
        result.current.handleCreateTab('test-tab');
      });

      await act(async () => {
        await result.current.handleSendMessage('   ', 'test-tab');
      });

      expect(result.current.tabs['test-tab']).toHaveLength(0);
    });

    it('should create default tab when sending message with no active tab', async () => {
      const { result } = renderHook(() => useChatContext(), {
        wrapper: createWrapper,
      });

      await act(async () => {
        await result.current.handleSendMessage('Auto tab message');
      });

      await waitFor(() => {
        const tabIds = result.current.getTabIds();
        expect(tabIds).toHaveLength(1);
        expect(result.current.activeTabId).toBeTruthy();

        const conversations = result.current.getActiveTabConversations();
        expect(conversations).toHaveLength(1);
        expect(conversations[0].user?.content).toBe('Auto tab message');
      });
    });
  });

  describe('Streaming and Cancellation', () => {
    it('should handle streaming cancellation', async () => {
      const { result } = renderHook(() => useChatContext(), {
        wrapper: createWrapper,
      });

      act(() => {
        result.current.handleCreateTab('test-tab');
        result.current.handleSetActiveTab('test-tab');
      });

      const sendPromise = act(async () => {
        await result.current.handleSendMessage('Test message for cancellation');
      });

      act(() => {
        result.current.handleCancelStreaming();
      });

      await sendPromise;

      expect(result.current.isStreaming).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('Context Hook', () => {
    it('should throw error when used outside provider', () => {
      const originalError = console.error;
      console.error = vi.fn();

      expect(() => {
        renderHook(() => useChatContext());
      }).toThrow('useChatContext must be used within a ChatProvider');

      console.error = originalError;
    });
  });
});
