"use client";

import { FIELD_CATEGORIES, type FieldDefinition } from "@/types/form";
import { useDraggable } from "@dnd-kit/core";
import {
  Type,
  AlignLeft,
  Hash,
  Banknote,
  Percent,
  Calendar,
  Clock,
  Mail,
  Phone,
  Link,
  CreditCard,
  FileText,
  MapPin,
  ChevronDown,
  CircleDot,
  CheckSquare,
  ListChecks,
  Search,
  Table,
  Grid3x3,
  Image,
  File,
  Paperclip,
  PenTool,
  Layout,
  Minus,
  Columns,
  Folder,
  ChevronsDown,
  Calculator,
  User,
  Briefcase,
  Award,
  Layers,
  Building,
  Landmark,
  Building2,
  Wallet,
  Receipt,
  Coins,
  Car,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const iconMap: Record<string, LucideIcon> = {
  type: Type,
  "align-left": AlignLeft,
  hash: Hash,
  banknote: Banknote,
  percent: Percent,
  calendar: Calendar,
  clock: Clock,
  "calendar-clock": Clock,
  mail: Mail,
  phone: Phone,
  link: Link,
  "credit-card": CreditCard,
  "id-card": CreditCard,
  "file-text": FileText,
  "map-pin": MapPin,
  "chevron-down": ChevronDown,
  "circle-dot": CircleDot,
  "check-square": CheckSquare,
  "list-checks": ListChecks,
  search: Search,
  table: Table,
  "grid-3x3": Grid3x3,
  image: Image,
  file: File,
  paperclip: Paperclip,
  "pen-tool": PenTool,
  layout: Layout,
  minus: Minus,
  columns: Columns,
  folder: Folder,
  "chevrons-down": ChevronsDown,
  calculator: Calculator,
  user: User,
  briefcase: Briefcase,
  award: Award,
  layers: Layers,
  building: Building,
  landmark: Landmark,
  "building-2": Building2,
  wallet: Wallet,
  text: Type,
  receipt: Receipt,
  coins: Coins,
  car: Car,
};

function DraggableField({ field }: { field: FieldDefinition }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${field.type}`,
    data: { type: "palette", fieldType: field.type, fieldDefinition: field },
  });

  const Icon = iconMap[field.icon] || Type;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        "flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-2.5 text-sm cursor-grab hover:border-blue-300 hover:bg-blue-50 transition-colors",
        isDragging && "opacity-50 border-blue-400"
      )}
    >
      <Icon className="h-4 w-4 text-gray-500 flex-shrink-0" />
      <span className="text-gray-700 truncate">{field.label}</span>
    </div>
  );
}

export function FieldPalette() {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(FIELD_CATEGORIES.map((c) => c.name))
  );

  const toggleCategory = (name: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  return (
    <div className="w-72 border-r border-gray-200 bg-gray-50 overflow-y-auto h-full">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900">Komponen</h3>
        <p className="text-xs text-gray-500 mt-1">Drag komponen ke area builder</p>
      </div>
      <div className="p-3 space-y-3">
        {FIELD_CATEGORIES.map((category) => {
          const isExpanded = expandedCategories.has(category.name);
          const CategoryIcon = iconMap[category.icon] || Type;
          return (
            <div key={category.name}>
              <button
                onClick={() => toggleCategory(category.name)}
                className="flex items-center gap-2 w-full text-left px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700"
              >
                <CategoryIcon className="h-3.5 w-3.5" />
                {category.name}
                <ChevronsDown
                  className={cn(
                    "h-3 w-3 ml-auto transition-transform",
                    !isExpanded && "-rotate-90"
                  )}
                />
              </button>
              {isExpanded && (
                <div className="grid grid-cols-1 gap-1.5 mt-1.5">
                  {category.fields.map((field) => (
                    <DraggableField key={field.type} field={field} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
