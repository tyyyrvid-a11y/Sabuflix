import { Inter, Lora } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { ProfileProvider } from "@/lib/ProfileContext";

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
  display: 'swap',
});

const lora = Lora({ 
  subsets: ["latin"],
  variable: '--font-title',
  display: 'swap',
});

export const metadata = {
  title: "SabuFlix | O Ápice do Streaming",
  description: "Um centro de streaming premium de classe mundial para filmes e séries. Descubra um novo nível de entretenimento imersivo.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SabuFlix",
  },
  openGraph: {
    title: "SabuFlix",
    description: "Um centro de streaming premium de classe mundial.",
    type: "website",
    locale: "pt_BR",
  },
};

export const viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br" className={`${inter.variable} ${lora.variable}`}>
      <body className={inter.className}>
        <ProfileProvider>
          <Header />
          {children}
        </ProfileProvider>
      </body>
    </html>
  );
}
