import React, { useState } from "react";
import hmis_logo from '../../assets/images/hmis_logo (1).png';
import bg_logo from '../../assets/images/bglogo.jpg';

const Login = () => {
  const [role, setRole] = useState("");
  const [organization, setOrganization] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    console.log({ role, organization, password });
    // 🔑 Add your login API integration here
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <div className="w-full max-w-md p-8 rounded-2xl backdrop-blur-md bg-white/10 border border-white/20 shadow-lg">
        {/* Heading */}
        {/* <div className="flex space-x-4"> */}
            <img src={hmis_logo} alt="HMIS Logo" className="flex justify-self-center mb-4 w-[260px] h-auto" />
            {/* <h2 className="text-2xl font-bold text-center mb-6 text-white">
                HMIS
            </h2> */}
        {/* </div> */}
        <p className="text-gray-400 text-center mb-8">
          Login to continue to HMIS
        </p>

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Select Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-gray-900 text-gray-100 border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            >
              <option value="">-- Select Role --</option>
              <option value="admin">Admin</option>
              <option value="doctor">Doctor</option>
              <option value="nurse">Nurse</option>
              <option value="receptionist">Receptionist</option>
            </select>
          </div>

          {/* Organization Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Organization Name
            </label>
            <input
              type="text"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder="Enter organization name"
              className="w-full px-3 py-2 rounded-lg bg-gray-900 text-gray-100 border border-gray-700 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full px-3 py-2 rounded-lg bg-gray-900 text-gray-100 border border-gray-700 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="cursor-pointer w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all shadow-lg"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
