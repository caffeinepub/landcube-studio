import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAboutContent, useUpdateAboutContent } from "../hooks/useQueries";

interface AboutFormProps {
  onCancel: () => void;
}

export default function AboutForm({ onCancel }: AboutFormProps) {
  const { data: about } = useAboutContent();
  const [name, setName] = useState(about?.name ?? "");
  const [tagline, setTagline] = useState(about?.tagline ?? "");
  const [bio, setBio] = useState(about?.bio ?? "");
  const [contactEmail, setContactEmail] = useState(about?.contactEmail ?? "");
  const updateAbout = useUpdateAboutContent();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateAbout.mutateAsync({ name, tagline, bio, contactEmail });
      toast.success("About content updated");
      onCancel();
    } catch {
      toast.error("Failed to update about content");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="about-name">Name</Label>
        <Input
          id="about-name"
          data-ocid="about.input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your full name"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="about-tagline">Tagline</Label>
        <Input
          id="about-tagline"
          data-ocid="about.input"
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          placeholder="e.g. Designing spaces that breathe"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="about-bio">Bio</Label>
        <Textarea
          id="about-bio"
          data-ocid="about.textarea"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell your story..."
          rows={6}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="about-email">Contact Email</Label>
        <Input
          id="about-email"
          data-ocid="about.input"
          type="email"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
          placeholder="you@studio.com"
        />
      </div>
      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          data-ocid="about.submit_button"
          disabled={updateAbout.isPending}
          className="flex-1"
        >
          {updateAbout.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
        <Button
          type="button"
          data-ocid="about.cancel_button"
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
