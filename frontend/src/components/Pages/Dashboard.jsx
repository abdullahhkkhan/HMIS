import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

export default function Dashboard() {
  // Sample bar chart data
  const barData = [
    { month: "Jan", blue: 5, white: 5 },
    { month: "Feb", blue: 7, white: 6 },
    { month: "Mar", blue: 7, white: 4 },
    { month: "Apr", blue: 6, white: 5 },
    { month: "May", blue: 7, white: 6 },
    { month: "Jun", blue: 5, white: 4 },
    { month: "Jul", blue: 7, white: 3 },
    { month: "Aug", blue: 6, white: 5 },
    { month: "Sep", blue: 7, white: 4 },
    { month: "Oct", blue: 6, white: 4 },
    { month: "Nov", blue: 6, white: 4 },
    { month: "Dec", blue: 7, white: 3 },
  ];

  // Sample line chart data
  const lineData = [
    { name: "Mon", revenue: 2000 },
    { name: "Tue", revenue: 4000 },
    { name: "Wed", revenue: 3000 },
    { name: "Thu", revenue: 5000 },
    { name: "Fri", revenue: 4000 },
    { name: "Sat", revenue: 3500 },
    { name: "Sun", revenue: 2000 },
  ];

  // Waiting patients data
  const patients = [
    { name: "Ali Khan", reason: "General Checkup", time: "3 days ago" },
    { name: "Sara Ahmed", reason: "Flu Symptoms", time: "1 day ago" },
    { name: "John Doe", reason: "Follow-up", time: "Today" },
    { name: "James Raphael", reason: "X-ray Review", time: "3 days ago" },
    { name: "Maryam Noor", reason: "Dental", time: "1 day ago" },
    { name: "Usman Ali", reason: "New Admission", time: "Today" },
  ];

  // Medicine slider data
  const medicines = [
    { name: "Paracetamol", sold: 120, stock: 50 },
    { name: "Amoxicillin", sold: 90, stock: 30 },
    { name: "Ibuprofen", sold: 150, stock: 70 },
    { name: "Vitamin C", sold: 200, stock: 100 },
    { name: "Cough Syrup", sold: 85, stock: 40 },
  ];

  // Camp locations
  const camps = [
    { place: "Karachi", percent: 75 },
    { place: "Lahore", percent: 55 },
    { place: "Islamabad", percent: 85 },
  ];


    const fundingSources = [
    { name: "Zakat", patients: "1.2k", percent: "+40%", color: "text-green-400" },
    { name: "Angio", patients: "850", percent: "+25%", color: "text-green-400" },
    { name: "Private", patients: "2.3k", percent: "-15%", color: "text-red-400" },
    { name: "Welfare", patients: "1.9k", percent: "+35%", color: "text-green-400" },
    { name: "Insurance", patients: "1.4k", percent: "+20%", color: "text-green-400" },
  ];

  const patientDetails = [
    { id: "#1001", name: "Ali Khan", type: "Zakat", bill: "$0", status: "Active" },
    { id: "#1002", name: "Sara Ahmed", type: "Private", bill: "$450", status: "Pending" },
    { id: "#1003", name: "John Doe", type: "Welfare", bill: "$120", status: "Active" },
    { id: "#1004", name: "Fatima Noor", type: "Angio", bill: "$300", status: "Pending" },
    { id: "#1005", name: "Omar Farooq", type: "Insurance", bill: "$600", status: "Active" },
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6 pt-40">
      {/* 1st Component */}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-lg font-semibold">Dashboard</h1>
          <p className="text-sm text-gray-400">HMIS &gt; Dashboard</p>
        </div>
        <button className="bg-green-500 text-white px-4 py-2 rounded-lg">
          Add Widget
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:px-20">
        {/* Left Column */}
        <div className="col-span-2 bg-[#1e293b] rounded-2xl p-4 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-lg">Quick Summary</h2>
            <div className="flex gap-3 text-sm">
              <button className="hover:text-blue-400">Day</button>
              <button className="hover:text-blue-400">Week</button>
              <button className="hover:text-blue-400">Month</button>
              <button className="bg-blue-600 px-3 py-1 rounded-lg">Year</button>
            </div>
          </div>

          {/* Chart + Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Bar Chart */}
            <div className="md:col-span-3 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <XAxis dataKey="month" stroke="#8884d8" />
                  <YAxis stroke="#8884d8" />
                  <Tooltip />
                  <Bar dataKey="blue" stackId="a" fill="#3b82f6" />
                  <Bar dataKey="white" stackId="a" fill="#f1f5f9" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Stats */}
            <div className="space-y-4">
              <div className="bg-[#0f172a] p-4 rounded-xl shadow">
                <p className="text-2xl font-bold">$2354</p>
                <p className="text-gray-400 text-sm">Total Earnings</p>
                <a href="#" className="text-blue-400 text-sm">Withdraw →</a>
              </div>
              <div className="bg-[#0f172a] p-4 rounded-xl shadow">
                <p className="text-2xl font-bold">$1598</p>
                <p className="text-gray-400 text-sm">To Be Paid</p>
                <a href="#" className="text-blue-400 text-sm">Pay →</a>
              </div>
              <div className="bg-[#0f172a] p-4 rounded-xl shadow">
                <p className="text-2xl font-bold">120</p>
                <p className="text-gray-400 text-sm">Admitted Patients</p>
                <a href="#" className="text-blue-400 text-sm">View →</a>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Appointments */}
          <div className="bg-[#1e293b] p-6 rounded-2xl shadow">
            <p className="text-sm text-gray-400">Appointments</p>
            <p className="text-3xl font-bold mt-2">58</p>
            <p className="text-xs text-gray-400 mt-1">70% Completed</p>
            <div className="w-full bg-gray-700 h-2 rounded mt-2">
              <div className="bg-blue-500 h-2 rounded" style={{ width: "70%" }}></div>
            </div>
          </div>

          {/* Patients */}
          <div className="bg-[#1e293b] p-6 rounded-2xl shadow">
            <p className="text-sm text-gray-400">Total Patients Registered</p>
            <p className="text-3xl font-bold mt-2">1360</p>
            <p className="text-xs text-gray-400 mt-1">80% Growth</p>
            <div className="w-full bg-gray-700 h-2 rounded mt-2">
              <div className="bg-green-500 h-2 rounded" style={{ width: "80%" }}></div>
            </div>
          </div>

          {/* Patient Statistics */}
          <div className="bg-[#1e293b] p-6 rounded-2xl shadow">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-400">Patient Statistics</p>
              <select className="bg-[#334155] text-sm rounded px-2 py-1">
                <option>Today</option>
                <option>This Week</option>
                <option>This Month</option>
              </select>
            </div>
            <p className="text-3xl font-bold mt-2">+120 New</p>
            <div className="h-32 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData}>
                  <XAxis dataKey="name" stroke="#8884d8" />
                  <Tooltip />
                  <Line type="monotone" dataKey="patients" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* 2nd Component */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8 lg:px-20">
        {/* Column 1: Waiting Patients */}
        <div className="bg-[#1e293b] rounded-2xl p-6 shadow">
          <h2 className="font-semibold text-lg mb-4">Waiting Patients</h2>
          <div className="space-y-6">
            {patients.map((p, i) => (
              <div
                key={i}
                className="flex items-center justify-between border-l-2 border-blue-500 pl-3"
              >
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-sm text-gray-400">{p.reason}</p>
                </div>
                <span className="text-xs text-blue-400">{p.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Goal + Medicines */}
        <div className="flex flex-col gap-6">
          {/* Earnings Goal */}
          <div className="bg-[#1e293b] rounded-2xl p-6 shadow">
            <h2 className="font-semibold text-lg mb-4">Earning Goal</h2>
            <div className="grid grid-cols-2 gap-6 items-center">
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 mb-2">
                  <CircularProgressbar
                    value={60}
                    styles={buildStyles({ pathColor: "#3b82f6" })}
                  />
                </div>
                <p className="text-xs text-gray-400">Total Earning</p>
                <p className="font-semibold">USD 13,545.65</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 mb-2">
                  <CircularProgressbar
                    value={85}
                    styles={buildStyles({ pathColor: "#22c55e" })}
                  />
                </div>
                <p className="text-xs text-gray-400">Earning Goal</p>
                <p className="font-semibold">USD 84,265.45</p>
              </div>
            </div>
          </div>

          {/* Medicines Slider */}
          <div className="bg-[#1e293b] rounded-2xl p-6 shadow">
            <h2 className="font-semibold text-lg mb-4">Dispensary Medicines</h2>
            <Swiper spaceBetween={20} slidesPerView={1}>
              {medicines.map((med, i) => (
                <SwiperSlide key={i}>
                  <div className="bg-[#0f172a] rounded-xl p-4 flex flex-col items-center shadow">
                    <p className="font-semibold text-blue-400">{med.name}</p>
                    <div className="flex gap-6 mt-4">
                      <div className="text-center">
                        <p className="text-lg font-bold">{med.sold}</p>
                        <p className="text-xs text-gray-400">Sold</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold">{med.stock}</p>
                        <p className="text-xs text-gray-400">Stock</p>
                      </div>
                    </div>
                    <button className="bg-blue-600 text-white text-sm px-4 py-1 mt-4 rounded-lg">
                      Dispense
                    </button>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>

        {/* Column 3: Camps Map */}
        <div className="bg-[#1e293b] rounded-2xl p-6 shadow">
          <h2 className="font-semibold text-lg mb-4">Camps by Location</h2>
          {/* Map Placeholder (replace with real map later) */}
          <div className="bg-gray-800 h-48 rounded-xl flex items-center justify-center text-gray-400">
            🗺 Map of Camps
          </div>
          <div className="mt-6 space-y-4">
            {camps.map((c, i) => (
              <div key={i}>
                <p className="flex justify-between text-sm mb-1">
                  <span>{c.place}</span>
                  <span>{c.percent}%</span>
                </p>
                <div className="w-full bg-gray-700 h-2 rounded">
                  <div
                    className="bg-blue-500 h-2 rounded"
                    style={{ width: `${c.percent}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3rd Container */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 lg:px-20">
      {/* Left - Patients by Funding */}
      <div className="bg-[#1e293b] rounded-2xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Patients by Funding Source</h2>
        <div className="space-y-4">
          {fundingSources.map((src, idx) => (
            <div key={idx} className="flex justify-between items-center p-3 rounded-lg hover:bg-[#334155]">
              <div>
                <p className="font-medium">{src.name}</p>
                <p className="text-sm text-gray-400">{src.patients} Patients</p>
              </div>
              <span className={`text-sm font-semibold ${src.color}`}>{src.percent}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right - Patient Details */}
      <div className="bg-[#1e293b] rounded-2xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Patient Details</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-gray-400 border-b border-gray-700">
              <tr>
                <th className="py-2 px-3">ID</th>
                <th className="py-2 px-3">Name</th>
                <th className="py-2 px-3">Type</th>
                <th className="py-2 px-3">Bill</th>
                <th className="py-2 px-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {patientDetails.map((p, idx) => (
                <tr key={idx} className="border-b border-gray-800">
                  <td className="py-2 px-3">{p.id}</td>
                  <td className="py-2 px-3">{p.name}</td>
                  <td className="py-2 px-3">{p.type}</td>
                  <td className="py-2 px-3">{p.bill}</td>
                  <td className="py-2 px-3">
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-medium ${
                        p.status === "Active"
                          ? "bg-green-700 text-green-300"
                          : "bg-blue-700 text-blue-300"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    </div>
  );
}
