"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, Keyboard, Zap, ZapOff } from "lucide-react";
import type { IScannerControls } from "@zxing/browser";

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  placeholder?: string;
}

// Formats we print on labels (Code128) plus common extras
const NATIVE_FORMATS = ["code_128", "code_39", "ean_13", "ean_8", "qr_code", "data_matrix"];

type BarcodeDetectorLike = {
  detect: (source: HTMLVideoElement) => Promise<Array<{ rawValue: string }>>;
};
type BarcodeDetectorCtor = {
  new (opts: { formats: string[] }): BarcodeDetectorLike;
  getSupportedFormats?: () => Promise<string[]>;
};

export function BarcodeScanner({ onScan, placeholder = "Scan or type barcode..." }: BarcodeScannerProps) {
  const [manualCode, setManualCode] = useState("");
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"camera" | "manual">("camera");
  const [torchAvailable, setTorchAvailable] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [zoomCaps, setZoomCaps] = useState<{ min: number; max: number; step: number } | null>(null);
  const [zoom, setZoom] = useState(1);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const trackRef = useRef<MediaStreamTrack | null>(null);
  const animFrameRef = useRef<number>(0);
  const zxingControlsRef = useRef<IScannerControls | null>(null);
  const detectedRef = useRef(false);

  const stopCamera = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = 0;
    }
    if (zxingControlsRef.current) {
      try {
        zxingControlsRef.current.stop();
      } catch {
        /* already stopped */
      }
      zxingControlsRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    trackRef.current = null;
    setTorchAvailable(false);
    setTorchOn(false);
    setZoomCaps(null);
    setScanning(false);
  }, []);

  const handleDetected = useCallback(
    (code: string) => {
      if (detectedRef.current || !code) return;
      detectedRef.current = true;
      try {
        navigator.vibrate?.(80);
      } catch {
        /* not supported */
      }
      stopCamera();
      onScan(code);
    },
    [onScan, stopCamera]
  );

  const startCamera = useCallback(async () => {
    if (streamRef.current) return; // already running
    setError(null);
    detectedRef.current = false;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      streamRef.current = stream;
      const track = stream.getVideoTracks()[0];
      trackRef.current = track;

      // Continuous autofocus where the camera supports it (small dense labels need it).
      // Unknown constraints are ignored by browsers that don't support them.
      try {
        await track.applyConstraints({
          advanced: [{ focusMode: "continuous" } as unknown as MediaTrackConstraintSet],
        });
      } catch {
        /* fixed-focus camera */
      }

      // Probe torch + zoom so we can offer them in the UI
      const caps = (track.getCapabilities?.() ?? {}) as {
        torch?: boolean;
        zoom?: { min?: number; max?: number; step?: number };
      };
      if (caps.torch) setTorchAvailable(true);
      if (caps.zoom && typeof caps.zoom.max === "number") {
        const min = caps.zoom.min ?? 1;
        setZoomCaps({ min, max: caps.zoom.max, step: caps.zoom.step ?? 0.1 });
        setZoom(min);
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setScanning(true);

      // Engine selection: native BarcodeDetector only when it actually decodes
      // our printed format (Code128). iOS/WebKit has no BarcodeDetector, and some
      // implementations only do QR — those all fall through to ZXing, which
      // decodes 1D barcodes from the live stream on every platform.
      const win = window as unknown as { BarcodeDetector?: BarcodeDetectorCtor };
      let useNative = false;
      if (win.BarcodeDetector) {
        try {
          const supported = (await win.BarcodeDetector.getSupportedFormats?.()) ?? [];
          useNative = supported.includes("code_128");
        } catch {
          useNative = false;
        }
      }

      if (useNative) {
        const detector = new win.BarcodeDetector!({ formats: NATIVE_FORMATS });
        const scan = async () => {
          if (!videoRef.current || !streamRef.current) return;
          try {
            const barcodes = await detector.detect(videoRef.current);
            if (barcodes.length > 0 && barcodes[0].rawValue) {
              handleDetected(barcodes[0].rawValue);
              return;
            }
          } catch {
            // frame not ready yet
          }
          animFrameRef.current = requestAnimationFrame(scan);
        };
        animFrameRef.current = requestAnimationFrame(scan);
      } else {
        const [{ BrowserMultiFormatReader }, { BarcodeFormat, DecodeHintType }] = await Promise.all([
          import("@zxing/browser"),
          import("@zxing/library"),
        ]);
        const hints = new Map();
        hints.set(DecodeHintType.POSSIBLE_FORMATS, [
          BarcodeFormat.CODE_128,
          BarcodeFormat.CODE_39,
          BarcodeFormat.EAN_13,
          BarcodeFormat.EAN_8,
          BarcodeFormat.QR_CODE,
          BarcodeFormat.DATA_MATRIX,
        ]);
        hints.set(DecodeHintType.TRY_HARDER, true);
        const reader = new BrowserMultiFormatReader(hints, { delayBetweenScanAttempts: 100 });
        if (!videoRef.current || !streamRef.current) return; // unmounted while loading
        zxingControlsRef.current = await reader.decodeFromStream(
          stream,
          videoRef.current,
          (result) => {
            if (result) handleDetected(result.getText());
          }
        );
      }
    } catch (err) {
      console.error("Camera error:", err);
      stopCamera();
      const name = err instanceof DOMException ? err.name : "";
      if (name === "NotAllowedError") {
        setError("Camera access denied. Allow camera permissions in your browser settings, then try again.");
      } else if (name === "NotFoundError" || name === "OverconstrainedError") {
        setError("No camera found on this device. Use manual entry below.");
      } else {
        setError("Could not start the camera. Use manual entry below.");
      }
    }
  }, [handleDetected, stopCamera]);

  // If camera permission was already granted (returning user), start instantly.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const status = await navigator.permissions?.query?.({ name: "camera" as PermissionName });
        if (!cancelled && status?.state === "granted") startCamera();
      } catch {
        /* Permissions API unavailable — wait for the tap */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [startCamera]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const toggleTorch = async () => {
    const track = trackRef.current;
    if (!track) return;
    const next = !torchOn;
    try {
      await track.applyConstraints({
        advanced: [{ torch: next } as unknown as MediaTrackConstraintSet],
      });
      setTorchOn(next);
    } catch {
      /* torch not available after all */
    }
  };

  const applyZoom = async (value: number) => {
    setZoom(value);
    try {
      await trackRef.current?.applyConstraints({
        advanced: [{ zoom: value } as unknown as MediaTrackConstraintSet],
      });
    } catch {
      /* zoom not applicable */
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      onScan(manualCode.trim());
      setManualCode("");
    }
  };

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div className="flex gap-2">
        <Button
          variant={mode === "camera" ? "default" : "outline"}
          onClick={() => { setMode("camera"); if (!scanning) startCamera(); }}
          className="flex-1"
        >
          <Camera className="mr-2 size-4" />
          Camera
        </Button>
        <Button
          variant={mode === "manual" ? "default" : "outline"}
          onClick={() => { setMode("manual"); stopCamera(); }}
          className="flex-1"
        >
          <Keyboard className="mr-2 size-4" />
          Manual Entry
        </Button>
      </div>

      {/* Camera view */}
      {mode === "camera" && (
        <div className="space-y-3">
          <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
            <video
              ref={videoRef}
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {scanning && (
              <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 h-24 rounded-lg border-2 border-primary pointer-events-none" />
            )}
            {scanning && torchAvailable && (
              <Button
                type="button"
                size="icon"
                variant="secondary"
                onClick={toggleTorch}
                className="absolute top-2 right-2"
                aria-label={torchOn ? "Turn light off" : "Turn light on"}
              >
                {torchOn ? <ZapOff className="size-4" /> : <Zap className="size-4" />}
              </Button>
            )}
            {!scanning && !error && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Button onClick={startCamera}>
                  <Camera className="mr-2 size-4" />
                  Start Camera
                </Button>
              </div>
            )}
          </div>
          {scanning && zoomCaps && (
            <input
              type="range"
              min={zoomCaps.min}
              max={zoomCaps.max}
              step={zoomCaps.step}
              value={zoom}
              onChange={(e) => applyZoom(Number(e.target.value))}
              className="w-full accent-primary"
              aria-label="Camera zoom"
            />
          )}
          {scanning && (
            <p className="text-sm text-muted-foreground text-center">
              Hold the barcode steady about 4-6 inches away. Use the light if it&apos;s dim.
            </p>
          )}
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg space-y-2">
              <p>{error}</p>
              <Button variant="outline" size="sm" onClick={startCamera}>
                Try Again
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Manual entry — always available (also catches USB/keyboard-wedge scanners) */}
      <form onSubmit={handleManualSubmit} className="flex gap-2">
        <Input
          value={manualCode}
          onChange={(e) => setManualCode(e.target.value)}
          placeholder={placeholder}
          className="flex-1 text-lg h-12"
          autoFocus={mode === "manual"}
        />
        <Button type="submit" size="lg" disabled={!manualCode.trim()}>
          Go
        </Button>
      </form>
    </div>
  );
}
