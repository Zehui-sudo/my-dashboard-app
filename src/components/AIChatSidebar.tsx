'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Loader2, Plus, MoreHorizontal, Trash2, Edit, Bot } from 'lucide-react';
import { useLearningStore } from '@/store/learningStore';
import type { ChatMessage } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Input } from './ui/input';
import { ContextReference } from './ContextReference';
import { callAI } from '@/services/aiService';
import { AI_PROVIDERS } from '@/config/aiProviders';

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
    aiModel,
    setAiProvider,
    setAiModel,
  } = useLearningStore();
  
  const activeSession = chatSessions.find(s => s.id === activeChatSessionId);
  const messages = useMemo(() => activeSession?.messages ?? [], [activeSession]);

  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !activeChatSessionId) return;

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const userMessage: Omit<ChatMessage, 'id' | 'timestamp'> = {
      content: inputMessage,
      sender: 'user',
      contextReference: selectedContent || undefined,
    };

    addMessageToActiveChat(userMessage);
    setInputMessage('');
    setSelectedContent(null);
    setIsTyping(true);
    setError(null);
    
    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
      // Get all messages in the active session
      const sessionMessages = activeSession?.messages 
        ? [...activeSession.messages, userMessage as ChatMessage] 
        : [userMessage as ChatMessage];

      // Call AI service
      const aiResponse = await callAI(
        aiProvider,
        aiModel,
        sessionMessages,
        abortControllerRef.current.signal
      );

      const aiMessage: Omit<ChatMessage, 'id' | 'timestamp'> = {
        content: aiResponse,
        sender: 'ai',
      };
      
      addMessageToActiveChat(aiMessage);
    } catch (err) {
      console.error('AI API error:', err);
      
      let errorMessage = 'AI服务出现错误，请稍后重试';
      
      if (err instanceof Error) {
        if (err.name === 'AIError') {
          errorMessage = err.message;
        } else if (err.name === 'AbortError') {
          errorMessage = '请求已被取消';
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsTyping(false);
      abortControllerRef.current = null;
    }
  };

  const generateAIResponse = (question: string) => {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('例子') || lowerQuestion.includes('示例')) {
      return '这是一个很好的问题！让我给你一个具体的例子：\n\n假设我们要创建一个简单的计算器程序，我们可以这样写：\n\n```python\ndef add(a, b):\n    return a + b\n\nresult = add(5, 3)\nprint(f"5 + 3 = {result}")\n```\n\n这个例子展示了函数的定义和调用。你可以试着修改参数看看结果！';
    }
    
    if (lowerQuestion.includes('为什么') || lowerQuestion.includes('原理')) {
      return '这个问题涉及到底层原理。简单来说，这是因为：\n\n1. 语言的语法规则定义了这种结构\n2. 编译器/解释器按照这些规则处理代码\n3. 最终转换为机器可以理解的指令\n\n这种设计让代码更易读、易维护，同时保持了强大的功能。';
    }
    
    if (lowerQuestion.includes('错误') || lowerQuestion.includes('bug')) {
      return '遇到错误是正常的！让我帮你分析一下：\n\n常见错误类型：\n• 语法错误：检查括号和引号是否匹配\n• 逻辑错误：仔细查看条件判断\n• 运行时错误：确保变量已定义\n\n你可以把错误信息发给我，我来帮你具体分析！';
    }
    
    return `很好的问题！关于“${question}”，让我来解释一下：\n\n这个问题的核心在于理解基础概念。建议你：\n1. 先仔细阅读上面的教程内容\n2. 动手修改代码示例，观察结果\n3. 如果有具体疑问，可以问得更详细一些\n\n你觉得哪个部分还需要进一步解释呢？`;
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

  const handleCancelRequest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsTyping(false);
    }
  };

  const handleProviderChange = (providerId: string) => {
    setAiProvider(providerId as import('@/config/aiProviders').AIProviderId);
    
    // Also update the model to the provider's default model
    const provider = AI_PROVIDERS.find(p => p.id === providerId);
    if (provider && provider.models.length > 0) {
      setAiModel(provider.models[0].id as import('@/config/aiProviders').AIModelId);
    }
  };

  const handleModelChange = (modelId: string) => {
    setAiModel(modelId as import('@/config/aiProviders').AIModelId);
  };

  return (
    <div className="flex flex-col bg-background rounded-lg h-full">
      {/* Header */}
      <div className="p-3 border-b flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <span className="font-medium">AI 助手</span>
        </div>
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs">
                {AI_PROVIDERS.find(p => p.id === aiProvider)?.name || 'AI'}: {
                  AI_PROVIDERS.find(p => p.id === aiProvider)?.models.find(m => m.id === aiModel)?.name || aiModel
                }
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <div className="px-2 py-1.5 text-sm font-semibold">AI 模型选择</div>
              <DropdownMenuSeparator />
              {AI_PROVIDERS.map(provider => (
                <div key={provider.id}>
                  <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase">
                    {provider.name}
                  </div>
                  {provider.models.map(model => (
                    <DropdownMenuItem 
                      key={model.id}
                      onClick={() => {
                        handleProviderChange(provider.id);
                        handleModelChange(model.id);
                      }}
                      className={`${aiProvider === provider.id && aiModel === model.id ? 'bg-accent' : ''}`}
                    >
                      <div className="flex flex-col">
                        <span>{model.name}</span>
                        <span className="text-xs text-muted-foreground">{model.description}</span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
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
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="p-3 space-y-3">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-[85%] space-y-1">
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
                    <div className="whitespace-pre-wrap">{message.content}</div>
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

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    AI正在思考...
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-5 px-1 text-xs"
                      onClick={handleCancelRequest}
                    >
                      取消
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="flex justify-start">
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <span>错误: {error}</span>
                  </div>
                </div>
              </div>
            )}
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
            disabled={!activeChatSessionId || isTyping}
          />
          <Button
            size="sm"
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping || !activeChatSessionId}
            className="self-end h-9 w-9 p-0"
          >
            {isTyping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          按 Enter 发送，Shift+Enter 换行 | Command+L 引用选中内容
        </p>
      </div>
    </div>
  );
}