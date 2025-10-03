import React, { useState } from "react";
import { FaEdit, FaSave, FaTimes } from "react-icons/fa";

const PatientRecords = () => {
  // Mock data
  const [patients, setPatients] = useState([
    {
      id: 1,
      name: "Ahmed Khan",
      age: 32,
      gender: "Male",
      contact: "03001234567",
      consultation: "Fever and headache",
      prescribedMedicines: [
        { name: "Paracetamol", dosage: "500mg", perDay: 2, duration: 3, quantity: 6 },
      ],
      referredDoctor: "Dr. Sara",
    },
    {
      id: 2,
      name: "Fatima Noor",
      age: 26,
      gender: "Female",
      contact: "03121234567",
      consultation: "Stomach pain",
      prescribedMedicines: [],
      referredDoctor: "",
    },
  ]);

  // Example medicines in DB
  const medicineList = [
    { _id: 1, name: "Paracetamol", quantity: 100 },
    { _id: 2, name: "Ibuprofen", quantity: 50 },
    { _id: 3, name: "Amoxicillin", quantity: 0 },
  ];

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [editMode, setEditMode] = useState({});

  const handleSelectPatient = (patient) => {
    // clone patient to avoid direct state mutation
    setSelectedPatient(JSON.parse(JSON.stringify(patient)));
    setEditMode({});
  };

  const handleChange = (field, value) => {
    setSelectedPatient((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (section) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === selectedPatient.id ? selectedPatient : p))
    );
    setEditMode((prev) => ({ ...prev, [section]: false }));
  };

  const closeModal = () => {
    setSelectedPatient(null);
    setEditMode({});
  };

  // Prescription helpers
  const updateMedication = (index, field, value) => {
    setSelectedPatient((prev) => {
      const meds = [...prev.prescribedMedicines];
      meds[index][field] = value;

      // Auto calculate quantity
      if (field === "perDay" || field === "duration") {
        const perDay = parseInt(meds[index].perDay) || 0;
        const duration = parseInt(meds[index].duration) || 0;
        meds[index].quantity = perDay * duration;
      }

      return { ...prev, prescribedMedicines: meds };
    });
  };

  const addMedication = () => {
    setSelectedPatient((prev) => ({
      ...prev,
      prescribedMedicines: [
        ...prev.prescribedMedicines,
        { name: "", dosage: "", perDay: 1, duration: 1, quantity: 1 },
      ],
    }));
  };

  return (
    <div className="p-8 bg-gray-900 min-h-screen text-gray-100 pt-40">
      <h1 className="text-2xl font-bold mb-6">Patient Records</h1>

      {/* Patients List */}
      <div className="overflow-x-auto mb-8">
        <table className="w-full text-left border border-gray-700 rounded-lg overflow-hidden">
          <thead className="bg-gray-800">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Age</th>
              <th className="p-3">Gender</th>
              <th className="p-3">Contact</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((p) => (
              <tr
                key={p.id}
                className="border-t border-gray-700 hover:bg-gray-800"
              >
                <td className="p-3">{p.name}</td>
                <td className="p-3">{p.age}</td>
                <td className="p-3">{p.gender}</td>
                <td className="p-3">{p.contact}</td>
                <td className="p-3">
                  <button
                    onClick={() => handleSelectPatient(p)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
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
      {selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-start pt-20 z-50">
          <div className="bg-gray-800 w-11/12 lg:w-4/5 xl:w-3/4 rounded-lg shadow-lg p-6 overflow-y-auto max-h-[80vh] relative custom-scroll">
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-400 hover:text-white"
            >
              <FaTimes size={20} />
            </button>

            <h2 className="text-xl font-bold mb-6">
              Patient: {selectedPatient.name}
            </h2>

            <div className="space-y-6">
              {/* Registration Info */}
              <div className="bg-gray-900 p-5 rounded-lg border border-gray-700">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-lg font-semibold">Registration Info</h2>
                  {!editMode.registration ? (
                    <FaEdit
                      className="cursor-pointer text-blue-400"
                      onClick={() =>
                        setEditMode((prev) => ({ ...prev, registration: true }))
                      }
                    />
                  ) : (
                    <div className="flex gap-3">
                      <FaSave
                        className="cursor-pointer text-green-400"
                        onClick={() => handleSave("registration")}
                      />
                      <FaTimes
                        className="cursor-pointer text-red-400"
                        onClick={() =>
                          setEditMode((prev) => ({
                            ...prev,
                            registration: false,
                          }))
                        }
                      />
                    </div>
                  )}
                </div>

                {editMode.registration ? (
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={selectedPatient.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      className="p-2 rounded bg-gray-800 border border-gray-700"
                    />
                    <input
                      type="number"
                      value={selectedPatient.age}
                      onChange={(e) => handleChange("age", e.target.value)}
                      className="p-2 rounded bg-gray-800 border border-gray-700"
                    />
                    <select
                      value={selectedPatient.gender}
                      onChange={(e) => handleChange("gender", e.target.value)}
                      className="p-2 rounded bg-gray-800 border border-gray-700"
                    >
                      <option>Male</option>
                      <option>Female</option>
                    </select>
                    <input
                      type="text"
                      value={selectedPatient.contact}
                      onChange={(e) => handleChange("contact", e.target.value)}
                      className="p-2 rounded bg-gray-800 border border-gray-700"
                    />
                  </div>
                ) : (
                  <ul className="space-y-1">
                    <li>
                      <strong>Name:</strong> {selectedPatient.name}
                    </li>
                    <li>
                      <strong>Age:</strong> {selectedPatient.age}
                    </li>
                    <li>
                      <strong>Gender:</strong> {selectedPatient.gender}
                    </li>
                    <li>
                      <strong>Contact:</strong> {selectedPatient.contact}
                    </li>
                  </ul>
                )}
              </div>

              {/* Consultation */}
              <div className="bg-gray-900 p-5 rounded-lg border border-gray-700">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-lg font-semibold">Doctor Consultation</h2>
                  {!editMode.consultation ? (
                    <FaEdit
                      className="cursor-pointer text-blue-400"
                      onClick={() =>
                        setEditMode((prev) => ({
                          ...prev,
                          consultation: true,
                        }))
                      }
                    />
                  ) : (
                    <div className="flex gap-3">
                      <FaSave
                        className="cursor-pointer text-green-400"
                        onClick={() => handleSave("consultation")}
                      />
                      <FaTimes
                        className="cursor-pointer text-red-400"
                        onClick={() =>
                          setEditMode((prev) => ({
                            ...prev,
                            consultation: false,
                          }))
                        }
                      />
                    </div>
                  )}
                </div>

                {editMode.consultation ? (
                  <textarea
                    className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700"
                    value={selectedPatient.consultation}
                    onChange={(e) =>
                      handleChange("consultation", e.target.value)
                    }
                  />
                ) : (
                  <p>{selectedPatient.consultation}</p>
                )}
              </div>

              {/* Prescriptions */}
              <div className="bg-gray-900 p-5 rounded-lg border border-gray-700">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-lg font-semibold">Prescriptions</h2>
                  {!editMode.prescriptions ? (
                    <FaEdit
                      className="cursor-pointer text-blue-400"
                      onClick={() =>
                        setEditMode((prev) => ({
                          ...prev,
                          prescriptions: true,
                        }))
                      }
                    />
                  ) : (
                    <div className="flex gap-3">
                      <FaSave
                        className="cursor-pointer text-green-400"
                        onClick={() => handleSave("prescriptions")}
                      />
                      <FaTimes
                        className="cursor-pointer text-red-400"
                        onClick={() =>
                          setEditMode((prev) => ({
                            ...prev,
                            prescriptions: false,
                          }))
                        }
                      />
                    </div>
                  )}
                </div>

                {editMode.prescriptions ? (
                  <div>
                    {selectedPatient.prescribedMedicines.map((med, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-5 gap-3 mb-3 bg-gray-800 p-3 rounded"
                      >
                        <select
                          value={med.name}
                          onChange={(e) =>
                            updateMedication(index, "name", e.target.value)
                          }
                          className="p-2 rounded bg-gray-900 border border-gray-700 text-white"
                        >
                          <option value="">Select Medicine</option>
                          {medicineList.map((m) => (
                            <option
                              key={m._id}
                              value={m.name}
                              disabled={m.quantity === 0}
                            >
                              {m.name}{" "}
                              {m.quantity === 0
                                ? "(Out of Stock)"
                                : `(${m.quantity} available)`}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={med.dosage}
                          onChange={(e) =>
                            updateMedication(index, "dosage", e.target.value)
                          }
                          placeholder="Dosage"
                          className="p-2 rounded bg-gray-900 border border-gray-700 text-white"
                        />
                        <input
                          type="number"
                          value={med.perDay}
                          onChange={(e) =>
                            updateMedication(index, "perDay", e.target.value)
                          }
                          placeholder="Per Day"
                          className="p-2 rounded bg-gray-900 border border-gray-700 text-white"
                        />
                        <input
                          type="number"
                          value={med.duration}
                          onChange={(e) =>
                            updateMedication(index, "duration", e.target.value)
                          }
                          placeholder="Duration"
                          className="p-2 rounded bg-gray-900 border border-gray-700 text-white"
                        />
                        <input
                          type="text"
                          value={med.quantity}
                          readOnly
                          className="p-2 rounded bg-gray-700 border border-gray-600 text-gray-400 cursor-not-allowed"
                        />
                      </div>
                    ))}
                    <button
                      onClick={addMedication}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white"
                    >
                      + Add Medicine
                    </button>
                  </div>
                ) : (
                  <ul>
                    {selectedPatient.prescribedMedicines.length > 0 ? (
                      selectedPatient.prescribedMedicines.map((m, i) => (
                        <li key={i}>
                          {m.name} - {m.dosage}, {m.perDay}/day for {m.duration}{" "}
                          days (Qty: {m.quantity})
                        </li>
                      ))
                    ) : (
                      <p>No medicines prescribed</p>
                    )}
                  </ul>
                )}
              </div>

              {/* Refer Doctor */}
              <div className="bg-gray-900 p-5 rounded-lg border border-gray-700">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-lg font-semibold">Referred Doctor</h2>
                  {!editMode.referred ? (
                    <FaEdit
                      className="cursor-pointer text-blue-400"
                      onClick={() =>
                        setEditMode((prev) => ({ ...prev, referred: true }))
                      }
                    />
                  ) : (
                    <div className="flex gap-3">
                      <FaSave
                        className="cursor-pointer text-green-400"
                        onClick={() => handleSave("referred")}
                      />
                      <FaTimes
                        className="cursor-pointer text-red-400"
                        onClick={() =>
                          setEditMode((prev) => ({ ...prev, referred: false }))
                        }
                      />
                    </div>
                  )}
                </div>

                {editMode.referred ? (
                  <select
                    value={selectedPatient.referredDoctor}
                    onChange={(e) =>
                      handleChange("referredDoctor", e.target.value)
                    }
                    className="p-2 rounded bg-gray-800 border border-gray-700"
                  >
                    <option value="">Select Doctor</option>
                    <option value="Dr. Ali">Dr. Ali</option>
                    <option value="Dr. Sara">Dr. Sara</option>
                    <option value="Dr. Kamran">Dr. Kamran</option>
                  </select>
                ) : (
                  <p>{selectedPatient.referredDoctor || "Not referred"}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Scrollbar */}
      <style jsx>{`
        .custom-scroll::-webkit-scrollbar {
          width: 10px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: #1f2937; /* dark gray */
          border-radius: 8px;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background-color: #2563eb; /* blue */
          border-radius: 8px;
          border: 2px solid #1f2937;
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background-color: #3b82f6;
        }
      `}</style>
    </div>
  );
};

export default PatientRecords;
