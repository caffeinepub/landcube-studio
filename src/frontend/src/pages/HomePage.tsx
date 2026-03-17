import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowDown,
  Box,
  CheckCircle2,
  Cpu,
  Layers,
  Loader2,
  Mail,
  PencilRuler,
  Phone,
  PlayCircle,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { Project } from "../backend";
import ProjectCard from "../components/ProjectCard";
import ProjectDetailModal from "../components/ProjectDetailModal";
import {
  useAboutContent,
  useAllProjects,
  useSubmitContactMessage,
} from "../hooks/useQueries";

const CATEGORIES = [
  "All",
  "Residential",
  "Commercial",
  "Public",
  "Interior",
  "Landscape",
];

const SERVICES = [
  { icon: PencilRuler, title: "Architectural Design" },
  { icon: Box, title: "3D Visualization & Rendering" },
  { icon: Layers, title: "Interior Design" },
  { icon: Cpu, title: "Concept Development" },
  { icon: PlayCircle, title: "Walkthrough Animation" },
];

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const { data: projects, isLoading: projectsLoading } = useAllProjects();
  const { data: about, isLoading: aboutLoading } = useAboutContent();
  const submitContact = useSubmitContactMessage();

  const filteredProjects =
    activeCategory === "All"
      ? (projects ?? [])
      : (projects ?? []).filter((p) => p.category === activeCategory);

  const yearRange =
    projects && projects.length > 0
      ? `${Math.min(...projects.map((p) => Number(p.year)))}\u2013${Math.max(...projects.map((p) => Number(p.year)))}`
      : "\u2014";

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    try {
      const fullMessage = contactPhone
        ? `Phone: ${contactPhone}\n\n${contactMessage}`
        : contactMessage;
      await submitContact.mutateAsync({
        name: contactName,
        email: contactEmail,
        message: fullMessage,
      });
      setSubmitted(true);
      setContactName("");
      setContactPhone("");
      setContactEmail("");
      setContactMessage("");
    } catch {
      setSubmitError(
        "Something went wrong. Please try again or email us directly.",
      );
    }
  };

  return (
    <>
      {/* Hero */}
      <section
        id="hero"
        className="relative min-h-screen flex items-end pb-20 pt-24 overflow-hidden"
      >
        <div className="absolute inset-0 z-0">
          <img
            src="/assets/generated/hero-architecture.dim_1600x900.jpg"
            alt="Architecture"
            className="w-full h-full object-cover opacity-30 blur-sm scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/30 to-background" />
        </div>
        <div className="absolute inset-0 z-0 grid-lines opacity-30" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 w-full">
          <div className="max-w-4xl">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-xs tracking-widest uppercase text-accent font-medium mb-8"
            >
              Architect &amp; Designer
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display text-6xl md:text-8xl lg:text-9xl font-light text-foreground leading-none tracking-tight mb-6"
            >
              {aboutLoading ? (
                <Skeleton className="h-24 w-80" />
              ) : (
                <>
                  {about?.name?.split(" ").slice(0, -1).join(" ") || "Landcube"}{" "}
                  <em className="italic">
                    {about?.name?.split(" ").slice(-1)[0] || "Studio"}
                  </em>
                </>
              )}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed mb-12"
            >
              {aboutLoading ? (
                <Skeleton className="h-7 w-96" />
              ) : (
                about?.tagline || "Shaping spaces with purpose and precision."
              )}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Button
                data-ocid="hero.primary_button"
                variant="default"
                size="lg"
                asChild
                className="rounded-none text-xs tracking-widest uppercase font-medium px-8 h-12"
              >
                <a href="#projects">
                  View Projects <ArrowDown className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-20 pt-8 border-t border-border flex flex-wrap gap-12"
          >
            <div>
              <p className="font-display text-3xl font-medium">
                {projects?.length ?? "\u2014"}
              </p>
              <p className="text-xs tracking-widest uppercase text-muted-foreground mt-1">
                Projects
              </p>
            </div>
            <div>
              <p className="font-display text-3xl font-medium">{yearRange}</p>
              <p className="text-xs tracking-widest uppercase text-muted-foreground mt-1">
                Years
              </p>
            </div>
            <div>
              <p className="font-display text-3xl font-medium">
                {[...new Set((projects ?? []).map((p) => p.category))].length ||
                  "\u2014"}
              </p>
              <p className="text-xs tracking-widest uppercase text-muted-foreground mt-1">
                Disciplines
              </p>
            </div>
          </motion.div>
        </div>
      </section>
      {/* Portfolio Grid */}
      <section id="projects" className="py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-xs tracking-widest uppercase text-accent mb-3">
                Portfolio
              </p>
              <h2 className="font-display text-4xl md:text-5xl font-light">
                Selected <em className="italic">Works</em>
              </h2>
            </motion.div>

            <Tabs
              value={activeCategory}
              onValueChange={setActiveCategory}
              className="w-full md:w-auto"
            >
              <TabsList
                data-ocid="projects.tab"
                className="bg-secondary flex-wrap h-auto gap-1 p-1"
              >
                {CATEGORIES.map((cat) => (
                  <TabsTrigger
                    key={cat}
                    value={cat}
                    data-ocid="projects.tab"
                    className="text-xs tracking-wide rounded-none data-[state=active]:bg-foreground data-[state=active]:text-background"
                  >
                    {cat}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {projectsLoading ? (
            <div
              data-ocid="projects.loading_state"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-[4/3] w-full" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div
              data-ocid="projects.empty_state"
              className="relative py-24 text-center border border-dashed border-border"
            >
              <p className="font-display text-2xl text-muted-foreground mb-2">
                No projects yet
              </p>
              <p className="text-sm text-muted-foreground">
                {activeCategory === "All"
                  ? "Projects will appear here once added."
                  : `No ${activeCategory} projects found.`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
              {filteredProjects.map((project, idx) => (
                <ProjectCard
                  key={String(project.id)}
                  project={project}
                  index={idx}
                  onClick={setSelectedProject}
                />
              ))}
            </div>
          )}
        </div>
      </section>
      {/* Services */}
      <section
        id="services"
        data-ocid="services.section"
        className="py-16 border-t border-border"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row md:items-center gap-8 md:gap-16">
            {/* Section label */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="shrink-0"
            >
              <p className="text-xs tracking-widest uppercase text-accent mb-1">
                Services
              </p>
              <h2 className="font-display text-2xl font-light">
                Our <em className="italic">Services</em>
              </h2>
            </motion.div>

            {/* Services inline chips with stagger */}
            <div className="flex flex-wrap gap-3">
              {SERVICES.map((service, idx) => {
                const Icon = service.icon;
                const ocidIndex = idx + 1;
                return (
                  <motion.div
                    key={service.title}
                    data-ocid={`services.card.${ocidIndex}`}
                    initial={{ opacity: 0, y: 12, scale: 0.95 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.08 }}
                    whileHover={{ y: -2 }}
                    className="flex items-center gap-2 border border-border px-4 py-2 hover:border-accent hover:bg-secondary transition-colors duration-200 group cursor-default"
                  >
                    <motion.span
                      initial={{ rotate: -10, opacity: 0 }}
                      whileInView={{ rotate: 0, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.35, delay: idx * 0.08 + 0.15 }}
                    >
                      <Icon className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors shrink-0" />
                    </motion.span>
                    <span className="text-sm font-light tracking-wide whitespace-nowrap">
                      {service.title}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
      {/* About */}
      <section id="about" className="py-24 border-t border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative"
            >
              <div className="aspect-[3/4] bg-secondary relative overflow-hidden">
                <img
                  src="/assets/uploads/WhatsApp-Image-2026-03-17-at-9.29.31-PM-1.jpeg"
                  alt="Landcube Studio architectural project"
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="space-y-8"
            >
              <div>
                <p className="text-xs tracking-widest uppercase text-accent mb-4">
                  About
                </p>
                <h2 className="font-display text-4xl md:text-5xl font-light leading-tight">
                  {aboutLoading ? (
                    <Skeleton className="h-14 w-64" />
                  ) : (
                    about?.name || "Landcube Studio"
                  )}
                </h2>
              </div>
              <div className="border-l-2 border-accent pl-6">
                <p className="font-display text-xl italic text-muted-foreground">
                  {aboutLoading ? (
                    <Skeleton className="h-7 w-72" />
                  ) : (
                    about?.tagline || ""
                  )}
                </p>
              </div>
              <div className="text-foreground/70 leading-relaxed space-y-4">
                {aboutLoading ? (
                  <>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-4/5" />
                  </>
                ) : (
                  <p className="whitespace-pre-wrap">
                    {about?.bio || "Architect's bio will appear here."}
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      <section id="contact" className="py-24 border-t border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
            <motion.div
              initial={{ opacity: 0, x: -32 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="flex flex-col justify-center"
            >
              <p className="text-xs tracking-widest uppercase text-accent mb-6">
                Get In Touch
              </p>
              <h2 className="font-display text-4xl md:text-5xl font-light mb-6 leading-tight">
                Let&#39;s Create <em className="italic">Together</em>
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-8">
                Available for new projects, collaborations, and consultations.
                Share your vision and we&#39;ll craft something extraordinary.
              </p>
              <div className="flex flex-col gap-3">
                {about?.contactEmail && (
                  <a
                    href={`mailto:${about.contactEmail}`}
                    className="inline-flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors group"
                  >
                    <Mail className="h-4 w-4 group-hover:text-accent transition-colors" />
                    <span className="border-b border-border group-hover:border-accent transition-colors">
                      {about.contactEmail}
                    </span>
                  </a>
                )}
                <a
                  href="tel:+971558336172"
                  className="inline-flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors group"
                >
                  <Phone className="h-4 w-4 group-hover:text-accent transition-colors" />
                  <span className="border-b border-border group-hover:border-accent transition-colors">
                    +971 55 833 6172
                  </span>
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 32 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="success"
                    data-ocid="contact.success_state"
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center text-center py-16 px-8 border border-border h-full min-h-[320px] gap-5"
                  >
                    <CheckCircle2 className="h-12 w-12 text-accent" />
                    <div>
                      <p className="font-display text-2xl font-light mb-2">
                        Message sent!
                      </p>
                      <p className="text-muted-foreground text-sm">
                        We&#39;ll be in touch soon.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-none text-xs tracking-widest uppercase mt-2"
                      onClick={() => setSubmitted(false)}
                    >
                      Send another
                    </Button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleContactSubmit}
                    className="space-y-6"
                  >
                    <div className="space-y-2">
                      <Label
                        htmlFor="contact-name"
                        className="text-xs tracking-widest uppercase text-muted-foreground"
                      >
                        Name
                      </Label>
                      <Input
                        id="contact-name"
                        data-ocid="contact.input"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="Your full name"
                        required
                        className="rounded-none border-x-0 border-t-0 border-b border-border bg-transparent px-0 focus-visible:ring-0 focus-visible:border-accent transition-colors"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="contact-phone"
                        className="text-xs tracking-widest uppercase text-muted-foreground"
                      >
                        Phone Number
                      </Label>
                      <Input
                        id="contact-phone"
                        data-ocid="contact.phone.input"
                        type="tel"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="Your phone number"
                        className="rounded-none border-x-0 border-t-0 border-b border-border bg-transparent px-0 focus-visible:ring-0 focus-visible:border-accent transition-colors"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="contact-email"
                        className="text-xs tracking-widest uppercase text-muted-foreground"
                      >
                        Email
                      </Label>
                      <Input
                        id="contact-email"
                        data-ocid="contact.email.input"
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="your@email.com"
                        required
                        className="rounded-none border-x-0 border-t-0 border-b border-border bg-transparent px-0 focus-visible:ring-0 focus-visible:border-accent transition-colors"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="contact-message"
                        className="text-xs tracking-widest uppercase text-muted-foreground"
                      >
                        Message
                      </Label>
                      <Textarea
                        id="contact-message"
                        data-ocid="contact.message.textarea"
                        value={contactMessage}
                        onChange={(e) => setContactMessage(e.target.value)}
                        placeholder="Tell us about your project..."
                        required
                        rows={5}
                        className="rounded-none border-x-0 border-t-0 border-b border-border bg-transparent px-0 resize-none focus-visible:ring-0 focus-visible:border-accent transition-colors"
                      />
                    </div>

                    {submitError && (
                      <div
                        data-ocid="contact.error_state"
                        className="flex items-center gap-2 text-destructive text-sm"
                      >
                        <XCircle className="h-4 w-4 shrink-0" />
                        <span>{submitError}</span>
                      </div>
                    )}

                    <Button
                      data-ocid="contact.submit_button"
                      type="submit"
                      disabled={submitContact.isPending}
                      className="w-full rounded-none text-xs tracking-widest uppercase h-12"
                    >
                      {submitContact.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        "Send Message"
                      )}
                    </Button>
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </section>
      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </>
  );
}
