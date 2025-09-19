/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Database } from "@/lib/schema";
import { updateSpeciesSchema } from "@/lib/validators";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type Species = Database["public"]["Tables"]["species"]["Row"];

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const supabase = createRouteHandlerClient<Database>({ cookies });
  const id = params.id;

  const json = await req.json();
  const parsed = updateSpeciesSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", issues: parsed.error.format() }, { status: 400 });
  }

  const {
    data,
    error,
  }: {
    data: Species | null;
    error: { message: string } | null;
  } = await supabase.from("species").update(parsed.data).eq("id", id).select().single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
