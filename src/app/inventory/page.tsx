"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PageError } from "@/components/page-state";
import { PageHeader } from "@/components/page-header";
import { INVENTORY_CATEGORIES } from "@/lib/constants";
import type { InventoryItem } from "@/lib/types";
import { toast } from "sonner";

const CATEGORY_LABELS: Record<string, string> = {
  chemical: "Chemical",
  consumable: "Consumable",
  container: "Container",
  equipment: "Equipment",
};

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showLowStock, setShowLowStock] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>("");
  const [unit, setUnit] = useState("");
  const [currentStock, setCurrentStock] = useState("");
  const [reorderLevel, setReorderLevel] = useState("");
  const [supplier, setSupplier] = useState("");
  const [sku, setSku] = useState("");
  const [costPerUnit, setCostPerUnit] = useState("");
  const [storageLocation, setStorageLocation] = useState("");

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (categoryFilter !== "all") params.set("category", categoryFilter);
    if (showLowStock) params.set("lowStock", "true");
    setLoadError(null);
    try {
    const res = await fetch(`/api/inventory?${params}`);
    if (!res.ok) throw new Error();
    const data = await res.json();
    setItems(data);

    } catch {
      setLoadError("Inventory could not be loaded. Retry to see this view.");
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, showLowStock]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const resetForm = () => {
    setName("");
    setCategory("");
    setUnit("");
    setCurrentStock("");
    setReorderLevel("");
    setSupplier("");
    setSku("");
    setCostPerUnit("");
    setStorageLocation("");
  };

  const handleCreate = async () => {
    if (!name || !category || !unit) {
      toast.error("Name, category, and unit are required");
      return;
    }
    setCreating(true);
    try {
      const body: Record<string, unknown> = {
        name,
        category,
        unit,
        currentStock: currentStock ? parseFloat(currentStock) : 0,
      };
      if (reorderLevel) body.reorderLevel = parseFloat(reorderLevel);
      if (supplier) body.supplier = supplier;
      if (sku) body.sku = sku;
      if (costPerUnit) body.costPerUnit = parseFloat(costPerUnit);
      if (storageLocation) body.storageLocation = storageLocation;

      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success("Item added");
        setDialogOpen(false);
        resetForm();
        fetchItems();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed");
      }
    } catch {
      toast.error("The save could not be confirmed. Your entries have been kept.");
    } finally {
      setCreating(false);
    }
  };

  const hasFilters = categoryFilter !== "all" || showLowStock;
  const resetFilters = () => { setCategoryFilter("all"); setShowLowStock(false); };

  const lowStockCount = items.filter((i) =>
    i.reorderLevel != null && i.currentStock <= i.reorderLevel
  ).length;

  return (
    <div className="min-w-0 space-y-6">
      <PageHeader
        title="Inventory"
        description="Monitor stock levels, record use and plan replenishment"
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>Add Item</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Inventory Item</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 [&>*]:min-w-0 [&>*]:break-words">
                  <div>
                    <Label htmlFor="inventory-field-1">Name</Label>
                    <Input id="inventory-field-1" value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="inventory-field-2">Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger id="inventory-field-2" className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {INVENTORY_CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c}>{CATEGORY_LABELS[c] || c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 [&>*]:min-w-0 [&>*]:break-words">
                  <div>
                    <Label htmlFor="inventory-field-3">Unit</Label>
                    <Input id="inventory-field-3" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="mL, g, ea" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="inventory-field-4">Current Stock</Label>
                    <Input id="inventory-field-4" type="number" value={currentStock} onChange={(e) => setCurrentStock(e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="inventory-field-5">Reorder Level</Label>
                    <Input id="inventory-field-5" type="number" value={reorderLevel} onChange={(e) => setReorderLevel(e.target.value)} className="mt-1" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 [&>*]:min-w-0 [&>*]:break-words">
                  <div>
                    <Label htmlFor="inventory-field-6">Supplier</Label>
                    <Input id="inventory-field-6" value={supplier} onChange={(e) => setSupplier(e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="inventory-field-7">SKU</Label>
                    <Input id="inventory-field-7" value={sku} onChange={(e) => setSku(e.target.value)} className="mt-1" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 [&>*]:min-w-0 [&>*]:break-words">
                  <div>
                    <Label htmlFor="inventory-field-8">Cost per Unit ($)</Label>
                    <Input id="inventory-field-8" type="number" step="0.01" value={costPerUnit} onChange={(e) => setCostPerUnit(e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="inventory-field-9">Storage Location</Label>
                    <Input id="inventory-field-9" value={storageLocation} onChange={(e) => setStorageLocation(e.target.value)} className="mt-1" />
                  </div>
                </div>
                <Button onClick={handleCreate} disabled={creating} className="w-full">
                  {creating ? "Adding..." : "Add Item"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Low stock alert */}
      {!loading && !loadError && lowStockCount > 0 && !showLowStock && (
        <Card className="border-amber-300 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
          <CardContent className="pt-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-amber-900 dark:text-amber-200">{lowStockCount} item{lowStockCount > 1 ? "s" : ""} below reorder level</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowLowStock(true)}>
              Show Low Stock
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-3">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48" aria-label="Inventory category"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {INVENTORY_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{CATEGORY_LABELS[c] || c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant={showLowStock ? "default" : "outline"}
              size="sm"
              aria-pressed={showLowStock}
              onClick={() => setShowLowStock(!showLowStock)}
            >
              Low Stock Only
            </Button>
            {hasFilters && <Button variant="ghost" size="sm" onClick={resetFilters}>Reset filters</Button>}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">{!loading && !loadError ? `${items.length} items in this view` : "Loading inventory…"}</p>
        </CardContent>
      </Card>

      {loadError ? <PageError message={loadError} retry={fetchItems} /> : loading ? (
        <p className="text-center text-muted-foreground py-8">Loading...</p>
      ) : items.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">{hasFilters ? "No items match these filters. Reset the filters to see all inventory." : "No inventory items yet. Add an item to track stock and usage."}</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Reorder At</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Location</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const isLow = item.reorderLevel != null && item.currentStock <= item.reorderLevel;
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium"><Link href={`/inventory/${item.id}`} className="text-primary hover:underline underline-offset-4">{item.name}</Link>{isLow && <span className="block text-xs text-amber-700 dark:text-amber-300">Low stock</span>}</TableCell>
                    <TableCell><Badge variant="outline">{CATEGORY_LABELS[item.category] || item.category}</Badge></TableCell>
                    <TableCell className={`text-right font-mono ${isLow ? "text-amber-700 dark:text-amber-300 font-semibold" : ""}`}>
                      {item.currentStock}
                    </TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell className="font-mono text-muted-foreground">{item.reorderLevel ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{item.supplier ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{item.storageLocation ?? "—"}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
