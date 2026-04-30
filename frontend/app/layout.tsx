import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "GhostOps — Stealth IG Automation",
  description:
    "Create, automate, and manage Instagram accounts at scale with GhostOps stealth infrastructure.",
  openGraph: {
    title: "GhostOps",
    description: "Stealth Instagram account automation platform.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Google Sans Flex — variable font (wdth + wght + ROND axes) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="preload"
          as="style"
          href="https://fonts.googleapis.com/css2?family=Google+Sans+Flex:opsz,wdth,wght,ROND@8..144,75..150,100..700,0..100&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Google+Sans+Flex:opsz,wdth,wght,ROND@8..144,75..150,100..700,0..100&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;700&display=swap"
        />
      </head>
      <body>
        {/* AuthProvider wraps all pages via client component */}
        <AuthWrapper>{children}</AuthWrapper>
      </body>
    </html>
  );
}

// AuthWrapper is a separate client component to avoid making layout.tsx a client file
import AuthWrapper from "./AuthWrapper";
