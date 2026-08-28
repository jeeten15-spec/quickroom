import Link from "next/link";
import { project } from "@/config/project";
import { site } from "@/config/site";

export const metadata = { title: "Sample brochure" };

export default function BrochurePage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <p className="text-xs uppercase tracking-[0.2em] text-gold">Sample document — not a real brochure</p>
      <h1 className="serif mt-2 text-5xl">{project.name}</h1>
      <p className="mt-4">{project.headline}</p>
      <p className="mt-2 text-muted">{project.location}</p>
      <p className="mt-6">
        Indicative from {project.startingPrice} · {project.plotSizes}
      </p>
      <p className="mt-8 text-sm text-muted">{site.disclaimer}</p>
      <Link className="btn btn-primary mt-8" href="/">
        Back to site
      </Link>
    </main>
  );
}
