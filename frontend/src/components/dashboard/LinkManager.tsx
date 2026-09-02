"use client";

import { createElement, useState } from "react";
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
import { resolveLinkIcon } from "@/lib/socialIcons";
import { groupLinks, sectionNames } from "@/lib/linkSections";

const SECTION_LIST_ID = "wsio-link-sections";

const ICON_OPTIONS = ["", ...LINK_ICON_KEYS];

function IconPreview({ url, icon }: { url: string; icon: string }) {
  return (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-line bg-raised text-muted">
      {createElement(resolveLinkIcon({ url, icon }), { className: "h-4 w-4" })}
    </span>
  );
}

const selectClass =
  "h-11 rounded-[var(--radius-sm)] border border-[var(--color-control-border)] bg-surface px-2.5 text-[0.95rem] text-ink outline-none focus:border-ink";

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
  const [section, setSection] = useState("");
  const [adding, setAdding] = useState(false);
  const sections = sectionNames(links);
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
    const res = await createProfileLink({
      label: label.trim(),
      url: url.trim(),
      icon,
      section: section.trim(),
    });
    setAdding(false);
    if (res.error || !res.link) {
      showToast(res.error || "Couldn't add the link", "error");
      return;
    }
    onChange([...links, res.link]);
    setLabel("");
    setUrl("");
    setIcon("");
    // keep `section` so consecutive links land in the same group
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
    patch: { label: string; url: string; icon: string; section: string }
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
        <h2 className="font-display text-lg font-medium tracking-tight">Links</h2>
        <p className="mt-1 text-sm text-muted">
          Drag to reorder. Give links the same section name to group them under a
          heading.
        </p>
      </div>

      <datalist id={SECTION_LIST_ID}>
        {sections.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>

      <form onSubmit={handleAdd} autoComplete="off" className="space-y-2">
        <div className="grid gap-2 sm:grid-cols-[1fr_1fr]">
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
        </div>
        <div className="flex flex-wrap gap-2">
          <IconPreview url={url} icon={icon} />
          <select
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            className={selectClass}
            aria-label="Link icon"
          >
            {ICON_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o === "" ? "Auto" : o}
              </option>
            ))}
          </select>
          <Input
            list={SECTION_LIST_ID}
            placeholder="Section (optional)"
            value={section}
            onChange={(e) => setSection(e.target.value)}
            maxLength={60}
            className="flex-1 sm:max-w-[12rem]"
            aria-label="Section"
          />
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
            <div className="space-y-5">
              {groupLinks(links).map((group) => (
                <div key={group.title || "_"} className="space-y-2">
                  <div className="px-1 text-xs font-semibold uppercase tracking-[0.12em] text-faint">
                    {group.title || "No section"}
                  </div>
                  <ul className="space-y-2">
                    {group.links.map((link) => (
                      <SortableLinkRow
                        key={link.id}
                        link={link}
                        clicks={clicksByLink[link.id] ?? 0}
                        busy={busyId === link.id}
                        editing={editingId === link.id}
                        sectionListId={SECTION_LIST_ID}
                        onEdit={() => setEditingId(link.id)}
                        onCancelEdit={() => setEditingId(null)}
                        onSaveEdit={(patch) => handleSaveEdit(link.id, patch)}
                        onToggle={() => handleToggle(link)}
                        onDelete={() => handleDelete(link.id)}
                      />
                    ))}
                  </ul>
                </div>
              ))}
            </div>
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
  sectionListId: string;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: (patch: { label: string; url: string; icon: string; section: string }) => void;
  onToggle: () => void;
  onDelete: () => void;
}

function SortableLinkRow({
  link,
  clicks,
  busy,
  editing,
  sectionListId,
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
  const [section, setSection] = useState(link.section ?? "");
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
        <div className="grid gap-2 sm:grid-cols-2">
          <Input value={label} onChange={(e) => setLabel(e.target.value)} maxLength={80} />
          <Input value={url} onChange={(e) => setUrl(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-2">
          <IconPreview url={url} icon={icon} />
          <select
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            className={selectClass}
            aria-label="Link icon"
          >
            {ICON_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o === "" ? "Auto" : o}
              </option>
            ))}
          </select>
          <Input
            list={sectionListId}
            value={section}
            onChange={(e) => setSection(e.target.value)}
            placeholder="Section"
            maxLength={60}
            className="flex-1 sm:max-w-[12rem]"
            aria-label="Section"
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="ghost" onClick={onCancelEdit}>
            <X className="h-4 w-4" /> Cancel
          </Button>
          <Button
            size="sm"
            disabled={busy || !label.trim() || !url.trim()}
            onClick={() =>
              onSaveEdit({
                label: label.trim(),
                url: url.trim(),
                icon,
                section: section.trim(),
              })
            }
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

      {createElement(resolveLinkIcon(link), { className: "h-4 w-4 shrink-0 text-muted" })}

      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-ink">{link.label}</div>
        <div className="truncate text-xs text-faint">{link.url}</div>
      </div>

      <span className="hidden text-xs text-muted sm:block" title="Clicks">
        {clicks} {clicks === 1 ? "click" : "clicks"}
      </span>

      {confirmDelete ? (
        <div className="flex items-center gap-2">
          <span className="hidden text-xs text-muted sm:block">Delete this link?</span>
          <button
            type="button"
            onClick={() => setConfirmDelete(false)}
            className="icon-btn"
            title="Keep link"
          >
            <X className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={busy}
            className="rounded-[var(--radius-xs)] bg-[var(--color-negative)] px-2.5 py-1.5 text-xs font-medium text-white disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={onToggle}
            disabled={busy}
            className="icon-btn"
            title={link.active ? "Hide from page" : "Show on page"}
          >
            {link.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>
          <button type="button" onClick={onEdit} className="icon-btn" title="Edit">
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="icon-btn hover:!text-[var(--color-negative)]"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )}
    </li>
  );
}
