import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Lifelog Dashboard",
    description: "Your life, indexed.",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="h-full bg-gray-900">
        <body className={`${inter.className} h-full text-gray-200`}>
        {children}
        </body>
        </html>
    );
}