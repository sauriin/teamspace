"use client";

import React, { useState, useEffect } from "react";
import {
  useOrganization,
  useUser,
  useAuth,
  OrganizationSwitcher,
  UserButton,
} from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Loader2, FolderPlus, Search, Grid2X2Plus, List } from "lucide-react";
import { UploadButton } from "@/_components/uploadButton";
import { FileCard } from "@/_components/fileCard";
import Navbar from "../Navbar";
import Image from "next/image";
import { Button } from "@/components/ui/button";

// Debounce hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

const DocsPage = () => {
  const { organization, isLoaded: orgLoaded } = useOrganization();
  const { user, isLoaded: userLoaded } = useUser();
  const { isSignedIn, isLoaded: authLoaded } = useAuth();

  const [search, setSearch] = useState("");
  const [activeView, setActiveView] = useState("all"); // "all" | "starred" | "trash"
  const [layout, setLayout] = useState("grid"); // "grid" | "list"

  const orgId = organization?.id ?? user?.id;
  const isClerkLoaded = orgLoaded && userLoaded && authLoaded;

  const debouncedSearch = useDebounce(search, 400);

  // Always call hooks in the same order
  const allFiles = useQuery(
    api.files.getFiles,
    isClerkLoaded && isSignedIn && orgId
      ? { orgId, query: activeView === "all" ? debouncedSearch : "" }
      : "skip"
  );

  const starredFiles = useQuery(
    api.starred.getStarred,
    isClerkLoaded && isSignedIn && orgId
      ? { orgId, query: debouncedSearch }
      : "skip"
  );


  const trashedFiles = useQuery(
    api.trashBin.getTrashedFiles,
    isClerkLoaded && isSignedIn && orgId
      ? { orgId, query: debouncedSearch }
      : "skip"
  );

  // Reset search when switching views
  useEffect(() => setSearch(""), [activeView]);

  if (!isClerkLoaded) {
    return (
      <div className="flex items-center justify-center h-screen text-white">
        Loading...
      </div>
    );
  }

  if (!isSignedIn) return <div>Please sign in</div>;

  // Select files based on active view
  let filesToRender = [];
  if (activeView === "all") filesToRender = allFiles || [];
  else if (activeView === "starred") filesToRender = starredFiles || [];
  else if (activeView === "trash") filesToRender = trashedFiles || [];

  const isLoading =
    (activeView === "all" && !allFiles) ||
    (activeView === "starred" && !starredFiles) ||
    (activeView === "trash" && !trashedFiles);

  const renderContent = () => {
    if (isLoading) return <Loader />;

    if (!filesToRender || filesToRender.length === 0) {
      let emptyProps = { message: "", icon: "" };

      if (debouncedSearch) {
        // 🔍 Show "not found" for any section if searching
        emptyProps = {
          message: "No matching files found.",
          icon: "/notFoundFile.svg",
        };
      } else if (activeView === "all") {
        emptyProps = {
          message: "Your workspace is empty. Upload your first file to begin.",
          icon: "/empty.svg",
        };
      } else if (activeView === "starred") {
        emptyProps = {
          message: "Star your important files and find them here quickly.",
          icon: "/favourite.svg",
        };
      } else if (activeView === "trash") {
        emptyProps = {
          message: "Your trash is empty. Keep it that way for peace of mind.",
          icon: "/trash.svg",
        };
      }

      return <EmptyState {...emptyProps} />;
    }

    if (layout === "grid") {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-8">
          {filesToRender.map((file) => (
            <div
              key={file._id}
              className="transform transition duration-200 hover:scale-[1.02]"
            >
              <FileCard file={file} variant="grid" />
            </div>
          ))}
        </div>
      );
    }

    if (layout === "list") {
      return (
        <div className="flex flex-col divide-y divide-gray-800">
          {filesToRender.map((file) => (
            <FileCard key={file._id} file={file} variant="list" />
          ))}
        </div>
      );
    }
  };

  return (
    <div className="flex h-screen">
      {/* Navbar */}
      <Navbar
        onMenuChange={(section, secondary) => {
          if (secondary === "All files") setActiveView("all");
          else if (secondary === "Starred") setActiveView("starred");
          else if (secondary === "Trash") setActiveView("trash");
        }}
      />

      <div className="flex flex-col w-full bg-black text-white">
        {/* Header */}
        <header className="h-14 flex items-center px-6 sticky top-0 z-10 bg-black mt-4">
          <div className="flex-1 flex justify-center">
            <div className="relative w-1/2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search your files"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-md pl-10 pr-3 py-2 text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-4 ml-4">
            {/* Toggle Layout */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLayout(layout === "grid" ? "list" : "grid")}
              title={layout === "grid" ? "Switch to List view" : "Switch to Grid view"}
            >
              {layout === "grid" ? (
                <List className="w-5 h-5" />
              ) : (
                <Grid2X2Plus className="w-5 h-5" />
              )}
            </Button>

            <OrganizationSwitcher
              appearance={{
                elements: {
                  rootBox: "bg-white text-black rounded-md shadow-lg",
                  organizationSwitcherTrigger: "bg-white text-black",
                },
              }}
            />
            <UserButton appearance={{ baseTheme: "dark" }} />
          </div>
        </header>

        {/* Upload + Create Folder - always visible even in Trash */}
        <div className="flex gap-4 px-6 mt-6">
          <UploadButton />
          <div className="w-44 max-w-sm border-2 border-gray-700 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-900 hover:border-blue-500 transition cursor-pointer">
            <FolderPlus size={28} className="text-gray-400 mb-3" />
            <p className="text-gray-300 text-sm font-medium">Create Folder</p>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 p-6 text-white overflow-y-auto">{renderContent()}</main>
      </div>
    </div>
  );
};

const EmptyState = ({ message, icon = "/empty.svg" }) => {
  return (
    <div className="flex flex-col items-center justify-center mt-10 gap-4">
      {/* Different Image tags for different icons */}
      {icon === "/empty.svg" && (
        <Image src="/empty.svg" alt="Empty workspace" width={500} height={500} className="mt-17" />
      )}

      {icon === "/favourite.svg" && (
        <Image src="/favourite.svg" alt="Favourite files" width={250} height={250} />
      )}

      {icon === "/trash.svg" && (
        <Image src="/trash.svg" alt="Trash bin" width={400} height={400} className="mt-17" />
      )}

      {icon === "/notFoundFile.svg" && (
        <Image src="/notFoundFile.svg" alt="not-found" width={400} height={400} className="mt-17" />
      )}

      <p className="text-lg text-center text-gray-400">{message}</p>
    </div>
  );
};

const Loader = () => (
  <div className="flex flex-col gap-8 w-full items-center mt-24">
    <Loader2 className="h-32 w-32 animate-spin text-gray-500" />
    <div className="text-2xl">Loading...</div>
  </div>
);

export default DocsPage;