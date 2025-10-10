import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useUser, useOrganization } from "@clerk/nextjs";
import { useState } from "react";

import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Download,
    FileImage,
    FileText,
    Grid2X2Plus,
    File,
    ChartNoAxesGantt,
    Presentation,
    Star,
    MoreVertical,
    Trash2,
    RotateCcw,
    Info,
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

// file type icons
const fileTypeIcons = {
    image: FileImage,
    pdf: FileText,
    txt: FileText,
    csv: ChartNoAxesGantt,
    doc: File,
    docx: File,
    xls: Grid2X2Plus,
    xlsx: Grid2X2Plus,
    ppt: Presentation,
    pptx: Presentation,
    default: File,
};

export function FileCard({ file, variant = "grid" }) {
    const [showDetails, setShowDetails] = useState(false);
    const Icon = fileTypeIcons[file.type] || fileTypeIcons.default;

    // get file url
    const fileUrl = useQuery(
        api.files.getFileUrl,
        file?.fileId ? { storageId: file.fileId } : "skip"
    );

    // get user and org
    const { user } = useUser();
    const userId = user?.id;
    const { organization } = useOrganization();
    const orgId = organization?.id ?? userId;

    // starred files
    const starredFiles = useQuery(api.starred.getStarred, orgId ? { orgId } : "skip");

    // mutations
    const addStarred = useMutation(api.starred.addStarred);
    const removeStarred = useMutation(api.starred.removeStarred);
    const moveToTrash = useMutation(api.trashBin.moveToTrash);
    const restoreFile = useMutation(api.trashBin.restoreFile);
    const permanentlyDelete = useMutation(api.trashBin.permanentlyDeleteFile);

    // states
    const isStarred = !!starredFiles?.some((f) => f._id === file._id);
    const isTrashed = file.isDeleted;

    // actions
    const toggleStarred = async () => {
        try {
            if (!orgId) return toast.error("Organization not identified.");
            if (isStarred) {
                await removeStarred({ fileId: file._id, orgId });
                toast.success("Removed from starred");
            } else {
                await addStarred({ fileId: file._id, orgId });
                toast.success("Added to starred");
            }
        } catch {
            toast.error("Failed to update starred");
        }
    };

    const handleMoveToTrash = async () => {
        try {
            await moveToTrash({ fileId: file._id });
            toast.success("Moved to trash");
        } catch {
            toast.error("Failed to move to trash");
        }
    };

    const handleRestore = async () => {
        try {
            await restoreFile({ fileId: file._id });
            toast.success("File restored");
        } catch {
            toast.error("Failed to restore file");
        }
    };

    const handlePermanentDelete = async () => {
        try {
            await permanentlyDelete({ fileId: file._id });
            toast.success("File permanently deleted");
        } catch {
            toast.error("Failed to delete permanently");
        }
    };

    /* ---------- LIST VARIANT ---------- */
    if (variant === "list") {
        return (
            <>
                <div className="flex items-center justify-between px-4 py-3 bg-slate-800 rounded-md transition mb-5">
                    {/* Left: Icon + Name */}
                    <div className="flex items-center gap-3 min-w-0">
                        <Icon className="w-5 h-5 text-gray-400 shrink-0" />
                        <span className="truncate text-sm text-gray-200 font-medium">
                            {file.name}
                        </span>
                    </div>

                    {/* Right: Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6 p-0">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {/* Details */}
                            <DropdownMenuItem
                                onSelect={(e) => {
                                    e.preventDefault();
                                    setShowDetails(true);
                                }}
                            >
                                <Info className="w-4 h-4 mr-2" />
                                Details
                            </DropdownMenuItem>

                            {/* Download */}
                            {!isTrashed && (
                                <DropdownMenuItem
                                    onClick={() => {
                                        if (!fileUrl) return toast.error("File URL not available.");
                                        window.open(fileUrl, "_blank");
                                    }}
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Download
                                </DropdownMenuItem>
                            )}

                            {/* Star / Unstar */}
                            {!isTrashed && (
                                <DropdownMenuItem onClick={toggleStarred}>
                                    {isStarred ? (
                                        <>
                                            <Star
                                                className="w-4 h-4 mr-2 text-yellow-500"
                                                fill="currentColor"
                                            />
                                            Unstar
                                        </>
                                    ) : (
                                        <>
                                            <Star className="w-4 h-4 mr-2" />
                                            Star
                                        </>
                                    )}
                                </DropdownMenuItem>
                            )}

                            {/* Trash Actions */}
                            {isTrashed ? (
                                <>
                                    <DropdownMenuItem onClick={handleRestore}>
                                        <RotateCcw className="w-4 h-4 mr-2" />
                                        Restore
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="text-red-600"
                                        onClick={handlePermanentDelete}
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Delete Permanently
                                    </DropdownMenuItem>
                                </>
                            ) : (
                                <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={handleMoveToTrash}
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Move to Trash
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* details dialog */}
                <Dialog open={showDetails} onOpenChange={setShowDetails}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>File Details</DialogTitle>
                            <DialogDescription>
                                Information about the selected file.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-2 text-sm">
                            <p>
                                <strong>Name:</strong> {file.name}
                            </p>
                            <p>
                                <strong>Type:</strong> {file.type}
                            </p>
                            <p>
                                <strong>Created At:</strong>{" "}
                                {new Date(file._creationTime).toLocaleString()}
                            </p>
                            <p>
                                <strong>Created By:</strong> {file.createdByName}
                            </p>
                        </div>
                    </DialogContent>
                </Dialog>
            </>
        );
    }

    /* ---------- GRID VARIANT ---------- */
    return (
        <>
            <Card className="w-full max-w-xs p-2">
                <CardHeader className="relative pb-1 pt-1 px-2 space-y-1">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-sm font-medium truncate">
                            <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                            <span className="truncate">{file.name}</span>
                        </CardTitle>

                        {/* menu */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6 p-0">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                    onSelect={(e) => {
                                        e.preventDefault();
                                        setShowDetails(true);
                                    }}
                                >
                                    <Info className="w-4 h-4 mr-2" />
                                    Details
                                </DropdownMenuItem>

                                {isTrashed ? (
                                    <>
                                        <DropdownMenuItem onClick={handleRestore}>
                                            <RotateCcw className="w-4 h-4 mr-2" />
                                            Restore
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="text-red-600"
                                            onClick={handlePermanentDelete}
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Delete Permanently
                                        </DropdownMenuItem>
                                    </>
                                ) : (
                                    <DropdownMenuItem
                                        className="text-red-600"
                                        onClick={handleMoveToTrash}
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Move to Trash
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardHeader>

                {/* preview */}
                <CardContent>
                    {fileUrl && file.type?.toLowerCase() === "image" ? (
                        <div className="w-full h-48 relative flex items-center justify-center bg-gray-900 rounded-md overflow-hidden">
                            <Image
                                alt={file.name}
                                src={fileUrl}
                                fill
                                className="object-contain"
                                sizes="200px"
                                onError={() => {
                                    toast.error(`Could not load image: ${file.name}`);
                                }}
                            />
                        </div>
                    ) : (
                        <div className="w-full h-48 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 rounded-md text-muted-foreground">
                            <Icon className="w-12 h-12 mb-2" />
                        </div>
                    )}
                </CardContent>

                {/* footer */}
                <CardFooter className="px-2 py-2 flex justify-between">
                    {isTrashed ? (
                        <p className="text-xs text-muted-foreground">In Trash</p>
                    ) : (
                        <>
                            <Button
                                size="sm"
                                className="justify-center gap-1 text-sm"
                                onClick={() => {
                                    if (!fileUrl) return toast.error("File URL not available.");
                                    window.open(fileUrl, "_blank");
                                }}
                            >
                                <Download className="w-4 h-4" />
                                Download
                            </Button>

                            <Button
                                size="sm"
                                variant={isStarred ? "default" : "outline"}
                                onClick={toggleStarred}
                                className={`gap-1 ${isStarred ? "border-yellow-500 " : ""}`}
                                title={isStarred ? "Unstar" : "Star"}
                            >
                                {isStarred ? (
                                    <Star
                                        className="w-4 h-4 text-yellow-500"
                                        fill="currentColor"
                                    />
                                ) : (
                                    <Star className="w-4 h-4" />
                                )}
                            </Button>
                        </>
                    )}
                </CardFooter>
            </Card>

            {/* details dialog */}
            <Dialog open={showDetails} onOpenChange={setShowDetails}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>File Details</DialogTitle>
                        <DialogDescription>
                            Information about the selected file.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2 text-sm">
                        <p>
                            <strong>Name:</strong> {file.name}
                        </p>
                        <p>
                            <strong>Type:</strong> {file.type}
                        </p>
                        <p>
                            <strong>Created At:</strong>{" "}
                            {new Date(file._creationTime).toLocaleString()}
                        </p>
                        <p>
                            <strong>Created By:</strong> {file.createdByName}
                        </p>
                        <p>
                            <strong>Size:</strong>{" "}
                            {file.size
                                ? file.size >= 1024 * 1024
                                    ? (file.size / (1024 * 1024)).toFixed(2) + " MB"
                                    : (file.size / 1024).toFixed(2) + " KB"
                                : "Unknown"}
                        </p>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
