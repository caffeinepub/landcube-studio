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
import {
  useClaimAdmin,
  useSaveProfile,
  useSelfRegister,
} from "../hooks/useQueries";

interface ProfileSetupProps {
  onComplete?: () => void;
}

export default function ProfileSetup({ onComplete }: ProfileSetupProps) {
  const [name, setName] = useState("");
  const [open, setOpen] = useState(true);
  const saveProfile = useSaveProfile();
  const selfRegister = useSelfRegister();
  const claimAdmin = useClaimAdmin();

  const isPending = saveProfile.isPending || selfRegister.isPending;

  const handleClose = () => {
    setOpen(false);
    onComplete?.();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      // selfRegister may fail if already registered — that's ok, continue anyway
      try {
        await selfRegister.mutateAsync();
      } catch {
        // Already registered, proceed to save profile
      }
      await saveProfile.mutateAsync(name.trim());
      // Try to claim admin silently — succeeds only if no admin exists yet
      try {
        await claimAdmin.mutateAsync();
      } catch {
        // Ignore — admin already exists
      }
      toast.success("Profile saved");
      handleClose();
    } catch {
      toast.error("Failed to save profile. Please try again.");
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
          <DialogTitle className="font-display text-xl">Welcome</DialogTitle>
          <DialogDescription>
            Please enter your name to set up your profile.
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
              placeholder="e.g. Maria Santos"
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
              "Continue"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
