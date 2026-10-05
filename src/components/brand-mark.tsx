"use client";

import { useId } from "react";

export function BrandMark({ className }: { className?: string }) {
  const clipId = useId();

  return (
    <svg viewBox="-24 243 889 875" width={36} height={36} className={className} aria-hidden="true" focusable="false">
      <defs>
        <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
          {/* Isolate the complete mark from the original wordmark without cutting
              its arrowhead or bottom point. The inset excludes only the letters. */}
          <polygon points="0,0 870,0 870,700 690,700 690,1094 0,1094" />
        </clipPath>
      </defs>
      <image href="/logo.png" width={1887} height={1094} clipPath={`url(#${clipId})`} />
    </svg>
  );
}
