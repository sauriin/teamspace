// FoldersPage.jsx
"use client";

import React, { useState } from "react";
import {
    useOrganization,
    useUser,
    useAuth,
    OrganizationSwitcher,
    UserButton,
} from "@clerk/nextjs";
import Navbar from "../Navbar";
import { FolderPlus } from "lucide-react";
import { UploadButton } from "@/_components/uploadButton";
import FolderView from "@/_components/folderView";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Image from "next/image";

const FoldersPage = () => {
    const { organization, isLoaded: orgLoaded } = useOrganization();
    const { user, isLoaded: userLoaded } = useUser();
    const { isSignedIn, isLoaded: authLoaded } = useAuth();

    const [query, setQuery] = useState("");

    const orgId = organization?.id ?? user?.id;
    const isClerkLoaded = orgLoaded && userLoaded && authLoaded;

    // 🔹 Fetch folders
    const folders = useQuery(
        api.folders.getFolders,
        orgId ? { orgId, searchQuery: query } : "skip"
    );

    if (!isClerkLoaded) {
        return (
            <div className="flex items-center justify-center h-screen text-white">
                Loading...
            </div>
        );
    }

    return (
        <div className="flex h-screen">
            {/* Navbar */}
            <Navbar onMenuChange={() => { }} folders={folders || []} />

            <div className="flex flex-col w-full bg-black text-white">
                {/* Header */}
                <header className="h-14 flex items-center px-6 sticky top-0 z-10 bg-black mt-4">
                    {/* Search */}
                    <div className="flex-1 flex justify-center">
                        <input
                            type="text"
                            placeholder="Search folders"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-1/2 bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>

                    {/* Clerk Controls */}
                    <div className="flex items-center gap-4 ml-4">
                        <OrganizationSwitcher
                            appearance={{
                                elements: {
                                    rootBox: "bg-white text-black rounded-md shadow-lg",
                                    organizationSwitcherTrigger: "bg-white text-black",
                                },
                            }}
                        />
                        <UserButton
                            appearance={{
                                baseTheme: "dark",
                            }}
                        />
                    </div>
                </header>

                {/* Upload + Create Folder */}
                <div className="flex gap-4 px-6 mt-6">
                    <UploadButton />
                    <div
                        className="w-44 max-w-sm border-2 border-gray-700 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-900 hover:border-blue-500 transition cursor-pointer"
                    >
                        <FolderPlus size={28} className="text-gray-400 mb-3" />
                        <p className="text-gray-300 text-sm font-medium">Create Folder</p>
                    </div>
                </div>

                {/* Main Section */}
                <main className="flex-1 p-6 text-white overflow-y-auto">
                    {/* 🔹 Empty State */}
                    {folders && folders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[60vh] text-center text-gray-400">
                            <Image
                                src="/empty.svg"
                                alt="Empty state"
                                width={450}
                                height={450}
                                className="mb-6 opacity-80"
                            />
                            <p className="text-xl text-gray-500">
                                Create a folder to start organizing your files.
                            </p>
                        </div>
                    ) : (
                        <FolderView orgId={orgId} query={query} />
                    )}
                </main>
            </div>
        </div>
    );
};

export default FoldersPage;