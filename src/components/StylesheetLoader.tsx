import { useEffect } from "react";

interface StylesheetLoaderProps {
  hrefs: string[];
}

// Global cache to keep track of loaded stylesheets and their active reference counts
const stylesheetRefs: Record<string, { link: HTMLLinkElement; count: number }> = {};

export function StylesheetLoader({ hrefs }: StylesheetLoaderProps) {
  useEffect(() => {
    // Increment reference counts for requested stylesheets
    hrefs.forEach((href) => {
      if (!stylesheetRefs[href]) {
        // Find existing or create new link element
        let link = document.querySelector(`link[rel="stylesheet"][href="${href}"]`) as HTMLLinkElement;
        if (!link) {
          link = document.createElement("link");
          link.rel = "stylesheet";
          link.href = href;
          document.head.appendChild(link);
        }
        stylesheetRefs[href] = { link, count: 1 };
      } else {
        stylesheetRefs[href].count++;
      }
    });

    // Cleanup function
    return () => {
      hrefs.forEach((href) => {
        const ref = stylesheetRefs[href];
        if (ref) {
          ref.count--;
          
          // Defer removal to allow next route's StylesheetLoader to increment counts
          // This avoids unloading and instantly reloading stylesheets, preventing layout flashes.
          setTimeout(() => {
            if (ref.count <= 0) {
              const link = ref.link;
              if (link && link.parentNode) {
                link.parentNode.removeChild(link);
              }
              delete stylesheetRefs[href];
            }
          }, 50); // Small delay to let new components mount
        }
      });
    };
  }, [hrefs]); // Note: stable arrays should be passed as dependencies

  return null;
}
