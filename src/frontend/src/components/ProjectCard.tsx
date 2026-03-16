import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import { motion } from "motion/react";
import type { Project } from "../backend";
import { useFirstImageUrl } from "../hooks/useImageUrl";
import { getFallbackImage } from "../lib/projectImages";

interface ProjectCardProps {
  project: Project;
  index: number;
  onClick: (project: Project) => void;
}

export default function ProjectCard({
  project,
  index,
  onClick,
}: ProjectCardProps) {
  const blobUrl = useFirstImageUrl(project.imageIds);
  const imageUrl = blobUrl ?? getFallbackImage(project.category, index);

  return (
    <motion.article
      data-ocid={`projects.item.${index + 1}`}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.1 }}
      onClick={() => onClick(project)}
      className="group cursor-pointer"
    >
      {/* Image */}
      <div className="relative overflow-hidden bg-secondary aspect-[4/3] mb-4">
        <img
          src={imageUrl}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-all duration-300" />
        {project.featured && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-accent text-accent-foreground text-xs tracking-widest uppercase border-0">
              Featured
            </Badge>
          </div>
        )}
        {/* Number badge */}
        <div className="absolute bottom-3 left-3 font-display text-xs font-medium text-background/80 bg-foreground/60 px-2 py-1">
          {String(index + 1).padStart(2, "0")}
        </div>
      </div>

      {/* Info */}
      <div className="space-y-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-lg font-medium text-foreground group-hover:text-accent transition-colors leading-snug">
            {project.title}
          </h3>
          <span className="text-xs text-muted-foreground shrink-0 mt-1">
            {Number(project.year)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground tracking-widest uppercase">
          {project.category}
        </p>
        {project.location && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span>{project.location}</span>
          </div>
        )}
      </div>
    </motion.article>
  );
}
