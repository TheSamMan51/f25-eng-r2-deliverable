import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data, error } = await supabase
    .from("comments")
    .select("id, content, created_at, user_id, profiles(username)")
    .eq("species_id", params.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ comments: data });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  if (!body.content || typeof body.content !== "string") {
    return NextResponse.json({ error: "Invalid comment" }, { status: 400 });
  }

  const { error } = await supabase.from("comments").insert({
    user_id: user.id,
    species_id: params.id,
    content: body.content,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
