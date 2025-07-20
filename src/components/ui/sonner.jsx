"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

const Toaster = (props) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme}
      toastOptions={{
        classNames: {
          toast:
            "bg-zinc-900 border border-green-500 text-green-200 shadow-lg",
          title: "text-green-200 font-semibold",
          description: "text-green-300",
          actionButton: "bg-green-800 text-white hover:bg-green-700",
          cancelButton: "text-gray-300 hover:text-white",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
