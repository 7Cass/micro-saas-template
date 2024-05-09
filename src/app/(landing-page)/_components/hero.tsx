"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="h-[calc(100vh_-_80px)] max-w-4xl text-center flex flex-col items-center justify-center gap-8">
      <h1 className="text-8xl font-bold">Manage Your Tasks in One Place</h1>
      <h2 className="text-xl font-light text-center max-w-lg mx-auto">
        Track and maintain every aspect of your tasks with Tasked
      </h2>
      <Button className="space-x-2 font-semibold text-md">
        <Link href={"/app"}>Go to Dashboard</Link>
      </Button>
    </section>
  );
}
