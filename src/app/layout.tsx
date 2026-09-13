import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "AIWISE | Course Platform",
  description: "Learn artificial intelligence with ethics, safety, and rigor.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="theme-maximalist" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AuthProvider>
          <Navbar />
          <main id="main-content" style={{ flex: 1 }} aria-label="Main Content">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
