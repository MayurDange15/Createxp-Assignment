// /components/SortControl.tsx
"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  // PopoverClose,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
  GripVertical,
  Plus,
} from "lucide-react";
import { Client, SortCriterion } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Dnd-kit imports
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// --- CONFIGURATION (from Step 1) ---
const SORT_CONFIG: Record<
  string, // Use string for broader compatibility with keyof Client
  { label: string; asc: React.ReactNode; desc: React.ReactNode }
> = {
  clientName: { label: "Client Name", asc: "A-Z", desc: "Z-A" },
  createdAt: {
    label: "Created At",
    asc: "Oldest to Newest",
    desc: "Newest to Oldest",
  },
  updatedAt: {
    label: "Updated At",
    asc: "Oldest to Newest",
    desc: "Newest to Newest",
  },
  id: { label: "Client ID", asc: "A-Z", desc: "Z-A" },
  email: { label: "Email", asc: "A-Z", desc: "Z-A" },
  status: { label: "Status", asc: "A-Z", desc: "Z-A" },
  clientType: { label: "Client Type", asc: "A-Z", desc: "Z-A" },
};

// --- UPDATED SORTABLE ITEM (Now inside SortControl) ---
function SortableCriterionItem({
  criterion,
  setDirection,
  remove,
}: {
  criterion: SortCriterion;
  setDirection: (dir: "asc" | "desc") => void;
  remove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: criterion.key });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const config = SORT_CONFIG[criterion.key as string];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 w-full"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none p-1"
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="flex-grow p-2 border rounded-md bg-background">
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium text-sm">{config.label}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={remove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={criterion.direction === "asc" ? "secondary" : "outline"}
            size="sm"
            className="w-full justify-start text-xs"
            onClick={() => setDirection("asc")}
          >
            <ArrowUp className="mr-2 h-3 w-3" /> {config.asc}
          </Button>
          <Button
            variant={criterion.direction === "desc" ? "secondary" : "outline"}
            size="sm"
            className="w-full justify-start text-xs"
            onClick={() => setDirection("desc")}
          >
            <ArrowDown className="mr-2 h-3 w-3" /> {config.desc}
          </Button>
        </div>
      </div>
    </div>
  );
}

// --- MAIN SORT CONTROL COMPONENT ---
interface SortControlProps {
  criteria: SortCriterion[];
  setCriteria: React.Dispatch<React.SetStateAction<SortCriterion[]>>;
}

export function SortControl({ criteria, setCriteria }: SortControlProps) {
  const sensors = useSensors(useSensor(PointerSensor));

  const availableOptions = Object.keys(SORT_CONFIG).filter(
    (key) => !criteria.some((c) => c.key === key)
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = criteria.findIndex((c) => c.key === active.id);
      const newIndex = criteria.findIndex((c) => c.key === over.id);
      setCriteria(arrayMove(criteria, oldIndex, newIndex));
    }
  }

  function setCriterionDirection(key: keyof Client, direction: "asc" | "desc") {
    setCriteria(criteria.map((c) => (c.key === key ? { ...c, direction } : c)));
  }

  function removeCriterion(key: keyof Client) {
    setCriteria(criteria.filter((c) => c.key !== key));
  }

  function addCriterion(key: keyof Client) {
    setCriteria([...criteria, { key, direction: "desc" }]);
  }

  function clearAll() {
    setCriteria([]);
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <ArrowUpDown className="mr-2 h-4 w-4" />
          Sort
          {criteria.length > 0 && (
            <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
              {criteria.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96" align="end">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Sort By</h4>
            <p className="text-sm text-muted-foreground">
              Drag to prioritize. Add up to 5 criteria.
            </p>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={criteria.map((c) => c.key as string)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {criteria.map((c) => (
                  <SortableCriterionItem
                    key={c.key}
                    criterion={c}
                    setDirection={(dir) => setCriterionDirection(c.key, dir)}
                    remove={() => removeCriterion(c.key)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {availableOptions.length > 0 && criteria.length < 5 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Plus className="mr-2 h-4 w-4" /> Add Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {availableOptions.map((key) => (
                  <DropdownMenuItem
                    key={key}
                    onSelect={() => addCriterion(key as keyof Client)}
                  >
                    {SORT_CONFIG[key].label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="ghost"
              onClick={clearAll}
              disabled={criteria.length === 0}
            >
              Clear all
            </Button>
            {/* <PopoverClose asChild> */}
            <Button>Apply Sort</Button>
            {/* </PopoverClose> */}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
