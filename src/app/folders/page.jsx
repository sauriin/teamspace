"use client";

import React, { useState, useEffect } from "react";
import {
    useOrganization,
    useUser,
    useAuth,
    OrganizationSwitcher,
    UserButton,
} from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
    FolderPlus,
    ArrowLeft,
    Search,
    Loader2,
    Grid2X2,
    List,
} from "lucide-react";
import Navbar from "../Navbar";
import { UploadButton } from "@/_components/uploadButton";
import FolderView from "@/_components/folderView";
import { FileCard } from "@/_components/fileCard";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const FoldersPage = () => {
    const { organization, isLoaded: orgLoaded } = useOrganization();
    const { user, isLoaded: userLoaded } = useUser();
    const { isLoaded: authLoaded } = useAuth();

    const [query, setQuery] = useState("");
    const [view, setView] = useState("all"); // "all" | "trash"
    const [openFolderId, setOpenFolderId] = useState(null);
    const [selectedFolderName, setSelectedFolderName] = useState("");
    const [layout, setLayout] = useState("grid"); // "grid" | "list"

    const orgId = organization?.id ?? user?.id ?? "";
    const isClerkLoaded = orgLoaded && userLoaded && authLoaded;

    // reset search when view changes
    useEffect(() => setQuery(""), [view]);

    // queries
    const allFolders = useQuery(api.folders.getFolders, {
        orgId,
        searchQuery: query,
    });

    const trashedFolders = useQuery(api.trashBin.getTrashedFolders, {
        orgId,
        searchQuery: query,
    });

    const folderFiles = useQuery(
        api.folders.getFilesInFolder,
        openFolderId ? { folderId: openFolderId } : "skip"
    );

    if (!isClerkLoaded) {
        return (
            <div className="flex items-center justify-center h-screen text-white">
                Loading...
            </div>
        );
    }

    const displayFolders = view === "all" ? allFolders ?? [] : trashedFolders ?? [];
    const isLoading = view === "all" ? !allFolders : !trashedFolders;

    const handleFolderClick = (folder) => {
        setOpenFolderId(folder._id);
        setSelectedFolderName(folder.name);
    };

    const renderContent = () => {
        // when a folder is opened
        if (openFolderId) {
            if (!folderFiles) return <Loader message="Loading files inside folder..." />;
            if (folderFiles.length === 0)
                return <EmptyState message="No files inside this folder." icon="/empty.svg" />;

            return (
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-medium">{selectedFolderName}</h2>
                        <Button
                            variant="default"
                            onClick={() => setOpenFolderId(null)}
                            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white"
                        >
                            <ArrowLeft size={20} /> Back to Folders
                        </Button>
                    </div>
                    {layout === "grid" ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                            {folderFiles.map((file) => (
                                <FileCard key={file._id} file={file} variant="grid" />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col divide-y divide-gray-800">
                            {folderFiles.map((file) => (
                                <FileCard key={file._id} file={file} variant="list" />
                            ))}
                        </div>
                    )}
                </div>
            );
        }

        // loading state
        if (isLoading) return <Loader message="Loading folders..." />;

        // no folders
        if (!displayFolders.length) {
            const hasSearch = query.trim().length > 0;
            let imageSrc = "/uploadFolder.svg";
            let message = "Create a folder to start organizing your files.";

            if (hasSearch) {
                imageSrc = "/notFoundFolder.svg";
                message = "No matching folders found.";
            } else if (view === "trash") {
                imageSrc = "/trash.svg";
                message = "No folders in Trash.";
            }

            return <EmptyState message={message} icon={imageSrc} />;
        }

        // default folder view
        return (
            <FolderView
                folders={displayFolders}
                isTrashView={view === "trash"}
                onFolderClick={handleFolderClick}
                layout={layout}
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
                    if (folderId) setOpenFolderId(folderId);
                }}
            />

            <div className="flex flex-col w-full bg-black text-white">
                {/* Header */}
                <header className="h-14 flex items-center px-6 sticky top-0 z-10 bg-black mt-4">
                    <div className="flex-1 flex justify-center">
                        <div className="relative w-1/2">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search your folders"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 rounded-md pl-10 pr-3 py-2 text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4 ml-4">
                        {/* layout toggle */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setLayout(layout === "grid" ? "list" : "grid")}
                            title={layout === "grid" ? "Switch to List view" : "Switch to Grid view"}
                        >
                            {layout === "grid" ? <List size={20} /> : <Grid2X2 size={20} />}
                        </Button>

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

                {/* Upload + Create Folder */}
                <div className="flex gap-4 px-6 mt-6">
                    <UploadButton />
                    <div className="w-44 max-w-sm border-2 border-gray-700 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-900 hover:border-blue-500 transition cursor-pointer">
                        <FolderPlus size={28} className="text-gray-400 mb-3" />
                        <p className="text-gray-300 text-sm font-medium">
                            {view === "trash" ? "Restore Folder" : "Create Folder"}
                        </p>
                    </div>
                </div>

                {/* Main content */}
                <main className="flex-1 p-6 text-white overflow-y-auto">{renderContent()}</main>
            </div>
        </div>
    );
};

// Loader
const Loader = ({ message }) => (
    <div className="flex flex-col gap-8 w-full items-center mt-24 text-gray-500">
        <Loader2 className="h-32 w-32 animate-spin" />
        <div className="text-2xl">{message}</div>
    </div>
);

// Empty state
const EmptyState = ({ message, icon = "/uploadFolder.svg" }) => (
    <div className="flex flex-col items-center justify-center h-[45vh] text-center mt-10 gap-4 text-gray-400">
        <Image src={icon} alt="Empty" width={450} height={450} className="mb-6 opacity-80" />
        <p className="text-xl text-gray-500">{message}</p>
    </div>
);

export default FoldersPage;
