import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import { Analytics } from "@/components/app/analytics";
import { ConvexClientProvider } from "@/components/app/convex-client-provider";
import { site } from "@/config/site";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.name, template: `%s · ${site.name}` },
  description: site.description,
  openGraph: { title: site.name, description: site.description, type: "website" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${archivo.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <ClerkProvider>
          <ConvexClientProvider>
            {children}
            <Analytics />
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
