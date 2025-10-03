import React, { useState } from "react";

const DispensaryIssue = () => {
  // Example registered patients
  const patients = [
    { id: "P-101", name: "John Doe", age: 40, gender: "Male" },
    { id: "P-102", name: "Sara Ali", age: 29, gender: "Female" },
  ];

  // Example prescriptions (these come from PatientHistory / doctor)
  const prescriptions = {
    "P-101": [
      { medicine: "Paracetamol", dosage: "500mg", perDay: "2x", days: 5 },
      { medicine: "Cough Syrup", dosage: "10ml", perDay: "3x", days: 7 },
    ],
    "P-102": [
      { medicine: "Amoxicillin", dosage: "250mg", perDay: "2x", days: 10 },
    ],
  };

  // Example stock in dispensary
  const medicinesList = [
    { id: 1, name: "Paracetamol", strength: "500mg", available: 50 },
    { id: 2, name: "Amoxicillin", strength: "250mg", available: 0 },
    { id: 3, name: "Cough Syrup", strength: "10ml", available: 20 },
  ];

  const [selectedPatient, setSelectedPatient] = useState("");
  const [issueData, setIssueData] = useState([]);

  const handleSelectPatient = (patientId) => {
    setSelectedPatient(patientId);
    setIssueData(
      prescriptions[patientId]?.map((med) => ({
        ...med,
        quantity: "",
      })) || []
    );
  };

  const handleUpdateQuantity = (index, value) => {
    const updated = [...issueData];
    updated[index].quantity = value;
    setIssueData(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Issued Medicines:", {
      patient: selectedPatient,
      medicines: issueData,
    });
    alert("Medicines issued successfully!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 p-8 pt-40">
      <div className="max-w-5xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-white">Dispensary - Issue Medicines</h1>

        {/* Patient Selection */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-xl shadow-lg">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Select Patient
          </label>
          <select
            value={selectedPatient}
            onChange={(e) => handleSelectPatient(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-gray-900 text-gray-100 border border-gray-700"
          >
            <option value="">-- Choose Patient --</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (ID: {p.id}, {p.age}y, {p.gender})
              </option>
            ))}
          </select>
        </div>

        {/* Show Prescription if Patient Selected */}
        {selectedPatient && (
          <form
            onSubmit={handleSubmit}
            className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-xl shadow-lg space-y-6"
          >
            <h2 className="text-xl font-semibold text-white mb-4">
              Prescribed Medicines
            </h2>

            {issueData.length === 0 ? (
              <p className="text-gray-400">No prescription found for this patient.</p>
            ) : (
              issueData.map((med, index) => {
                const stock = medicinesList.find(
                  (m) => m.name === med.medicine && m.strength === med.dosage
                );
                return (
                  <div
                    key={index}
                    className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center bg-gray-800/50 p-4 rounded-lg"
                  >
                    <div>
                      <p className="text-white font-medium">{med.medicine}</p>
                      <p className="text-sm text-gray-400">
                        {med.dosage} • {med.perDay} • {med.days} days
                      </p>
                    </div>

                    <div className="text-gray-300">
                      {stock
                        ? stock.available > 0
                          ? `${stock.available} available`
                          : "Out of stock"
                        : "Not in dispensary"}
                    </div>

                    <input
                      type="number"
                      min="1"
                      value={med.quantity}
                      onChange={(e) =>
                        handleUpdateQuantity(index, e.target.value)
                      }
                      placeholder="Qty to issue"
                      className="p-2 rounded bg-gray-900 border border-gray-700 text-white"
                      disabled={!stock || stock.available === 0}
                    />

                    <div className="text-gray-400 text-sm col-span-2">
                      {stock && stock.available === 0 && (
                        <span className="text-red-500">⚠ Out of Stock</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {issueData.length > 0 && (
              <button
                type="submit"
                className="cursor-pointer w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold"
              >
                Issue Medicines
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default DispensaryIssue;
