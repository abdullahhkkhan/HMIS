import { useState, useEffect } from "react";

export default function PatientHistory() {
  const [formData, setFormData] = useState({
    bloodPressure: "",
    sugarLevel: "",
    diagnosis: "",
    notes: "",
    referredDoctor: "",
    confirmVisit: false,
  });

  const [medications, setMedications] = useState([
    { medicine: "", dosage: "", perDay: "", duration: "", quantity: "" },
  ]);
  const [medicineList, setMedicineList] = useState([]);

  // Fetch medicines from DB
  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const res = await fetch("/api/medicines"); // Replace with your endpoint
        const data = await res.json();
        setMedicineList(data);
      } catch (err) {
        console.error("Error fetching medicines:", err);
      }
    };
    fetchMedicines();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const addMedication = () => {
    setMedications([
      ...medications,
      { medicine: "", dosage: "", perDay: "", duration: "", quantity: "" },
    ]);
  };

  const updateMedication = (index, field, value) => {
    const updated = [...medications];
    updated[index][field] = value;

    if (["dosage", "perDay", "duration"].includes(field)) {
      const { dosage, perDay, duration } = updated[index];
      const qty =
        (parseInt(perDay) || 0) * (parseInt(duration) || 0);
      updated[index].quantity = qty > 0 ? qty : "";
    }

    setMedications(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Patient History Submitted:", { ...formData, medications });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8 pt-40">
      <h1 className="text-2xl font-bold text-white mb-6">Patient History</h1>

      {/* Patient Info (Fetched, Read-Only) */}
      <div className="bg-gray-800 p-4 rounded-lg mb-6 shadow-md">
        <h2 className="text-lg font-semibold text-white mb-2">Patient Information</h2>
        <p><strong>Name:</strong> John Doe</p>
        <p><strong>Age:</strong> 42</p>
        <p><strong>Gender:</strong> Male</p>
        <p><strong>Registered ID:</strong> P-10293</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Vitals */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Blood Pressure
          </label>
          <input
            type="text"
            name="bloodPressure"
            value={formData.bloodPressure}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-100"
            placeholder="e.g. 120/80 mmHg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Sugar Level
          </label>
          <input
            type="text"
            name="sugarLevel"
            value={formData.sugarLevel}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-100"
            placeholder="e.g. 110 mg/dL"
          />
        </div>

        {/* Diagnosis */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Diagnosis
          </label>
          <textarea
            name="diagnosis"
            value={formData.diagnosis}
            onChange={handleChange}
            rows="3"
            className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-100"
            placeholder="Enter diagnosis..."
          />
        </div>

        {/* Prescription - with DB medicines */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Prescribed Medicines</h2>

          {medications.map((med, index) => (
            <div
              key={index}
              className="grid grid-cols-5 gap-4 mb-3 bg-gray-800 p-4 rounded-lg border border-gray-700"
            >
              {/* Medicine Dropdown */}
              <select
                value={med.medicine}
                onChange={(e) =>
                  updateMedication(index, "medicine", e.target.value)
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

              {/* Dosage */}
              <input
                type="text"
                placeholder="Dosage (e.g., 500mg)"
                value={med.dosage}
                onChange={(e) =>
                  updateMedication(index, "dosage", e.target.value)
                }
                className="p-2 rounded bg-gray-900 border border-gray-700 text-white"
              />

              {/* Per Day */}
              <input
                type="number"
                placeholder="Per Day"
                value={med.perDay}
                onChange={(e) =>
                  updateMedication(index, "perDay", e.target.value)
                }
                className="p-2 rounded bg-gray-900 border border-gray-700 text-white"
              />

              {/* Duration */}
              <input
                type="number"
                placeholder="Duration (days)"
                value={med.duration}
                onChange={(e) =>
                  updateMedication(index, "duration", e.target.value)
                }
                className="p-2 rounded bg-gray-900 border border-gray-700 text-white"
              />

              {/* Quantity (calculated) */}
              <input
                type="text"
                readOnly
                value={med.quantity}
                placeholder="Quantity"
                className="p-2 rounded bg-gray-700 border border-gray-600 text-gray-400 cursor-not-allowed"
              />
            </div>
          ))}

          <button
            type="button"
            onClick={addMedication}
            className="cursor-pointer px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white"
          >
            + Add Medicine
          </button>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Additional Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
            className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-100"
            placeholder="Enter notes..."
          />
        </div>

        {/* Refer Doctor */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Refer to Other Doctor
          </label>
          <select
            name="referredDoctor"
            value={formData.referredDoctor}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-100"
          >
            <option value="">Select Doctor</option>
            <option value="Dr. Ali">Dr. Ali</option>
            <option value="Dr. Sara">Dr. Sara</option>
            <option value="Dr. Kamran">Dr. Kamran</option>
          </select>
        </div>

        {/* Confirm Visit */}
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            name="confirmVisit"
            checked={formData.confirmVisit}
            onChange={handleChange}
            className="cursor-pointer h-5 w-5 text-blue-500 bg-gray-800 border-gray-600 rounded"
          />
          <label className="text-gray-300">Confirm Visit</label>
        </div>

        <button
          type="submit"
          className="cursor-pointer w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold"
        >
          Save History
        </button>
      </form>
    </div>
  );
}
