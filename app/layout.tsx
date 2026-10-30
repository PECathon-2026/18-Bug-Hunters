import type { Metadata } from "next";
import { Cormorant_Garamond, Noto_Sans_JP, JetBrains_Mono } from "next/font/google";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteSidebar } from "@/components/layout/SiteSidebar";
import { AuthProvider } from "@/lib/auth/auth-context";
import { ThemeProvider } from "@/lib/theme/theme-context";
import { AuthModal } from "@/components/auth/AuthModal";
import { SamuraiLoginPage } from "@/components/auth/SamuraiLoginPage";
import { PetalBreeze } from "@/components/ui/PetalBreeze";
import { AstronomicalSkyBackdrop } from "@/components/ui/AstronomicalSkyBackdrop";
import { EarthIntroSplash } from "@/components/ui/EarthIntroSplash";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";
import "./globals.css";

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const body = Noto_Sans_JP({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} — ${APP_TAGLINE}`,
    template: `%s · ${APP_NAME}`,
  },
  description:
    "Japanese-inspired celestial guide for stargazing conditions, astronomy events, and astronomical image restoration.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable} min-h-full antialiased`}
    >
          <body className="starfield min-h-screen font-sans bg-[var(--void)] text-[var(--moonlight)] antialiased">
            <ThemeProvider>
              <AuthProvider>
                {/* 1. Earth Orbit Popup Animation on App Open */}
                <EarthIntroSplash />

                {/* 2. Login Page with Samurai Standing in Moonlight */}
                <SamuraiLoginPage />

                {/* 3. Lively Astronomical Canvas Background on Homepage */}
                <AstronomicalSkyBackdrop />

                {/* 4. Drifting Japanese Petal Breeze */}
                <PetalBreeze />

                {/* 5. Left Navigation Sidebar Dock with Shiny Hover Effects */}
                <SiteSidebar />

                {/* 6. Main App Content with Desktop Left Sidebar Offset */}
                <div className="lg:pl-64 xl:pl-72 flex min-h-screen flex-col transition-all duration-300">
                  <SiteHeader />
                  <main className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
                    {children}
                  </main>
                  <SiteFooter />
                </div>

              {/* 7. Auth Modal */}
              <AuthModal />
            </AuthProvider>
          </ThemeProvider>
      </body>
    </html>
  );
}
