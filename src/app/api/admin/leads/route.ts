import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { maskPhone } from "@/lib/utils";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format");
  const q = searchParams.get("q") || "";
  const stage = searchParams.get("stage") || "";
  const temperature = searchParams.get("temperature") || "";
  const leads = await prisma.lead.findMany({
    where: {
      AND: [
        q
          ? {
              OR: [
                { name: { contains: q } },
                { phone: { contains: q } },
                { email: { contains: q } },
              ],
            }
          : {},
        stage ? { stage } : {},
        temperature ? { temperature } : {},
      ],
    },
    include: { assignedTo: true, appointments: { orderBy: { startAt: "desc" }, take: 1 } },
    orderBy: { createdAt: "desc" },
  });

  if (format === "csv") {
    const header = "id,name,phone,email,stage,score,temperature,source,utm,createdAt";
    const lines = leads.map((l) =>
      [l.id, l.name, l.phoneNormalized, l.email ?? "", l.stage, l.score, l.temperature, l.source ?? "", l.utmCampaign ?? "", l.createdAt.toISOString()].join(","),
    );
    return new NextResponse([header, ...lines].join("\n"), {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=aurevia-leads.csv",
      },
    });
  }

  return NextResponse.json({
    leads: leads.map((l) => ({
      ...l,
      phoneMasked: maskPhone(l.phoneNormalized),
    })),
  });
}
