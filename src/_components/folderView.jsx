"use client";

import { useState } from "react";
import { api } from "../../convex/_generated/api";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Folder,
    MoreVertical,
    Pencil,
    Trash2,
    RotateCcw,
    XCircle,
    Info,
} from "lucide-react";

import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

export default function FolderView({
    folders = [],
    isTrashView = false,
    onFolderClick,
    layout = "grid", // grid | list
}) {
    const [activeFolder, setActiveFolder] = useState(null);
    const [newName, setNewName] = useState("");
    const [showDetails, setShowDetails] = useState(null);

    // convex mutations
    const renameFolder = useMutation(api.folders.renameFolder);
    const trashFolder = useMutation(api.trashBin.trashFolder);
    const restoreFolder = useMutation(api.trashBin.restoreFolder);
    const deleteFolderForever = useMutation(api.folders.deleteFolder);

    if (!folders) return <div className="p-4 text-gray-400">Loading...</div>;

    return (
        <>
            <div className="p-4 space-y-10">
                {layout === "grid" ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                        {folders.map((folder) => (
                            <FolderCard
                                key={folder._id}
                                folder={folder}
                                isTrashView={isTrashView}
                                onFolderClick={onFolderClick}
                                setShowDetails={setShowDetails}
                                setActiveFolder={setActiveFolder}
                                setNewName={setNewName}
                                renameFolder={renameFolder}
                                trashFolder={trashFolder}
                                restoreFolder={restoreFolder}
                                deleteFolderForever={deleteFolderForever}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col divide-y divide-gray-800">
                        {folders.map((folder) => (
                            <FolderCard
                                key={folder._id}
                                folder={folder}
                                isTrashView={isTrashView}
                                onFolderClick={onFolderClick}
                                setShowDetails={setShowDetails}
                                setActiveFolder={setActiveFolder}
                                setNewName={setNewName}
                                renameFolder={renameFolder}
                                trashFolder={trashFolder}
                                restoreFolder={restoreFolder}
                                deleteFolderForever={deleteFolderForever}
                                layout="list"
                            />
                        ))}
                    </div>
                )}

                {/* Rename folder */}
                {activeFolder && (
                    <div className="flex items-center gap-2 mt-4">
                        <input
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="New folder name"
                            className="px-3 py-2 rounded border border-gray-700 bg-gray-900 text-white"
                        />
                        <Button
                            onClick={async () => {
                                await renameFolder({ folderId: activeFolder._id, newName });
                                toast.success("Folder renamed");
                                setActiveFolder(null);
                            }}
                        >
                            Save
                        </Button>
                        <Button variant="outline" onClick={() => setActiveFolder(null)}>
                            Cancel
                        </Button>
                    </div>
                )}
            </div>

            {/* Details Dialog */}
            <Dialog open={!!showDetails} onOpenChange={() => setShowDetails(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-semibold">
                            {showDetails?.name}
                        </DialogTitle>
                        <DialogDescription>Details about this folder.</DialogDescription>
                    </DialogHeader>

                    {showDetails && (
                        <div className="space-y-2 mt-4 text-sm text-gray-100">
                            <p>
                                <strong>Created By:</strong> {showDetails.createdByName}
                            </p>
                            <p>
                                <strong>Created At:</strong>{" "}
                                {new Date(showDetails.createdAt).toLocaleString()}
                            </p>
                            <p>
                                <strong>Trashed:</strong> {showDetails.isDeleted ? "Yes" : "No"}
                            </p>
                        </div>
                    )}

                    <div className="mt-4 flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowDetails(null)}>
                            Close
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

// FolderCard (used in both grid and list)
function FolderCard({
    folder,
    isTrashView,
    onFolderClick,
    setShowDetails,
    setActiveFolder,
    setNewName,
    trashFolder,
    restoreFolder,
    deleteFolderForever,
    layout = "grid",
}) {
    return (
        <Card
            key={folder._id}
            className={`relative group p-4 cursor-pointer hover:bg-gray-800 transition rounded-lg shadow-lg ${layout === "list" ? "flex items-center justify-between" : ""
                }`}
            onClick={() => onFolderClick && onFolderClick(folder)}
        >
            <div
                className={`flex ${layout === "list"
                        ? "flex-row items-center justify-between w-full"
                        : "flex-col items-center justify-center h-full text-center space-y-2"
                    }`}
            >
                <Folder className="w-30 h-30 text-blue-400" />
                <span className="text-sm font-medium truncate ml-2">{folder.name}</span>
            </div>

            {/* Dropdown */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost">
                            <MoreVertical className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        {/* Info */}
                        <DropdownMenuItem
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowDetails(folder);
                            }}
                        >
                            <Info className="w-4 h-4 mr-2" /> Info
                        </DropdownMenuItem>

                        {!isTrashView ? (
                            <>
                                <DropdownMenuItem
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveFolder(folder);
                                        setNewName(folder.name);
                                    }}
                                >
                                    <Pencil className="w-4 h-4 mr-2" /> Rename
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        trashFolder({ folderId: folder._id });
                                        toast.success("Folder moved to Trash");
                                    }}
                                >
                                    <Trash2 className="w-4 h-4 mr-2" /> Move to Trash
                                </DropdownMenuItem>
                            </>
                        ) : (
                            <>
                                <DropdownMenuItem
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        restoreFolder({ folderId: folder._id });
                                        toast.success("Folder restored");
                                    }}
                                >
                                    <RotateCcw className="w-4 h-4 mr-2" /> Restore
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="text-red-500"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteFolderForever({ folderId: folder._id });
                                        toast.success("Folder deleted permanently");
                                    }}
                                >
                                    <XCircle className="w-4 h-4 mr-2" /> Delete Permanently
                                </DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </Card>
    );
}
