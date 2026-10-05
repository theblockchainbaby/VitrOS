"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/page-header";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DeviceSetup } from "@/components/device-setup";
import { PageLoading, PageError } from "@/components/page-state";
import { toast } from "sonner";
import { Plus, Key, Copy, Check, Webhook } from "lucide-react";

interface ApiKeyData {
  id: string;
  name: string;
  keyPrefix: string;
  permissions: string[];
  lastUsedAt: string | null;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
}

const AVAILABLE_PERMISSIONS = [
  { value: "vessels:read", label: "Read Vessels" },
  { value: "vessels:write", label: "Write Vessels" },
  { value: "orders:read", label: "Read Orders" },
  { value: "orders:write", label: "Write Orders" },
  { value: "clone_lines:read", label: "Read Clone Lines" },
  { value: "webhooks:read", label: "Read Webhooks" },
  { value: "webhooks:write", label: "Manage Webhooks" },
  { value: "*", label: "Full Access" },
];

export default function IntegrationsPage() {
  const [apiKeys, setApiKeys] = useState<ApiKeyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [createError, setCreateError] = useState("");
  const [form, setForm] = useState({
    name: "",
    permissions: ["vessels:read", "orders:read"],
    expiresInDays: "",
  });

  const loadKeys = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/api-keys");
      if (!response.ok) throw new Error("Could not load API keys. Check your access or try again.");
      setApiKeys(await response.json());
    } catch (err) { setError(err instanceof Error ? err.message : "Could not load API keys."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { loadKeys(); }, [loadKeys]);

  async function handleCreate() {
    if (creating) return;
    setCreating(true); setCreateError("");
    try {
      const res = await fetch("/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          permissions: form.permissions,
          expiresInDays: form.expiresInDays ? parseInt(form.expiresInDays) : null,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setNewKey(data.key);
        setCopied(false);
        await loadKeys();
      } else {
        const data = await res.json();
        throw new Error(data.error || "Could not create an API key.");
      }
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Could not create an API key.");
    } finally { setCreating(false); }
  }

  function togglePermission(perm: string) {
    setForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter((p) => p !== perm)
        : [...prev.permissions, perm],
    }));
  }

  async function copyKey() {
    if (!newKey) return;
    try { await navigator.clipboard.writeText(newKey); setCopied(true); }
    catch { toast.error("Could not copy. Select the key and copy it manually."); }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Integrations"
        description="Set up bench devices and connect your lab systems"
      />

      <DeviceSetup />

      {/* API Keys */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <h2 className="text-lg font-semibold">API Keys</h2>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) { setCreateError(""); setCopied(false); setNewKey(null); setForm({ name: "", permissions: ["vessels:read", "orders:read"], expiresInDays: "" }); }
        }}>
          <DialogTrigger asChild>
            <Button><Plus className="size-4 mr-2" /> Create API Key</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{newKey ? "API Key Created" : "Create API Key"}</DialogTitle>
            </DialogHeader>
            {newKey ? (
              <div className="space-y-4 pt-4">
                <div className="p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-2">
                    Copy this key now. It will not be shown again.
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs bg-white dark:bg-black p-2 rounded font-mono break-all">
                      {newKey}
                    </code>
                    <Button size="sm" variant="outline" onClick={copyKey} aria-label={copied ? "Key copied" : "Copy API key"}>
                      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                    </Button>
                  </div>
                </div>
                <Button className="w-full" onClick={() => { setDialogOpen(false); setNewKey(null); }}>
                  Done
                </Button>
              </div>
            ) : (
              <div className="space-y-4 pt-4">
                <div>
                  <Label htmlFor="api-key-name">Key Name</Label>
                  <Input
                    id="api-key-name" placeholder="e.g. ERP Integration"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Permissions</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {AVAILABLE_PERMISSIONS.map((p) => (
                      <button type="button" aria-pressed={form.permissions.includes(p.value)}
                        key={p.value}
                        className={`rounded-md border px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-ring ${form.permissions.includes(p.value) ? "bg-accent border-primary text-accent-foreground" : "hover:bg-muted"}`}
                        onClick={() => togglePermission(p.value)}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="api-key-expiry">Expires In (days, optional)</Label>
                  <Input
                    id="api-key-expiry" min="1" type="number"
                    placeholder="Leave empty for no expiration"
                    value={form.expiresInDays}
                    onChange={(e) => setForm({ ...form, expiresInDays: e.target.value })}
                    className="mt-1"
                  />
                </div>
                {createError && <p role="alert" className="text-sm text-destructive">{createError}</p>}
                <Button onClick={handleCreate} className="w-full" disabled={creating || !form.name.trim() || form.permissions.length === 0}>
                  {creating ? "Creating key…" : "Generate Key"}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <PageLoading label="Loading API keys…" />
      ) : error ? (<PageError message={error} retry={loadKeys} />) : apiKeys.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Key className="size-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium">No API Keys</h3>
            <p className="text-muted-foreground mt-1">Create an API key to connect external systems like Fox.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {apiKeys.map((key) => (
            <Card key={key.id}>
              <CardContent className="pt-4">
                <div className="flex flex-wrap gap-3 items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Key className="size-5 text-muted-foreground" />
                    <div>
                      <h3 className="font-semibold">{key.name}</h3>
                      <p className="text-xs text-muted-foreground font-mono">{key.keyPrefix}...</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={key.isActive ? "secondary" : "destructive"}>
                      {key.isActive ? "Active" : "Revoked"}
                    </Badge>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {(key.permissions as string[]).map((p) => (
                    <Badge key={p} variant="outline" className="text-xs">{p}</Badge>
                  ))}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Created {new Date(key.createdAt).toLocaleDateString()}
                  {key.lastUsedAt && ` | Last used ${new Date(key.lastUsedAt).toLocaleDateString()}`}
                  {key.expiresAt && ` | Expires ${new Date(key.expiresAt).toLocaleDateString()}`}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* API Documentation Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">REST API</CardTitle>
          <CardDescription>
            Use the VitrOS API to connect your ERP, LIMS, or other systems. All endpoints are under <code className="text-xs bg-muted px-1 rounded">/api/v1/</code>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Available Endpoints</h4>
              <div className="space-y-1 font-mono text-xs">
                <p><span className="text-green-500">GET</span> /api/v1/vessels</p>
                <p><span className="text-green-500">GET</span> /api/v1/vessels/:id</p>
                <p><span className="text-green-500">GET</span> /api/v1/orders</p>
                <p><span className="text-green-500">GET</span> /api/v1/clone-lines</p>
                <p><span className="text-green-500">GET</span> /api/v1/webhooks</p>
                <p><span className="text-blue-500">POST</span> /api/v1/webhooks</p>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Authentication</h4>
              <p className="text-muted-foreground mb-2">Include your API key in the Authorization header:</p>
              <code className="text-xs bg-muted px-2 py-1 rounded block break-all">
                Authorization: Bearer YOUR_API_KEY
              </code>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Webhook Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Webhook className="size-5" /> Webhooks
          </CardTitle>
          <CardDescription>
            Receive real-time notifications when events happen in VitrOS. Configure webhooks via the API.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm space-y-2">
            <p className="font-medium">Available Events</p>
            <div className="flex flex-wrap gap-2">
              {[
                "vessel.created", "vessel.multiplied", "vessel.stage_advanced",
                "vessel.health_updated", "vessel.disposed",
                "order.created", "order.fulfilled", "order.updated",
              ].map((event) => (
                <code key={event} className="text-xs bg-muted px-2 py-1 rounded">{event}</code>
              ))}
            </div>
            <p className="text-muted-foreground mt-3">
              Webhook payloads are signed with HMAC-SHA256. Verify the <code className="text-xs bg-muted px-1 rounded">X-VitrOS-Signature</code> header against your secret.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
