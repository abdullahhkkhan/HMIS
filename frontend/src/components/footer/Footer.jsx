import React from "react";
import { IoHome } from "react-icons/io5";
import { LuHistory } from "react-icons/lu";
import { FcStatistics } from "react-icons/fc";
import { RiHealthBookFill } from "react-icons/ri";
import { MdOutlinePayment } from "react-icons/md";

export default function Footer() {
  return (
    <footer className="bg-[#141b2d] text-white border-t border-gray-700">
      {/* Top Section */}
      <div className="flex flex-col md:flex-row justify-between items-center px-12 py-6 border-b border-gray-700">
        {/* Left */}
        <div className="text-center md:text-left mb-4 md:mb-0">
          <h1 className="text-xl font-semibold">
            Hospital Management Information System
          </h1>
          <p className="text-sm text-gray-400">
            Better Care, Better Management, Better Health
          </p>
        </div>

        {/* Center - Quick Links */}
        <div className="flex flex-wrap justify-center gap-6 text-gray-400">
          <a href="/dashboard" className="flex items-center space-x-1 hover:text-white">
            <IoHome className="text-lg" /> <span>Dashboard</span>
          </a>
          <a href="/history" className="flex items-center space-x-1 hover:text-white">
            <LuHistory className="text-lg" /> <span>Patient History</span>
          </a>
          <a href="/stats" className="flex items-center space-x-1 hover:text-white">
            <FcStatistics className="text-lg" /> <span>Statistics</span>
          </a>
          <a href="/waiting" className="flex items-center space-x-1 hover:text-white">
            <RiHealthBookFill className="text-lg" /> <span>Waiting Patients</span>
          </a>
          <a href="/billing" className="flex items-center space-x-1 hover:text-white">
            <MdOutlinePayment className="text-lg" /> <span>Billing</span>
          </a>
        </div>

        {/* Right - Contact */}
        <div className="text-center md:text-right text-gray-400 mt-4 md:mt-0">
          <p>Email: support@hmis.com</p>
          <p>Phone: +92 300 1234567</p>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="text-center py-4 text-gray-500 text-sm bg-[#1f293f]">
        © {new Date().getFullYear()} HMIS. All Rights Reserved.
      </div>
    </footer>
  );
}
