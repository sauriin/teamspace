"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";

import {
    Folder,
    MoreVertical,
    Pencil,
    Trash2,
    RotateCcw,
    XCircle,
} from "lucide-react";

import { toast } from "sonner";
import { FileCard } from "./fileCard";

export default function FolderView({ orgId, query = "" }) {
    const folders = useQuery(
        api.folders.getFolders,
        orgId ? { orgId, searchQuery: query } : "skip"
    );
    const files = useQuery(
        api.files.getFiles,
        orgId ? { orgId, query } : "skip"
    );

    // mutations
    const renameFolder = useMutation(api.folders.renameFolder);
    const moveFolderToTrash = useMutation(api.trash.moveFolderToTrash);
    const deleteFolderForever = useMutation(api.trash.deleteFolderForever);

    const [openFolderId, setOpenFolderId] = useState(null);
    const [activeFolder, setActiveFolder] = useState(null);
    const [newName, setNewName] = useState("");

    if (!folders || !files) {
        return <div className="p-4 text-gray-400">Loading...</div>;
    }

    const selectedFiles = files.filter((file) => file.folderId === openFolderId);

    const handleRename = async () => {
        if (!newName || !activeFolder) return;
        try {
            await renameFolder({ folderId: activeFolder._id, newName });
            toast.success("Folder renamed");
            setActiveFolder(null);
        } catch {
            toast.error("Failed to rename folder");
        }
    };

    const handleMoveToTrash = async (folderId) => {
        try {
            await moveFolderToTrash({ folderId });
            toast.success("Folder moved to Trash");
        } catch {
            toast.error("Failed to move folder");
        }
    };

    const handleDeleteForever = async (folderId) => {
        try {
            await deleteFolderForever({ folderId });
            toast.success("Folder deleted permanently");
        } catch {
            toast.error("Failed to delete folder");
        }
    };

    return (
        <div className="p-4 space-y-10">
            {!openFolderId ? (
                <>
                    {/* Folders grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                        {folders.map((folder) => (
                            <Card
                                key={folder._id}
                                className="relative group p-4 cursor-pointer hover:bg-gray-800 transition"
                                onClick={() => setOpenFolderId(folder._id)}
                            >
                                <div className="flex flex-col items-center justify-center h-full text-center space-y-2">
                                    <Folder className="w-30 h-30 text-blue-400" />
                                    <span className="text-sm font-medium">{folder.name}</span>
                                </div>

                                {/* Dropdown menu */}
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button size="icon" variant="ghost">
                                                <MoreVertical className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-60">
                                            {/* Folder Info Section */}
                                            <div className="px-3 py-2 text-xs text-gray-400 border-b border-gray-700">
                                                <p className="flex items-center gap-2">
                                                    <Folder className="w-4 h-4 text-blue-400" />
                                                    <span className="font-medium text-white">{folder.name}</span>
                                                </p>
                                                <p className="flex items-center gap-2 mt-1">
                                                    <Pencil className="w-3 h-3 text-gray-400" />
                                                    Created By:{" "}
                                                    <span className="text-white">{folder.createdByName || "Unknown"}</span>
                                                </p>
                                                <p className="flex items-center gap-2 mt-1">
                                                    <RotateCcw className="w-3 h-3 text-gray-400" />
                                                    Created At:{" "}
                                                    <span className="text-white">
                                                        {new Date(folder.createdAt).toLocaleDateString()}
                                                    </span>
                                                </p>
                                                <p className="flex items-center gap-2 mt-1">
                                                    <Folder className="w-3 h-3 text-gray-400" />
                                                    Files:{" "}
                                                    <span className="text-white">
                                                        {files.filter((file) => file.folderId === folder._id).length}
                                                    </span>
                                                </p>
                                            </div>

                                            {/* Folder Actions */}
                                            {!folder.isDeleted ? (
                                                <>
                                                    <DropdownMenuItem
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setActiveFolder(folder);
                                                            setNewName(folder.name);
                                                        }}
                                                    >
                                                        <Pencil className="w-4 h-4 mr-2" />
                                                        Rename
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleMoveToTrash(folder._id);
                                                        }}
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                        Move to Trash
                                                    </DropdownMenuItem>
                                                </>
                                            ) : (
                                                <>
                                                    <DropdownMenuItem
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toast.success("Folder restored (hook restore mutation here)");
                                                        }}
                                                    >
                                                        <RotateCcw className="w-4 h-4 mr-2" />
                                                        Restore
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-red-500"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteForever(folder._id);
                                                        }}
                                                    >
                                                        <XCircle className="w-4 h-4 mr-2" />
                                                        Delete Permanently
                                                    </DropdownMenuItem>
                                                </>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </Card>
                        ))}
                    </div>

                    {/* Rename inline form */}
                    {activeFolder && (
                        <div className="flex items-center gap-2 mt-4">
                            <Input
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="New folder name"
                            />
                            <Button onClick={handleRename}>Save</Button>
                            <Button variant="outline" onClick={() => setActiveFolder(null)}>
                                Cancel
                            </Button>
                        </div>
                    )}
                </>
            ) : (
                <>
                    {/* Inside a folder */}
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-semibold text-white">
                            {folders.find((f) => f._id === openFolderId)?.name}
                        </h2>
                        <Button variant="outline" onClick={() => setOpenFolderId(null)}>
                            Back to Folders
                        </Button>
                    </div>

                    {selectedFiles.length > 0 ? (
                        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {selectedFiles.map(file => (
                                <FileCard key={file._id} file={file} />
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-400 mt-4">No files in this folder.</p>
                    )}
                </>
            )}
        </div>
    );
}
