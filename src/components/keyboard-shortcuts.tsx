"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SCAN_MAX_KEY_GAP_MS } from "@/lib/use-hardware-scanner";

const SHORTCUTS = [
  { keys: ["s"], label: "Open Scanner", path: "/scan" },
  { keys: ["v"], label: "Vessels List", path: "/vessels" },
  { keys: ["b"], label: "Batch Operations", path: "/batch" },
  { keys: ["c"], label: "Cultivars", path: "/cultivars" },
  { keys: ["d"], label: "Dashboard", path: "/" },
  { keys: ["m"], label: "Media Recipes", path: "/media" },
  { keys: ["l"], label: "Locations", path: "/locations" },
  { keys: ["i"], label: "Inventory", path: "/inventory" },
  { keys: ["r"], label: "Reports", path: "/reports" },
  { keys: ["a"], label: "Activity Log", path: "/activity" },
  { keys: ["?"], label: "Show Shortcuts", path: null },
];

export function KeyboardShortcuts() {
  const router = useRouter();
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    // A hardware barcode scanner types its code as a burst of keys. Without a
    // focused field, each letter in "RS-00012" used to fire a shortcut and
    // bounce the user between pages. A shortcut now waits a moment and only
    // runs if no other key follows, so a burst is left for the scanner listener.
    let pending: ReturnType<typeof setTimeout> | null = null;
    let lastKeyAt = 0;
    const handler = (e: KeyboardEvent) => {
      const now = performance.now();
      const inBurst = now - lastKeyAt < SCAN_MAX_KEY_GAP_MS;
      lastKeyAt = now;
      if (pending) { clearTimeout(pending); pending = null; }
      if (inBurst) return;

      // Don't trigger if typing in an input/textarea/select
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      ) {
        return;
      }

      // Don't trigger with modifier keys (except shift for ?)
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const key = e.key.toLowerCase();

      if (key === "?" || (e.shiftKey && key === "/")) {
        e.preventDefault();
        setHelpOpen((prev) => !prev);
        return;
      }

      if (e.shiftKey) return;

      const shortcut = SHORTCUTS.find((s) => s.keys.includes(key) && s.path);
      if (shortcut && shortcut.path) {
        e.preventDefault();
        const path = shortcut.path;
        pending = setTimeout(() => { pending = null; router.push(path); }, SCAN_MAX_KEY_GAP_MS + 30);
      }
    };

    window.addEventListener("keydown", handler);
    return () => { window.removeEventListener("keydown", handler); if (pending) clearTimeout(pending); };
  }, [router]);

  return (
    <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {SHORTCUTS.map((shortcut) => (
            <div key={shortcut.label} className="flex items-center justify-between py-1">
              <span className="text-sm">{shortcut.label}</span>
              <div className="flex gap-1">
                {shortcut.keys.map((key) => (
                  <kbd
                    key={key}
                    className="px-2 py-0.5 text-xs font-mono bg-muted border rounded"
                  >
                    {key}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Shortcuts are disabled when typing in input fields.
        </p>
      </DialogContent>
    </Dialog>
  );
}
