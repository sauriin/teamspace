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
    const folders = useQuery(api.folders.getFolders, orgId ? { orgId } : "skip");
    const files = useQuery(api.files.getFiles, orgId ? { orgId } : "skip");

    const deleteFolder = useMutation(api.folders.deleteFolder);
    const renameFolder = useMutation(api.folders.renameFolder);

    const [openFolderId, setOpenFolderId] = useState(null);
    const [activeFolder, setActiveFolder] = useState(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isRenameOpen, setIsRenameOpen] = useState(false);
    const [newName, setNewName] = useState("");

    if (!folders || !files) {
        return <div className="p-4 text-muted-foreground">Loading...</div>;
    }

    const lowerQuery = query.toLowerCase();

    const filteredFolders = folders.filter((folder) =>
        folder.name.toLowerCase().includes(lowerQuery)
    );

    const selectedFiles = files.filter((file) => file.folderId === openFolderId);

    const filteredFiles = selectedFiles.filter((file) =>
        file.name.toLowerCase().includes(lowerQuery)
    );

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

    const handleDelete = async () => {
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
            {!openFolderId ? (
                <>
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-4xl font-semibold">Folders</h1>
                        <UploadButton />
                    </div>
                    <div className="grid grid-cols-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {filteredFolders.map((folder) => (
                            <Card
                                key={folder._id}
                                className="relative group p-4 cursor-pointer hover:bg-muted/50 transition"
                            >
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <MoreVertical className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
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
                <>
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-white">
                            Files in {folders.find(f => f._id === openFolderId)?.name}
                        </h2>
                        <Button variant="outline" onClick={() => setOpenFolderId(null)}>
                            Back to Folders
                        </Button>
                    </div>
                    {filteredFiles.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {filteredFiles.map((file) => (
                                <FileCard key={file._id} file={file} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground mt-4">No files in this folder.</p>
                    )}
                </>
            )}

            {/* Rename Dialog */}
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

            {/* Delete AlertDialog */}
            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Folder</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this folder? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
