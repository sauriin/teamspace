"use client";

import { useState } from "react";
import { useOrganization, useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Folder, MoreVertical, Trash, Pencil } from "lucide-react";

import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { FileCard } from "./fileCard";
import { UploadButton } from "./uploadButton";

export default function FolderView({ orgId, query = "" }) {
    const folders = useQuery(
        api.folders.getFolders,
        orgId ? { orgId, searchQuery: query } : "skip"
    );

    const files = useQuery(
        api.files.getFiles,
        orgId ? { orgId, query } : "skip"
    );

    // Mutations for deleting and renaming folders
    const deleteFolder = useMutation(api.folders.deleteFolder);
    const renameFolder = useMutation(api.folders.renameFolder);

    // Local state management
    const [openFolderId, setOpenFolderId] = useState(null); // currently opened folder
    const [activeFolder, setActiveFolder] = useState(null); // folder selected for rename/delete
    const [isDeleteOpen, setIsDeleteOpen] = useState(false); // delete confirmation modal
    const [isRenameOpen, setIsRenameOpen] = useState(false); // rename dialog
    const [newName, setNewName] = useState(""); // new folder name input

    // Loading state while queries are pending
    if (!folders || !files) {
        return <div className="p-4 text-muted-foreground">Loading...</div>;
    }

    // Only show files that belong to the currently open folder
    const selectedFiles = files.filter((file) => file.folderId === openFolderId);

    /* Handles folder rename mutation */
    const handleRename = async () => {
        if (newName && activeFolder) {
            try {
                await renameFolder({ folderId: activeFolder._id, newName });
                toast.success("Folder renamed.");
            } catch {
                toast.error("Failed to rename folder.");
            } finally {
                setIsRenameOpen(false);
            }
        }
    };

    /*Handles folder delete mutation */
    const handleDelete = async () => {
        if (!activeFolder) return;
        try {
            await deleteFolder({ folderId: activeFolder._id });
            toast.success("Folder deleted.");
        } catch {
            toast.error("Failed to delete folder.");
        } finally {
            setIsDeleteOpen(false);
        }
    };

    return (
        <div className="p-4 space-y-10">
            {/* If no folder is open, show the folder grid */}
            {!openFolderId ? (
                <>

                    {/* Folder grid */}
                    <div className="grid grid-cols-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                        {folders.map((folder) => (
                            <Card
                                key={folder._id}
                                className="relative group p-4 cursor-pointer hover:bg-muted/50 transition"
                            >
                                {/* Dropdown menu (Rename, Delete) */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100"
                                            onClick={(e) => e.stopPropagation()} // prevent opening folder when clicking menu
                                        >
                                            <MoreVertical className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        {/* Rename option */}
                                        <DropdownMenuItem
                                            className="flex gap-2 items-center"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveFolder(folder);
                                                setNewName(folder.name);
                                                setIsRenameOpen(true);
                                            }}
                                        >
                                            <Pencil className="w-4 h-4" />
                                            Rename
                                        </DropdownMenuItem>
                                        {/* Delete option */}
                                        <DropdownMenuItem
                                            className="flex gap-2 items-center text-red-600"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveFolder(folder);
                                                setIsDeleteOpen(true);
                                            }}
                                        >
                                            <Trash className="w-4 h-4" />
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                {/* Folder card content */}
                                <div
                                    onClick={() => setOpenFolderId(folder._id)}
                                    className="flex flex-col items-center justify-center h-full text-center space-y-2"
                                >
                                    <Folder className="w-25 h-25" />
                                    <span className="text-sm font-medium">{folder.name}</span>
                                </div>
                            </Card>
                        ))}
                    </div>
                </>
            ) : (
                /* If a folder is open, show files inside it */
                <>
                    <div className="flex items-center justify-between">
                        <h2 className="text-3xl font-semibold text-white">
                            {folders.find((f) => f._id === openFolderId)?.name}
                        </h2>
                        <Button variant="outline" onClick={() => setOpenFolderId(null)}>
                            Back to Folders
                        </Button>
                    </div>
                    {/* Files inside folder */}
                    {selectedFiles.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {selectedFiles.map((file) => (
                                <FileCard key={file._id} file={file} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground mt-4">No files in this folder.</p>
                    )}
                </>
            )}

            {/* Rename Folder Dialog */}
            <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Rename Folder</DialogTitle>
                    </DialogHeader>
                    <Input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="New folder name"
                    />
                    <DialogFooter className="pt-2">
                        <Button onClick={handleRename}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Folder Confirmation Dialog */}
            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Folder</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this folder? This action cannot
                            be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
