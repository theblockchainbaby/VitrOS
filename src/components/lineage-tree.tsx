"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { HEALTH_STATUS_LABELS } from "@/lib/constants";
import { STAGE_LABELS } from "@/lib/constants";
import type { LineageNode, LineageTree as LineageTreeType } from "@/lib/types";
import { ChevronRight, ChevronDown, TreePine, AlertTriangle } from "lucide-react";

const HEALTH_COLORS: Record<string, { border: string; bg: string; dot: string }> = {
  healthy:     { border: "border-l-primary",  bg: "bg-card",    dot: "bg-primary" },
  stable:      { border: "border-l-muted-foreground", bg: "bg-card", dot: "bg-muted-foreground" },
  critical:    { border: "border-l-red-500",     bg: "bg-red-50 dark:bg-red-950/20",        dot: "bg-red-500" },
  slow_growth: { border: "border-l-yellow-500",  bg: "bg-yellow-50 dark:bg-yellow-950/20",  dot: "bg-yellow-500" },
  necrotic:    { border: "border-l-red-700",     bg: "bg-red-100 dark:bg-red-950/30",       dot: "bg-red-700" },
  vitrified:   { border: "border-l-amber-500",  bg: "bg-amber-50 dark:bg-amber-950/20",  dot: "bg-amber-500" },
  dead:        { border: "border-l-gray-400",    bg: "bg-gray-100 dark:bg-gray-800/50",     dot: "bg-gray-400" },
};

const DEFAULT_HEALTH = { border: "border-l-gray-300", bg: "bg-card", dot: "bg-gray-300" };
const AUTO_COLLAPSE_THRESHOLD = 15;

function getPathToNode(root: LineageNode, targetId: string): Set<string> {
  const path = new Set<string>();

  function walk(node: LineageNode): boolean {
    if (node.id === targetId) {
      path.add(node.id);
      return true;
    }
    for (const child of node.children) {
      if (walk(child)) {
        path.add(node.id);
        return true;
      }
    }
    return false;
  }

  walk(root);
  return path;
}

function getInitialCollapsed(root: LineageNode, currentVesselId: string): Set<string> {
  const pathToTarget = getPathToNode(root, currentVesselId);
  const collapsed = new Set<string>();

  function walk(node: LineageNode) {
    if (
      node.children.length > AUTO_COLLAPSE_THRESHOLD &&
      !pathToTarget.has(node.id)
    ) {
      collapsed.add(node.id);
    }
    for (const child of node.children) walk(child);
  }

  walk(root);
  return collapsed;
}

function countStats(root: LineageNode) {
  let healthy = 0, critical = 0, disposed = 0, total = 0;

  function walk(node: LineageNode) {
    total++;
    if (node.status === "disposed") disposed++;
    else if (["critical", "necrotic", "dead"].includes(node.healthStatus)) critical++;
    else if (node.healthStatus === "healthy") healthy++;
    for (const child of node.children) walk(child);
  }

  walk(root);
  return { healthy, critical, disposed, total };
}

interface TreeNodeProps {
  node: LineageNode;
  isCurrentVessel: boolean;
  isCollapsed: boolean;
  onToggle: () => void;
}

function TreeNode({ node, isCurrentVessel, isCollapsed, onToggle }: TreeNodeProps) {
  const colors = HEALTH_COLORS[node.healthStatus] || DEFAULT_HEALTH;
  const isDisposed = node.status === "disposed" || node.status === "multiplied";

  return (
    <div
      className={cn(
        "relative flex items-center gap-2 rounded-lg border-l-4 border px-3 py-2 transition-shadow min-w-[180px] max-w-[220px]",
        colors.border,
        colors.bg,
        isCurrentVessel && "ring-2 ring-primary ring-offset-2 ring-offset-background",
        isDisposed && "opacity-60",
      )}
    >
      <Link href={`/vessels/${node.id}`} aria-current={isCurrentVessel ? "page" : undefined} className="flex-1 min-w-0 rounded-sm hover:underline underline-offset-4">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-xs font-semibold truncate">{node.barcode}</span>
          <span className={cn("w-2 h-2 rounded-full shrink-0", colors.dot)} />
        </div>
        {node.cultivarName && (
          <p className="text-xs text-muted-foreground truncate">{node.cultivarName}</p>
        )}
        <p className="text-xs text-muted-foreground">
          {STAGE_LABELS[node.stage] || node.stage} · Gen {node.generation}
          {node.explantCount > 0 && ` · ${node.explantCount} exp`}
        </p>
        <p className="text-xs text-muted-foreground">{HEALTH_STATUS_LABELS[node.healthStatus] || node.healthStatus}{isDisposed ? ` · ${node.status}` : ""}</p>
      </Link>
      {node.children.length > 0 && (
        <button
          aria-expanded={!isCollapsed}
          aria-label={`${isCollapsed ? "Expand" : "Collapse"} ${node.children.length} descendants of ${node.barcode}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className="shrink-0 p-2 rounded hover:bg-black/10 dark:hover:bg-white/10"
        >
          {isCollapsed ? (
            <span className="flex items-center text-xs text-muted-foreground gap-0.5">
              <ChevronRight className="w-3 h-3" />
              <span>{node.children.length}</span>
            </span>
          ) : (
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          )}
        </button>
      )}
    </div>
  );
}

interface SubtreeProps {
  node: LineageNode;
  currentVesselId: string;
  collapsedNodes: Set<string>;
  onToggle: (id: string) => void;
  depth: number;
}

function Subtree({ node, currentVesselId, collapsedNodes, onToggle, depth }: SubtreeProps) {
  const isCollapsed = collapsedNodes.has(node.id);
  const isCurrent = node.id === currentVesselId;

  return (
    <div className="flex items-start gap-6">
      <TreeNode
        node={node}
        isCurrentVessel={isCurrent}
        isCollapsed={isCollapsed}
        onToggle={() => onToggle(node.id)}
      />

      <>
        {!isCollapsed && node.children.length > 0 && (
          <div
            className="flex flex-col gap-2 relative"
          >
            {/* Vertical connector line */}
            {node.children.length > 1 && (
              <div
                className="absolute left-0 top-4 bottom-4 w-px bg-border -translate-x-3"
              />
            )}
            {node.children.map((child) => (
              <div key={child.id} className="relative">
                {/* Horizontal connector line */}
                <div className="absolute left-0 top-4 w-3 h-px bg-border -translate-x-3" />
                <Subtree
                  node={child}
                  currentVesselId={currentVesselId}
                  collapsedNodes={collapsedNodes}
                  onToggle={onToggle}
                            depth={depth + 1}
                />
              </div>
            ))}
          </div>
        )}
      </>
    </div>
  );
}

export function LineageTreeView({ tree }: { tree: LineageTreeType }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(() =>
    getInitialCollapsed(tree.root, tree.currentVesselId)
  );

  const stats = useMemo(() => countStats(tree.root), [tree.root]);

  const handleToggle = useCallback((id: string) => {
    setCollapsedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // Scroll to current vessel on mount
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const currentNode = el.querySelector("[class*='ring-primary']");
    if (currentNode) {
      const bounds = currentNode.getBoundingClientRect();
      const container = el.getBoundingClientRect();
      el.scrollTo({ left: bounds.left - container.left + el.scrollLeft - el.clientWidth / 2 + bounds.width / 2, top: bounds.top - container.top + el.scrollTop - el.clientHeight / 2 + bounds.height / 2, behavior: "auto" });
    }
  }, []);

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center gap-1.5">
          <TreePine className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">{stats.total} vessels</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-muted-foreground">{stats.healthy} healthy</span>
        </div>
        {stats.critical > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-muted-foreground">{stats.critical} critical</span>
          </div>
        )}
        {stats.disposed > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-gray-400" />
            <span className="text-muted-foreground">{stats.disposed} disposed</span>
          </div>
        )}
        <span className="text-muted-foreground">
          {tree.maxGeneration + 1} generation{tree.maxGeneration > 0 ? "s" : ""}
        </span>
        {tree.truncated && (
          <div className="flex items-center gap-1.5 text-amber-600">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span className="text-xs">Tree truncated (too many vessels)</span>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary" /> Healthy</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-muted-foreground" /> Stable</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Critical</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-400" /> Disposed</span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded border-2 border-primary" /> Current
        </span>
      </div>

      {/* Tree */}
      <div
        ref={scrollRef}
        role="region"
        aria-label="Vessel family tree; scroll to explore generations"
        tabIndex={0}
        className="min-w-0 max-w-full overflow-x-auto overflow-y-auto max-h-[70vh] rounded-lg border bg-card/50 p-6"
      >
        <Subtree
          node={tree.root}
          currentVesselId={tree.currentVesselId}
          collapsedNodes={collapsedNodes}
          onToggle={handleToggle}
          depth={0}
        />
      </div>
    </div>
  );
}
