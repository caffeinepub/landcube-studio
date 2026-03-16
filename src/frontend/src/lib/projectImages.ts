// Fallback images for projects without uploaded images
const CATEGORY_IMAGES: Record<string, string> = {
  Residential: "/assets/generated/project-residential-villa.dim_800x600.jpg",
  Commercial: "/assets/generated/project-commercial-tower.dim_800x600.jpg",
  Public: "/assets/generated/project-public-library.dim_800x600.jpg",
};

const FALLBACK_IMAGES = [
  "/assets/generated/project-residential-villa.dim_800x600.jpg",
  "/assets/generated/project-commercial-tower.dim_800x600.jpg",
  "/assets/generated/project-public-library.dim_800x600.jpg",
];

export function getFallbackImage(category: string, index = 0): string {
  return (
    CATEGORY_IMAGES[category] ?? FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]
  );
}
