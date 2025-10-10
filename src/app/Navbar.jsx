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
import { useQuery } from "convex/react";
import { useOrganization, useUser } from "@clerk/nextjs";
import { api } from "../../convex/_generated/api";

const Navbar = ({ onMenuChange, folders = [] }) => {
    const pathname = usePathname();
    const router = useRouter();

    const { organization } = useOrganization();
    const { user } = useUser();

    // Get storage usage (auto updates from Convex)
    const usedBytes = useQuery(api.files.getUsedStorage, {
        orgId: organization ? organization.id : undefined,
    });

    const TOTAL_QUOTA = 350 * 1024 * 1024; // 350 MB in bytes
    const used = usedBytes || 0;
    const percentage = Math.min((used / TOTAL_QUOTA) * 100, 100);

    const formatSize = (bytes) => {
        if (bytes >= 1024 * 1024)
            return (bytes / (1024 * 1024)).toFixed(2) + " MB";
        return (bytes / 1024).toFixed(2) + " KB";
    };

    const getActiveFromPath = (path) => {
        if (path.startsWith("/docs")) return "home";
        if (path.startsWith("/folders")) return "folders";
        if (path.startsWith("/whiteBoard")) return "whiteBoard";
        if (path.startsWith("/contact")) return "contact";
        return "home";
    };

    const [activeSection, setActiveSection] = useState(
        getActiveFromPath(pathname)
    );
    const [secondaryActive, setSecondaryActive] = useState("All files");
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        setActiveSection(getActiveFromPath(pathname));
    }, [pathname]);

    // Collapse Navbar on small screens
    useEffect(() => {
        const handleResize = () => {
            setIsCollapsed(window.innerWidth < 768);
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const secondaryMenus = {
        home: [
            { label: "All files", icon: File },
            { label: "Starred", icon: Star },
        ],
        whiteBoard: [
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
            title={section}
        >
            <Icon size={22} />
        </button>
    );

    return (
        <div className="flex h-full">
            {/* Primary Sidebar */}
            <aside
                className={`flex flex-col py-6 border-r border-gray-700 transition-all duration-300 bg-black text-white
    ${isCollapsed ? "w-20" : "w-24 md:w-24 lg:w-28"}`}
            >
                <div
                    className={`mb-12 mt-2 flex justify-center ${isCollapsed ? "" : "px-4"
                        }`}
                >
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
                    <NavButton section="whiteBoard" icon={SquarePen} path="/whiteBoard" />
                    <NavButton section="contact" icon={Users} path="/contact" />
                </nav>
            </aside>

            {/* Secondary Sidebar (Hidden for WhiteBoard) */}
            {activeSection !== "whiteBoard" &&
                (activeSection === "folders" || currentMenu.length > 0) && (
                    <aside
                        className={`flex flex-col py-6 border-r border-gray-700 bg-black text-white transition-all duration-300
          ${isCollapsed ? "w-0 overflow-hidden" : "w-48 px-4"}`}
                    >
                        <h2 className="text-lg font-semibold ml-2 mb-6">
                            {activeSection === "folders"
                                ? "Folders"
                                : activeSection.charAt(0).toUpperCase() +
                                activeSection.slice(1)}
                        </h2>

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
                                            <span
                                                className={`${isCollapsed ? "hidden" : "inline"}`}
                                            >
                                                {item.label}
                                            </span>
                                        </Link>
                                    ))}
                                </nav>
                            )}
                        </div>

                        {/* ✅ Storage Usage Bar + Trash Bin */}
                        <div className="mt-auto space-y-5">
                            {/* Storage Usage */}
                            <div className="px-2">
                                <div className="flex justify-between text-xs text-gray-400 mb-1">
                                    <span>
                                        {formatSize(used)} / 350 MB
                                    </span>
                                </div>
                                <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500"
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                            </div>

                            {/* Trash Bin Button */}
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
                                <span className={`${isCollapsed ? "hidden" : "inline"}`}>
                                    Trash Bin
                                </span>
                            </button>
                        </div>
                    </aside>
                )}
        </div>
    );
};

export default Navbar;
