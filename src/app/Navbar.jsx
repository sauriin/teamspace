"use client";

import {
    Folder,
    Home,
    SquarePen,
    Users,
    Trash2,
    Star,
    File,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

const Navbar = ({ onMenuChange, folders = [] }) => {
    const pathname = usePathname();
    const router = useRouter();

    const getActiveFromPath = (path) => {
        if (path.startsWith("/docs")) return "home";
        if (path.startsWith("/folders")) return "folders";
        if (path.startsWith("/smartboard")) return "smartBoard";
        if (path.startsWith("/contact")) return "contact";
        return "home";
    };

    const [activeSection, setActiveSection] = useState(
        getActiveFromPath(pathname)
    );
    const [secondaryActive, setSecondaryActive] = useState("All files");

    useEffect(() => {
        setActiveSection(getActiveFromPath(pathname));
    }, [pathname]);

    const secondaryMenus = {
        home: [
            { label: "All files", icon: File },
            { label: "Starred", icon: Star },
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

    // If section is "folders", map actual folders into menu items
    const currentMenu =
        activeSection === "folders"
            ? folders.map((f) => ({
                label: f.name,
                icon: Folder,
                path: `/folders/${f._id}`,
            }))
            : secondaryMenus[activeSection] || [];

    const NavButton = ({ section, icon: Icon, path }) => (
        <button
            onClick={() => {
                router.push(path);
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
                    <NavButton section="home" icon={Home} path="/docs" />
                    <NavButton section="folders" icon={Folder} path="/folders" />
                    <NavButton
                        section="smartBoard"
                        icon={SquarePen}
                        path="/smartboard"
                    />
                    <NavButton section="contact" icon={Users} path="/contact" />
                </nav>
            </aside>

            {/* Secondary Sidebar */}
            {(activeSection === "folders" || currentMenu.length > 0) && (
                <aside className="w-[200px] bg-black text-white border-r border-gray-700 flex flex-col py-6 px-4">
                    <h2 className="text-lg font-semibold ml-2 mb-6">
                        {activeSection === "folders"
                            ? "Folders"
                            : activeSection === "smartBoard"
                                ? "Smart Board"
                                : activeSection.charAt(0).toUpperCase() +
                                activeSection.slice(1)}
                    </h2>

                    {/* Top Menu */}
                    <div className="flex-1">
                        {activeSection === "folders" && folders.length === 0 ? (
                            <div className="flex flex-1 items-center justify-center text-gray-400 italic">
                                No folders yet.
                            </div>
                        ) : (
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
                        )}
                    </div>

                    {/* Trash Bin at bottom (always visible) */}
                    <div className="mt-auto">
                        <button
                            onClick={() => {
                                setSecondaryActive("Trash");
                                onMenuChange(activeSection, "Trash");
                            }}
                            className={`flex w-full items-center gap-3 py-2 px-2 rounded-md transition
          ${secondaryActive === "Trash"
                                    ? "bg-gradient-to-r from-[#1a0e2b] to-[#2c1b49] text-white"
                                    : "hover:bg-gray-800 text-gray-300"
                                }`}
                        >
                            <Trash2 size={18} />
                            <span>Trash Bin</span>
                        </button>
                    </div>
                </aside>
            )}
        </div>
    );
};

export default Navbar;
