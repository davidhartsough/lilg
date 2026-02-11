import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "lil' g",
  description:
    "Super simple, minimal Google app info from Gmail and Google Calendar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" prefix="og: https://ogp.me/ns#">
      <body>{children}</body>
    </html>
  );
}
