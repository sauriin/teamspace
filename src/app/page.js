"use client";

import { Button } from "@/components/ui/button";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
  useOrganization,
  useUser,
} from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import Header from "./Header";

export default function Home() {
  const { organization, isLoaded: orgLoaded } = useOrganization();
  const { user, isLoaded: userLoaded } = useUser();

  // Wait for Clerk context to load
  const isClerkLoaded = orgLoaded && userLoaded;

  // Safely derive orgId
  const orgId = organization?.id ?? user?.id;

  const getFiles = useQuery(api.files.getFiles, orgId ? { orgId } : "skip");
  const createFile = useMutation(api.files.createFile);

  if (!isClerkLoaded) {
    return <div className="p-6 text-white">Loading...</div>;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 pt-4">
      <div className="max-w-7xl mx-auto">
        <Header />
        <SignInButton>
          <Button>Sign In</Button>
        </SignInButton>
        <SignOutButton>
          <Button>Sign Out</Button>
        </SignOutButton>
        {/* Create File Button */}
        <Button
          onClick={() => {
            if (!orgId) return;
            createFile({ name: "Hello There!!", orgId });
          }}
        >
          Create File
        </Button>

        {/* Files List */}
        <div className="mt-4 space-y-2 ">
          {getFiles?.map((file) => (
            <div key={file._id}>{file.name}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
