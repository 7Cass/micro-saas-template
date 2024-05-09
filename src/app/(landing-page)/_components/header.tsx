import { Logo } from "@/components/logo";
import Link from "next/link";
import ThemeSwitcher from "./theme-switcher";

export default function Header() {
  return (
    <header className="px-24 flex items-center justify-between w-full h-20">
      <div className="flex items-center gap-2">
        <Logo className="bg-primary" />
        <h1 className="text-2xl font-bold">Tasked</h1>
      </div>
      <nav className="flex items-center justify-between gap-8">
        <Link href={"#features"} className="text-sm text-muted-foreground">
          Features
        </Link>
        <Link href={"#features"} className="text-sm text-muted-foreground">
          Pricing
        </Link>
        <Link href={"#features"} className="text-sm text-muted-foreground">
          Changelog
        </Link>
        <Link href={"#features"} className="text-sm text-muted-foreground">
          Roadmap
        </Link>
      </nav>
      <ThemeSwitcher />
    </header>
  );
}
