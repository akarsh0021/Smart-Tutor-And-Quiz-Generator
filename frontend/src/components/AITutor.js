// src/components/AITutor.js
import React, { useState, useRef, useEffect } from "react";
import { Send, LogOut, BookOpen, User, Bot } from "lucide-react";

function AITutor({ onSelectTopic, user, onLogout }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Welcome ${user.username || user.name}! 👋  
I’m your AI Tutor 🤖  

• Ask any topic  
• Get clear explanations  
• Generate quizzes to test yourself  

Let’s begin 🚀`,
    },
  ]);

  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentTopic, setCurrentTopic] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || loading) return;

    const userMessage = inputValue.trim();
    setInputValue("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/ai-tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: userMessage,
          conversation_history: messages,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.answer },
        ]);
        setCurrentTopic(userMessage);
      } else {
        throw new Error();
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Unable to fetch response." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-amber-50 flex">

      {/* SIDEBAR */}
      <aside className="w-72 bg-white/90 backdrop-blur-xl border-r border-gray-200 p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg text-white">
            <Bot size={22} />
          </div>
          <div>
            <h2 className="font-bold text-gray-800">AI Tutor</h2>
            <p className="text-sm text-gray-500">Learning Platform</p>
          </div>
        </div>

        <div className="bg-amber-100 border border-amber-200 rounded-xl p-4 mb-6">
          <p className="text-xs text-gray-600">Logged in as</p>
          <p className="font-semibold text-gray-800">
            {user.username || user.name}
          </p>
        </div>

        {currentTopic && (
          <button
            onClick={() => onSelectTopic(currentTopic)}
            className="mb-4 flex items-center gap-2 px-4 py-3 bg-amber-500 text-white rounded-xl font-semibold shadow hover:bg-amber-600 transition"
          >
            <BookOpen size={18} />
            Generate Quiz
          </button>
        )}

        <button
          onClick={onLogout}
          className="mt-auto flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100 transition"
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      {/* MAIN CHAT */}
      <main className="flex-1 flex flex-col px-6 py-6">

        {/* CHAT CARD */}
        <div className="flex-1 bg-white/90 backdrop-blur-xl border border-gray-200 rounded-3xl shadow-2xl flex flex-col">

          {/* HEADER */}
          <div className="border-b px-6 py-4">
            <h1 className="text-lg font-bold text-gray-800">
              Ask Your AI Tutor
            </h1>
            <p className="text-sm text-gray-500">
              Learn concepts step by step
            </p>
          </div>

          {/* MESSAGES */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 bg-gray-50/50 rounded-t-3xl">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div className="flex gap-3 max-w-[75%]">
                  {msg.role === "assistant" && (
                    <div className="w-9 h-9 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow">
                      <Bot size={16} />
                    </div>
                  )}

                  <div
                    className={`px-5 py-4 rounded-2xl text-sm leading-relaxed shadow
                      ${
                        msg.role === "user"
                          ? "bg-amber-500 text-white rounded-br-sm"
                          : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm"
                      }`}
                  >
                    {msg.content}
                  </div>

                  {msg.role === "user" && (
                    <div className="w-9 h-9 bg-amber-400 rounded-full flex items-center justify-center shadow">
                      <User size={16} />
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <p className="text-sm text-gray-400 italic">
                AI is thinking...
              </p>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* INPUT */}
          <div className="border-t bg-white p-4 rounded-b-3xl">
            <div className="flex gap-3">
              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Ask a topic (e.g. Explain DBMS)"
                className="flex-1 px-4 py-3 rounded-xl border focus:ring-2 focus:ring-amber-400 outline-none"
                disabled={loading}
              />
              <button
                onClick={handleSendMessage}
                disabled={loading}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold shadow hover:bg-indigo-700 transition flex items-center gap-2"
              >
                <Send size={16} />
                Send
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AITutor;
