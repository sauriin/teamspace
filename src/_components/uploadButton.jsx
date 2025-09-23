"use client";

import { useOrganization, useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";

// Schema 
const formSchema = z.object({
  title: z.string().min(4, "Title must be at least 4 characters").max(50),
  file: z
    .custom((val) => val instanceof FileList, "Required")
    .refine((files) => files.length > 0, "Required"),
});

export function UploadButton() {
  const { organization, isLoaded: orgLoaded } = useOrganization();
  const { user, isLoaded: userLoaded } = useUser();
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      file: null,
    },
  });

  const fileRef = form.register("file");

  const orgId = organization?.id ?? user?.id;
  const isClerkLoaded = orgLoaded && userLoaded;

  const createFile = useMutation(api.files.createFile);

  async function onSubmit(values) {
    if (!orgId) return;

    const postUrl = await generateUploadUrl();
    const fileType = values.file[0].type;

    const result = await fetch(postUrl, {
      method: "POST",
      headers: { "Content-Type": fileType },
      body: values.file[0],
    });

    const { storageId } = await result.json();

    const types = {
      "image/png": "image",
      "image/jpeg": "image",
      "image/jpg": "image",
      "image/webp": "image",
      "application/pdf": "pdf",
      "text/csv": "csv",
      "application/msword": "doc",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
      "application/vnd.ms-excel": "xls",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
      "application/vnd.ms-powerpoint": "ppt",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
      "text/plain": "txt",
    };

    try {
      await createFile({
        name: values.title,
        fileId: storageId,
        orgId,
        type: types[fileType],
      });

      form.reset();
      setIsFileDialogOpen(false);

      toast.success("Uploaded successfully!", {
        description: "Now anyone can view your File.",
      });
    } catch (err) {
      toast.error("Something went wrong", {
        description: "Your file could not be uploaded, Try again later.",
      });
    }
  }

  if (!isClerkLoaded) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <Dialog
      open={isFileDialogOpen}
      onOpenChange={(isOpen) => {
        setIsFileDialogOpen(isOpen);
        form.reset();
      }}
    >
      {/* 👇 Custom trigger = Your Big Upload Card */}
      <DialogTrigger asChild>
        <div
          role="button"
          tabIndex={0}
          className="w-44 max-w-sm border-2 border-gray-700 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-900 hover:border-blue-500 transition cursor-pointer"
        >
          <Upload size={28} className="text-gray-400 mb-3" />
          <p className="text-gray-300 text-sm font-medium">Upload files</p>
        </div>
      </DialogTrigger>

      <DialogContent className="bg-white text-black border-gray-300">
        <DialogHeader>
          <DialogTitle className="mb-8 text-xl">Upload Your File</DialogTitle>
          <DialogDescription>
            This file will be accessible by anyone in your organization.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="file"
              render={() => (
                <FormItem>
                  <FormLabel>File</FormLabel>
                  <FormControl>
                    <Input type="file" {...fileRef} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="flex gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              {form.formState.isSubmitting && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Submit
            </button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
