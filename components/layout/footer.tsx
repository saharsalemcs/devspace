import Link from "next/link"

import { Container } from "@/components/layout/container"

const links = [
  { label: "Products", href: "/products" },
  { label: "Desk Builder", href: "/desk-builder" },
  { label: "Cart", href: "/cart" },
]

function Footer() {
  return (
    <footer
      data-slot="footer"
      className="border-t border-neutral-700 bg-surface"
    >
      <Container className="flex flex-col items-center gap-4 py-10 text-center sm:flex-row sm:justify-between sm:text-left">
        <div className="flex flex-col gap-1">
          <span className="text-h4 font-bold text-foreground">
            Dev<span className="text-accent">Space</span>
          </span>
          <p className="text-body-sm text-neutral-400">
            Build your perfect workspace, one component at a time.
          </p>
        </div>

        <nav className="flex items-center gap-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-body-sm text-muted-foreground hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <p className="text-caption text-neutral-400">
          © {new Date().getFullYear()} DevSpace. All rights reserved.
        </p>
      </Container>
    </footer>
  )
}

export { Footer }
