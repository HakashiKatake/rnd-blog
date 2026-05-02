import { ReactNode } from "react";
import { ArrowRightIcon, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/retroui/Button";

const BentoGrid = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "grid w-full auto-rows-auto grid-cols-1 gap-4 md:auto-rows-[22rem] md:grid-cols-3",
        className,
      )}
    >
      {children}
    </div>
  );
};

const BentoCard = ({
  name,
  className,
  background,
  Icon,
  description,
  href,
  cta,
}: {
  name: string;
  className?: string;
  background: ReactNode;
  Icon: LucideIcon;
  description: string;
  href: string;
  cta: string;
}) => (
  <div
    key={name}
    className={cn(
      "group relative col-span-3 flex flex-col justify-between overflow-hidden rounded-[1.5rem]",
      // Styles
      "bg-card border-2 border-brutal shadow-brutal",
      // Hover styles
      "transition-all duration-300 hover:shadow-brutal-xl hover:-translate-y-1",
      className,
    )}
  >
    <div>{background}</div>
    <div className="pointer-events-none z-10 flex min-h-[13rem] transform-gpu flex-col gap-3 p-5 transition-all duration-300 md:min-h-0 md:group-hover:-translate-y-10 md:p-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-brutal bg-primary/10">
        <Icon className="h-6 w-6 origin-left transform-gpu text-foreground transition-all duration-300 ease-in-out group-hover:scale-90" />
      </div>
      <h3 className="text-xl font-bold text-card-foreground font-head">
        {name}
      </h3>
      <p className="max-w-lg text-sm text-muted-foreground sm:text-base">
        {description}
      </p>
    </div>

    <div
      className={cn(
        "flex w-full transform-gpu flex-row items-center px-5 pb-5 pt-0 opacity-100 transition-all duration-300 md:pointer-events-none md:absolute md:bottom-0 md:p-4 md:translate-y-10 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100",
      )}
    >
      <Button
        variant="ghost"
        asChild
        size="sm"
        className="pointer-events-auto w-full justify-center rounded-full border-2 border-brutal bg-background md:w-auto"
      >
        <a href={href}>
          {cta}
          <ArrowRightIcon className="ml-2 h-4 w-4" />
        </a>
      </Button>
    </div>
    <div className="pointer-events-none absolute inset-0 transform-gpu transition-all duration-300 group-hover:bg-primary/[.03]" />
  </div>
);

export { BentoGrid, BentoCard };
