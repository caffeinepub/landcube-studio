import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useResetAndClaimAdmin, useSaveProfile } from "../hooks/useQueries";

interface ProfileSetupProps {
  onComplete?: () => void;
}

export default function ProfileSetup({ onComplete }: ProfileSetupProps) {
  const [name, setName] = useState("");
  const [open, setOpen] = useState(true);
  const saveProfile = useSaveProfile();
  const resetAndClaimAdmin = useResetAndClaimAdmin();
  const { actor } = useActor();

  const isPending = saveProfile.isPending || resetAndClaimAdmin.isPending;

  const handleClose = () => {
    setOpen(false);
    onComplete?.();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      // First register the user so they can save a profile
      if (actor) {
        try {
          await actor.selfRegister();
        } catch {
          // Already registered
        }
      }
      await saveProfile.mutateAsync(name.trim());
      // Always use resetAndClaimAdmin so this user becomes admin
      // regardless of any existing state
      await resetAndClaimAdmin.mutateAsync();
      toast.success("Admin access granted!");
      handleClose();
    } catch {
      toast.error("Setup failed. Please try again.");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) handleClose();
      }}
    >
      <DialogContent data-ocid="profile.dialog" className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            Admin Setup
          </DialogTitle>
          <DialogDescription>
            Enter your name to set up your admin profile.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="profile-name">Your Name</Label>
            <Input
              id="profile-name"
              data-ocid="profile.input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Your Name"
              autoFocus
            />
          </div>
          <Button
            data-ocid="profile.submit_button"
            type="submit"
            className="w-full"
            disabled={isPending || !name.trim()}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Setting up...
              </>
            ) : (
              "Set Up Admin Access"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
