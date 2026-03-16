import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronLeft, ChevronRight, MapPin, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { Project } from "../backend";
import { useImageUrls } from "../hooks/useImageUrl";
import { getFallbackImage } from "../lib/projectImages";

interface ProjectDetailModalProps {
  project: Project | null;
  onClose: () => void;
}

export default function ProjectDetailModal({
  project,
  onClose,
}: ProjectDetailModalProps) {
  const [imageIndex, setImageIndex] = useState(0);
  const { urls: blobUrls } = useImageUrls(project?.imageIds ?? []);

  if (!project) return null;

  // Use uploaded images if available, otherwise fall back to category image
  const imageUrls =
    blobUrls.length > 0 ? blobUrls : [getFallbackImage(project.category, 0)];

  const prevImage = () =>
    setImageIndex((i) => (i - 1 + imageUrls.length) % imageUrls.length);
  const nextImage = () => setImageIndex((i) => (i + 1) % imageUrls.length);

  return (
    <AnimatePresence>
      <motion.div
        data-ocid="project.modal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto"
      >
        <div className="max-w-5xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div />
            <Button
              data-ocid="project.close_button"
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-none"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Image gallery */}
            <div className="space-y-4">
              <div className="relative aspect-[4/3] bg-secondary overflow-hidden">
                <img
                  src={imageUrls[imageIndex]}
                  alt={`${project.title} — ${imageIndex + 1}`}
                  className="w-full h-full object-cover"
                />

                {imageUrls.length > 1 && (
                  <>
                    <button
                      type="button"
                      data-ocid="project.secondary_button"
                      onClick={prevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background p-2 transition-colors"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      data-ocid="project.secondary_button"
                      onClick={nextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background p-2 transition-colors"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {imageUrls.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {imageUrls.map((url, i) => (
                    <button
                      // biome-ignore lint/suspicious/noArrayIndexKey: thumbnail index is position-stable
                      key={i}
                      type="button"
                      data-ocid={`project.item.${i + 1}`}
                      onClick={() => setImageIndex(i)}
                      className={`flex-shrink-0 w-16 h-16 overflow-hidden border-2 transition-colors ${
                        i === imageIndex
                          ? "border-accent"
                          : "border-transparent"
                      }`}
                    >
                      <img
                        src={url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="space-y-6">
              <div>
                {project.featured && (
                  <Badge className="bg-accent text-accent-foreground border-0 text-xs tracking-widest uppercase mb-3">
                    Featured
                  </Badge>
                )}
                <h2 className="font-display text-3xl lg:text-4xl font-medium text-foreground leading-tight">
                  {project.title}
                </h2>
              </div>

              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="text-xs tracking-widest uppercase font-medium">
                    Category
                  </span>
                  <span className="text-foreground">{project.category}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span className="text-foreground">
                    {Number(project.year)}
                  </span>
                </div>
                {project.location && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span className="text-foreground">{project.location}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-border pt-6">
                <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap">
                  {project.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
