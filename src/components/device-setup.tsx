"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DeviceSetup() {
  const [barcode, setBarcode] = useState("");
  const [received, setReceived] = useState("");
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader><CardTitle className="text-base">Barcode scanner</CardTitle><p className="text-sm text-muted-foreground">Check input before starting at the bench.</p></CardHeader>
        <CardContent className="space-y-4 text-sm">
          <ol className="list-decimal pl-5 space-y-2 text-muted-foreground"><li>Pair your USB or Bluetooth scanner with this device in keyboard mode.</li><li>Configure an Enter suffix, focus the field below, and scan a label.</li><li>Open Scan to verify the barcode matches the expected vessel.</li></ol>
          <form className="flex gap-2" onSubmit={(event) => { event.preventDefault(); if (barcode.trim()) { setReceived(barcode.trim()); setBarcode(""); } }}>
            <Input aria-label="Scanner test barcode" autoComplete="off" placeholder="Focus here, then scan" value={barcode} onChange={(event) => setBarcode(event.target.value)} />
            <Button type="submit" variant="outline" disabled={!barcode.trim()}>Check input</Button>
          </form>
          <p role="status" className="text-sm">{received ? <>Input received: <span className="font-mono break-all">{received}</span>. This checks input only; it has not looked up or saved a vessel.</> : "No input checked in this session. Browser keyboard input cannot verify a scanner connection."}</p>
          <Button variant="outline" asChild><Link href="/scan">Open Scan</Link></Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Label printer</CardTitle><p className="text-sm text-muted-foreground">Verify the physical result on your bench.</p></CardHeader>
        <CardContent className="space-y-4 text-sm">
          <ol className="list-decimal pl-5 space-y-2 text-muted-foreground"><li>Install the printer and select the correct paper dimensions in its settings.</li><li>Open Labels, choose a vessel and preview the label. Print one test at actual size.</li><li>Scan the printed barcode and confirm it opens the correct vessel before printing a batch.</li></ol>
          <p>Printer readiness is not detected here. A print dialog or downloaded file does not confirm a successful print.</p>
          <Button variant="outline" asChild><Link href="/labels">Open Labels</Link></Button>
        </CardContent>
      </Card>
    </div>
  );
}
