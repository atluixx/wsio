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

const selectClass =
  "h-11 rounded-[var(--radius-sm)] border border-line-strong bg-surface px-2.5 text-[0.95rem] text-ink outline-none focus:border-ink";

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
      showToast(res.error || "Couldn't add the link", "error");
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
      showToast(res.error || "Couldn't update the link", "error");
      return;
    }
    onChange(links.map((l) => (l.id === link.id ? res.link! : l)));
  };

  const handleDelete = async (id: string) => {
    setBusyId(id);
    const res = await deleteProfileLink(id);
    setBusyId(null);
    if (!res.success) {
      showToast(res.error || "Couldn't delete the link", "error");
      return;
    }
    onChange(links.filter((l) => l.id !== id));
    showToast("Link deleted", "info");
  };

  const handleSaveEdit = async (
    id: string,
    patch: { label: string; url: string; icon: string }
  ) => {
    setBusyId(id);
    const res = await updateProfileLink(id, patch);
    setBusyId(null);
    if (res.error || !res.link) {
      showToast(res.error || "Couldn't save the link", "error");
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
      showToast("Couldn't save the new order", "error");
    } else if (res.links) {
      onChange(res.links);
    }
  };

  return (
    <div className="surface-card space-y-5 p-6">
      <div>
        <h2 className="font-display text-lg font-semibold tracking-tight">Links</h2>
        <p className="mt-1 text-sm text-muted">
          Drag to reorder. Hidden links stay off your public page.
        </p>
      </div>

      <form onSubmit={handleAdd} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
        <Input
          placeholder="Label — e.g. My newsletter"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          maxLength={80}
          required
        />
        <Input
          placeholder="https://…"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
        />
        <div className="flex gap-2">
          <select
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            className={selectClass}
            aria-label="Link icon"
          >
            {ICON_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o === "" ? "No icon" : o}
              </option>
            ))}
          </select>
          <Button type="submit" size="sm" disabled={adding} className="shrink-0">
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </div>
      </form>

      {links.length === 0 ? (
        <p className="py-8 text-center text-sm text-faint">
          No links yet — add your first one above.
        </p>
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
        className="space-y-2 rounded-[var(--radius-sm)] border border-line-strong bg-raised p-3"
      >
        <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <Input value={label} onChange={(e) => setLabel(e.target.value)} maxLength={80} />
          <Input value={url} onChange={(e) => setUrl(e.target.value)} />
          <select
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            className={selectClass}
            aria-label="Link icon"
          >
            {ICON_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o === "" ? "No icon" : o}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="ghost" onClick={onCancelEdit}>
            <X className="h-4 w-4" /> Cancel
          </Button>
          <Button
            size="sm"
            disabled={busy || !label.trim() || !url.trim()}
            onClick={() => onSaveEdit({ label: label.trim(), url: url.trim(), icon })}
          >
            <Check className="h-4 w-4" /> Save
          </Button>
        </div>
      </li>
    );
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 rounded-[var(--radius-sm)] border border-line px-2.5 py-2.5 ${
        !link.active ? "opacity-45" : ""
      }`}
    >
      <button
        type="button"
        className="cursor-grab touch-none p-1 text-faint hover:text-ink active:cursor-grabbing"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-ink">{link.label}</div>
        <div className="truncate text-xs text-faint">{link.url}</div>
      </div>

      <span className="hidden text-xs text-muted sm:block" title="Clicks">
        {clicks} {clicks === 1 ? "click" : "clicks"}
      </span>

      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={onToggle}
          disabled={busy}
          className="p-2 text-muted hover:text-ink"
          title={link.active ? "Hide from page" : "Show on page"}
        >
          {link.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </button>
        <button
          type="button"
          onClick={onEdit}
          className="p-2 text-muted hover:text-ink"
          title="Edit"
        >
          <Pencil className="h-4 w-4" />
        </button>
        {confirmDelete ? (
          <button
            type="button"
            onClick={onDelete}
            disabled={busy}
            className="rounded-[var(--radius-xs)] bg-[var(--color-negative)] px-2.5 py-1 text-xs font-medium text-white"
          >
            Delete
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            onMouseLeave={() => setConfirmDelete(false)}
            className="p-2 text-faint hover:text-[var(--color-negative)]"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </li>
  );
}
