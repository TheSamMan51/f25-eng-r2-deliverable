import { Button } from "@/components/ui/button";
import { createServerSupabaseClient } from "@/lib/server-utils";
import Link from "next/link";
import UserNav from "./user-nav";

export default async function AuthStatus() {
  // Create supabase server component client and obtain user session from stored cookie
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <Button asChild>
        <Link href="/login">Log in</Link>
      </Button>
    );
  }

  const { data, error } = await supabase.from("profiles").select().eq("id", user.id);

  if (error ?? data.length !== 1) {
    return null; // 👈 explicitly return null instead of nothing
  }

  const profileData = data[0];
  if (!profileData) {
    return null;
  }

  return <UserNav profile={profileData} />;
}
