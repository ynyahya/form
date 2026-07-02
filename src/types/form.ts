export type FieldType =
  | "text"
  | "paragraph"
  | "number"
  | "currency"
  | "percentage"
  | "date"
  | "time"
  | "datetime"
  | "year"
  | "month"
  | "email"
  | "phone"
  | "url"
  | "nik"
  | "nip"
  | "npwp"
  | "alamat"
  | "dropdown"
  | "radio"
  | "checkbox"
  | "multi_select"
  | "autocomplete"
  | "dynamic_table"
  | "static_table"
  | "upload_photo"
  | "upload_pdf"
  | "upload_document"
  | "signature"
  | "section"
  | "divider"
  | "column"
  | "tabs"
  | "accordion"
  | "formula"
  | "nama_pegawai"
  | "jabatan"
  | "pangkat"
  | "golongan"
  | "unit_kerja"
  | "instansi"
  | "bank"
  | "nomor_rekening"
  | "nilai_rupiah"
  | "terbilang"
  | "pajak"
  | "ppn"
  | "pph"
  | "honor"
  | "transport"
  | "uang_harian";

export interface FieldCategory {
  name: string;
  icon: string;
  fields: FieldDefinition[];
}

export interface FieldDefinition {
  type: FieldType;
  label: string;
  icon: string;
  defaultWidth: string;
}

export interface FormFieldData {
  id: string;
  name: string;
  slug: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  helpText?: string;
  tooltip?: string;
  required: boolean;
  readonly: boolean;
  hidden: boolean;
  defaultValue?: string;
  validation?: ValidationRule;
  conditionalLogic?: ConditionalLogic;
  options?: FieldOptions;
  formula?: string;
  prefix?: string;
  suffix?: string;
  width: string;
  alignment?: string;
  mask?: string;
  order: number;
  parentId?: string;
  entityFieldId?: string;
}

export interface ValidationRule {
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  message?: string;
}

export interface ConditionalLogic {
  action: "show" | "hide" | "require" | "disable";
  operator: "and" | "or";
  conditions: Condition[];
}

export interface Condition {
  fieldId: string;
  operator: "equals" | "not_equals" | "contains" | "greater_than" | "less_than" | "is_empty" | "is_not_empty";
  value: string;
}

export interface FieldOptions {
  choices?: { label: string; value: string }[];
  columns?: TableColumn[];
  multiple?: boolean;
  accept?: string;
  maxSize?: number;
}

export interface TableColumn {
  id: string;
  label: string;
  type: FieldType;
  width?: string;
}

export interface TemplateElement {
  id: string;
  type: "text" | "field" | "table" | "image" | "logo" | "qr" | "line" | "shape" | "signature" | "stamp" | "doc_number" | "page_number" | "header" | "footer";
  content?: string;
  fieldSlug?: string;
  style?: Record<string, string | number>;
  x: number;
  y: number;
  width: number;
  height: number;
  repeatFrom?: string;
  columns?: { label: string; fieldSlug: string; width: number }[];
}

export const FIELD_CATEGORIES: FieldCategory[] = [
  {
    name: "Basic Components",
    icon: "type",
    fields: [
      { type: "text", label: "Text", icon: "type", defaultWidth: "full" },
      { type: "paragraph", label: "Paragraph", icon: "align-left", defaultWidth: "full" },
      { type: "number", label: "Number", icon: "hash", defaultWidth: "half" },
      { type: "currency", label: "Currency (Rp)", icon: "banknote", defaultWidth: "half" },
      { type: "percentage", label: "Percentage", icon: "percent", defaultWidth: "half" },
      { type: "date", label: "Date", icon: "calendar", defaultWidth: "half" },
      { type: "time", label: "Time", icon: "clock", defaultWidth: "half" },
      { type: "datetime", label: "Date Time", icon: "calendar-clock", defaultWidth: "half" },
      { type: "email", label: "Email", icon: "mail", defaultWidth: "half" },
      { type: "phone", label: "Phone", icon: "phone", defaultWidth: "half" },
      { type: "url", label: "URL", icon: "link", defaultWidth: "half" },
      { type: "nik", label: "NIK", icon: "credit-card", defaultWidth: "half" },
      { type: "nip", label: "NIP", icon: "id-card", defaultWidth: "half" },
      { type: "npwp", label: "NPWP", icon: "file-text", defaultWidth: "half" },
      { type: "alamat", label: "Alamat", icon: "map-pin", defaultWidth: "full" },
    ],
  },
  {
    name: "Selection",
    icon: "list",
    fields: [
      { type: "dropdown", label: "Dropdown", icon: "chevron-down", defaultWidth: "half" },
      { type: "radio", label: "Radio", icon: "circle-dot", defaultWidth: "full" },
      { type: "checkbox", label: "Checkbox", icon: "check-square", defaultWidth: "full" },
      { type: "multi_select", label: "Multi Select", icon: "list-checks", defaultWidth: "half" },
      { type: "autocomplete", label: "Autocomplete", icon: "search", defaultWidth: "half" },
    ],
  },
  {
    name: "Table Components",
    icon: "table",
    fields: [
      { type: "dynamic_table", label: "Dynamic Table", icon: "table", defaultWidth: "full" },
      { type: "static_table", label: "Static Table", icon: "grid-3x3", defaultWidth: "full" },
    ],
  },
  {
    name: "Media",
    icon: "image",
    fields: [
      { type: "upload_photo", label: "Upload Foto", icon: "image", defaultWidth: "half" },
      { type: "upload_pdf", label: "Upload PDF", icon: "file", defaultWidth: "half" },
      { type: "upload_document", label: "Upload Dokumen", icon: "paperclip", defaultWidth: "half" },
    ],
  },
  {
    name: "Signature",
    icon: "pen-tool",
    fields: [
      { type: "signature", label: "Signature Pad", icon: "pen-tool", defaultWidth: "half" },
    ],
  },
  {
    name: "Layout",
    icon: "layout",
    fields: [
      { type: "section", label: "Section", icon: "layout", defaultWidth: "full" },
      { type: "divider", label: "Divider", icon: "minus", defaultWidth: "full" },
      { type: "column", label: "Column", icon: "columns", defaultWidth: "full" },
      { type: "tabs", label: "Tabs", icon: "folder", defaultWidth: "full" },
      { type: "accordion", label: "Accordion", icon: "chevrons-down", defaultWidth: "full" },
    ],
  },
  {
    name: "Formula",
    icon: "calculator",
    fields: [
      { type: "formula", label: "Formula", icon: "calculator", defaultWidth: "half" },
    ],
  },
  {
    name: "Government Components",
    icon: "landmark",
    fields: [
      { type: "nama_pegawai", label: "Nama Pegawai", icon: "user", defaultWidth: "half" },
      { type: "jabatan", label: "Jabatan", icon: "briefcase", defaultWidth: "half" },
      { type: "pangkat", label: "Pangkat", icon: "award", defaultWidth: "half" },
      { type: "golongan", label: "Golongan", icon: "layers", defaultWidth: "half" },
      { type: "unit_kerja", label: "Unit Kerja", icon: "building", defaultWidth: "half" },
      { type: "instansi", label: "Instansi", icon: "landmark", defaultWidth: "half" },
      { type: "bank", label: "Bank", icon: "building-2", defaultWidth: "half" },
      { type: "nomor_rekening", label: "Nomor Rekening", icon: "wallet", defaultWidth: "half" },
      { type: "nilai_rupiah", label: "Nilai Rupiah", icon: "banknote", defaultWidth: "half" },
      { type: "terbilang", label: "Terbilang", icon: "text", defaultWidth: "full" },
      { type: "pajak", label: "Pajak", icon: "receipt", defaultWidth: "half" },
      { type: "honor", label: "Honor", icon: "coins", defaultWidth: "half" },
      { type: "transport", label: "Transport", icon: "car", defaultWidth: "half" },
      { type: "uang_harian", label: "Uang Harian", icon: "wallet", defaultWidth: "half" },
    ],
  },
];
