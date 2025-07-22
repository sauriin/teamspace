"use client";

import { useOrganization, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

import { UploadButton } from "@/_components/uploadButton";
import { FileCard } from "@/_components/fileCard";

export default function Home() {
  const { organization, isLoaded: orgLoaded } = useOrganization();
  const { user, isLoaded: userLoaded } = useUser();

  const orgId = organization?.id ?? user?.id;
  const isClerkLoaded = orgLoaded && userLoaded;

  const getFiles = useQuery(api.files.getFiles, orgId ? { orgId } : "skip");

  if (!isClerkLoaded) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 pt-[150px]">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-semibold">Your Files</h1>

          <UploadButton />
        </div>

        <div className="grid grid-cols-4 gap-4">
          {getFiles?.map((file) => (
            <FileCard key={file._id} file={file} />
          ))}
        </div>
      </div>
    </div>
  );
}
