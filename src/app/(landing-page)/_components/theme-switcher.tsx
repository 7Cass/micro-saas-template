"use client";

import { Switch } from "@/components/ui/switch";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { useTheme } from "next-themes";

export default function ThemeSwitcher() {
  const theme = useTheme();

  const toggleTheme = (checked: boolean): void => {
    theme.setTheme(checked ? "dark" : "light");
  };

  return (
    <div className="flex items-center gap-2">
      <SunIcon />
      <Switch onCheckedChange={toggleTheme} />
      <MoonIcon />
    </div>
  );
}
