import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { DeskBuilderView } from "./desk-builder-view";

export const metadata: Metadata = {
  title: "Desk Builder",
};

export default function DeskBuilderPage() {
  return (
    <Container className="flex flex-col gap-8 py-8">
      <div>
        <h1 className="text-h2 text-foreground font-bold">Desk Builder</h1>
        <p className="mt-1 text-neutral-400">
          Pick one product per slot to assemble your setup. Add 3 or more and a
          5% bundle discount applies automatically.
        </p>
      </div>

      <DeskBuilderView />
    </Container>
  );
}
