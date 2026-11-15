import type { Metadata } from "next";
import "./globals.css";
import config from "@/library.config.json";

// metadataBase turns the relative image and page addresses into absolute ones (link previews need them).
export const metadata: Metadata = {
  metadataBase: new URL(config.url),
  title: config.displayName,
  description: config.description,
  openGraph: {
    type: "website",
    url: "/",
    siteName: config.displayName,
    title: config.displayName,
    description: config.description,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: `${config.displayName} components` }],
  },
  twitter: {
    card: "summary_large_image",
    title: config.displayName,
    description: config.description,
    images: ["/og.png"],
  },
};

// ?font=fallback forces the free stand-in typeface: sets data-plush-font on <html> before the first paint.
const fontSwitch = `if(new URLSearchParams(location.search).get("font")==="fallback")document.documentElement.dataset.plushFont="fallback"`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: fontSwitch }} />
      </head>
      <body className="plush-font bg-(--plush-bg) text-(--plush-ink)">{children}</body>
    </html>
  );
}
