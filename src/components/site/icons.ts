import { Building2, HeartHandshake, Home, Briefcase, FileCheck2, Globe2, Wallet, Handshake } from "lucide-react";
import type { ComponentType } from "react";

export const audienceIcons: Record<string, ComponentType<{ className?: string }>> = {
  particulieren: Home,
  gezinnen: HeartHandshake,
  zelfstandigen: Briefcase,
  ondernemingen: Building2,
};

export const serviceIcons: Record<string, ComponentType<{ className?: string }>> = {
  immigration: Globe2,
  "administratieve-begeleiding": FileCheck2,
  "budgettaire-begeleiding": Wallet,
  "minnelijke-oplossing": Handshake,
};
