import { createFileRoute } from "@tanstack/react-router";
import EtherealBeamsHero from "@/components/ui/ethereal-beams-hero";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Jassu Cheats — Free Fire Addons Marketplace" },
      { name: "description", content: "Premium Free Fire addons, skins and tools with instant delivery and 24/7 support." },
      { property: "og:title", content: "Jassu Cheats — Free Fire Addons Marketplace" },
      { property: "og:description", content: "Premium Free Fire addons, skins and tools with instant delivery." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return <EtherealBeamsHero />;
}
