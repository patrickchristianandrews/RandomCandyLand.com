import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fibo Studio — AI Image Creator",
  description: "Turn ideas and feelings into expressive AI artwork.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
