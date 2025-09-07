import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useUser, useOrganization } from "@clerk/nextjs";

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
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

export function FileCard({ file }) {
    const Icon = fileTypeIcons[file.type] || fileTypeIcons.default;

    const fileUrl = useQuery(
        api.files.getFileUrl,
        file?.fileId ? { storageId: file.fileId } : "skip"
    );

    const { user } = useUser();
    const userId = user?.id;
    const { organization } = useOrganization();
    const orgId = organization?.id ?? userId;

    const starredFiles = useQuery(api.starred.getStarred, orgId ? { orgId } : "skip");

    const addStarred = useMutation(api.starred.addStarred);
    const removeStarred = useMutation(api.starred.removeStarred);

    const moveToTrash = useMutation(api.trashBin.moveToTrash);
    const restoreFile = useMutation(api.trashBin.restoreFile);
    const permanentlyDelete = useMutation(api.trashBin.permanentlyDeleteFile);

    const isStarred = !!starredFiles?.some((f) => f._id === file._id);
    const isTrashed = file.isDeleted; // ✅ check if file is in trash

    // ⭐ toggle star
    const toggleStarred = async () => {
        try {
            if (!orgId) {
                toast.error("Organization not identified.");
                return;
            }
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

    // 🗑️ move to trash
    const handleMoveToTrash = async () => {
        try {
            await moveToTrash({ fileId: file._id });
            toast.success("Moved to trash");
        } catch {
            toast.error("Failed to move to trash");
        }
    };

    // 🔄 restore file
    const handleRestore = async () => {
        try {
            await restoreFile({ fileId: file._id });
            toast.success("File restored");
        } catch {
            toast.error("Failed to restore file");
        }
    };

    // ❌ permanently delete file
    const handlePermanentDelete = async () => {
        try {
            await permanentlyDelete({ fileId: file._id });
            toast.success("File permanently deleted");
        } catch {
            toast.error("Failed to delete permanently");
        }
    };

    return (
        <Card className="w-full max-w-xs p-2">
            <CardHeader className="relative pb-1 pt-1 px-2 space-y-1">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-sm font-medium truncate">
                        <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="truncate">{file.name}</span>
                    </CardTitle>

                    {/* ⋮ Dropdown menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6 p-0">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
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

            <CardFooter className="px-2 py-2 flex justify-between">
                {isTrashed ? (
                    <p className="text-xs text-muted-foreground">In Trash</p>
                ) : (
                    <>
                        <Button
                            size="sm"
                            className="justify-center gap-1 text-sm"
                            onClick={() => {
                                if (!fileUrl) {
                                    toast.error("File URL not available.");
                                    return;
                                }
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
    );
}
