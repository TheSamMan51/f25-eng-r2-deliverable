import type { Database } from "@/lib/schema";
import { updateSpeciesSchema } from "@/lib/validators";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type Species = Database["public"]["Tables"]["species"]["Row"];

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const supabase = createRouteHandlerClient<Database>({ cookies });
  const id = Number(params.id); // ✅ cast to number, since Supabase species.id is numeric

  const json = await req.json();
  const parsed = updateSpeciesSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", issues: parsed.error.format() }, { status: 400 });
  }

  // ✅ cast parsed.data to Partial<Species> so only updated fields are required
  const { data, error } = await supabase
    .from("species")
    .update(parsed.data as Partial<Species>)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
