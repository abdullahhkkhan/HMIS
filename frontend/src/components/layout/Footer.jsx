import React from "react";
import { IoCallOutline, IoMailOutline } from "react-icons/io5";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#111827]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
        <p>© {new Date().getFullYear()} HMIS · Better Care, Better Management, Better Health</p>
        <div className="flex items-center gap-4">
          <a href="mailto:support@hmis.com" className="flex items-center gap-1.5 hover:text-slate-300">
            <IoMailOutline /> support@hmis.com
          </a>
          <a href="tel:+923001234567" className="flex items-center gap-1.5 hover:text-slate-300">
            <IoCallOutline /> +92 300 1234567
          </a>
        </div>
      </div>
    </footer>
  );
}
