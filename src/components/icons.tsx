'use client'

import type { LucideProps } from "lucide-react"

export const Logo = (props: LucideProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
    <path d="M2 17l10 5 10-5" />
    <path d="M2 12l10 5 10-5" />
    <style jsx>{`
      svg path {
        stroke: hsl(var(--primary));
      }
      .dark svg path {
        stroke: hsl(var(--primary-foreground));
      }
    `}</style>
  </svg>
);

export const Icons = {
  Logo: Logo,
  // You can add other icons here and access them via Icons.OtherIcon
  // For example, if you had an OtherIcon component:
  // OtherIcon: OtherIconComponent,
};
