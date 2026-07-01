import { ReactNode } from "react";
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

interface WithId {
  id: string;
}

interface SortableListProps<T extends WithId> {
  items: T[];
  onReorder: (orderedIds: string[]) => void;
  renderItem: (item: T, dragHandle: ReactNode) => ReactNode;
  disabled?: boolean;
  className?: string;
}

export function SortableList<T extends WithId>({
  items,
  onReorder,
  renderItem,
  disabled,
  className = "space-y-3",
}: SortableListProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(items, oldIndex, newIndex);
    onReorder(next.map((i) => i.id));
  };

  if (disabled) {
    return (
      <div className={className}>
        {items.map((item) => renderItem(item, <StaticHandle />))}
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <div className={className}>
          {items.map((item) => (
            <SortableRow key={item.id} id={item.id}>
              {(handle) => renderItem(item, handle)}
            </SortableRow>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortableRow({
  id,
  children,
}: {
  id: string;
  children: (handle: ReactNode) => ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 10 : "auto",
  };
  const handle = (
    <button
      type="button"
      ref={setNodeRef as unknown as React.Ref<HTMLButtonElement>}
      {...attributes}
      {...listeners}
      aria-label="Drag to reorder"
      className="cursor-grab touch-none p-1 text-muted-foreground/50 hover:text-muted-foreground active:cursor-grabbing"
    >
      <GripVertical className="h-4 w-4" />
    </button>
  );
  return (
    <div ref={setNodeRef} style={style}>
      {children(handle)}
    </div>
  );
}

function StaticHandle() {
  return (
    <span className="p-1 text-muted-foreground/30" aria-hidden>
      <GripVertical className="h-4 w-4" />
    </span>
  );
}

/**
 * Persist reordered IDs by writing sort_order back to Supabase.
 * Uses index-based ordering (0, 1, 2, ...) so future inserts append naturally.
 */
export async function persistSortOrder(
  supabase: {
    from: (t: string) => {
      update: (v: { sort_order: number }) => { eq: (col: string, id: string) => Promise<{ error: unknown }> };
    };
  },
  table: string,
  orderedIds: string[],
): Promise<{ error: unknown | null }> {
  const results = await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from(table).update({ sort_order: index }).eq("id", id),
    ),
  );
  const firstError = results.find((r) => r.error)?.error ?? null;
  return { error: firstError };
}
