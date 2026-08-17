import React, { useState, useRef, useEffect } from 'react'
import {
    MdOutlineAppRegistration,
    MdOutlineModeComment,
    MdOutlinePayment,
} from "react-icons/md";
import { SlCalender } from "react-icons/sl";
import { IoHome, IoChevronDown } from "react-icons/io5";
import { LuHistory } from "react-icons/lu";
import { RiHealthBookFill } from "react-icons/ri";
import { Link, useLocation } from 'react-router-dom';
import { FaUserDoctor } from "react-icons/fa6";
 
const NAV_LINKS = [
    { to: '/dashboard', label: 'Dashboard', icon: IoHome },
    { to: '/patient-registration', label: 'Patient Registration', icon: MdOutlineAppRegistration },
    { to: '/patient-history', label: 'Patient History', icon: LuHistory },
    { to: '/doctor-consultation', label: 'Doctor Consultation', icon: FaUserDoctor },
    { to: '/waiting-patients', label: 'Waiting Patients', icon: RiHealthBookFill },
];
 
function MiniCalendar({ onClose }) {
    const today = new Date();
    const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
    const ref = useRef(null);
 
    useEffect(() => {
        function handleClickOutside(e) {
            if (ref.current && !ref.current.contains(e.target)) onClose();
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);
 
    const monthLabel = viewDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    const firstDayIndex = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
    const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
    const cells = [...Array(firstDayIndex).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
 
    const changeMonth = (delta) => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + delta, 1));
    };
 
    const isToday = (day) =>
        day === today.getDate() &&
        viewDate.getMonth() === today.getMonth() &&
        viewDate.getFullYear() === today.getFullYear();
 
    return (
        <div
            ref={ref}
            className='absolute right-0 top-12 w-72 rounded-xl bg-white text-[#141b2d] shadow-2xl ring-1 ring-black/5 p-4 z-50'
        >
            <div className='flex items-center justify-between mb-3'>
                <button
                    onClick={() => changeMonth(-1)}
                    className='w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-sm font-semibold'
                    aria-label='Previous month'
                >
                    ‹
                </button>
                <span className='text-sm font-semibold tracking-wide'>{monthLabel}</span>
                <button
                    onClick={() => changeMonth(1)}
                    className='w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-sm font-semibold'
                    aria-label='Next month'
                >
                    ›
                </button>
            </div>
            <div className='grid grid-cols-7 gap-y-1 text-center text-[11px] font-medium text-gray-400 mb-1'>
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                    <span key={i}>{d}</span>
                ))}
            </div>
            <div className='grid grid-cols-7 gap-y-1 text-center text-sm'>
                {cells.map((day, i) => (
                    <span
                        key={i}
                        className={`h-8 flex items-center justify-center rounded-full mx-auto w-8 cursor-default
                            ${day === null ? '' : isToday(day)
                                ? 'bg-[#2f6fed] text-white font-semibold'
                                : 'hover:bg-gray-100 text-gray-700'}`}
                    >
                        {day ?? ''}
                    </span>
                ))}
            </div>
        </div>
    );
}
 
export default function Navbar() {
    const location = useLocation();
    const [calendarOpen, setCalendarOpen] = useState(false);
 
    return (
        <div className='flex flex-col fixed top-0 right-0 left-0 z-50'>
            <div className='bg-[#141b2d] text-white border-b border-white/5'>
                <div className='flex px-16 py-3 items-center justify-between'>
                    <div className='flex items-center space-x-3'>
                        <div className='w-9 h-9 rounded-lg bg-gradient-to-br from-[#2f6fed] to-[#7c5cff] flex items-center justify-center shadow-lg shadow-[#2f6fed]/20'>
                            <RiHealthBookFill className='text-lg text-white' />
                        </div>
                        <h1 className='text-lg font-semibold tracking-tight'>
                            Hospital Management Information System
                        </h1>
                    </div>
 
                    <div className='flex items-center space-x-6'>
                        <MdOutlineModeComment
                            className='text-xl text-gray-300 hover:text-white cursor-pointer transition-colors'
                            title='Messages'
                        />
 
                        <div className='relative'>
                            <button
                                onClick={() => setCalendarOpen((o) => !o)}
                                className={`flex items-center justify-center text-xl transition-colors cursor-pointer
                                    ${calendarOpen ? 'text-white' : 'text-gray-300 hover:text-white'}`}
                                title='Calendar'
                                aria-haspopup='dialog'
                                aria-expanded={calendarOpen}
                            >
                                <SlCalender />
                            </button>
                            {calendarOpen && <MiniCalendar onClose={() => setCalendarOpen(false)} />}
                        </div>
 
                        <div className='w-px h-6 bg-white/10' />
 
                        <div className='flex items-center space-x-2 cursor-pointer group'>
                            <div className='w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-xs font-semibold text-[#141b2d]'>
                                A
                            </div>
                            <select className='bg-transparent focus:outline-none text-white text-sm cursor-pointer appearance-none pr-4'>
                                <option value='profile' className='text-black'>Profile</option>
                                <option value='signout' className='text-black'>Sign out</option>
                            </select>
                            <IoChevronDown className='text-xs text-gray-400 -ml-3 pointer-events-none' />
                        </div>
                    </div>
                </div>
            </div>
 
            <nav className='flex justify-around bg-[#1f293f]/95 backdrop-blur text-white px-16 shadow-md'>
                {NAV_LINKS.map(({ to, label, icon: Icon }) => {
                    const active = location.pathname === to;
                    return (
                        <Link
                            key={to}
                            to={to}
                            className={`relative flex items-center space-x-2 py-4 transition-colors
                                ${active ? 'text-white' : 'text-gray-400 hover:text-gray-200'}`}
                        >
                            <Icon className='text-lg' />
                            <span className='text-[15px] font-medium whitespace-nowrap'>{label}</span>
                            <span
                                className={`absolute left-0 right-0 -bottom-px h-[2px] rounded-full bg-gradient-to-r from-[#2f6fed] to-[#7c5cff] transition-opacity
                                    ${active ? 'opacity-100' : 'opacity-0'}`}
                            />
                        </Link>
                    );
                })}
                <div className='flex items-center space-x-2 py-4 text-gray-400 hover:text-gray-200 cursor-pointer transition-colors'>
                    <MdOutlinePayment className='text-lg' />
                    <span className='text-[15px] font-medium'>Billing</span>
                </div>
            </nav>
        </div>
    )
}
 