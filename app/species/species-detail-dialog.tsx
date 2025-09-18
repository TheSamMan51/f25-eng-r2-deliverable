"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { Database } from "@/lib/schema";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";

type Species = Database["public"]["Tables"]["species"]["Row"];
type Comment = Database["public"]["Tables"]["comments"]["Row"];

interface SpeciesDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  species: Species;
  userId: string; // 👈 new prop
}

export default function SpeciesDetailDialog({ open, onOpenChange, species, userId }: SpeciesDetailDialogProps) {
  const supabase = createClientComponentClient<Database>();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");

  // Fetch comments for this species
  useEffect(() => {
    if (!species.id) return;

    const fetchComments = async () => {
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("species_id", species.id)
        .order("created_at", { ascending: false });

      if (!error && data) setComments(data);
    };

    fetchComments();
  }, [supabase, species.id]);

  // Add comment
  const handleAddComment = async () => {
    if (!newComment.trim() || !userId) return;

    const { data, error } = await supabase
      .from("comments")
      .insert([{ content: newComment.trim(), user_id: userId, species_id: species.id }])
      .select()
      .single();

    if (!error && data) {
      setComments((prev) => [data, ...prev]);
      setNewComment("");
    }
  };

  // Delete comment
  const handleDeleteComment = async (id: string) => {
    const { error } = await supabase.from("comments").delete().eq("id", id);

    if (!error) {
      setComments((prev) => prev.filter((c) => c.id !== id));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{species.scientific_name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-2 pt-2">
          <p className="italic text-muted-foreground">{species.common_name}</p>

          <div>
            <strong>Kingdom:</strong> <span>{species.kingdom ?? "Unknown"}</span>
          </div>
          <div>
            <strong>Total Population:</strong> <span>{species.total_population ?? "Unknown"}</span>
          </div>
          <div>
            <strong>Description:</strong>
            <p className="mt-1 whitespace-pre-line">{species.description ?? "No description available."}</p>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-6 space-y-3">
          <h3 className="text-lg font-semibold">Comments</h3>

          {/* Add Comment Form */}
          <div className="flex gap-2">
            <Input
              placeholder="Leave a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <Button onClick={handleAddComment} disabled={!newComment.trim()}>
              Post
            </Button>
          </div>

          {/* Comments List */}
          <div className="max-h-60 space-y-3 overflow-y-auto border-t pt-3">
            {comments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No comments yet. Be the first!</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex items-start justify-between border-b pb-2">
                  <p className="text-sm">{comment.content}</p>
                  {comment.user_id === userId && (
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteComment(comment.id)}>
                      Delete
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
