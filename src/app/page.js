"use client";

import { Button } from "@/components/ui/button";
import { SignInButton } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function Home() {
  const createFile = useMutation(api.files.createFile);
  const getFiles = useQuery(api.files.getFiles);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <Button
          onClick={() => {
            createFile({ name: "Hello There!!" });
          }}
        >
          Click!!
        </Button>

        {getFiles?.map((file) => {
          return <div key={file._id}>{file.name}</div>;
        })}
      </main>
    </div>
  );
}
