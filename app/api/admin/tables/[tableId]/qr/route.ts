import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { getTableById } from "@/lib/services/tableService";
import { generateQRCodeDataURL, generateQRCodeSVG, getTableQRUrl } from "@/lib/utils/qrUtils";

export async function GET(
  request: NextRequest,
  { params }: { params: { tableId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const table = await getTableById(params.tableId);
  if (!table) return NextResponse.json({ error: "Table not found" }, { status: 404 });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const qrUrl = getTableQRUrl(table.slug, baseUrl);

  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") || "dataurl";

  if (format === "svg") {
    const svg = await generateQRCodeSVG(qrUrl);
    return new Response(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Content-Disposition": `attachment; filename="table-${table.number}-qr.svg"`,
      },
    });
  }

  // Return data URL + metadata for preview
  const dataUrl = await generateQRCodeDataURL(qrUrl);
  return NextResponse.json({
    tableId: table.id,
    tableNumber: table.number,
    qrUrl,
    dataUrl,
  });
}
