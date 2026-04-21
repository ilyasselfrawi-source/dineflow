import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { updateTable, deleteTable, regenerateTableSlug } from "@/lib/services/tableService";
import { UpdateTableSchema } from "@/lib/validators/menu";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { tableId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  // Special action: regenerate QR slug
  if (body.action === "regenerate_slug") {
    try {
      const table = await regenerateTableSlug(params.tableId);
      return NextResponse.json(table);
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
  }

  const parsed = UpdateTableSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const table = await updateTable(params.tableId, parsed.data);
  return NextResponse.json(table);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { tableId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Only admin can delete
  if ((session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await deleteTable(params.tableId);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err.message === "TABLE_HAS_ORDERS") {
      return NextResponse.json(
        { error: "Cannot delete a table that has orders. Deactivate it instead." },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
