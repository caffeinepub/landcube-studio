import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface AboutContent {
    bio: string;
    tagline: string;
    name: string;
    contactEmail: string;
}
export interface ContactMessage {
    id: bigint;
    name: string;
    createdAt: bigint;
    email: string;
    message: string;
}
export interface Project {
    id: bigint;
    title: string;
    featured: boolean;
    createdAt: bigint;
    year: bigint;
    description: string;
    imageIds: Array<string>;
    category: string;
    location: string;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    claimAdminIfNoneExists(): Promise<UserRole>;
    createProject(title: string, description: string, category: string, year: bigint, location: string, imageIds: Array<string>, featured: boolean): Promise<bigint>;
    deleteProject(id: bigint): Promise<void>;
    getAboutContent(): Promise<AboutContent>;
    getAllProjects(): Promise<Array<Project>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getContactMessages(): Promise<Array<ContactMessage>>;
    getFeaturedProjects(): Promise<Array<Project>>;
    getProjectById(id: bigint): Promise<Project>;
    getProjectsByCategory(category: string): Promise<Array<Project>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    init(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    reorderProjects(newOrder: Array<bigint>): Promise<void>;
    resetAndClaimAdmin(): Promise<UserRole>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    selfRegister(): Promise<UserRole>;
    submitContactMessage(name: string, email: string, message: string): Promise<bigint>;
    updateAboutContent(newContent: AboutContent): Promise<void>;
    updateProject(id: bigint, title: string, description: string, category: string, year: bigint, location: string, imageIds: Array<string>, featured: boolean): Promise<void>;
}
