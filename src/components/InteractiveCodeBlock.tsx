'use client';

import { useState, useEffect } from 'react';
import { useLearningStore } from '@/store/learningStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Play, Copy, Check, AlertTriangle, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface InteractiveCodeBlockProps {
  language: 'python' | 'javascript';
  initialCode: string;
  sectionId: string;
}

export function InteractiveCodeBlock({ 
  language, 
  initialCode, 
  sectionId 
}: InteractiveCodeBlockProps) {
  const { userCodeSnippets, updateUserCode } = useLearningStore();
  
  const [code, setCode] = useState(userCodeSnippets[sectionId] || initialCode);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Update code when section changes
  useEffect(() => {
    setCode(userCodeSnippets[sectionId] || initialCode);
    setOutput('');
    setError('');
  }, [sectionId, initialCode, userCodeSnippets]);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    updateUserCode(sectionId, newCode);
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setError('');
    setOutput('');

    try {
      // Simulate code execution
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock execution based on code content
      const mockExecution = () => {
        // Simple mock output based on code patterns
        if (code.includes('print(') || code.includes('console.log(')) {
          // Extract print statements
          const printMatches = code.match(/(?:print|console\.log)\s*\(\s*["']([^"']*)["']\s*\)/g);
          if (printMatches) {
            return printMatches.map(match => {
              const content = match.match(/["']([^"']*)["']/);
              return content ? content[1] : '';
            }).join('\n');
          }
        }

        if (code.includes('if') && code.includes('print')) {
          // Mock conditional output
          if (code.includes('> 0')) {
            return '正数';
          } else if (code.includes('< 0')) {
            return '负数';
          } else {
            return 'Hello, World!';
          }
        }

        return '代码执行成功！';
      };

      const result = mockExecution();
      setOutput(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '代码执行失败');
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const handleResetCode = () => {
    setCode(initialCode);
    updateUserCode(sectionId, initialCode);
    setOutput('');
    setError('');
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base">代码练习</CardTitle>
            <Badge variant="outline" className="text-xs">
              {language.toUpperCase()}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyCode}
              className="h-7 px-2"
            >
              {copied ? (
                <Check className="h-3 w-3" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetCode}
              className="h-7 px-2 text-xs"
            >
              重置
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="code" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="code" className="text-sm">
              代码
            </TabsTrigger>
            <TabsTrigger value="output" className="text-sm">
              输出
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="code" className="mt-0">
            <div className="space-y-3">
              <div className="relative">
                <Textarea
                  value={code}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  className="min-h-[200px] font-mono text-sm bg-muted/50 resize-none"
                  placeholder={`在${language === 'python' ? 'Python' : 'JavaScript'}中输入代码...`}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Button
                  size="sm"
                  onClick={handleRunCode}
                  disabled={isRunning}
                  className="flex items-center gap-2"
                >
                  {isRunning ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      运行中...
                    </>
                  ) : (
                    <>
                      <Play className="h-3 w-3" />
                      运行代码
                    </>
                  )}
                </Button>
                
                <div className="text-xs text-muted-foreground">
                  {code.length} 字符
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="output" className="mt-0">
            <div className="space-y-3">
              {error && (
                <Alert variant="destructive" className="mb-3">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {output && (
                <div className="rounded-lg border bg-muted/50">
                  <div className="border-b px-3 py-2 text-sm font-medium">
                    输出结果
                  </div>
                  <ScrollArea className="h-[200px]">
                    <pre className="p-3 text-sm font-mono whitespace-pre-wrap">{output}</pre>
                  </ScrollArea>
                </div>
              )}
              
              {!output && !error && (
                <div className="text-center py-8 text-sm text-muted-foreground"
                >
                  点击&#34;运行代码&#34;查看输出结果
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}