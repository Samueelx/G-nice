import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTimeAgo(dateString: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMins = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

  if (diffInMins < 1) return "Just Now";
  if (diffInMins < 60) return `${diffInMins} min`;
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? "s" : ""}`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 2) return `${diffInDays} day`;

  const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: '2-digit' };
  return date.toLocaleDateString('en-GB', options).replace(/,/g, '');
}
