import { useState, useRef, useEffect } from "react";
import { aiStore } from "../store/aiStore";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const AiChatContainer = () => {
  const [input, setInput] = useState("");
  const { 
    sendMessage, 
    uploadResume, 
    messages, 
    loading, 
    sessions, 
    fetchSessions, 
    loadSession, 
    currentSessionId 
  } = aiStore();
  
  const chatEndRef = useRef(null);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleSendMessage = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput("");
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      uploadResume(file);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="h-screen flex bg-[#f7f7f8]">
      <div className="w-[260px] bg-[#202123] text-white flex flex-col p-4 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">AI Resume</h2>
        <button 
          onClick={() => window.location.reload()} // Quick hack to reset state for new chat
          className="bg-[#343541] p-2 rounded-lg text-sm hover:bg-[#40414f] transition flex items-center gap-2 mb-6"
        >
          <span>✏️</span> New Chat
        </button>
        <div className="text-xs font-semibold text-gray-500 mb-3 px-2">RECENT CHATS</div>
        <div className="flex flex-col gap-2 flex-1">
          {sessions.map(session => (
            <button
              key={session._id}
              onClick={() => loadSession(session._id)}
              className={`text-left truncate px-3 py-2 rounded-lg text-sm transition-colors ${currentSessionId === session._id ? 'bg-[#343541]' : 'hover:bg-[#2A2B32] text-gray-300'}`}
            >
              📄 {session.title}
            </button>
          ))}
        </div>
        
        <div className="mt-auto border-t border-gray-700 pt-4 pb-2">
           <button 
             onClick={aiStore.getState().logout} 
             className="w-full text-left text-sm text-gray-400 hover:text-white transition px-2 flex justify-between items-center"
           >
             <span>{aiStore.getState().authUser?.fullname}</span>
             <span className="text-xs border border-gray-600 px-2 py-1 rounded">Logout</span>
           </button>
        </div>
      </div>
      <div className="flex-1 flex flex-col">

        <div className="h-14 border-b flex items-center justify-between px-6 bg-white shrink-0">
          <h1 className="font-semibold text-gray-700">
            🤖 Resume Analyzer 
            {loading && <span className="ml-3 text-xs text-blue-500 bg-blue-50 px-2 py-1 rounded">Thinking...</span>}
          </h1>

          <label className="cursor-pointer bg-black text-white px-3 py-1.5 rounded-md text-sm hover:opacity-80 transition">
            Upload PDF
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

          {messages.length === 0 && (
            <div className="text-center text-gray-400 mt-32">
              <div className="text-4xl mb-4">📄</div>
              <h2 className="text-xl font-medium mb-2">
                Upload your resume to begin
              </h2>
              <p className="text-sm">
                Get instant AI-powered feedback, ATS score, and architecture improvements.
              </p>
            </div>
          )}

          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[700px] px-4 py-3 rounded-xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-black text-white"
                    : "bg-white border shadow-sm text-gray-800"
                }`}
              >
                <div className="prose prose-sm max-w-none [&>h2]:mt-4 [&>ul]:mb-3">
              
                  {msg.role === "assistant" && msg.content === "" && (
                    <span className="animate-pulse">●</span>
                  )}
                  {msg.role === "user" && msg.content === "Analyze my resume" ? (
                     <span className="italic text-gray-300">📄 System: Analyzing uploaded resume...</span>
                  ) : (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h2: (props) => <h2 className="text-base font-semibold mt-3 mb-2" {...props} />,
                        li: (props) => <li className="ml-4 list-disc mb-1" {...props} />,
                        strong: (props) => <strong className="font-bold text-gray-900" {...props} />,
                        p: (props) => <p className="mb-2 leading-relaxed" {...props} />
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  )}
                </div>
              </div>
            </div>
          ))}

          <div ref={chatEndRef} />
        </div>

        <div className="border-t bg-white p-4 flex items-center gap-3 shrink-0">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={!currentSessionId || loading}
            placeholder={currentSessionId ? "Ask anything about your resume..." : "Upload a resume first to chat"}
            className="flex-1 px-4 py-3 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100 disabled:cursor-not-allowed transition"
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <button
            onClick={handleSendMessage}
            disabled={!currentSessionId || loading || !input.trim()}
            className="bg-black text-white px-6 py-3 rounded-lg hover:opacity-80 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium transition"
          >
            Send
          </button>
        </div>

      </div>
    </div>
  );
};

export default AiChatContainer;