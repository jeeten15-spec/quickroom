import Link from "next/link";
import { site } from "@/config/site";

export const metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="serif text-4xl">Terms (placeholder)</h1>
      <p className="mt-6 whitespace-pre-wrap text-muted">{site.terms}</p>
      <p className="mt-4 text-sm text-muted">{site.disclaimer}</p>
      <Link className="mt-8 inline-block underline" href="/">
        Back
      </Link>
    </main>
  );
}
