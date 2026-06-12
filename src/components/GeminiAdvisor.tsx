import React, { useState, useRef, useEffect } from "react";
import { Sparkles, MessageCircle, Send, X, Bot, User, Trash2 } from "lucide-react";
import { useApp } from "../AppContext";

interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
}

export const GeminiAdvisor: React.FC = () => {
  const { expenses } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: inputText
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          expenses: expenses.slice(0, 50), // Send last 50 expenses
          history: messages.map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (!response.ok) throw new Error("Failed to get response");
      
      const data = await response.json();
      
      const botMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "model",
        content: data.reply
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "model",
        content: "Sorry, I couldn't connect to the AI brain. Please try again later."
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <>
      {/* Inline Dashboard Trigger Card */}
      {!isOpen && (
        <div 
          onClick={() => setIsOpen(true)}
          className="mt-4 bg-gradient-to-r from-indigo-500 rounded-2xl p-4 flex items-center justify-between cursor-pointer group shadow-sm transition-all hover:shadow-md to-purple-600 active:scale-[0.98]"
        >
          <div className="flex items-center gap-3 text-white">
            <div className="p-2 bg-white/20 rounded-xl">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-indigo-100 uppercase tracking-widest block font-mono">Gemini Intelligence</span>
              <span className="text-sm font-black text-white block">AI Financial Advisor</span>
            </div>
          </div>
          <div className="text-white bg-white/20 px-3 py-1.5 rounded-full text-[10px] font-bold">Ask</div>
        </div>
      )}

      {/* Chat Window Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/40 backdrop-blur-sm sm:items-center sm:justify-center p-0 sm:p-4">
          <div className="flex-1 w-full max-w-md bg-white flex flex-col overflow-hidden sm:rounded-3xl shadow-2xl animate-in slide-in-from-bottom-10 duration-300">
            <div className="bg-slate-900 p-4 shrink-0 flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <div>
                <h3 className="font-bold tracking-tight">Gemini Advisor</h3>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Financial Analysis</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
               {messages.length > 0 && (
                <button onClick={clearChat} className="p-2 text-slate-400 hover:text-white transition-colors" title="Clear Chat">
                  <Trash2 className="w-4 h-4" />
                </button>
               )}
               <button onClick={() => setIsOpen(false)} className="p-2 text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center px-4 opacity-50">
                <Bot className="w-12 h-12 text-slate-400 mb-3" />
                <p className="font-bold text-slate-600 text-sm">Ask me about your spending</p>
                <p className="text-xs text-slate-500 mt-1">E.g., "How can I cut down on my food expenses?" or "Do my bills look normal?"</p>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-800 text-white'}`}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                </div>
                <div className={`p-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-white border rounded-tl-sm text-slate-700 shadow-sm'}`}>
                  {msg.role === 'model' ? (
                     <div dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n(.*)/g, '<br/>$1') }} />
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 max-w-[85%]">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-slate-800 text-white">
                  <Sparkles className="w-4 h-4 animate-spin" />
                </div>
                <div className="p-3 bg-white border rounded-2xl rounded-tl-sm text-slate-400 text-sm shadow-sm flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t shrink-0 flex items-end gap-2">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask for advice..."
              className="flex-1 max-h-32 min-h-[44px] w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="h-[44px] w-[44px] shrink-0 bg-indigo-600 text-white rounded-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors"
            >
              <Send className="w-5 h-5 ml-1" />
            </button>
          </form>
        </div>
        </div>
      )}
    </>
  );
};
