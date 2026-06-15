import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import Navbar from "@/components/Navbar";
import CountdownTimer from "@/components/CountdownTimer";
import SupportButton from "@/components/SupportButton";
import AIChatAgent from "@/components/AIChatAgent";

export const metadata = {
  title: "MarathonTrack — Беги. Расти. Побеждай.",
  description: "Платформа для марафонцев",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
          <CountdownTimer />
          <SupportButton />
          <AIChatAgent />
        </AuthProvider>
      </body>
    </html>
  );
}
