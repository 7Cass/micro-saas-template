import { cn } from "@/lib/utils";
import { RocketIcon } from "@radix-ui/react-icons";

export type LogoGenericProps<T = unknown> = {
  className?: string;
  children?: React.ReactNode;
} & T;

export function Logo({ className, children }: LogoGenericProps) {
  return (
    <div
      className={cn([
        className,
        "h-8 w-8 flex items-center justify-center rounded-md",
      ])}
    >
      {children && children}
      {!children && <RocketIcon className="w-5 h-5 text-primary-foreground" />}
    </div>
  );
}
