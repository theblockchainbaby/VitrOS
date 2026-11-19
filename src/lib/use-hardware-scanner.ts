"use client";

import { useEffect, useRef } from "react";

// USB and Bluetooth barcode scanners (Zebra, Honeywell, Datalogic, generic)
// pair as a keyboard: they "type" the code in a burst and usually finish with
// Enter. That burst is far faster than a person types, which is how a scan is
// told apart from typing without any driver or pairing step in the browser.

// Wired scanners send keys 1 to 20 ms apart and Bluetooth ones up to about
// 50 ms. Fast human typing is 80 ms or slower between keys.
export const SCAN_MAX_KEY_GAP_MS = 80;
export const SCAN_MIN_LENGTH = 3;

export interface KeyStroke {
  key: string;
  time: number;
}

export type ScanVerdict =
  | { kind: "scan"; code: string; durationMs: number }
  | { kind: "typed"; code: string }
  | { kind: "too_short"; code: string };

// Classifies the keystrokes that came before an Enter.
export function classifyKeystrokes(strokes: KeyStroke[]): ScanVerdict {
  const code = strokes.map((s) => s.key).join("").trim();
  if (code.length < SCAN_MIN_LENGTH) return { kind: "too_short", code };
  let slowest = 0;
  for (let i = 1; i < strokes.length; i++) slowest = Math.max(slowest, strokes[i].time - strokes[i - 1].time);
  if (slowest > SCAN_MAX_KEY_GAP_MS) return { kind: "typed", code };
  return { kind: "scan", code, durationMs: strokes[strokes.length - 1].time - strokes[0].time };
}

function isEditable(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
}

// Calls onScan when a hardware scanner fires while no text field has focus.
// When a field is focused the scanner types into it as usual, so forms with
// their own barcode box keep working unchanged.
export function useHardwareScanner(onScan: (code: string) => void, enabled = true) {
  const onScanRef = useRef(onScan);
  useEffect(() => { onScanRef.current = onScan; }, [onScan]);

  useEffect(() => {
    if (!enabled) return;
    let strokes: KeyStroke[] = [];
    const handler = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey || isEditable(event.target)) { strokes = []; return; }
      const now = performance.now();
      if (event.key === "Enter") {
        const verdict = classifyKeystrokes(strokes);
        strokes = [];
        if (verdict.kind === "scan") {
          event.preventDefault();
          onScanRef.current(verdict.code);
        }
        return;
      }
      if (event.key.length !== 1) return;
      if (strokes.length && now - strokes[strokes.length - 1].time > SCAN_MAX_KEY_GAP_MS) strokes = [];
      strokes.push({ key: event.key, time: now });
    };
    document.addEventListener("keydown", handler, true);
    return () => document.removeEventListener("keydown", handler, true);
  }, [enabled]);
}
