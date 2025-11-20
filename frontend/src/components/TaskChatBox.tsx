import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Send, User, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { aiCoachApi } from "@/lib/api";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  id: string;
  content: string;
  isAI: boolean;
  timestamp: Date;
}

interface TaskChatBoxProps {
  taskId: string;
}

export const TaskChatBox = ({ taskId }: TaskChatBoxProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! I'm your AI Coach powered by Google Gemini. I can help you understand this task better and provide guidance on how to approach it. I have access to your task details, project context, and can help you break down problems. What would you like to know?",
      isAI: true,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentModel, setCurrentModel] = useState<string | null>(null);
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  useEffect(() => {
    // Check available models on mount
    const checkModels = async () => {
      try {
        const data = await aiCoachApi.getAvailableModels();
        setAvailableModels(data.availableModels || []);
        setCurrentModel(data.recommended || null);
      } catch (error) {
        console.error("Failed to check available models:", error);
      }
    };
    checkModels();
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: String(Date.now()),
      content: input,
      isAI: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Send message to Gemini API with conversation history
      const response = await aiCoachApi.chat(taskId, input, messages);

      // Update current model if it changed
      if (response.model && response.model !== currentModel) {
        setCurrentModel(response.model);
      }

      const aiMessage: Message = {
        id: String(Date.now() + 1),
        content: response.response,
        isAI: true,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      console.error("AI Coach error:", error);
      
      const errorMessage: Message = {
        id: String(Date.now() + 1),
        content: error.message || "I apologize, but I encountered an error. Please try again or contact your team for assistance.",
        isAI: true,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
      toast.error("Failed to get AI response");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          AI Coach
          {currentModel && (
            <span className="text-xs font-normal text-muted-foreground">
              (using {currentModel})
            </span>
          )}
        </CardTitle>
        <CardDescription>
          Get help understanding and solving this task
          {/* {availableModels.length > 0 && (
            <span className="text-xs block mt-1">
              Available models: {availableModels.join(', ')}
            </span>
          )} */}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4 mb-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.isAI ? "" : "flex-row-reverse"}`}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.isAI ? "bg-primary" : "bg-muted"
                }`}>
                  {message.isAI ? (
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </div>
                <div
                  className={`flex-1 rounded-lg p-3 ${
                    message.isAI ? "bg-muted" : "bg-primary text-primary-foreground"
                  }`}
                >
                  {message.isAI ? (
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({ node, ...props }) => <h1 className="text-lg font-bold mb-2 mt-4" {...props} />,
                          h2: ({ node, ...props }) => <h2 className="text-base font-bold mb-2 mt-3" {...props} />,
                          h3: ({ node, ...props }) => <h3 className="text-sm font-bold mb-1 mt-2" {...props} />,
                          p: ({ node, ...props }) => <p className="mb-2 text-sm leading-relaxed" {...props} />,
                          ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-2 space-y-1" {...props} />,
                          ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-2 space-y-1" {...props} />,
                          li: ({ node, ...props }) => <li className="text-sm ml-2" {...props} />,
                          code: ({ node, inline, ...props }) => 
                            inline ? (
                              <code className="bg-primary/10 px-1.5 py-0.5 rounded text-xs font-mono" {...props} />
                            ) : (
                              <code className="block bg-primary/10 p-2 rounded text-xs font-mono overflow-x-auto my-2" {...props} />
                            ),
                          pre: ({ node, ...props }) => <pre className="bg-primary/10 p-3 rounded overflow-x-auto my-2" {...props} />,
                          strong: ({ node, ...props }) => <strong className="font-bold text-foreground" {...props} />,
                          em: ({ node, ...props }) => <em className="italic" {...props} />,
                          blockquote: ({ node, ...props }) => (
                            <blockquote className="border-l-4 border-primary pl-3 italic my-2" {...props} />
                          ),
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm">{message.content}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex gap-2">
          <Input
            placeholder="Ask the AI Coach..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && !isLoading && handleSend()}
            disabled={isLoading}
          />
          <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
