import Link from "next/link";
import { project } from "@/config/project";
import { site } from "@/config/site";

export const metadata = { title: "Thank you" };

export default function ThankYouPage() {
  return (
    <main className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="text-xs uppercase tracking-[0.2em] text-emerald">{site.demoBanner}</p>
      <h1 className="serif mt-4 text-4xl">We have your enquiry</h1>
      <p className="mt-4 text-muted">
        A simulated acknowledgement is on your lead record. If you booked {project.name}, use the booking reference and
        calendar file from the confirmation screen.
      </p>
      <Link className="btn btn-primary mt-8" href="/">
        Return to the project
      </Link>
    </main>
  );
}
