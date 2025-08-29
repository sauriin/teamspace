"use client";

import {
    Folder,
    Home,
    SquarePen,
    Users,
    Trash2,
    Clock,
    Star,
    CloudOff,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";

const Navbar = ({ onMenuChange }) => {
    const [activeSection, setActiveSection] = useState("home");
    const [secondaryActive, setSecondaryActive] = useState("All files");

    const secondaryMenus = {
        home: [
            { label: "All files", icon: Folder },
            { label: "Starred", icon: Star },
            { label: "Trash", icon: Trash2 },
        ],

        folders: [
            { label: "Recent", icon: Clock },
            { label: "Starred", icon: Star },
            { label: "Offline", icon: CloudOff },
        ],
        smartBoard: [
            { label: "New Doc", icon: SquarePen },
            { label: "Drafts", icon: Folder },
            { label: "Templates", icon: Star },
        ],
        contact: [
            { label: "Team Members", icon: Users },
            { label: "Invites", icon: SquarePen },
            { label: "Roles", icon: Folder },
        ],
    };

    const currentMenu = secondaryMenus[activeSection] || [];

    const NavButton = ({ section, icon: Icon }) => (
        <button
            onClick={() => {
                setActiveSection(section);
                setSecondaryActive(null);
                onMenuChange(section, null);
            }}
            className={`w-12 h-12 flex items-center justify-center rounded-md transition-colors
        ${activeSection === section
                    ? "bg-gradient-to-r from-[#1a0e2b] to-[#2c1b49] text-white"
                    : "text-gray-300 hover:bg-gradient-to-r hover:from-[#1a0e2b] hover:to-[#2c1b49] hover:text-white"
                }`}
        >
            <Icon size={22} />
        </button>
    );

    return (
        <div className="flex h-full">
            {/* Primary Sidebar */}
            <aside className="w-[80px] bg-black text-white flex flex-col py-6 border-r border-gray-700">
                <div className="mb-12 mt-2 flex justify-center">
                    <Link href="/">
                        <Image
                            src="/logo.png"
                            alt="Logo"
                            width={28}
                            height={28}
                            priority
                            className="cursor-pointer"
                        />
                    </Link>
                </div>

                <nav className="flex flex-col gap-4 items-center">
                    <NavButton section="home" icon={Home} />
                    <NavButton section="folders" icon={Folder} />
                    <NavButton section="smartBoard" icon={SquarePen} />
                    <NavButton section="contact" icon={Users} />
                </nav>
            </aside>

            {/* Secondary Sidebar */}
            <aside className="w-[200px] bg-black text-white border-r border-gray-700 flex flex-col py-6 px-4">
                <h2 className="text-lg font-semibold ml-2 mb-6">
                    {activeSection === "smartBoard"
                        ? "Smart Board"
                        : activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
                </h2>

                <nav className="flex flex-col gap-3 mb-10">
                    {currentMenu.map((item) => (
                        <Link
                            key={item.label}
                            href={item.path || "#"}
                            onClick={() => {
                                setSecondaryActive(item.label);
                                onMenuChange(activeSection, item.label);
                            }}
                            className={`flex items-center gap-3 py-2 px-2 rounded-md transition
      ${secondaryActive === item.label
                                    ? "bg-gradient-to-r from-[#1a0e2b] to-[#2c1b49] text-white"
                                    : "hover:bg-gray-800 text-gray-300"
                                }`}
                        >
                            <item.icon size={18} />
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>
            </aside>
        </div>
    );
};

export default Navbar;
