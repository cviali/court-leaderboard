"use client";

import * as React from "react";
import { LayoutDashboard, Users, Trophy, Calendar } from "lucide-react";
import Image from "next/image";

import { NavMain } from "@/components/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: LayoutDashboard,
    },
    {
      title: "Players",
      url: "/admin/players",
      icon: Users,
    },
    {
      title: "Matches",
      url: "/admin/matches",
      icon: Trophy,
    },
    {
      title: "Events",
      url: "/admin/events",
      icon: Calendar,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex w-full items-center justify-center py-2">
          <Image
            src="/logo.png"
            alt="Logo"
            width={56}
            height={56}
            className="h-14 w-auto shrink-0"
            priority
          />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
    </Sidebar>
  );
}
