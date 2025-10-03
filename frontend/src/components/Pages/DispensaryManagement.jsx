import React, { useState } from "react";

const DispensaryManagement = () => {
  const [medicines, setMedicines] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    strength: "",
    quantity: "",
    expiry: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.quantity) {
      alert("Medicine name and quantity are required!");
      return;
    }

    setMedicines((prev) => [...prev, formData]);
    setFormData({ name: "", category: "", strength: "", quantity: "", expiry: "" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 p-8 pt-40">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Form Section */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-2xl shadow-lg">
          <h1 className="text-2xl font-bold text-white mb-6">
            Add Medicine to Dispensary
          </h1>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {/* Medicine Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Medicine Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Paracetamol"
                required
                className="w-full px-3 py-2 rounded-lg bg-gray-900 text-gray-100 border border-gray-700 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category
              </label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="e.g., Painkiller, Antibiotic"
                className="w-full px-3 py-2 rounded-lg bg-gray-900 text-gray-100 border border-gray-700 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Strength (mg/ml) */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Strength
              </label>
              <input
                type="text"
                name="strength"
                value={formData.strength}
                onChange={handleChange}
                placeholder="e.g., 500mg, 10ml"
                className="w-full px-3 py-2 rounded-lg bg-gray-900 text-gray-100 border border-gray-700 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Quantity
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="e.g., 100"
                required
                className="w-full px-3 py-2 rounded-lg bg-gray-900 text-gray-100 border border-gray-700 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Expiry Date */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Expiry Date
              </label>
              <input
                type="date"
                name="expiry"
                value={formData.expiry}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-gray-900 text-gray-100 border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Submit Button */}
            <div className="lg:col-span-3">
              <button
                type="submit"
                className="cursor-pointer w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all shadow-lg"
              >
                Add Medicine
              </button>
            </div>
          </form>
        </div>

        {/* Medicines List */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-white mb-6">Dispensary Medicines</h2>

          {medicines.length === 0 ? (
            <p className="text-gray-400">No medicines added yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-800 text-gray-200">
                    <th className="p-3 text-left">Name</th>
                    <th className="p-3 text-left">Category</th>
                    <th className="p-3 text-left">Strength</th>
                    <th className="p-3 text-left">Quantity</th>
                    <th className="p-3 text-left">Expiry Date</th>
                  </tr>
                </thead>
                <tbody>
                  {medicines.map((med, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-gray-700 hover:bg-gray-800/50"
                    >
                      <td className="p-3 text-gray-100">{med.name}</td>
                      <td className="p-3 text-gray-100">{med.category || "-"}</td>
                      <td className="p-3 text-gray-100">{med.strength || "-"}</td>
                      <td className="p-3 text-gray-100">{med.quantity}</td>
                      <td className="p-3 text-gray-100">
                        {med.expiry ? med.expiry : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DispensaryManagement;
