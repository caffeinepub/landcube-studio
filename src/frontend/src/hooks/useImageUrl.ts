import { useEffect, useState } from "react";
import { getImageUrl } from "./useImageUpload";

export function useImageUrls(imageIds: string[]) {
  const [urls, setUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const key = imageIds.join(",");

  // biome-ignore lint/correctness/useExhaustiveDependencies: key is a stable derived string from imageIds
  useEffect(() => {
    if (imageIds.length === 0) {
      setUrls([]);
      return;
    }
    setLoading(true);
    Promise.all(imageIds.map((id) => getImageUrl(id)))
      .then(setUrls)
      .finally(() => setLoading(false));
  }, [key]);

  return { urls, loading };
}

export function useFirstImageUrl(imageIds: string[]) {
  const [url, setUrl] = useState<string | null>(null);
  const firstId = imageIds?.[0] ?? "";

  useEffect(() => {
    if (!firstId) {
      setUrl(null);
      return;
    }
    getImageUrl(firstId).then(setUrl);
  }, [firstId]);

  return url;
}
