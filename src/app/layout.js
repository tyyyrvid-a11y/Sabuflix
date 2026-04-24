import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { ProfileProvider } from "@/lib/ProfileContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "SabuFlix | O Ápice do Streaming",
  description: "Um centro de streaming premium de classe mundial para filmes e séries.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      <body className={inter.className}>
        <ProfileProvider>
          <Header />
          {children}
        </ProfileProvider>
      </body>
    </html>
  );
}
