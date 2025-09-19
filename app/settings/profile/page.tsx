import { Separator } from "@/components/ui/separator";
import type { Database } from "@/lib/schema";
import { createServerSupabaseClient } from "@/lib/server-utils";
import { redirect } from "next/navigation";
import ProfileForm from "./profile-form";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

function SettingsError({ message }: { message: string }) {
  return (
    <>
      <h3 className="text-lg font-medium">Error</h3>
      <p>{message}</p>
    </>
  );
}

export default async function Settings() {
  const supabase = createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    // this is a protected route - only users who are signed in can view this route
    redirect("/");
  }

  // ✅ Explicitly type the Supabase response
  const { data, error }: { data: Profile[] | null; error: { message: string } | null } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id);

  if (error) {
    return <SettingsError message={error.message} />;
  }

  if (!data || data.length !== 1) {
    return <SettingsError message="There are duplicate UUIDs. Please contact system administrator" />;
  }

  const profileData = data[0];

  if (!profileData) {
    return <SettingsError message="Profile data not found." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Profile</h3>
        <p className="text-sm text-muted-foreground">This is how others will see you on the site.</p>
      </div>
      <Separator />
      <ProfileForm profile={profileData} />
    </div>
  );
}
