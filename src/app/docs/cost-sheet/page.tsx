import Link from "next/link";
import { project } from "@/config/project";

export const metadata = { title: "Sample cost sheet" };

export default function CostSheetPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <p className="text-xs uppercase tracking-[0.2em] text-gold">Sample cost sheet — figures are placeholders</p>
      <h1 className="serif mt-2 text-4xl">Indicative cost components</h1>
      <table className="mt-8 w-full text-left">
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
      <Link className="mt-8 inline-block underline" href="/">
        Back
      </Link>
    </main>
  );
}
