import { useState } from "react";
import { aiStore } from "../store/aiStore";
import { Link, useNavigate } from "react-router-dom";

export default function Signup() {
  const [formData, setFormData] = useState({ fullname: "", username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const { signup } = aiStore();
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    const res = await signup(formData.fullname, formData.username, formData.email, formData.password);
    if (res.success) {
      navigate("/");
    } else {
      setError(res.error);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f7f8]">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Create Account</h2>
        {error && <div className="bg-red-50 text-red-500 p-3 rounded mb-4 text-sm text-center">{error}</div>}
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input type="text" name="fullname" onChange={handleChange} className="w-full px-4 py-2 border rounded outline-none focus:ring-2 focus:ring-black" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input type="text" name="username" onChange={handleChange} className="w-full px-4 py-2 border rounded outline-none focus:ring-2 focus:ring-black" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" name="email" onChange={handleChange} className="w-full px-4 py-2 border rounded outline-none focus:ring-2 focus:ring-black" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" name="password" onChange={handleChange} className="w-full px-4 py-2 border rounded outline-none focus:ring-2 focus:ring-black" required />
          </div>
          <button type="submit" className="w-full bg-black text-white py-2 rounded mt-2 hover:opacity-80 transition font-medium">
            Sign up
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}
