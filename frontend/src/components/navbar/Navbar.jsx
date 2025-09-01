import React, { use } from 'react'
import { MdOutlineAppRegistration, MdOutlineModeComment, MdOutlinePayment, MdOutlineSettings } from "react-icons/md";
import { SlCalender } from "react-icons/sl";
import { FaSearch } from "react-icons/fa";
import { IoHome } from "react-icons/io5";
import { LuHistory } from "react-icons/lu";
import { RiHealthBookFill } from "react-icons/ri";
import { useLocation } from 'react-router-dom';
import { FaUserDoctor } from "react-icons/fa6";

export default function Navbar() {
    const location = useLocation();
    return (
        <div className='flex flex-col fixed top-0 right-0 left-0 z-50'>
            <div className='bg-[#141b2d] text-white p-4'>
                <div className=' flex px-16 py-2 justify-between'>
                    <div className='flex space-x-10'>
                        <div>
                            <h1 className='text-2xl'>Hospital Management Information System</h1>
                        </div>
                    </div>
                    <div className='flex space-x-10'>
                        <div className='flex space-x-6 mt-1'>
                            <FaSearch className='text-xl' />
                            <MdOutlineModeComment className='text-2xl' />
                            <SlCalender className='text-xl' />
                        </div>
                        <div className='flex space-x-2'>
                            <div className='w-6 h-4 bg-gray-400 mt-2'></div>
                            <select className='bg-[#141b2d] focus:outline-none text-white'>
                                <option value='en'>English</option>
                                <option value='fr'>French</option>
                                <option value='es'>Spanish</option>
                            </select>
                        </div>

                        <div className='flex space-x-2 focus:bg-gray-600'>
                            <div className='w-8 h-8 rounded-full bg-gray-400'></div>
                            <select className='bg-[#141b2d] focus:outline-none text-white'>
                                <option value='en'>Profile</option>
                                <option value='fr'>Signout</option>
                            </select>
                        </div>
                        <div>
                            <MdOutlineSettings className='text-2xl mt-1' />
                        </div>
                    </div>
                </div>
                <div></div>
            </div>
            <nav className='flex justify-around bg-[#1f293f] text-white px-16 py-4'>
                <a href='/dashboard' className={`flex space-x-2 ${
                            location.pathname === '/dashboard' ? 'text-white' : 'text-gray-400'
                        }`}>
                    <IoHome className='text-lg mt-1 cursor-pointer' />
                    <h1 className='text-lg cursor-pointer'>Dashboard</h1>
                </a>
                <a href='/patient-registration' className={`flex space-x-2 ${
                            location.pathname === '/patient-registration' ? 'text-white' : 'text-gray-400'
                        }`}>
                    <MdOutlineAppRegistration className='text-xl mt-1 cursor-pointer' />
                    <h1 className='text-lg cursor-pointer'>Patient Registration</h1>
                </a>
                <a href='/patient-history' className={`flex space-x-2 ${
                            location.pathname === '/patient-history' ? 'text-white' : 'text-gray-400'
                        }`}>
                    <LuHistory className='text-lg mt-1 cursor-pointer' />
                    <h1 className='text-lg cursor-pointer'>Patient History</h1>
                </a>
                <div className='flex space-x-2 text-gray-400 hover:text-white'>
                    <FaUserDoctor className='text-lg mt-1 cursor-pointer' />
                    <h1 className='text-lg cursor-pointer'>Appointments</h1>
                </div>
                <a href='/waiting-patients' className={`flex space-x-2 ${
                            location.pathname === '/waiting-patients' ? 'text-white' : 'text-gray-400'
                        }`}>
                    <RiHealthBookFill className='text-lg mt-1 cursor-pointer' />
                    <h1 className='text-lg cursor-pointer'>Waiting Patients</h1>
                </a>
                <div className='flex space-x-2 text-gray-400 hover:text-white'>
                    <MdOutlinePayment className='text-xl mt-1 cursor-pointer' />
                    <h1 className='text-lg cursor-pointer'>Billing</h1>
                </div>
            </nav>
        </div>
    )
}
