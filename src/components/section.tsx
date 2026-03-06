import { cn } from "@/lib/utils";

interface SectionProps {
  tag?: string;
  title: string;
  desc?: string;
  dark?: boolean;
  id?: string;
  children: React.ReactNode;
}

export function Section({ tag, title, desc, dark, id, children }: SectionProps) {
  return (
    <section id={id} className={cn("section", dark && "section-dark")}>
      <div className="max-w-container mx-auto px-4 md:px-8">
        <div className="mb-10">
          {tag && (
            <span className="text-xs font-mono uppercase tracking-widest text-accent mb-3 block">
              {tag}
            </span>
          )}
          <h2 className="text-3xl md:text-4xl font-display text-text-primary mb-3">
            {title}
          </h2>
          {desc && (
            <p className="text-text-secondary max-w-2xl text-base leading-relaxed">
              {desc}
            </p>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}
