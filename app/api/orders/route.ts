import { NextRequest, NextResponse } from "next/server";
import { SubmitOrderSchema } from "@/lib/validators/order";
import { submitOrder } from "@/lib/services/orderService";
import { sseEmitter } from "@/lib/sse/sseEmitter";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const parsed = SubmitOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "VALIDATION_ERROR",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const order = await submitOrder(parsed.data);

    sseEmitter.emit({
      type: "NEW_ORDER",
      payload: {
        orderId: order.id,
        orderNumber: order.orderNumber,
      },
    });

    return NextResponse.json(
      {
        success: true,
        orderId: order.id,
        orderNumber: order.orderNumber,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("[POST /api/orders]", err);

    const knownErrors: Record<string, { status: number; message: string }> = {
      TABLE_NOT_FOUND: { status: 404, message: "Table not found." },
      TABLE_INACTIVE: { status: 400, message: "This table is not currently active." },
      RESTAURANT_CLOSED: { status: 400, message: "The restaurant is currently closed." },
    };

    if (err.message && knownErrors[err.message]) {
      const { status, message } = knownErrors[err.message];
      return NextResponse.json({ error: err.message, message }, { status });
    }

    if (err.message?.startsWith("ITEM_UNAVAILABLE:")) {
      const itemName = err.message.split(":")[1];
      return NextResponse.json(
        { error: "ITEM_UNAVAILABLE", message: `"${itemName}" is no longer available.` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}