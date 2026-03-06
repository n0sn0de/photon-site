import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: string;
  title: string;
  value: string;
  sub?: string;
  footer?: string;
  featured?: boolean;
  progress?: number;
  tokenIcon?: "photon" | "atone";
  children?: React.ReactNode;
}

export function StatCard({
  icon,
  title,
  value,
  sub,
  footer,
  featured,
  progress,
  tokenIcon,
  children,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "bg-bg-card rounded-xl border border-border p-5 transition-colors hover:border-border-accent hover:bg-bg-card-hover",
        featured && "border-accent/20 bg-bg-card col-span-full md:col-span-1"
      )}
    >
      <div className="flex items-center gap-2 mb-3">
        {tokenIcon ? (
          <img
            src={`/assets/${tokenIcon}.svg`}
            alt={tokenIcon.toUpperCase()}
            className="w-5 h-5"
          />
        ) : (
          <span className="text-lg">{icon}</span>
        )}
        <span className="text-xs font-mono uppercase tracking-wider text-text-muted">
          {title}
        </span>
      </div>
      <div className="text-2xl md:text-3xl font-mono font-medium text-text-primary mb-1">
        {value}
      </div>
      {sub && <div className="text-sm text-text-muted">{sub}</div>}
      {progress !== undefined && (
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      )}
      {footer && (
        <div className="text-xs text-text-secondary mt-2 font-mono">
          {footer}
        </div>
      )}
      {children}
    </div>
  );
}
