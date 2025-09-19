/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-misused-promises */

"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import type { Database } from "@/lib/schema";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useState } from "react";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export default function ProfileForm({ profile }: { profile: Profile }) {
  const supabase = createClientComponentClient<Database>();
  const [username, setUsername] = useState(profile.display_name ?? "");
  const [bio, setBio] = useState(profile.biography ?? "");

  const handleSubmit = async () => {
    const { error } = await supabase
      .from("profiles" as any) // 👈 allow any
      .update({ biography: bio, display_name: username } as any) // 👈 allow any
      .eq("id", profile.id);

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
        <Label>Display Name</Label>
        <Input value={username} onChange={(e) => setUsername(e.target.value)} />
      </div>

      <div>
        <Label>Biography</Label>
        <Input value={bio} onChange={(e) => setBio(e.target.value)} />
      </div>

      <Button type="submit">Save Changes</Button>
    </form>
  );
}
