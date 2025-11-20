import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Send, User } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

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
      content: "Hello! I'm your AI Coach. I can help you understand this task better and provide guidance on how to approach it. What would you like to know?",
      isAI: true,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: String(messages.length + 1),
      content: input,
      isAI: false,
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);

    // Mock AI response
    setTimeout(() => {
      const aiResponses = [
        "To approach this task, I'd recommend breaking it down into smaller steps: 1) Research the requirements, 2) Design the solution, 3) Implement the core functionality, 4) Test thoroughly.",
        "This is a common pattern in software development. You might want to look at similar implementations in the codebase for reference.",
        "If you're stuck, consider reaching out to your team members who have experience with this type of task. Collaboration is key!",
        "Make sure to allocate enough time for testing and code review. This will help catch issues early.",
      ];

      const aiMessage: Message = {
        id: String(messages.length + 2),
        content: aiResponses[Math.floor(Math.random() * aiResponses.length)],
        isAI: true,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    }, 1000);

    setInput("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          AI Coach
        </CardTitle>
        <CardDescription>Get help understanding and solving this task</CardDescription>
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
                  <p className="text-sm">{message.content}</p>
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
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
          />
          <Button onClick={handleSend}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
