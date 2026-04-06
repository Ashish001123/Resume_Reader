import { create } from "zustand";

const NODE_API = "http://localhost:3000/api";
const PYTHON_API = "http://localhost:8000";

export const aiStore = create((set, get) => ({
  authUser: JSON.parse(localStorage.getItem("chat-user")) || null,
  token: localStorage.getItem("chat-token") || null,
  sessions: [], 
  currentSessionId: null,
  messages: [], 
  loading: false,
  error: null,

  login: async (username, password) => {
    try {
      const res = await fetch(`${NODE_API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("chat-user", JSON.stringify(data));
        localStorage.setItem("chat-token", data.token);
        set({ authUser: data, token: data.token });
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch (e) {
      return { success: false, error: "Network error" };
    }
  },

  signup: async (fullname, username, email, password) => {
    try {
      const res = await fetch(`${NODE_API}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullname, username, email, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("chat-user", JSON.stringify(data));
        localStorage.setItem("chat-token", data.token);
        set({ authUser: data, token: data.token });
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch (e) {
      return { success: false, error: "Network error" };
    }
  },

  logout: () => {
    localStorage.removeItem("chat-user");
    localStorage.removeItem("chat-token");
    set({ authUser: null, token: null, sessions: [], messages: [], currentSessionId: null });
  },

  fetchSessions: async () => {
    const { authUser } = get();
    if (!authUser) return;
    try {
      const res = await fetch(`${NODE_API}/chats/user/${authUser._id}`);
      const data = await res.json();
      if (res.ok) set({ sessions: data });
    } catch (error) {
      console.error("Failed to fetch sessions", error);
    }
  },

  loadSession: async (sessionId) => {
    set({ loading: true, currentSessionId: sessionId });
    try {
      const res = await fetch(`${NODE_API}/chats/sessions/${sessionId}`);
      const data = await res.json();
      set({ messages: data.messages || [], loading: false });
    } catch (error) {
      set({ error: "Failed to load chat", loading: false });
    }
  },

  uploadResume: async (file) => {
    const { authUser } = get();
    if (!authUser) return;
    set((state) => ({ loading: true, messages: [] }));

    try {
      const formData = new FormData();
      formData.append("file", file);
      const pythonRes = await fetch(`${PYTHON_API}/extract`, { method: "POST", body: formData });
      const pythonData = await pythonRes.json();
  
      const nodeRes = await fetch(`${NODE_API}/chats/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: authUser._id, resumeText: pythonData.text })
      });
      const session = await nodeRes.json();
      
      set({ currentSessionId: session._id, loading: false });
      
      get().fetchSessions();
      get().sendMessage("Analyze my resume");

    } catch (error) {
      set({ loading: false, error: "Upload failed" });
      console.log(error);
    }
  },

  sendMessage: async (text) => {
    const { currentSessionId, messages } = get();
    if (!currentSessionId) return;

    set({ messages: [...messages, { role: "user", content: text }] });

    try {
      const res = await fetch(`${NODE_API}/chats/sessions/${currentSessionId}/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text })
      });

      if (!res.body) throw new Error("No readable stream");

      set((state) => ({
        messages: [...state.messages, { role: "assistant", content: "" }]
      }));

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        
        set((state) => {
          const newMessages = [...state.messages];
          newMessages[newMessages.length - 1].content += chunk;
          return { messages: newMessages };
        });
      }
      
      get().fetchSessions();
    } catch (error) {
      set({ error: "Something went wrong" });
    }
  }
}));