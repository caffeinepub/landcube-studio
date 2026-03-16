import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Eye,
  Loader2,
  Lock,
  Mail,
  Pencil,
  Plus,
  Settings2,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Project } from "../backend";
import AboutForm from "../components/AboutForm";
import ProjectForm from "../components/ProjectForm";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAllProjects,
  useClaimAdmin,
  useContactMessages,
  useDeleteProject,
  useIsAdmin,
  useResetAndClaimAdmin,
} from "../hooks/useQueries";

interface AdminPageProps {
  onBack: () => void;
}

type SheetMode = "create" | "edit" | "about" | null;

export default function AdminPage({ onBack }: AdminPageProps) {
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { data: projects, isLoading: projectsLoading } = useAllProjects();
  const { data: messages, isLoading: messagesLoading } = useContactMessages();
  const deleteProject = useDeleteProject();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const claimAdmin = useClaimAdmin();
  const resetAndClaimAdmin = useResetAndClaimAdmin();

  const [activeTab, setActiveTab] = useState("projects");
  const [sheetMode, setSheetMode] = useState<SheetMode>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProject.mutateAsync(deleteTarget.id);
      toast.success("Project deleted");
    } catch {
      toast.error("Failed to delete project");
    } finally {
      setDeleteTarget(null);
    }
  };

  const openEdit = (project: Project) => {
    setEditingProject(project);
    setSheetMode("edit");
  };

  const closeSheet = () => {
    setSheetMode(null);
    setEditingProject(null);
  };

  const formatDate = (ts: bigint) => {
    return new Date(Number(ts) / 1_000_000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleClaimAdmin = async () => {
    try {
      await claimAdmin.mutateAsync();
      queryClient.invalidateQueries({ queryKey: ["isAdmin"] });
      toast.success("Admin access claimed successfully!");
    } catch {
      toast.error("Could not claim admin. Try 'Force Claim Admin' below.");
    }
  };

  const handleResetAndClaim = async () => {
    try {
      await resetAndClaimAdmin.mutateAsync();
      queryClient.invalidateQueries({ queryKey: ["isAdmin"] });
      toast.success("Admin access claimed!");
    } catch {
      toast.error("Failed to claim admin access. Please try again.");
    }
  };

  if (adminLoading) {
    return (
      <div
        data-ocid="admin.loading_state"
        className="pt-24 max-w-7xl mx-auto px-6 py-12"
      >
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!isAdmin) {
    const isAuthenticated = !!identity;

    return (
      <div
        data-ocid="admin.error_state"
        className="pt-24 max-w-7xl mx-auto px-6 py-24 flex flex-col items-center text-center gap-6"
      >
        <Lock className="h-12 w-12 text-muted-foreground" />
        <h2 className="font-display text-3xl">
          {isAuthenticated ? "Admin Setup" : "Access Restricted"}
        </h2>
        <p className="text-muted-foreground max-w-sm">
          {isAuthenticated
            ? "You are logged in but don't have admin access yet. Claim admin rights below."
            : "You must be logged in as an administrator to access this area."}
        </p>

        {isAuthenticated && (
          <div className="flex flex-col items-center gap-3 w-full max-w-xs">
            <Button
              data-ocid="admin.primary_button"
              onClick={handleClaimAdmin}
              disabled={claimAdmin.isPending || resetAndClaimAdmin.isPending}
              className="w-full gap-2"
            >
              {claimAdmin.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Claiming...
                </>
              ) : (
                "Claim Admin Access"
              )}
            </Button>

            <Button
              data-ocid="admin.secondary_button"
              variant="outline"
              onClick={handleResetAndClaim}
              disabled={resetAndClaimAdmin.isPending || claimAdmin.isPending}
              className="w-full gap-2 border-yellow-500/50 text-yellow-600 hover:bg-yellow-50 hover:text-yellow-700"
            >
              {resetAndClaimAdmin.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Claiming...
                </>
              ) : (
                <span>
                  Force Claim Admin{" "}
                  <span className="text-xs font-normal opacity-70">
                    (use if claim fails)
                  </span>
                </span>
              )}
            </Button>
          </div>
        )}

        <Button
          data-ocid="admin.cancel_button"
          variant="outline"
          onClick={onBack}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Site
        </Button>
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-12 pb-8 border-b border-border"
        >
          <div>
            <p className="text-xs tracking-widest uppercase text-accent mb-2">
              Administration
            </p>
            <h1 className="font-display text-4xl font-light">Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button
              data-ocid="admin.view_site_button"
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="gap-2 text-xs tracking-wide uppercase"
            >
              <Eye className="h-4 w-4" /> View Site
            </Button>
            <Button
              data-ocid="admin.secondary_button"
              variant="outline"
              size="sm"
              onClick={() => setSheetMode("about")}
              className="gap-2 text-xs tracking-wide uppercase"
            >
              <Settings2 className="h-4 w-4" /> Edit About
            </Button>
            <Button
              data-ocid="admin.primary_button"
              size="sm"
              onClick={() => setSheetMode("create")}
              className="gap-2 text-xs tracking-wide uppercase"
            >
              <Plus className="h-4 w-4" /> New Project
            </Button>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-secondary mb-8 rounded-none h-auto p-0 gap-0 border border-border">
            <TabsTrigger
              value="projects"
              data-ocid="admin.projects.tab"
              className="rounded-none text-xs tracking-widest uppercase px-6 py-3 data-[state=active]:bg-foreground data-[state=active]:text-background"
            >
              Projects
            </TabsTrigger>
            <TabsTrigger
              value="messages"
              data-ocid="admin.messages.tab"
              className="rounded-none text-xs tracking-widest uppercase px-6 py-3 data-[state=active]:bg-foreground data-[state=active]:text-background gap-2"
            >
              Messages
              {messages && messages.length > 0 && (
                <Badge className="bg-accent text-accent-foreground text-[10px] h-4 px-1.5 rounded-full">
                  {messages.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Projects Tab */}
          <TabsContent value="projects">
            {projectsLoading ? (
              <div data-ocid="admin.loading_state" className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : !projects || projects.length === 0 ? (
              <div
                data-ocid="admin.empty_state"
                className="py-16 text-center border border-dashed border-border"
              >
                <p className="text-muted-foreground mb-4">No projects yet</p>
                <Button
                  data-ocid="admin.primary_button"
                  size="sm"
                  onClick={() => setSheetMode("create")}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" /> Add First Project
                </Button>
              </div>
            ) : (
              <div className="border border-border" data-ocid="admin.table">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary/50">
                      <TableHead className="text-xs tracking-widest uppercase">
                        #
                      </TableHead>
                      <TableHead className="text-xs tracking-widest uppercase">
                        Title
                      </TableHead>
                      <TableHead className="text-xs tracking-widest uppercase hidden md:table-cell">
                        Category
                      </TableHead>
                      <TableHead className="text-xs tracking-widest uppercase hidden md:table-cell">
                        Year
                      </TableHead>
                      <TableHead className="text-xs tracking-widest uppercase hidden lg:table-cell">
                        Location
                      </TableHead>
                      <TableHead className="text-xs tracking-widest uppercase">
                        Status
                      </TableHead>
                      <TableHead className="text-right text-xs tracking-widest uppercase">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projects.map((project, idx) => (
                      <TableRow
                        key={String(project.id)}
                        data-ocid={`admin.row.${idx + 1}`}
                        className="hover:bg-secondary/30 transition-colors"
                      >
                        <TableCell className="text-muted-foreground text-sm font-display">
                          {String(idx + 1).padStart(2, "0")}
                        </TableCell>
                        <TableCell className="font-medium">
                          {project.title}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                          {project.category}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                          {Number(project.year)}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                          {project.location}
                        </TableCell>
                        <TableCell>
                          {project.featured && (
                            <Badge className="bg-accent/15 text-accent border-0 text-xs">
                              Featured
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              data-ocid={`admin.edit_button.${idx + 1}`}
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openEdit(project)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              data-ocid={`admin.delete_button.${idx + 1}`}
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => setDeleteTarget(project)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages">
            {messagesLoading ? (
              <div data-ocid="admin.loading_state" className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : !messages || messages.length === 0 ? (
              <div
                data-ocid="admin.messages.empty_state"
                className="py-16 text-center border border-dashed border-border"
              >
                <Mail className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No messages yet</p>
                <p className="text-sm text-muted-foreground/60 mt-1">
                  Contact form submissions will appear here.
                </p>
              </div>
            ) : (
              <div
                className="border border-border"
                data-ocid="admin.messages.table"
              >
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary/50">
                      <TableHead className="text-xs tracking-widest uppercase">
                        #
                      </TableHead>
                      <TableHead className="text-xs tracking-widest uppercase">
                        Name
                      </TableHead>
                      <TableHead className="text-xs tracking-widest uppercase hidden md:table-cell">
                        Email
                      </TableHead>
                      <TableHead className="text-xs tracking-widest uppercase">
                        Message
                      </TableHead>
                      <TableHead className="text-xs tracking-widest uppercase hidden lg:table-cell">
                        Date
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {messages.map((msg, idx) => (
                      <TableRow
                        key={String(msg.id)}
                        data-ocid={`admin.messages.row.${idx + 1}`}
                        className="hover:bg-secondary/30 transition-colors align-top"
                      >
                        <TableCell className="text-muted-foreground text-sm font-display pt-4">
                          {String(idx + 1).padStart(2, "0")}
                        </TableCell>
                        <TableCell className="font-medium pt-4">
                          {msg.name}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground text-sm pt-4">
                          <a
                            href={`mailto:${msg.email}`}
                            className="hover:text-accent transition-colors"
                          >
                            {msg.email}
                          </a>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-xs pt-4">
                          <p className="line-clamp-3 whitespace-pre-wrap">
                            {msg.message}
                          </p>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground text-sm pt-4">
                          {formatDate(msg.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Project Form Sheet */}
      <Sheet
        open={sheetMode === "create" || sheetMode === "edit"}
        onOpenChange={(open) => !open && closeSheet()}
      >
        <SheetContent
          data-ocid="admin.sheet"
          className="w-full sm:max-w-xl overflow-y-auto"
          side="right"
        >
          <SheetHeader className="mb-6">
            <SheetTitle className="font-display text-2xl font-medium">
              {sheetMode === "edit" ? "Edit Project" : "New Project"}
            </SheetTitle>
          </SheetHeader>
          <ProjectForm
            project={editingProject}
            onSuccess={closeSheet}
            onCancel={closeSheet}
          />
        </SheetContent>
      </Sheet>

      {/* About Form Sheet */}
      <Sheet
        open={sheetMode === "about"}
        onOpenChange={(open) => !open && closeSheet()}
      >
        <SheetContent
          data-ocid="admin.sheet"
          className="w-full sm:max-w-xl overflow-y-auto"
          side="right"
        >
          <SheetHeader className="mb-6">
            <SheetTitle className="font-display text-2xl font-medium">
              Edit About Content
            </SheetTitle>
          </SheetHeader>
          <AboutForm onCancel={closeSheet} />
        </SheetContent>
      </Sheet>

      {/* Delete Confirm */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent data-ocid="admin.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <strong>{deleteTarget?.title}</strong>. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="admin.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="admin.confirm_button"
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
