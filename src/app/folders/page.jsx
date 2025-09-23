"use client";

import React, { useState, useEffect } from "react";
import {
    useOrganization,
    useUser,
    useAuth,
    OrganizationSwitcher,
    UserButton,
} from "@clerk/nextjs";
import Navbar from "../Navbar";
import { FolderPlus, ArrowLeft } from "lucide-react";
import { UploadButton } from "@/_components/uploadButton";
import FolderView from "@/_components/folderView";
import { FileCard } from "@/_components/fileCard";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Image from "next/image";
import { Button } from "@/components/ui/button";

const FoldersPage = () => {
    const { organization, isLoaded: orgLoaded } = useOrganization();
    const { user, isLoaded: userLoaded } = useUser();
    const { isLoaded: authLoaded } = useAuth();

    const [query, setQuery] = useState("");
    const [view, setView] = useState("all"); // "all" | "trash"
    const [openFolderId, setOpenFolderId] = useState(null);
    const [selectedFolderName, setSelectedFolderName] = useState("");

    const orgId = organization?.id ?? user?.id ?? "";
    const isClerkLoaded = orgLoaded && userLoaded && authLoaded;

    useEffect(() => setQuery(""), [view]);

    const allFolders = useQuery(api.folders.getFolders, { orgId, searchQuery: query });
    const trashedFolders = useQuery(api.trashBin.getTrashedFolders, { orgId });

    // Files inside selected folder
    const folderFiles = useQuery(
        api.folders.getFilesInFolder,
        openFolderId ? { folderId: openFolderId } : "skip"
    );

    if (!isClerkLoaded)
        return (
            <div className="flex items-center justify-center h-screen text-white">
                Loading...
            </div>
        );

    const displayFolders = view === "all" ? allFolders ?? [] : trashedFolders ?? [];
    const isLoading = view === "all" ? !allFolders : !trashedFolders;
    const hasFolders = displayFolders.length > 0;

    const handleFolderClick = (folder) => {
        setOpenFolderId(folder._id);
        setSelectedFolderName(folder.name);
    };

    const renderContent = () => {
        // If a folder is open, show its files
        if (openFolderId) {
            if (!folderFiles) return <div className="text-gray-400">Loading files...</div>;
            if (folderFiles.length === 0) return <div className="text-gray-400">No files inside this folder.</div>;

            return (
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-medium">{selectedFolderName}</h2>
                        <Button
                            variant="default"
                            onClick={() => setOpenFolderId(null)}
                            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white ml-4"
                        >
                            <ArrowLeft size={20} /> Back to Folders
                        </Button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                        {folderFiles.map((file) => (
                            <FileCard key={file._id} file={file} />
                        ))}
                    </div>
                </div>
            );
        }

        if (isLoading)
            return (
                <div className="flex items-center justify-center h-[60vh] text-gray-400">
                    Loading...
                </div>
            );

        if (!hasFolders)
            return (
                <div className="flex flex-col items-center justify-center h-[45vh] text-center mt-25 text-gray-400">
                    <Image
                        src={view === "trash" ? "/trash.svg" : "/empty.svg"}
                        alt="Empty state"
                        width={450}
                        height={450}
                        className="mb-6 opacity-80"
                    />
                    <p className="text-xl text-gray-500">
                        {view === "trash"
                            ? "No folders in Trash."
                            : "Create a folder to start organizing your files."}
                    </p>
                </div>
            );

        return (
            <FolderView
                orgId={orgId}
                folders={displayFolders}
                isTrashView={view === "trash"}
                onFolderClick={handleFolderClick} // Pass click handler
            />
        );
    };

    return (
        <div className="flex h-screen">
            <Navbar
                folders={allFolders ?? []}
                onMenuChange={(section, secondary, folderId) => {
                    if (secondary === "Trash") setView("trash");
                    else if (section === "folders") setView("all");
                    if (folderId) setOpenFolderId(folderId); // Click from navbar
                }}
            />
            <div className="flex flex-col w-full bg-black text-white">
                <header className="h-14 flex items-center px-6 sticky top-0 z-10 bg-black mt-4">
                    <div className="flex-1 flex justify-center">
                        <input
                            type="text"
                            placeholder="Search folders"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-1/2 bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex items-center gap-4 ml-4">
                        <OrganizationSwitcher
                            appearance={{
                                elements: {
                                    rootBox: "bg-white text-black rounded-md shadow-lg",
                                    organizationSwitcherTrigger: "bg-white text-black",
                                },
                            }}
                        />
                        <UserButton appearance={{ baseTheme: "dark" }} />
                    </div>
                </header>

                <div className="flex gap-4 px-6 mt-6">
                    <UploadButton />
                    <div className="w-44 max-w-sm border-2 border-gray-700 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-900 hover:border-blue-500 transition cursor-pointer">
                        <FolderPlus size={28} className="text-gray-400 mb-3" />
                        <p className="text-gray-300 text-sm font-medium">
                            {view === "trash" ? "Restore Folder" : "Create Folder"}
                        </p>
                    </div>
                </div>

                <main className="flex-1 p-6 text-white overflow-y-auto">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default FoldersPage;
