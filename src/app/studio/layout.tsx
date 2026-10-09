import "../globals.css";

/**
 * Root layout for the Sanity Studio.
 *
 * The site's root layout lives under `app/[lang]`, and the studio sits outside
 * it on purpose: it is a single-language editor tool with its own login, and
 * neither the site chrome nor a locale prefix belongs on it.
 */
export default function StudioLayout({ children }: LayoutProps<"/studio">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
