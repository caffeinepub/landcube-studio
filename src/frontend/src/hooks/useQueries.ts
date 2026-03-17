import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AboutContent, ContactMessage, Project } from "../backend";
import { useActor } from "./useActor";

export type { ContactMessage };

const DEFAULT_ABOUT: AboutContent = {
  name: "Landcube Studio",
  tagline: "Design and visualization services",
  bio: "LANDCUBE Design Studio is a creative and innovative architectural firm dedicated to transforming spaces with excellence and precision. With over 5 years of experience, we deliver sustainable, high-quality designs across residential, commercial, and public projects, crafting spaces that inspire and enhance human experience.",
  contactEmail: "landcube0@gmail.com",
};

export function useAllProjects() {
  const { actor, isFetching } = useActor();
  return useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllProjects();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useFeaturedProjects() {
  const { actor, isFetching } = useActor();
  return useQuery<Project[]>({
    queryKey: ["projects", "featured"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFeaturedProjects();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useProjectsByCategory(category: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Project[]>({
    queryKey: ["projects", "category", category],
    queryFn: async () => {
      if (!actor) return [];
      if (category === "All") return actor.getAllProjects();
      return actor.getProjectsByCategory(category);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAboutContent() {
  const { actor, isFetching } = useActor();
  return useQuery<AboutContent>({
    queryKey: ["about"],
    queryFn: async () => {
      if (!actor) return DEFAULT_ABOUT;
      try {
        const result = await actor.getAboutContent();
        // If the canister returned empty fields, use defaults
        return {
          name: result.name || DEFAULT_ABOUT.name,
          tagline: result.tagline || DEFAULT_ABOUT.tagline,
          bio: result.bio || DEFAULT_ABOUT.bio,
          contactEmail: result.contactEmail || DEFAULT_ABOUT.contactEmail,
        };
      } catch {
        return DEFAULT_ABOUT;
      }
    },
    enabled: !!actor && !isFetching,
    placeholderData: DEFAULT_ABOUT,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerAdmin();
      } catch {
        // isCallerAdmin traps if user is not yet registered.
        // Treat as "not admin" so the claim flow is shown.
        return false;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const query = useQuery({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useContactMessages() {
  const { actor, isFetching } = useActor();
  return useQuery<ContactMessage[]>({
    queryKey: ["contactMessages"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getContactMessages();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSubmitContactMessage() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      email: string;
      message: string;
    }) => {
      if (!actor) throw new Error("Not available");
      return actor.submitContactMessage(data.name, data.email, data.message);
    },
  });
}

export function useCreateProject() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      title: string;
      description: string;
      category: string;
      year: bigint;
      location: string;
      imageIds: string[];
      featured: boolean;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.createProject(
        data.title,
        data.description,
        data.category,
        data.year,
        data.location,
        data.imageIds,
        data.featured,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useUpdateProject() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      title: string;
      description: string;
      category: string;
      year: bigint;
      location: string;
      imageIds: string[];
      featured: boolean;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.updateProject(
        data.id,
        data.title,
        data.description,
        data.category,
        data.year,
        data.location,
        data.imageIds,
        data.featured,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useDeleteProject() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.deleteProject(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useUpdateAboutContent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (content: AboutContent) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.updateAboutContent(content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["about"] });
    },
  });
}

export function useSaveProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.saveCallerUserProfile({ name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

export function useSelfRegister() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not authenticated");
      return actor.selfRegister();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["isAdmin"] });
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

export function useClaimAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not authenticated");
      return actor.claimAdminIfNoneExists();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["isAdmin"] });
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

export function useResetAndClaimAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not authenticated");
      return actor.resetAndClaimAdmin();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["isAdmin"] });
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}
