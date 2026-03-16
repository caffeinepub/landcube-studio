import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ImageIcon, Loader2, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { Project } from "../backend";
import { useImageUpload } from "../hooks/useImageUpload";
import { useCreateProject, useUpdateProject } from "../hooks/useQueries";

const CATEGORIES = [
  "Residential",
  "Commercial",
  "Public",
  "Interior",
  "Landscape",
];

interface ProjectFormProps {
  project?: Project | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ProjectForm({
  project,
  onSuccess,
  onCancel,
}: ProjectFormProps) {
  const [title, setTitle] = useState(project?.title ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [category, setCategory] = useState(project?.category ?? "");
  const [year, setYear] = useState(
    project ? String(Number(project.year)) : String(new Date().getFullYear()),
  );
  const [location, setLocation] = useState(project?.location ?? "");
  const [featured, setFeatured] = useState(project?.featured ?? false);
  const [imageIds, setImageIds] = useState<string[]>(project?.imageIds ?? []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { upload, progress, isUploading } = useImageUpload();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const isPending = createProject.isPending || updateProject.isPending;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    try {
      const hashes = await Promise.all(files.map((f) => upload(f)));
      setImageIds((prev) => [...prev, ...hashes]);
      toast.success(
        `${files.length} image${files.length > 1 ? "s" : ""} uploaded`,
      );
    } catch {
      toast.error("Image upload failed");
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (idx: number) => {
    setImageIds((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !category || !year) return;
    const data = {
      title: title.trim(),
      description: description.trim(),
      category,
      year: BigInt(year),
      location: location.trim(),
      imageIds,
      featured,
    };
    try {
      if (project) {
        await updateProject.mutateAsync({ id: project.id, ...data });
        toast.success("Project updated");
      } else {
        await createProject.mutateAsync(data);
        toast.success("Project created");
      }
      onSuccess();
    } catch {
      toast.error("Failed to save project");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="proj-title">Title *</Label>
        <Input
          id="proj-title"
          data-ocid="project.input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Meridian House"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="proj-desc">Description</Label>
        <Textarea
          id="proj-desc"
          data-ocid="project.textarea"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the project, its context and materials..."
          rows={4}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Category *</Label>
          <Select value={category} onValueChange={setCategory} required>
            <SelectTrigger data-ocid="project.select">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="proj-year">Year *</Label>
          <Input
            id="proj-year"
            data-ocid="project.input"
            type="number"
            min="1900"
            max="2100"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="proj-location">Location</Label>
        <Input
          id="proj-location"
          data-ocid="project.input"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g. Lisbon, Portugal"
        />
      </div>

      {/* Images */}
      <div className="space-y-3">
        <Label>Images</Label>
        {imageIds.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {imageIds.map((id, i) => (
              <div key={id} className="relative group">
                <div className="w-20 h-20 bg-secondary flex items-center justify-center overflow-hidden">
                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                </div>
                <button
                  type="button"
                  data-ocid={`project.delete_button.${i + 1}`}
                  onClick={() => removeImage(i)}
                  className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            type="button"
            data-ocid="project.upload_button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Upload Images
              </>
            )}
          </Button>
        </div>
        {isUploading && (
          <Progress
            data-ocid="project.loading_state"
            value={progress}
            className="h-1"
          />
        )}
      </div>

      {/* Featured toggle */}
      <div className="flex items-center justify-between py-2 border-t border-border">
        <Label htmlFor="proj-featured" className="cursor-pointer">
          Featured Project
        </Label>
        <Switch
          id="proj-featured"
          data-ocid="project.switch"
          checked={featured}
          onCheckedChange={setFeatured}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          data-ocid="project.submit_button"
          disabled={isPending || isUploading}
          className="flex-1"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Saving...
            </>
          ) : project ? (
            "Update Project"
          ) : (
            "Create Project"
          )}
        </Button>
        <Button
          type="button"
          data-ocid="project.cancel_button"
          variant="outline"
          onClick={onCancel}
          disabled={isPending}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
