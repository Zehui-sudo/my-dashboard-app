// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Project Dashboard",
  description: "My awesome project dashboard",
};

// 这是一个简单的顶部导航组件
function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <h1 className="text-xl font-bold">Dashboard</h1>
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Header />
        <main className="container mx-auto p-4">{children}</main>
      </body>
    </html>
  );
}