export type ProjectStatus = "aanvraag" | "offerte" | "akkoord" | "shoot_gepland" | "bewerking" | "opgeleverd";
export type PaymentStatus = "open" | "deels" | "betaald";
export type QuoteStatus = "concept" | "verstuurd" | "vraag" | "geaccepteerd" | "afgewezen" | "verlopen";
export type AgreementStatus = "te_ondertekenen" | "ondertekend" | "ingetrokken";
export type AppointmentStatus = "bevestigd" | "geannuleerd" | "afgerond";
export type PortfolioCategory = "gym" | "training" | "lifestyle" | "video";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: "admin" | "client";
}

export interface Client {
  id: string;
  user_id: string | null;
  email: string;
  full_name: string | null;
  phone: string | null;
  company: string | null;
  instagram: string | null;
  city: string | null;
  created_at: string;
}

export interface Project {
  id: string;
  client_id: string;
  title: string;
  description: string | null;
  shoot_type: string | null;
  location: string | null;
  status: ProjectStatus;
  payment_status: PaymentStatus;
  portfolio_consent: boolean;
  portfolio_consent_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Package {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  price_from: number | null;
  price_label: string | null;
  duration: string | null;
  features: string[];
  highlighted: boolean;
  sort: number;
  active: boolean;
}

export interface QuoteItem {
  id: string;
  quote_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  sort: number;
}

export interface Quote {
  id: string;
  project_id: string;
  number: string;
  title: string;
  intro: string | null;
  status: QuoteStatus;
  vat_rate: number;
  subtotal: number;
  vat_amount: number;
  total: number;
  valid_until: string | null;
  usage_rights: string | null;
  revision_rounds: number;
  sent_at: string | null;
  accepted_at: string | null;
  created_at: string;
}

export interface QuoteTemplate {
  id: string;
  name: string;
  package_id: string | null;
  title: string;
  intro: string | null;
  items: { description: string; quantity: number; unit_price: number }[];
  validity_days: number;
  usage_rights: string | null;
  revision_rounds: number;
}

export interface AgreementTemplate {
  id: string;
  name: string;
  body: string;
  default_usage_rights: string | null;
  default_revision_rounds: number;
  is_default: boolean;
  updated_at: string;
}

export interface Agreement {
  id: string;
  project_id: string;
  quote_id: string | null;
  title: string;
  body: string;
  usage_rights: string | null;
  revision_rounds: number;
  status: AgreementStatus;
  content_hash: string | null;
  signed_at: string | null;
  created_at: string;
}

export interface Signature {
  id: string;
  agreement_id: string;
  signer_role: "client" | "admin";
  signer_name: string;
  signer_email: string | null;
  signed_at: string;
  ip_address: string | null;
  user_agent: string | null;
  content_hash: string;
}

export interface Slot {
  id: string;
  starts_at: string;
  ends_at: string;
  note: string | null;
}

export interface Appointment {
  id: string;
  project_id: string;
  availability_id: string | null;
  title: string;
  starts_at: string;
  ends_at: string;
  location: string | null;
  notes: string | null;
  status: AppointmentStatus;
  reminder_sent_at: string | null;
  google_event_id: string | null;
}

export interface Message {
  id: string;
  project_id: string;
  sender_id: string | null;
  body: string;
  read_at: string | null;
  created_at: string;
}

export interface Gallery {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  shoot_date: string | null;
  published: boolean;
  published_at: string | null;
  downloads_unlocked: boolean;
  created_at: string;
}

export interface GalleryFile {
  id: string;
  gallery_id: string;
  original_path: string;
  preview_path: string | null;
  file_name: string;
  mime_type: string | null;
  width: number | null;
  height: number | null;
  size_bytes: number | null;
  is_favorite: boolean;
  sort: number;
}

export interface Invoice {
  id: string;
  project_id: string;
  number: string;
  amount: number | null;
  payment_status: PaymentStatus;
  due_date: string | null;
  file_path: string | null;
  created_at: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body: string;
  cover_url: string | null;
  published: boolean;
  published_at: string | null;
  sort: number;
  updated_at: string;
}

export interface PortfolioItem {
  id: string;
  title: string | null;
  category: PortfolioCategory;
  image_url: string;
  storage_path: string | null;
  video_url: string | null;
  width: number;
  height: number;
  alt: string | null;
  featured: boolean;
  published: boolean;
  sort: number;
}

export interface EmailTemplate {
  key: string;
  name: string;
  description: string | null;
  subject: string;
  body: string;
  variables: string[];
  updated_at: string;
}

export interface DeletionRequest {
  id: string;
  user_id: string | null;
  email: string;
  reason: string | null;
  status: "open" | "afgerond" | "afgewezen";
  created_at: string;
  processed_at: string | null;
}

/** Standaard resultaat van server actions voor formulieren. */
export type ActionState = { ok?: boolean; error?: string; message?: string } | null;
