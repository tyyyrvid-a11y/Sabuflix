import { Inter } from "next/font/google";
import "../globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Minha Lista | SabuFlix",
  description: "Sua lista de filmes e séries para assistir.",
};

export default function PlaylistLayout({ children }) {
  return (
    <html lang="pt-br">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}