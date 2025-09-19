"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import type { Database } from "@/lib/schema";
import { updateSpeciesSchema } from "@/lib/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { type z } from "zod";

type Species = Database["public"]["Tables"]["species"]["Row"];

interface SpeciesEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  species: Species;
}

export default function SpeciesEditDialog({ open, onOpenChange, species }: SpeciesEditDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof updateSpeciesSchema>>({
    resolver: zodResolver(updateSpeciesSchema),
    defaultValues: {
      scientific_name: species.scientific_name ?? "",
      common_name: species.common_name ?? "",
      kingdom: species.kingdom ?? "",
      total_population: species.total_population ?? 0,
      description: species.description ?? "",
      image: species.image ?? "",
    },
  });

  const onSubmit = (values: z.infer<typeof updateSpeciesSchema>) => {
    startTransition(() => {
      void (async () => {
        const response = await fetch(`/api/species/${species.id}`, {
          method: "PUT",
          body: JSON.stringify(values),
        });

        if (response.ok) {
          toast({
            title: "Species updated",
            description: `${values.scientific_name} has been updated.`,
          });
          onOpenChange(false);
          router.refresh();
        } else {
          toast({
            title: "Error",
            description: "Failed to update species.",
            variant: "destructive",
          });
        }
      })();
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Species</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            void form.handleSubmit(onSubmit)(e); // ✅ wrapped in void
          }}
          className="space-y-4"
        >
          <div className="grid gap-2">
            <Label>Scientific Name</Label>
            <Input {...form.register("scientific_name")} />
          </div>
          <div className="grid gap-2">
            <Label>Common Name</Label>
            <Input {...form.register("common_name")} />
          </div>
          <div className="grid gap-2">
            <Label>Kingdom</Label>
            <Input {...form.register("kingdom")} />
          </div>
          <div className="grid gap-2">
            <Label>Total Population</Label>
            <Input type="number" {...form.register("total_population")} />
          </div>
          <div className="grid gap-2">
            <Label>Image URL</Label>
            <Input {...form.register("image")} />
          </div>
          <div className="grid gap-2">
            <Label>Description</Label>
            <Textarea rows={4} {...form.register("description")} />
          </div>
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
