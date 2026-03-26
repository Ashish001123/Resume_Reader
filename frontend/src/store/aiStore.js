import { create } from "zustand"
import axiosInstance from "../config/axios";

export const aiStore = create((set) => ({
  messages: [],
  loading: false,
  error: null,

  sendMessage: async (text) => {
    set((state) => ({
      messages: [...state.messages, { role: "user", content: text }],
      loading: true,
      error: null
    }));

    try {
      const res = await axiosInstance.post("/chat", {
        message: text
      });

      set((state) => ({
        messages: [
          ...state.messages,
          { role: "assistant", content: res.data?.response || "⚠️ No response" }
        ],
        loading: false
      }));
    } catch (error) {
      set({ loading: false, error: "Something went wrong" });
    }
  },

  uploadResume: async (file) => {
    set((state) => ({
      messages: [
        ...state.messages,
        { role: "user", content: `📄 Resume Uploaded: ${file.name}` }
      ],
      loading: true
    }));

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await axiosInstance.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      set((state) => ({
        messages: [
          ...state.messages,
          { role: "assistant", content: res.data.analysis }
        ],
        loading: false
      }));
    } catch (error) {
      set({ loading: false, error: "Upload failed" });
      console.log(error);
    }
  }
}));