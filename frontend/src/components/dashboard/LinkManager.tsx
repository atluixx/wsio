"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Check,
  X,
  Pencil,
  BarChart2,
} from "lucide-react";
import {
  createProfileLink,
  updateProfileLink,
  deleteProfileLink,
  reorderProfileLinks,
  type ProfileLink,
} from "@/lib/api";
import { useToast } from "@/components/Toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LINK_ICON_KEYS } from "@/lib/linkIcons";

const ICON_OPTIONS = ["", ...LINK_ICON_KEYS];

interface Props {
  links: ProfileLink[];
  onChange: (links: ProfileLink[]) => void;
  clicksByLink: Record<string, number>;
}

export function LinkManager({ links, onChange, clicksByLink }: Props) {
  const { showToast } = useToast();
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [icon, setIcon] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim() || !url.trim()) return;
    setAdding(true);
    const res = await createProfileLink({ label: label.trim(), url: url.trim(), icon });
    setAdding(false);
    if (res.error || !res.link) {
      showToast(res.error || "Failed to add link", "error");
      return;
    }
    onChange([...links, res.link]);
    setLabel("");
    setUrl("");
    setIcon("");
    showToast("Link added", "success");
  };

  const handleToggle = async (link: ProfileLink) => {
    setBusyId(link.id);
    const res = await updateProfileLink(link.id, { active: !link.active });
    setBusyId(null);
    if (res.error || !res.link) {
      showToast(res.error || "Failed to update link", "error");
      return;
    }
    onChange(links.map((l) => (l.id === link.id ? res.link! : l)));
  };

  const handleDelete = async (id: string) => {
    setBusyId(id);
    const res = await deleteProfileLink(id);
    setBusyId(null);
    if (!res.success) {
      showToast(res.error || "Failed to delete link", "error");
      return;
    }
    onChange(links.filter((l) => l.id !== id));
    showToast("Link deleted", "info");
  };

  const handleSaveEdit = async (id: string, patch: { label: string; url: string; icon: string }) => {
    setBusyId(id);
    const res = await updateProfileLink(id, patch);
    setBusyId(null);
    if (res.error || !res.link) {
      showToast(res.error || "Failed to save link", "error");
      return;
    }
    onChange(links.map((l) => (l.id === id ? res.link! : l)));
    setEditingId(null);
    showToast("Link updated", "success");
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = links.findIndex((l) => l.id === active.id);
    const newIndex = links.findIndex((l) => l.id === over.id);
    const next = arrayMove(links, oldIndex, newIndex);
    onChange(next);
    const res = await reorderProfileLinks(next.map((l) => l.id));
    if (res.error) {
      showToast("Failed to save order", "error");
    } else if (res.links) {
      onChange(res.links);
    }
  };

  return (
    <div className="minimal-card p-5 sm:p-6 space-y-5">
      <div className="space-y-1">
        <h2 className="text-sm font-bold text-white">Links</h2>
        <p className="text-xs text-zinc-400">
          Drag to reorder. Hidden links stay off your public page.
        </p>
      </div>

      <form onSubmit={handleAdd} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
        <Input
          placeholder="Label (e.g. My newsletter)"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="minimal-input h-9 text-xs"
          maxLength={80}
          required
        />
        <Input
          placeholder="https://..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="minimal-input h-9 text-xs"
          required
        />
        <div className="flex gap-2">
          <select
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            className="minimal-input h-9 rounded-lg px-2 text-xs text-white"
            aria-label="Link icon"
          >
            {ICON_OPTIONS.map((o) => (
              <option key={o} value={o} className="bg-zinc-900">
                {o === "" ? "No icon" : o}
              </option>
            ))}
          </select>
          <Button type="submit" size="sm" disabled={adding} className="h-9 shrink-0 text-xs">
            <Plus className="h-3.5 w-3.5" />
            Add
          </Button>
        </div>
      </form>

      {links.length === 0 ? (
        <p className="py-6 text-center text-xs text-zinc-500">No links yet — add your first one above.</p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={links.map((l) => l.id)} strategy={verticalListSortingStrategy}>
            <ul className="space-y-2">
              {links.map((link) => (
                <SortableLinkRow
                  key={link.id}
                  link={link}
                  clicks={clicksByLink[link.id] ?? 0}
                  busy={busyId === link.id}
                  editing={editingId === link.id}
                  onEdit={() => setEditingId(link.id)}
                  onCancelEdit={() => setEditingId(null)}
                  onSaveEdit={(patch) => handleSaveEdit(link.id, patch)}
                  onToggle={() => handleToggle(link)}
                  onDelete={() => handleDelete(link.id)}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

interface RowProps {
  link: ProfileLink;
  clicks: number;
  busy: boolean;
  editing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: (patch: { label: string; url: string; icon: string }) => void;
  onToggle: () => void;
  onDelete: () => void;
}

function SortableLinkRow({
  link,
  clicks,
  busy,
  editing,
  onEdit,
  onCancelEdit,
  onSaveEdit,
  onToggle,
  onDelete,
}: RowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: link.id,
  });
  const [label, setLabel] = useState(link.label);
  const [url, setUrl] = useState(link.url);
  const [icon, setIcon] = useState(link.icon ?? "");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  if (editing) {
    return (
      <li
        ref={setNodeRef}
        style={style}
        className="rounded-xl border border-white/10 bg-zinc-900/60 p-3 space-y-2"
      >
        <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <Input value={label} onChange={(e) => setLabel(e.target.value)} className="minimal-input h-8 text-xs" maxLength={80} />
          <Input value={url} onChange={(e) => setUrl(e.target.value)} className="minimal-input h-8 text-xs" />
          <select
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            className="minimal-input h-8 rounded-lg px-2 text-xs text-white"
            aria-label="Link icon"
          >
            {ICON_OPTIONS.map((o) => (
              <option key={o} value={o} className="bg-zinc-900">
                {o === "" ? "No icon" : o}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={onCancelEdit}>
            <X className="h-3.5 w-3.5" /> Cancel
          </Button>
          <Button
            size="sm"
            className="h-7 text-xs"
            disabled={busy || !label.trim() || !url.trim()}
            onClick={() => onSaveEdit({ label: label.trim(), url: url.trim(), icon })}
          >
            <Check className="h-3.5 w-3.5" /> Save
          </Button>
        </div>
      </li>
    );
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-900/40 p-2.5 ${
        !link.active ? "opacity-50" : ""
      }`}
    >
      <button
        type="button"
        className="cursor-grab touch-none p-1 text-zinc-500 hover:text-zinc-300 active:cursor-grabbing"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <div className="min-w-0 flex-1">
        <div className="truncate text-xs font-semibold text-white">{link.label}</div>
        <div className="truncate text-[11px] text-zinc-500">{link.url}</div>
      </div>

      <span className="hidden items-center gap-1 text-[11px] text-zinc-400 sm:flex" title="Clicks">
        <BarChart2 className="h-3 w-3" />
        {clicks}
      </span>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onToggle}
          disabled={busy}
          className="p-1.5 text-zinc-400 hover:text-white"
          title={link.active ? "Hide from page" : "Show on page"}
        >
          {link.active ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
        </button>
        <button type="button" onClick={onEdit} className="p-1.5 text-zinc-400 hover:text-white" title="Edit">
          <Pencil className="h-3.5 w-3.5" />
        </button>
        {confirmDelete ? (
          <button
            type="button"
            onClick={onDelete}
            disabled={busy}
            className="rounded-md bg-red-600/90 px-2 py-1 text-[11px] font-bold text-white"
          >
            Delete
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            onMouseLeave={() => setConfirmDelete(false)}
            className="p-1.5 text-zinc-500 hover:text-red-400"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </li>
  );
}
