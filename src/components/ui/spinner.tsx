import { cn } from "@/lib/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  label?: string;
}

// 사이즈별 크기 클래스
const sizeClasses = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-10 w-10 border-4",
  xl: "h-16 w-16 border-4",
};

export function Spinner({ size = "md", className, label = "로딩 중..." }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label={label}
      className={cn("inline-block", className)}
    >
      <div
        className={cn(
          "rounded-full border-muted border-t-primary animate-spin",
          sizeClasses[size]
        )}
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}
