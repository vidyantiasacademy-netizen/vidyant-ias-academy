import type { Metadata } from "next";
import {
  Copy,
  CreditCard,
  IdCard,
  MessageCircleQuestion,
  Ticket,
  Upload,
  UserRoundCheck,
  Video,
  Wallet,
} from "lucide-react";

import { ServiceTile, type ServiceTileProps } from "@/components/portal/ServiceTile";
import { BRAND } from "@/lib/constants/site";

/**
 * Services — everything the institute does for a student that is not a class
 * or a paper.
 *
 * A tile without `href` has no destination yet. They are listed rather than
 * hidden because the grid is also how the centre tells a student what is
 * coming, and a tile that silently 404s is the worse failure.
 */
export const metadata: Metadata = {
  title: `Services | ${BRAND.name}`,
  robots: { index: false, follow: false },
};

const SERVICES: ServiceTileProps[] = [
  {
    label: "Mentorship",
    description: "Your mentor, session notes and what to do next.",
    icon: <UserRoundCheck aria-hidden className="size-5" />,
    tone: "indigo",
  },
  {
    label: "I Card",
    description: "Your roll number and student identity card.",
    icon: <IdCard aria-hidden className="size-5" />,
    tone: "kesar",
    href: "/dashboard/services/i-card",
  },
  {
    label: "Recordings",
    description: "Recorded classes, on demand.",
    icon: <Video aria-hidden className="size-5" />,
    tone: "indigo-dark",
    href: "/dashboard/classroom",
  },
  {
    label: "Doubts",
    description: "Ask a subject doubt and track the answer.",
    icon: <MessageCircleQuestion aria-hidden className="size-5" />,
    tone: "paper",
  },
  {
    label: "Upload Docs",
    description: "Submit answer sheets and admission documents.",
    icon: <Upload aria-hidden className="size-5" />,
    tone: "paper",
  },
  {
    label: "My Copies",
    description: "Evaluated answer copies with remarks.",
    icon: <Copy aria-hidden className="size-5" />,
    tone: "indigo",
  },
  {
    label: "Fees",
    description: "Payment history and receipts.",
    icon: <CreditCard aria-hidden className="size-5" />,
    tone: "indigo-dark",
    href: "/dashboard/services/fees",
  },
  {
    label: "My Coupons",
    description: "Offers applied to your enrollment.",
    icon: <Ticket aria-hidden className="size-5" />,
    tone: "paper",
  },
  {
    label: "My Wallet",
    description: "Credit balance held against your account.",
    icon: <Wallet aria-hidden className="size-5" />,
    tone: "paper",
  },
];

export default function ServicesPage() {
  return (
    <>
      <h1 className="text-h2 font-semibold">Services</h1>
      <p className="mt-2 text-body text-ink-secondary">
        Everything that supports your preparation, in one place.
      </p>

      <ul className="mt-8 grid auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SERVICES.map((service) => (
          <li key={service.label} className="h-full">
            <ServiceTile {...service} />
          </li>
        ))}
      </ul>
    </>
  );
}
