import Sidebar from "@/src/components/dashboard/sidebar";
import Navbar from "@/src/components/dashboard/header/navbar";
import React, { ReactNode } from "react";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/src/lib/prisma";

const layout = async ({ children }: { children: ReactNode }) => {
  const user = await currentUser();

  if (!user) {
    redirect("/");
  }

  try {
    await prisma.user.upsert({
      where: {
        clerkUserId: user.id,
      },
      update: {},
      create: {
        name: user.fullName || "User",
        clerkUserId: user.id,
        email: user.emailAddresses?.[0]?.emailAddress || `no-email-${user.id}`,
        imageUrl: user.imageUrl || "",
      },
    });
  } catch (err) {
    console.error("USER UPSERT FAILED BUT NOT BLOCKING", err);
  }

  return (
    <div className="min-h-screen w-full flex flex-col">
      <Navbar />

      <div className="flex flex-1 pt-16">
        <Sidebar />
        <main className="flex-1 bg-background overflow-y-auto pt-2">
          {children}
        </main>
      </div>
    </div>
  );
};

export default layout;
