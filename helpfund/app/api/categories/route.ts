import { NextResponse } from "next/server";
import { listCategories } from "@/lib/services/campaigns";

export async function GET() {
  try {
    const categories = await listCategories();
    return NextResponse.json({ categories });
  } catch (err) {
    console.error("[categories]", err);
    return NextResponse.json(
      { error: "Unable to load categories", categories: [] },
      { status: 500 }
    );
  }
}
