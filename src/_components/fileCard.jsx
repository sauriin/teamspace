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
} from "@/components/ui/card"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { MoreVertical, Trash, Download, Eye } from "lucide-react";
import { toast } from "sonner";


function FileCardActions({ file }) {
    const deleteFile = useMutation(api.files.deleteFile)
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const getFileUrl = useQuery(api.files.getFileUrl, file?.fileId ? { storageId: file.fileId } : "skip");

    const handleDownload = () => {
        if (!getFileUrl) {
            console.error("File URL not available.");
            return;
        }
        const anchor = document.createElement("a");
        anchor.href = getFileUrl;
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
                    <DropdownMenuItem onClick={handleDownload} className="flex gap-1 items-center">
                        <Download className="h-4 w-4" />
                        Download
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsConfirmOpen(true)} className="flex gap-1 items-center">
                        <Trash className="h-4 w-4" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
}

export function FileCard({ file }) {
    return (
        <Card>
            <CardHeader className="relative">
                <CardTitle>{file.name}</CardTitle>
                <div className="absolute right-2 z-10">
                    <FileCardActions file={file} />
                </div>
            </CardHeader>
            <CardContent />
            <CardFooter>
                <Button >View <Eye /></Button>
            </CardFooter>
        </Card>
    );
}
