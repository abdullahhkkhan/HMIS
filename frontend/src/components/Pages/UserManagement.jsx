import React, { useState } from "react";

const UserManagement = () => {
  const [formData, setFormData] = useState({
    username: "", // This will be the role
    organization: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    console.log("New User Created:", formData);
    // 🔑 API call for user creation goes here
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 p-8 pt-40">
      <div className="max-w-xl mx-auto bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold text-white mb-6">User Management</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username (User Role) */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              User Role (Username)
            </label>
            <select
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 rounded-lg bg-gray-900 text-gray-100 border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">-- Select Role --</option>
              <option value="admin">Admin</option>
              <option value="doctor">Doctor</option>
              <option value="nurse">Nurse</option>
              <option value="receptionist">Receptionist</option>
              <option value="pharmacist">Pharmacist</option>
            </select>
          </div>

          {/* Organization */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Organization Name
            </label>
            <input
              type="text"
              name="organization"
              value={formData.organization}
              onChange={handleChange}
              placeholder="Enter organization name"
              className="w-full px-3 py-2 rounded-lg bg-gray-900 text-gray-100 border border-gray-700 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Email (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email (Optional)
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email address"
              className="w-full px-3 py-2 rounded-lg bg-gray-900 text-gray-100 border border-gray-700 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              required
              className="w-full px-3 py-2 rounded-lg bg-gray-900 text-gray-100 border border-gray-700 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter password"
              required
              className="w-full px-3 py-2 rounded-lg bg-gray-900 text-gray-100 border border-gray-700 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all shadow-lg"
          >
            Create User
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserManagement;
