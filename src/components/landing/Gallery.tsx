"use client";

import { useState } from "react";
import Image from "next/image";
import { project } from "@/config/project";

export function Gallery() {
  const [active, setActive] = useState<number | null>(null);
  const item = active !== null ? project.gallery[active] : null;
  return (
    <section id="gallery" className="section mx-auto max-w-6xl">
      <p className="text-xs uppercase tracking-[0.2em] text-emerald">Gallery & walkthrough</p>
      <h2 className="serif mt-2 text-4xl md:text-5xl">See the sample layout, not a stock skyline</h2>
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {project.gallery.map((g, i) => (
          <button key={g.src} className="group text-left" onClick={() => setActive(i)}>
            <Image src={g.src} alt={g.alt} width={700} height={450} className="h-52 w-full rounded-xl object-cover" loading="lazy" />
            <span className="mt-2 block text-sm text-muted">{g.caption}</span>
          </button>
        ))}
      </div>
      <div className="mt-10 overflow-hidden rounded-2xl bg-forest">
        <video className="h-auto w-full" poster={project.walkthrough.poster} controls muted playsInline preload="metadata">
          <source src={project.walkthrough.src} type="video/mp4" />
        </video>
        <p className="px-4 py-3 text-sm text-ivory/80">{project.walkthrough.caption}</p>
      </div>
      {item ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/70 p-4" role="dialog" aria-modal>
          <button className="absolute right-6 top-6 text-ivory" onClick={() => setActive(null)}>
            Close
          </button>
          <figure className="max-w-4xl">
            <Image src={item.src} alt={item.alt} width={1400} height={900} className="rounded-xl" />
            <figcaption className="mt-2 text-ivory">{item.caption}</figcaption>
          </figure>
        </div>
      ) : null}
    </section>
  );
}
