import Image from "next/image";
import Link from "next/link";
import { site } from "@/config/site";
import { project } from "@/config/project";
import { offer } from "@/config/offer";
import { retainer } from "@/config/retainer";
import { EnquiryExperience } from "@/components/enquiry/EnquiryExperience";
import { ExitIntent, Header, StickyCtas } from "@/components/landing/Chrome";
import { Gallery } from "@/components/landing/Gallery";
import { messageTemplates } from "@/config/templates";
import { interpolate } from "@/lib/utils";
import { whatsappPrefillHref } from "@/services/adapters";

export default function HomePage() {
  const wa = whatsappPrefillHref(
    site.whatsappE164,
    interpolate(messageTemplates.whatsapp_prefill.body, { project: project.name }),
  );

  return (
    <>
      <Header />
      <StickyCtas />
      <ExitIntent />
      <main className="pb-24 md:pb-0">
        <section className="relative min-h-[88vh] overflow-hidden">
          <Image src={project.hero.image} alt={project.hero.alt} fill priority className="object-cover" />
          <video
            className="absolute inset-0 hidden h-full w-full object-cover md:block"
            autoPlay
            muted
            loop
            playsInline
            poster={project.hero.poster}
            aria-hidden
          >
            <source src={project.hero.video} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/35 to-charcoal/20" />
          <div className="relative mx-auto flex min-h-[88vh] max-w-6xl flex-col justify-end px-4 pb-16 pt-28 text-ivory">
            <p className="text-sm uppercase tracking-[0.25em] text-gold">{project.locationShort}</p>
            <h1 className="serif mt-3 max-w-3xl text-4xl leading-tight md:text-6xl">{project.headline}</h1>
            <p className="mt-4 max-w-xl text-lg text-ivory/85">{project.valueProposition}</p>
            <p className="mt-4 text-sm">
              {project.type} · {project.plotSizes} · Indicative from {project.startingPrice}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a className="btn btn-gold" href="#book">
                Book a free site visit
              </a>
              <a className="btn bg-ivory/10 text-ivory ring-1 ring-ivory/50" href="#enquire">
                Get price & availability
              </a>
              <a className="btn bg-ivory/10 text-ivory ring-1 ring-ivory/50" href={wa} target="_blank" rel="noreferrer">
                WhatsApp
              </a>
            </div>
            <dl className="mt-10 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
              <div className="rounded-xl bg-ivory/10 p-3 ring-1 ring-ivory/20">
                <dt className="text-ivory/60">RERA</dt>
                <dd>Demo placeholder</dd>
              </div>
              <div className="rounded-xl bg-ivory/10 p-3 ring-1 ring-ivory/20">
                <dt className="text-ivory/60">Location</dt>
                <dd>Mokila corridor</dd>
              </div>
              <div className="rounded-xl bg-ivory/10 p-3 ring-1 ring-ivory/20">
                <dt className="text-ivory/60">Plot sizes</dt>
                <dd>{project.plotSizes}</dd>
              </div>
              <div className="rounded-xl bg-ivory/10 p-3 ring-1 ring-ivory/20">
                <dt className="text-ivory/60">Visits</dt>
                <dd>{project.status}</dd>
              </div>
            </dl>
          </div>
        </section>

        <section id="enquire" className="section mx-auto grid max-w-6xl gap-10 md:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald">Quick enquiry</p>
            <h2 className="serif mt-2 text-4xl">Tell us what you need. We will not dump a long form on you.</h2>
            <p className="mt-4 text-muted">
              After you send name and mobile, a short conversation qualifies the requirement. WhatsApp buttons on this
              page open a <code className="text-sm">wa.me</code> chat — they cannot read replies or book slots by themselves.
            </p>
            <p className="mt-4 text-sm text-muted">{project.offer}</p>
          </div>
          <EnquiryExperience />
        </section>

        <section id="highlights" className="bg-sand/40">
          <div className="section mx-auto max-w-6xl">
            <h2 className="serif text-4xl">Project highlights</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {project.highlights.map((h) => (
                <div key={h.label} className="rounded-2xl bg-ivory p-5 ring-1 ring-line">
                  <p className="text-xs uppercase tracking-widest text-muted">{h.label}</p>
                  <p className="mt-2 text-lg">{h.value}</p>
                </div>
              ))}
            </div>
            <ul className="mt-8 grid gap-2 text-sm text-muted md:grid-cols-2">
              {project.landmarks.slice(0, 4).map((l) => (
                <li key={l.name}>
                  {l.name}: {l.note}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="section mx-auto max-w-6xl">
          <h2 className="serif text-4xl">Why consider this sample project</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {project.whyConsider.map((w) => (
              <article key={w.title}>
                <h3 className="serif text-2xl">{w.title}</h3>
                <p className="mt-2 text-muted">{w.body}</p>
              </article>
            ))}
          </div>
        </section>

        <Gallery />

        <section className="bg-forest text-ivory">
          <div className="section mx-auto max-w-6xl">
            <h2 className="serif text-4xl">Amenities (sample)</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {project.amenities.map((a) => (
                <div key={a.title} className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                  <p className="text-gold text-xs uppercase">{a.icon}</p>
                  <h3 className="mt-2 font-medium">{a.title}</h3>
                  <p className="mt-1 text-sm text-ivory/75">{a.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="location" className="section mx-auto max-w-6xl">
          <h2 className="serif text-4xl">Location advantages</h2>
          <p className="mt-2 max-w-2xl text-muted">
            Travel times are illustrative unless independently verified. This is real estate in Hyderabad’s west
            corridor — plots in Mokila, with properties near Financial District as a commute reference, not a promise.
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="relative min-h-72 overflow-hidden rounded-2xl">
              <Image src="/media/location.jpg" alt="Illustrative map-style artwork for Mokila–Shankarpally" fill className="object-cover" />
            </div>
            <div>
              <div className="flex flex-wrap gap-3">
                <a className="btn btn-primary" href={project.map.mapsUrl} target="_blank" rel="noreferrer">
                  Open in Maps
                </a>
                <a className="btn btn-secondary" href={project.map.directionsUrl} target="_blank" rel="noreferrer">
                  Get directions
                </a>
              </div>
              <div className="mt-6 grid gap-3">
                {project.landmarks.map((l) => (
                  <div key={l.name} className="rounded-xl bg-white p-4 ring-1 ring-line">
                    <p className="font-medium">{l.name}</p>
                    <p className="text-sm text-muted">{l.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="bg-sand/40">
          <div className="section mx-auto max-w-6xl">
            <h2 className="serif text-4xl">Pricing & availability</h2>
            <p className="mt-2 text-muted">
              Indicative starting price {project.startingPrice}. Prices and availability are subject to confirmation.
              No countdown clocks on this page.
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {project.plotSizeOptions.map((p) => (
                <div key={p.label} className="rounded-2xl bg-ivory p-5 ring-1 ring-line">
                  <p className="serif text-3xl">{p.label}</p>
                  <p className="mt-2 text-sm text-muted">{p.note}</p>
                </div>
              ))}
            </div>
            <table className="mt-8 w-full text-left text-sm">
              <tbody>
                {project.costComponents.map((c) => (
                  <tr key={c.label} className="border-b border-line">
                    <td className="py-3">{c.label}</td>
                    <td>{c.value}</td>
                    <td className="text-muted">{c.fact}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-6 flex flex-wrap gap-3">
              <a className="btn btn-primary" href="#enquire">
                Request complete cost sheet
              </a>
              <a className="btn btn-secondary" href="#enquire">
                Check current availability
              </a>
            </div>
          </div>
        </section>

        <section className="section mx-auto max-w-6xl">
          <h2 className="serif text-4xl">How a considered purchase works</h2>
          <ol className="mt-8 grid gap-4 md:grid-cols-5">
            {project.process.map((p) => (
              <li key={p.step} className="rounded-2xl bg-white p-4 ring-1 ring-line">
                <span className="text-gold">{String(p.step).padStart(2, "0")}</span>
                <h3 className="mt-2 font-medium">{p.title}</h3>
                <p className="mt-2 text-sm text-muted">{p.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="bg-ivory">
          <div className="section mx-auto max-w-6xl">
            <h2 className="serif text-4xl">Credibility — labelled as demo</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {project.stats.map((s) => (
                <div key={s.label} className="rounded-2xl bg-white p-5 ring-1 ring-line">
                  <p className="serif text-4xl text-emerald">{s.value}</p>
                  <p className="mt-2 text-sm text-muted">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {project.testimonials.map((t) => (
                <blockquote key={t.name} className="rounded-2xl bg-white p-5 ring-1 ring-line">
                  <p>“{t.quote}”</p>
                  <footer className="mt-3 text-sm text-muted">
                    {t.name} · {t.role}
                  </footer>
                </blockquote>
              ))}
            </div>
            <div className="mt-8 rounded-2xl bg-white p-5 ring-1 ring-line">
              <p className="font-medium">{project.salesTeam.name}</p>
              <p className="text-sm text-muted">
                {project.salesTeam.role} · {project.salesTeam.phone} · {project.salesTeam.email}
              </p>
              <p className="mt-2 text-sm">{project.salesTeam.bio}</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {project.partners.map((p) => (
                <span key={p} className="rounded-full bg-sand px-3 py-1 text-sm">
                  {p}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section id="documents" className="section mx-auto max-w-6xl">
          <h2 className="serif text-4xl">Documents & due diligence</h2>
          <p className="mt-3 max-w-2xl text-muted">
            Independently verify title, approvals, measurements, pricing, taxes and contractual terms before purchase.
            Every file below is a sample placeholder.
          </p>
          <ul className="mt-8 grid gap-3 md:grid-cols-3">
            {project.documents.map((d) => (
              <li key={d.title} className="rounded-xl bg-white p-4 ring-1 ring-line">
                <p className="font-medium">{d.title}</p>
                <p className="text-sm text-muted">{d.note}</p>
                <Link className="mt-2 inline-block text-sm underline" href="/docs/brochure">
                  Open sample
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section id="faq" className="bg-sand/40">
          <div className="section mx-auto max-w-6xl">
            <h2 className="serif text-4xl">Questions buyers actually ask</h2>
            <div className="mt-8 space-y-3">
              {project.faqs.map((f) => (
                <details key={f.q} className="rounded-xl bg-ivory p-4 ring-1 ring-line">
                  <summary className="cursor-pointer font-medium">{f.q}</summary>
                  <p className="mt-2 text-muted">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section id="book" className="section mx-auto grid max-w-6xl gap-10 md:grid-cols-2">
          <div>
            <h2 className="serif text-4xl">Book a property site visit</h2>
            <p className="mt-3 text-muted">
              Hyderabad real-estate consultant desk for this demonstration brand. Privacy respected; no spam sequences
              unless you opt in. Production WhatsApp reminders need an approved Business account — this demo simulates
              them.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a className="btn btn-secondary" href={`tel:${site.phoneTel}`}>
                Call {site.phone}
              </a>
              <a className="btn btn-secondary" href={wa} target="_blank" rel="noreferrer">
                WhatsApp
              </a>
            </div>
            <p className="mt-8 text-sm text-muted">{retainer.customerReferralPrompt}</p>
          </div>
          <EnquiryExperience heading="Final enquiry" />
        </section>

        <section className="border-t border-line bg-white">
          <div className="section mx-auto max-w-6xl text-sm text-muted">
            <h2 className="serif text-2xl text-charcoal">What this template sells (for consultants)</h2>
            <p className="mt-2">
              {offer.packageName} for {offer.niche}. {offer.priceInr} ({offer.priceUsdNote}). Deposit: {offer.deposit}.
              After launch: {offer.retainer.name} at {offer.retainer.monthlyInr}/month.
            </p>
          </div>
        </section>
      </main>
      <footer className="border-t border-line bg-forest px-4 py-12 text-ivory">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
          <div>
            <p className="serif text-2xl">{site.companyName}</p>
            <p className="mt-2 text-sm text-ivory/70">{site.officeAddress}</p>
            <p className="mt-2 text-sm">
              {site.phone} · {site.email} · WhatsApp {site.whatsapp}
            </p>
          </div>
          <div className="text-sm">
            <Link className="block underline" href="/privacy">
              Privacy
            </Link>
            <Link className="block underline" href="/terms">
              Terms
            </Link>
            <Link className="block underline" href="/admin">
              Sales dashboard
            </Link>
            <p className="mt-3">RERA: {project.rera}</p>
          </div>
          <div className="text-sm text-ivory/70">
            <p>{site.disclaimer}</p>
            <div className="mt-3 flex gap-3">
              <a href={site.social.instagram}>Instagram</a>
              <a href={site.social.linkedin}>LinkedIn</a>
              <a href={site.social.youtube}>YouTube</a>
            </div>
            <p className="mt-4 text-xs">{site.demoBanner}</p>
          </div>
        </div>
      </footer>
    </>
  );
}
