"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import type { Database } from "@/lib/schema";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useState } from "react";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export default function ProfileForm({ profile }: { profile: Profile }) {
  const supabase = createClientComponentClient<Database>();
  const [username, setUsername] = useState(profile.display_name ?? "");
  const [bio, setBio] = useState(profile.biography ?? "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);

    const updates: ProfileUpdate = {
      display_name: username,
      biography: bio,
    };

    const { error } = await supabase.from("profiles").update(updates).eq("id", profile.id);

    setLoading(false);

    if (error) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void handleSubmit();
      }}
      className="space-y-4"
    >
      <div>
        <Label htmlFor="username">Display Name</Label>
        <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
      </div>

      <div>
        <Label htmlFor="bio">Biography</Label>
        <Textarea id="bio" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
}
