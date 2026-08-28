import Link from "next/link";
import { site } from "@/config/site";

export const metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="serif text-4xl">Privacy notice (placeholder)</h1>
      <p className="mt-6 whitespace-pre-wrap text-muted">{site.privacyPolicy}</p>
      <p className="mt-6 text-sm">{site.dataDeletionInstructions}</p>
      <Link className="mt-8 inline-block underline" href="/">
        Back
      </Link>
    </main>
  );
}
