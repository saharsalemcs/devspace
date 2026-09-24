import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";

function HomeHero() {
  return (
    <section
      data-slot="home-hero"
      className="from-surface to-background relative overflow-hidden border-b border-neutral-700 bg-gradient-to-b"
    >
      <div
        aria-hidden
        className="bg-ember-500/20 pointer-events-none absolute top-1/2 left-1/2 size-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
      />

      <Container className="relative flex flex-col items-center gap-6 py-24 text-center">
        <h1 className="text-display text-foreground max-w-3xl">
          Build the desk setup you actually want
        </h1>
        <p className="text-body-lg max-w-xl text-neutral-300">
          Screens, keyboards, mice, lighting and desks &mdash; shop them one by
          one, or assemble a complete setup with the DevSpace Desk Builder.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button
            size="lg"
            className="shadow-ember-glow-lg"
            render={<Link href="/desk-builder" />}
            nativeButton={false}
          >
            Build Your Desk
          </Button>
          <Button
            variant="outline"
            size="lg"
            render={<Link href="/products" />}
            nativeButton={false}
          >
            Shop All Products
          </Button>
        </div>
      </Container>
    </section>
  );
}

export { HomeHero };
