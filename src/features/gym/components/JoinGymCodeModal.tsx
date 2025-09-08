import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface JoinGymCodeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function JoinGymCodeModal({ open, onOpenChange, onSuccess }: JoinGymCodeModalProps) {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleJoinGym = async () => {
    if (!code.trim()) {
      toast.error("Please enter a code");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.rpc("redeem_join_code", {
        p_code: code.trim()
      });

      if (error) throw error;

      toast.success("Successfully joined gym!");
      setCode("");
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error joining gym:", error);
      toast.error("Failed to join gym. Please check the code and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Join Gym</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="code">Gym Code</Label>
            <Input
              id="code"
              placeholder="Enter your gym code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !isLoading && handleJoinGym()}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleJoinGym}
              disabled={isLoading || !code.trim()}
              className="flex-1"
            >
              {isLoading ? "Joining..." : "Join Gym"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}