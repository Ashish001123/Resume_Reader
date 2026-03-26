
import { useState, useRef, useEffect } from "react";
import { aiStore } from "../store/aiStore";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const AiChatContainer = () => {
  const [input, setInput] = useState("");
  const { sendMessage, uploadResume, messages, loading } = aiStore();
  const chatEndRef = useRef(null);

  const handleSendMessage = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput("");
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) uploadResume(file);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <div className="h-screen flex bg-[#f7f7f8]">

      <div className="w-[260px] bg-[#202123] text-white flex flex-col p-4">
        <h2 className="text-lg font-semibold mb-4">AI Resume</h2>

        <button className="bg-[#343541] p-2 rounded-lg text-sm hover:bg-[#40414f] transition">
          + New Chat
        </button>

        <div className="mt-6 text-xs text-gray-400">
          Upload a resume to start analysis
        </div>
      </div>

      <div className="flex-1 flex flex-col">

        <div className="h-14 border-b flex items-center justify-between px-6 bg-white">
          <h1 className="font-semibold text-gray-700">
            🤖 Resume Analyzer
          </h1>

          <label className="cursor-pointer bg-black text-white px-3 py-1.5 rounded-md text-sm hover:opacity-80">
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
            <div className="text-center text-gray-400 mt-20">
              <h2 className="text-xl font-medium mb-2">
                Upload your resume 📄
              </h2>
              <p className="text-sm">
                Get instant AI-powered feedback and ATS score
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
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h2: ({ ...props }) => (
                        <h2 className="text-base font-semibold mt-3 mb-2" {...props} />
                      ),
                      li: ({ ...props }) => (
                        <li className="ml-4 list-disc mb-1" {...props} />
                      ),
                      strong: ({ ...props }) => (
                        <strong className="font-semibold" {...props} />
                      ),
                      p: ({ ...props }) => (
                        <p className="mb-2 leading-relaxed" {...props} />
                      )
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-gray-400">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300"></div>
              <span className="text-sm">Analyzing...</span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        <div className="border-t bg-white p-4 flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about your resume..."
            className="flex-1 px-4 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-black"
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          />

          <button
            onClick={handleSendMessage}
            disabled={loading}
            className="bg-black text-white px-5 py-2 rounded-lg hover:opacity-80 disabled:bg-gray-400"
          >
            Send
          </button>
        </div>

      </div>
    </div>
  );
};

export default AiChatContainer;