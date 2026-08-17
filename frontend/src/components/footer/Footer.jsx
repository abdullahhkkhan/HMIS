// src/components/Footer.jsx
import React from "react";
import {
  IoHome,
  IoStatsChart,
  IoCallOutline,
  IoMailOutline,
} from "react-icons/io5";
import { LuHistory } from "react-icons/lu";
import { RiHealthBookFill } from "react-icons/ri";
import { MdOutlinePayment } from "react-icons/md";
import { Link } from "react-router-dom";

const LINKS = [
  { to: "/dashboard", label: "Dashboard", icon: IoHome },
  { to: "/history", label: "Patient History", icon: LuHistory },
  { to: "/stats", label: "Statistics", icon: IoStatsChart },
  { to: "/waiting", label: "Waiting Patients", icon: RiHealthBookFill },
  { to: "/billing", label: "Billing", icon: MdOutlinePayment },
];

export default function Footer() {
  return (
    <footer className="bg-[#141b2d] text-white border-t border-white/5">
      {/* Top Section */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
        {/* Brand */}
        <div className="text-center md:text-left">
          <h1 className="text-lg font-semibold tracking-tight">
            Hospital Management Information System
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Better Care, Better Management, Better Health
          </p>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col items-center md:items-start gap-2.5">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-1">
            Quick Links
          </p>
          <div className="flex gap-8">
            {[LINKS.slice(0, 3), LINKS.slice(3)].map((column, colIndex) => (
              <nav key={colIndex} className="flex flex-col gap-2.5">
                {column.map(({ to, label, icon: Icon }) => (
                  <Link
                    key={to}
                    to={to}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    <Icon className="text-base text-blue-400 shrink-0" />
                    <span>{label}</span>
                  </Link>
                ))}
              </nav>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="flex flex-col items-center md:items-end gap-2.5">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-1">
            Contact
          </p>
          <a
            href="mailto:support@hmis.com"
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <IoMailOutline className="text-base text-blue-400 shrink-0" />
            support@hmis.com
          </a>
          <a
            href="tel:+923001234567"
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <IoCallOutline className="text-base text-blue-400 shrink-0" />
            +92 300 1234567
          </a>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-white/5 text-center py-4 text-gray-500 text-sm bg-[#1f293f]">
        © {new Date().getFullYear()} HMIS. All Rights Reserved.
      </div>
    </footer>
  );
}