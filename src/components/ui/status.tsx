import { Badge } from "./card";
import { agreementStatusLabel, paymentStatusLabel, projectStatusLabel, quoteStatusLabel } from "@/lib/format";
import type { AgreementStatus, PaymentStatus, ProjectStatus, QuoteStatus } from "@/lib/types";

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  const tone = status === "opgeleverd" ? "good" : status === "aanvraag" ? "neutral" : status === "shoot_gepland" ? "cool" : "warm";
  return <Badge tone={tone}>{projectStatusLabel[status]}</Badge>;
}

export function QuoteStatusBadge({ status }: { status: QuoteStatus }) {
  const tone =
    status === "geaccepteerd" ? "good" : status === "afgewezen" || status === "verlopen" ? "bad" : status === "concept" ? "neutral" : status === "vraag" ? "cool" : "warm";
  return <Badge tone={tone}>{quoteStatusLabel[status]}</Badge>;
}

export function AgreementStatusBadge({ status }: { status: AgreementStatus }) {
  return <Badge tone={status === "ondertekend" ? "good" : status === "ingetrokken" ? "bad" : "warm"}>{agreementStatusLabel[status]}</Badge>;
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <Badge tone={status === "betaald" ? "good" : status === "deels" ? "cool" : "neutral"}>{paymentStatusLabel[status]}</Badge>;
}
