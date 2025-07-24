'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Loader2, Plus, MoreHorizontal, Trash2, Edit, Bot } from 'lucide-react';
import { useLearningStore } from '@/store/learningStore';
import type { ChatMessage, AIProviderType } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Input } from './ui/input';
import { ContextReference } from './ContextReference';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChatMessageRenderer } from './ChatMessageRenderer';

const AI_PROVIDER_LABELS: Record<AIProviderType, string> = {
  openai: 'OpenAI',
  anthropic: 'Claude',
  deepseek: 'DeepSeek',
  doubao: '豆包',
};

export function AIChatSidebar() {
  const {
    chatSessions,
    activeChatSessionId,
    addMessageToActiveChat,
    createNewChat,
    switchChat,
    deleteChat,
    renameChat,
    selectedContent,
    setSelectedContent,
    aiProvider,
    setAIProvider,
    sendChatMessage,
    sendingMessage,
  } = useLearningStore();
  
  const activeSession = chatSessions.find(s => s.id === activeChatSessionId);
  const messages = useMemo(() => activeSession?.messages ?? [], [activeSession]);

  const [inputMessage, setInputMessage] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !activeChatSessionId || sendingMessage) return;

    const message = inputMessage;
    setInputMessage('');
    setSelectedContent(null);

    // Call the store's sendChatMessage which handles API call
    await sendChatMessage(message);
  };


  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleRename = (sessionId: string) => {
    if (renameValue.trim()) {
      renameChat(sessionId, renameValue.trim());
      setRenamingId(null);
      setRenameValue('');
    }
  };

  return (
    <div className="h-full flex flex-col bg-background rounded-lg">
      {/* Header */}
      <div className="p-3 border-b flex justify-between items-center">
        {/* AI Provider Selector */}
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-muted-foreground" />
          <Select value={aiProvider} onValueChange={(value) => setAIProvider(value as AIProviderType)}>
            <SelectTrigger className="h-8 w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="openai">OpenAI</SelectItem>
              <SelectItem value="anthropic">Claude</SelectItem>
              <SelectItem value="deepseek">DeepSeek</SelectItem>
              <SelectItem value="doubao">豆包</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" onClick={createNewChat} className="h-8 w-8">
            <Plus className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <div className="px-2 py-1.5 text-sm font-semibold">对话记录</div>
              <DropdownMenuSeparator />
              <ScrollArea className="max-h-80">
                {chatSessions.map(session => (
                  <DropdownMenuItem 
                    key={session.id} 
                    onClick={() => switchChat(session.id)}
                    className={`flex justify-between items-center ${session.id === activeChatSessionId ? 'bg-accent' : ''}`}
                  >
                    {renamingId === session.id ? (
                      <Input 
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleRename(session.id)}
                        onBlur={() => handleRename(session.id)}
                        autoFocus
                        className="h-8"
                      />
                    ) : (
                      <span className="truncate flex-1">{session.title}</span>
                    )}
                    <div className="flex items-center ml-2">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); setRenamingId(session.id); setRenameValue(session.title); }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={(e) => { e.stopPropagation(); deleteChat(session.id); }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </DropdownMenuItem>
                ))}
              </ScrollArea>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-3 space-y-3">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-[95%] space-y-1">
                  {message.contextReference && message.sender === 'user' && (
                    <div className="mb-2">
                      <ContextReference
                        reference={message.contextReference}
                        onClear={() => {}}
                      />
                    </div>
                  )}
                  <div
                    className={`rounded-lg px-3 py-2 text-sm ${
                      message.sender === 'user'
                        ? 'bg-primary text-primary-foreground ml-auto'
                        : 'bg-muted'
                    }`}
                  >
                    <ChatMessageRenderer content={message.content} />
                  </div>
                  <div className={`text-xs text-muted-foreground px-1 ${
                    message.sender === 'user' ? 'text-right' : ''
                  }`}>
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            ))}
            
            {sendingMessage && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    AI正在思考...
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Input Area */}
      <div className="p-3 border-t space-y-2">
        {selectedContent && (
          <ContextReference 
            reference={selectedContent} 
            onClear={() => setSelectedContent(null)} 
          />
        )}
        <div className="flex gap-2">
          <Textarea
            data-chat-input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={activeChatSessionId ? "输入你的问题..." : "请先新建或选择一个对话"}
            className="min-h-[36px] max-h-[100px] resize-none text-sm"
            rows={1}
            disabled={!activeChatSessionId || sendingMessage}
          />
          <Button
            size="sm"
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || sendingMessage || !activeChatSessionId}
            className="self-end h-9 w-9 p-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          按 Enter 发送，Shift+Enter 换行 | Command+L 引用选中内容
        </p>
      </div>
    </div>
  );
}