// src/pages/PatientRegistrationPage.jsx
import React, { useState } from "react";

const PatientRegistrationPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    contact: "",
    address: "",
    cnic: "",
    guardian: "",
    doctor: "",
    department: "",
    type: "",
    notes: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Patient Registered:", formData);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 pt-40">
      <h1 className="text-2xl font-bold mb-6">Patient Registration</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-6 rounded-2xl shadow-lg space-y-6"
      >
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-sm font-medium">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 focus:ring focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Age</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              required
              className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
              className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600"
            >
              <option value="">Select</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">
              Contact Number
            </label>
            <input
              type="text"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              required
              className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">CNIC</label>
            <input
              type="text"
              name="cnic"
              value={formData.cnic}
              onChange={handleChange}
              className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Guardian Name</label>
            <input
              type="text"
              name="guardian"
              value={formData.guardian}
              onChange={handleChange}
              className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600"
            />
          </div>
        </div>

        {/* Doctor & Department */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-sm font-medium">Referred Doctor</label>
            <select
              name="doctor"
              value={formData.doctor}
              onChange={handleChange}
              className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600"
            >
              <option value="">Select Doctor</option>
              <option>Dr. Ahmed</option>
              <option>Dr. Sara</option>
              <option>Dr. Kamran</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Department</label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600"
            >
              <option value="">Select Department</option>
              <option>Cardiology</option>
              <option>Orthopedics</option>
              <option>Neurology</option>
              <option>General</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Patient Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600"
            >
              <option value="">Select Type</option>
              <option>Zakat</option>
              <option>Welfare</option>
              <option>Private</option>
              <option>Angio</option>
            </select>
          </div>
        </div>

        {/* Address & Notes */}
        <div>
          <label className="block mb-1 text-sm font-medium">Address</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows={2}
            className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600"
          ></textarea>
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600"
          ></textarea>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            Register Patient
          </button>
        </div>
      </form>
    </div>
  );
};

export default PatientRegistrationPage;
