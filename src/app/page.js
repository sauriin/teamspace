"use client";

import { useOrganization, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { UploadButton } from "@/_components/uploadButton";
import { FileCard } from "@/_components/fileCard";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FolderView from "@/_components/folderView";
import Header from "../app/Header";
import { useState } from "react";

export default function Home() {
  const { organization, isLoaded: orgLoaded } = useOrganization();
  const { user, isLoaded: userLoaded } = useUser();
  const [query, setQuery] = useState(""); // 👈 Search Query State

  const orgId = organization?.id ?? user?.id;
  const isClerkLoaded = orgLoaded && userLoaded;

  const getFiles = useQuery(
    api.files.getFiles,
    isClerkLoaded && orgId ? { orgId, query } : "skip"
  );
  const isLoading = getFiles === undefined;

  if (!isClerkLoaded) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 pt-[150px]">
      <div className="fixed top-5 left-0 right-0 z-50 px-3 sm:px-6 lg:px-8 pt-3">
        <div className="max-w-7xl mx-auto">
          <Header setQuery={setQuery} />
        </div>
      </div>
      <div className="max-w-7xl mx-auto">
        <Tabs defaultValue="files">
          <TabsList className="mb-6 text-lg">
            <TabsTrigger value="files" className="px-5 py-2">
              Files
            </TabsTrigger>
            <TabsTrigger value="folders" className="px-5 py-2">
              Folders
            </TabsTrigger>
          </TabsList>

          {/* ====== Files Tab ====== */}
          <TabsContent value="files">
            {isLoading && (
              <div className="flex flex-col gap-8 w-full items-center mt-24">
                <Loader2 className="h-32 w-32 animate-spin text-gray-500" />
                <div className="text-2xl">Loading...</div>
              </div>
            )}

            {!isLoading && getFiles.length === 0 && (
              <div className="flex flex-col gap-4 w-full items-center mt-10">
                <Image
                  alt="Image of empty state"
                  width="500"
                  height="500"
                  src="/empty.svg"
                />
                <div className="text-2xl text-gray-500 text-center">
                  {query
                    ? "No matching files found."
                    : "Let’s build together — upload a file to get started."}
                </div>
                <div className="mt-2">
                  <UploadButton />
                </div>
              </div>
            )}

            {!isLoading && getFiles.length > 0 && (
              <>
                <div className="flex items-center justify-between mb-8">
                  <h1 className="text-4xl font-semibold">Files</h1>
                  <UploadButton />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 transition-all duration-300 ease-in-out">
                  {getFiles.map((file) => (
                    <div
                      key={file._id}
                      className="transform transition duration-200 hover:scale-[1.02]"
                    >
                      <FileCard file={file} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          {/* ====== Folders Tab ====== */}
          <TabsContent value="folders">
            <FolderView orgId={orgId} query={query} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
