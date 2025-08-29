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
    StarOff,
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

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

    // get download URL for preview/download
    const fileUrl = useQuery(
        api.files.getFileUrl,
        file?.fileId ? { storageId: file.fileId } : "skip"
    );

    const { user } = useUser();
    const userId = user?.id;
    const { organization } = useOrganization();
    const orgId = organization?.id ?? userId; // use org or personal workspace

    // load starred files (returns file docs, not rows)
    const starredFiles = useQuery(api.starred.getStarred, orgId ? { orgId } : "skip");

    // mutations for star/unstar
    const addStarred = useMutation(api.starred.addStarred);
    const removeStarred = useMutation(api.starred.removeStarred);

    // check if this file is starred (compare file._id to returned file docs)
    const isStarred = !!starredFiles?.some((f) => f._id === file._id);

    // toggle star state
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

    return (
        <Card className="w-full max-w-xs p-2">
            <CardHeader className="relative pb-1 pt-1 px-2 space-y-1">
                <CardTitle className="flex items-center gap-2 text-sm font-medium truncate">
                    <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="truncate">{file.name}</span>
                </CardTitle>
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
                    variant={isStarred ? "default" : "outline"} // solid when starred
                    onClick={toggleStarred}
                    className={`gap-1 ${isStarred ? "border-yellow-500 " : ""}`} // subtle cue
                    title={isStarred ? "Unstar" : "Star"}
                >
                    {isStarred ? (
                        // show StarOff when starred
                        <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
                    ) : (
                        // show Star when not starred
                        <Star className="w-4 h-4" />
                    )}
                </Button>
            </CardFooter>
        </Card>
    );
}
