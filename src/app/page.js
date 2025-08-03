"use client";

import { useOrganization, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { UploadButton } from "@/_components/uploadButton";
import { FileCard } from "@/_components/fileCard";
import Image from "next/image";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { organization, isLoaded: orgLoaded } = useOrganization();
  const { user, isLoaded: userLoaded } = useUser();

  const orgId = organization?.id ?? user?.id;
  const isClerkLoaded = orgLoaded && userLoaded;

  const getFiles = useQuery(api.files.getFiles, orgId ? { orgId } : "skip");
  const isLoading = getFiles === undefined;

  if (!isClerkLoaded) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 pt-[150px]">
      <div className="max-w-7xl mx-auto">
        {isLoading && (
          <div className="flex flex-col gap-8 w-full items-center mt-24">
            <Loader2 className="h-32 w-32 animate-spin text-gray-500" />
            <div className="text-2xl">Loading...</div>
          </div>
        )}

        {!isLoading && getFiles.length === 0 && (
          <div className="flex flex-col gap-4 w-full items-center mt-24">
            <Image
              alt="Image of empty state"
              width="500"
              height="500"
              src="/empty.svg"
            />
            <div className="text-2xl text-gray-500 text-center">
              Let’s build together — upload a file to get started.
            </div>
            <div className="mt-2">
              <UploadButton />
            </div>
          </div>
        )}

        {!isLoading && getFiles.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-4xl font-semibold">Your Files</h1>

              <UploadButton />
            </div>
            <div className="grid grid-cols-5 gap-4">
              {getFiles?.map((file) => (
                <FileCard key={file._id} file={file} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
