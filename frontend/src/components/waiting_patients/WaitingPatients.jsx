// src/components/waitingPatients/WaitingPatients.jsx

import React, { useState } from "react";

const WaitingPatients = () => {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [open, setOpen] = useState(false);

  // Dummy queue data (replace later with API data)
  const patients = [
    { id: 1, name: "Ali Khan", age: 32, gender: "Male" },
    { id: 2, name: "Sara Ahmed", age: 27, gender: "Female" },
    { id: 3, name: "Usman Tariq", age: 45, gender: "Male" },
  ];

  const handleSelect = (patient) => {
    setSelectedPatient(patient);
    setOpen(true);
  };

  return (
    <div className="p-6 bg-[#0f172a] min-h-screen text-white pt-40">
      <h1 className="text-2xl font-semibold mb-6">Waiting Patients</h1>

      <div className="bg-[#1f293f] shadow rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#141b2d] text-gray-300">
            <tr>
              <th className="p-3 text-sm font-medium">ID</th>
              <th className="p-3 text-sm font-medium">Name</th>
              <th className="p-3 text-sm font-medium">Age</th>
              <th className="p-3 text-sm font-medium">Gender</th>
              <th className="p-3 text-sm font-medium text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient) => (
              <tr
                key={patient.id}
                className="border-b border-gray-700 hover:bg-[#24324a] transition"
              >
                <td className="p-3">{patient.id}</td>
                <td className="p-3">{patient.name}</td>
                <td className="p-3">{patient.age}</td>
                <td className="p-3">{patient.gender}</td>
                <td className="p-3 text-center">
                  <button
                    className="cursor-pointer px-4 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 transition text-sm"
                    onClick={() => handleSelect(patient)}
                  >
                    Select
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
          <div className="bg-[#1f293f] p-6 rounded-2xl shadow-lg w-[400px]">
            <h2 className="text-xl font-semibold border-b border-gray-600 pb-2 mb-4">
              Patient Selected
            </h2>
            <div className="mt-2 text-gray-300">
              {selectedPatient ? (
                <p>
                  You selected <b className="text-white">{selectedPatient.name}</b> 
                  (Age: {selectedPatient.age}, Gender: {selectedPatient.gender})
                </p>
              ) : (
                <p>No patient selected.</p>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                className="cursor-pointer px-4 py-1 rounded-lg bg-red-600 hover:bg-red-700 transition text-sm"
                onClick={() => setOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WaitingPatients;
