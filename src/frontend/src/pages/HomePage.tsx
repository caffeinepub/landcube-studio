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
  "Residential Buildings",
  "Interior",
  "Villas",
  "Public",
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
            className="w-full h-full object-cover opacity-50 blur-sm scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/40 to-background" />
        </div>
        <div className="absolute inset-0 z-0 grid-lines opacity-40" />

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
                  <span className="text-accent">
                    {about?.name?.split(" ").slice(-1)[0] || "Studio"}
                  </span>
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
                className="rounded-none text-xs tracking-widest uppercase font-medium px-8 h-12 border border-accent bg-transparent text-accent hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <a href="#projects">
                  View Projects <ArrowDown className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </motion.div>
          </div>
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
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-display text-4xl md:text-5xl font-light">
                Selected <span className="text-accent">Works</span>
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
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
                      className="text-xs tracking-wide rounded-none data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
                    >
                      {cat}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </motion.div>
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
            <motion.div
              data-ocid="projects.empty_state"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
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
            </motion.div>
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
              <h2 className="font-display text-2xl font-light">
                Our <span className="text-accent">Services</span>
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
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            {/* Left: Image */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="w-full"
            >
              <div className="aspect-[3/4] w-full overflow-hidden">
                <img
                  src="/assets/uploads/0A40258E-3A6A-46EB-B8A7-77A9F8910FEE-3-1.png"
                  alt="Landcube Studio"
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>

            {/* Right: Text content */}
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="space-y-8 lg:pt-8"
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
                <p className="font-display text-xl text-muted-foreground">
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

      {/* Contact */}
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
                Let&#39;s Create <span className="text-accent">Together</span>
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
                <a
                  href="tel:+918296541957"
                  className="inline-flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors group"
                >
                  <Phone className="h-4 w-4 group-hover:text-accent transition-colors" />
                  <span className="border-b border-border group-hover:border-accent transition-colors">
                    +91 82965 41957
                  </span>
                </a>
                <a
                  href="https://wa.me/971558336172"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors group"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 32 32"
                    fill="currentColor"
                    className="h-4 w-4 group-hover:text-[#25D366] transition-colors"
                    style={{ color: "#25D366" }}
                  >
                    <title>WhatsApp</title>
                    <path d="M16 2C8.268 2 2 8.268 2 16c0 2.522.658 4.89 1.806 6.938L2 30l7.294-1.772A13.93 13.93 0 0 0 16 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 25.6a11.55 11.55 0 0 1-5.892-1.608l-.422-.252-4.33 1.052 1.082-4.21-.276-.434A11.558 11.558 0 0 1 4.4 16C4.4 9.59 9.59 4.4 16 4.4S27.6 9.59 27.6 16 22.41 27.6 16 27.6zm6.344-8.664c-.348-.174-2.058-1.014-2.376-1.13-.318-.116-.55-.174-.782.174-.232.348-.898 1.13-1.102 1.362-.202.232-.404.26-.752.086-.348-.174-1.47-.542-2.8-1.726-1.034-.922-1.732-2.06-1.936-2.408-.202-.348-.022-.536.152-.708.156-.156.348-.406.522-.608.174-.202.232-.348.348-.58.116-.232.058-.436-.028-.608-.088-.174-.782-1.888-1.072-2.586-.282-.678-.57-.586-.782-.596l-.666-.012c-.232 0-.608.086-.926.434-.318.348-1.216 1.188-1.216 2.896s1.244 3.358 1.418 3.59c.174.232 2.45 3.74 5.938 5.244.83.358 1.478.572 1.982.732.832.264 1.59.226 2.188.138.668-.1 2.058-.842 2.348-1.656.29-.814.29-1.512.204-1.656-.086-.144-.318-.232-.666-.406z" />
                  </svg>
                  <span className="border-b border-border group-hover:border-[#25D366] transition-colors">
                    Chat on WhatsApp
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
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className="space-y-2"
                    >
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
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.18 }}
                      className="space-y-2"
                    >
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
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.26 }}
                      className="space-y-2"
                    >
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
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.34 }}
                      className="space-y-2"
                    >
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
                    </motion.div>

                    {submitError && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        data-ocid="contact.error_state"
                        className="flex items-center gap-2 text-destructive text-sm"
                      >
                        <XCircle className="h-4 w-4 shrink-0" />
                        <span>{submitError}</span>
                      </motion.div>
                    )}

                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.42 }}
                    >
                      <Button
                        data-ocid="contact.submit_button"
                        type="submit"
                        disabled={submitContact.isPending}
                        className="w-full rounded-none text-xs tracking-widest uppercase h-12 bg-accent text-accent-foreground hover:bg-accent/90"
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
                    </motion.div>
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
