"use client";

import React, { useState } from "react";
import {
  useOrganization,
  useUser,
  useAuth,
  OrganizationSwitcher,
  UserButton,
} from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { FolderPlus, Loader2 } from "lucide-react";
import { UploadButton } from "@/_components/uploadButton";
import { FileCard } from "@/_components/fileCard";
import FolderView from "@/_components/folderView";
import LandingPage from "@/_components/landingPage";
import Navbar from "../Navbar";
import Image from "next/image";

const DocsPage = () => {
  const { organization, isLoaded: orgLoaded } = useOrganization();
  const { user, isLoaded: userLoaded } = useUser();
  const { isSignedIn, isLoaded: authLoaded } = useAuth();

  const [query, setQuery] = useState(""); // search text
  const [menuState, setMenuState] = useState({ section: "home", secondary: "All files" }); // left menu
  const [selectedFolderId, setSelectedFolderId] = useState(null); // current folder id

  const orgId = organization?.id ?? user?.id; // org id or personal workspace id
  const isClerkLoaded = orgLoaded && userLoaded && authLoaded; // clerk readiness

  // all files in org (with search)
  const allFiles = useQuery(
    api.files.getFiles,
    isClerkLoaded && isSignedIn && orgId ? { orgId, query } : "skip"
  );

  // files in a folder
  const folderFiles = useQuery(
    api.files.getFilesByFolder,
    selectedFolderId ? { folderId: selectedFolderId } : "skip"
  );

  // starred files list
  const starredFiles = useQuery(
    api.starred.getStarred,
    isClerkLoaded && isSignedIn && orgId ? { orgId } : "skip"
  );

  if (!isClerkLoaded)
    return (
      <div className="flex items-center justify-center h-screen text-white">
        Loading...
      </div>
    );
  if (!isSignedIn) return <LandingPage />;

  // loading flags
  const isLoading = allFiles === undefined;
  const isFolderLoading = folderFiles === undefined;
  const isStarredLoading = starredFiles === undefined;

  // data presence flags
  const hasFiles = !isLoading && allFiles?.length > 0;
  const hasFolderFiles = !isFolderLoading && folderFiles?.length > 0;
  const hasStarred = !isStarredLoading && starredFiles?.length > 0;

  const renderContent = () => {
    // HOME section
    if (menuState.section === "home") {
      // All files
      if (menuState.secondary === "All files") {
        if (!isLoading && !hasFiles) {
          return (
            <EmptyState
              message={
                query
                  ? "No matching files found."
                  : "Your workspace is empty. Upload your first file to begin."
              }
            />
          );
        }
        return <FileGrid files={allFiles} />;
      }

      // Starred
      if (menuState.secondary === "Starred") {
        if (isStarredLoading) return <Loader />; // show loader while fetching
        if (!hasStarred) {
          return (
            <EmptyState
              message="Star your important files and find them here quickly."
              icon="/favourite.svg"
              width="210"
              height="210"
              gray
              small
            />
          );
        }
        return <FileGrid files={starredFiles} />;
      }

      // Trash (placeholder)
      if (menuState.secondary === "Trash") {
        return (
          <EmptyState
            message="Your trash is empty. Keep it that way for peace of mind."
            icon="/trash.svg"
            gray
          />
        );
      }
    }

    // FOLDERS section
    if (menuState.section === "folders") {
      if (!selectedFolderId) {
        return (
          <EmptyState
            message="No folders created yet. Start by making one."
            icon="/empty.svg"
            gray
          />
        );
      }

      if (!isFolderLoading && (!folderFiles || folderFiles.length === 0)) {
        return (
          <EmptyState
            message="This folder is empty. Upload or move files here."
            icon="/empty.svg"
            gray
          />
        );
      }

      if (hasFolderFiles) {
        return <FolderView orgId={orgId} query={query} folderFiles={folderFiles} />;
      }
    }

    return null;
  };

  return (
    <div className="flex h-screen">
      <Navbar
        onMenuChange={(section, secondary) => setMenuState({ section, secondary })}
      />
      <div className="flex flex-col w-[100%] bg-black">
        <header className="h-14 flex items-center px-6 sticky top-0 z-10 bg-black mt-4">
          <div className="flex-1 flex justify-center">
            <input
              type="text"
              placeholder="Search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-1/2 bg-gray-900 border border-gray-700 rounded-md px-3 py-1 text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Clerk org + user controls */}
          <div className="flex items-center gap-4 ml-4">
            <OrganizationSwitcher
              appearance={{
                elements: {
                  rootBox: "bg-white text-black rounded-md shadow-lg",
                  organizationSwitcherTrigger: "bg-white text-black",
                },
              }}
            />
            <UserButton
              appearance={{
                baseTheme: "dark",
                elements: {},
              }}
            />
          </div>
        </header>

        <div className="flex gap-4 px-6 mt-6">
          <UploadButton />
          <div className="w-44 max-w-sm border-2 border-gray-700 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-900 hover:border-blue-500 transition cursor-pointer">
            <FolderPlus size={28} className="text-gray-400 mb-3" />
            <p className="text-gray-300 text-sm font-medium">Create folder</p>
          </div>
        </div>

        <main className="flex-1 p-6 text-white overflow-y-auto">
          {isLoading ? <Loader /> : renderContent()}
        </main>
      </div>
    </div>
  );
};

const FileGrid = ({ files }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-8">
    {files?.map((file) => (
      <div key={file._id} className="transform transition duration-200 hover:scale-[1.02]">
        <FileCard file={file} />
      </div>
    ))}
  </div>
);

const EmptyState = ({ message, icon = "/empty.svg", gray = false, width = 450, height = 450 }) => (
  <div className="flex flex-col items-center justify-center mt-10 gap-4">
    <Image src={icon} alt="Empty" width={width} height={height} />
    <p className={`text-lg text-center ${gray ? "text-gray-400" : "text-gray-500"}`}>{message}</p>
  </div>
);

const Loader = () => (
  <div className="flex flex-col gap-8 w-full items-center mt-24">
    <Loader2 className="h-32 w-32 animate-spin text-gray-500" />
    <div className="text-2xl">Loading...</div>
  </div>
);

export default DocsPage;
