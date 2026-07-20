import { Geist, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const noto = Noto_Sans_Devanagari({
  variable: "--font-noto",
  subsets: ["devanagari", "latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "Bihar Transport Dept. — e-Challan Monitoring Portal",
  description: "Enforcement officer console for monitoring vehicle challans across Bihar.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${noto.variable} h-full antialiased`}>
      <body className="min-h-full">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
