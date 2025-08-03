import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

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

import { Button } from "@/components/ui/button";

import {
    MoreVertical,
    Trash,
    Download,
    FileImage,
    FileText,
    Grid2X2Plus,
    File,
    ChartNoAxesGantt,
    Presentation,
} from "lucide-react";

import { toast } from "sonner";
import Image from "next/image";

// 🔁 Icon map based on file type
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

function FileCardActions({ file }) {
    const deleteFile = useMutation(api.files.deleteFile);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const fileUrl = useQuery(
        api.files.getFileUrl,
        file?.fileId ? { storageId: file.fileId } : "skip"
    );

    const handleDownload = () => {
        if (!fileUrl) {
            console.error("File URL not available.");
            return;
        }
        const anchor = document.createElement("a");
        anchor.href = fileUrl;
        anchor.download = file.name;
        anchor.click();
    };

    return (
        <>
            <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this file.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={async () => {
                                try {
                                    await deleteFile({ fileId: file._id });
                                    toast.success("File deleted successfully.");
                                } catch (err) {
                                    console.error("Failed to delete file:", err);
                                    toast.error("Failed to delete the file.");
                                }
                            }}
                        >
                            Continue
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <DropdownMenu>
                <DropdownMenuTrigger>
                    <MoreVertical />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem
                        onClick={() => setIsConfirmOpen(true)}
                        className="flex gap-1 items-center"
                    >
                        <Trash className="h-4 w-4" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
}

export function FileCard({ file }) {
    const Icon = fileTypeIcons[file.type] || fileTypeIcons.default;
    const fileUrl = useQuery(
        api.files.getFileUrl,
        file?.fileId ? { storageId: file.fileId } : "skip"
    );

    return (
        <Card className="w-full max-w-xs p-2">
            <CardHeader className="relative pb-1 pt-1 px-2 space-y-1">
                <CardTitle className="flex items-center gap-2 text-sm font-medium truncate">
                    <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="truncate">{file.name}</span>
                </CardTitle>
                <div className="absolute right-2 top-2">
                    <FileCardActions file={file} />
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

            <CardFooter className="px-2 py-2">
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
            </CardFooter>
        </Card>
    );
}