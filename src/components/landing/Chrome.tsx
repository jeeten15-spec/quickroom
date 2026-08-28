"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { site } from "@/config/site";
import { project } from "@/config/project";
import { messageTemplates } from "@/config/templates";
import { interpolate } from "@/lib/utils";
import { whatsappPrefillHref } from "@/services/adapters";

const nav = [
  { href: "#highlights", label: "Project" },
  { href: "#gallery", label: "Gallery" },
  { href: "#location", label: "Location" },
  { href: "#pricing", label: "Pricing" },
  { href: "#documents", label: "Documents" },
  { href: "#faq", label: "FAQ" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const wa = whatsappPrefillHref(
    site.whatsappE164,
    interpolate(messageTemplates.whatsapp_prefill.body, { project: project.name }),
  );
  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-ivory/95 backdrop-blur">
      <p className="bg-forest px-4 py-1.5 text-center text-[11px] tracking-wide text-ivory">{site.demoBanner}</p>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Image src={site.logoSrc} alt="" width={36} height={36} />
          <span className="serif text-xl leading-none">
            {site.logoText}
            <span className="block text-[10px] font-sans uppercase tracking-[0.2em] text-muted">{site.companyName}</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-5 text-sm lg:flex">
          {nav.map((item) => (
            <a key={item.href} href={item.href} className="text-muted hover:text-charcoal">
              {item.label}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <a className="btn btn-secondary px-3 py-2 text-sm" href={`tel:${site.phoneTel}`}>
            Call now
          </a>
          <a className="btn btn-secondary px-3 py-2 text-sm" href={wa} target="_blank" rel="noreferrer">
            WhatsApp us
          </a>
          <a className="btn btn-primary px-3 py-2 text-sm" href="#book">
            Book site visit
          </a>
        </div>
        <button className="md:hidden" aria-expanded={open} aria-controls="mnav" onClick={() => setOpen(!open)}>
          Menu
        </button>
      </div>
      {open ? (
        <div id="mnav" className="border-t border-line px-4 py-3 md:hidden">
          {nav.map((item) => (
            <a key={item.href} href={item.href} className="block py-2" onClick={() => setOpen(false)}>
              {item.label}
            </a>
          ))}
          <div className="mt-2 flex flex-col gap-2">
            <a className="btn btn-secondary" href={`tel:${site.phoneTel}`}>
              Call now
            </a>
            <a className="btn btn-primary" href="#book">
              Book site visit
            </a>
          </div>
        </div>
      ) : null}
    </header>
  );
}

export function StickyCtas() {
  const wa = whatsappPrefillHref(
    site.whatsappE164,
    interpolate(messageTemplates.whatsapp_prefill.body, { project: project.name }),
  );
  return (
    <>
      <a
        href={wa}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-20 right-4 z-30 hidden h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-sm font-medium text-white shadow-lg md:flex"
        aria-label="Open WhatsApp with a pre-filled enquiry"
      >
        WA
      </a>
      <div className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 gap-px bg-forest text-ivory md:hidden">
        <a className="py-3 text-center text-sm" href={`tel:${site.phoneTel}`}>
          Call
        </a>
        <a className="py-3 text-center text-sm" href={wa}>
          WhatsApp
        </a>
        <a className="bg-gold py-3 text-center text-sm text-charcoal" href="#book">
          Book visit
        </a>
      </div>
    </>
  );
}

export function ExitIntent() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (sessionStorage.getItem("aurevia-exit")) return;
    const on = (e: MouseEvent) => {
      if (e.clientY < 8) {
        setShow(true);
        sessionStorage.setItem("aurevia-exit", "1");
        document.removeEventListener("mouseout", on);
      }
    };
    document.addEventListener("mouseout", on);
    return () => document.removeEventListener("mouseout", on);
  }, []);
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 p-4" role="dialog" aria-modal>
      <div className="max-w-md rounded-2xl bg-ivory p-6">
        <p className="text-sm text-emerald">Before you go</p>
        <h2 className="serif text-3xl">Want the cost sheet instead?</h2>
        <p className="mt-2 text-sm text-muted">One enquiry, no fake countdown. Shown once per visit on desktop.</p>
        <div className="mt-4 flex gap-2">
          <a className="btn btn-primary" href="#enquire" onClick={() => setShow(false)}>
            Request cost sheet
          </a>
          <button className="btn btn-secondary" onClick={() => setShow(false)}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
