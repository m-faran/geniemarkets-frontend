import type { Metadata } from "next";
import { AdminContent } from "@/components/admin/admin-content";

export const metadata: Metadata = {
  title: "Admin Portal — Genie Markets",
  description: "Protocol administration and management console.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPage() {
  return <AdminContent />;
}
