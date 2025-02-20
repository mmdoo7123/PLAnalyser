// components/icons.tsx
import { cn } from "@/lib/utils";
import * as React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export const Icons = {
  google: ({ className, ...props }: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className} // Apply the className prop
      {...props} // Spread any additional props
    >
      <path d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.033s2.701-6.033 6.033-6.033c1.498 0 2.866.548 3.921 1.453l2.814-2.814C17.503 2.332 15.139 1 12.545 1 6.677 1 1.91 5.766 1.91 11.634s4.767 10.634 10.634 10.634c5.762 0 10.456-4.51 10.456-10.634 0-.716-.074-1.416-.216-2.091H12.545z" />
    </svg>
  ),
  spinner: ({ className, ...props }: IconProps) => (
    <svg
      {...props}
      className={cn(className, "animate-spin")} // Add animation class
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  ),
};