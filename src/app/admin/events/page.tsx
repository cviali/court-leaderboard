import { Metadata } from "next";
import ClientPage from "./client-page";

export const metadata: Metadata = {
  title: "Events",
};

export default function Page() {
  return <ClientPage />;
}
