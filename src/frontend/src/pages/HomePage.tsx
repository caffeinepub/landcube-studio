import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowDown,
  Box,
  Cpu,
  Layers,
  Loader2,
  Mail,
  PencilRuler,
  Phone,
  PlayCircle,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion, useInView } from "motion/react";
import { useRef, useState } from "react";
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

// Pre-computed letter keys for "Get In Touch" (avoids array-index-as-key lint rule)
const GET_IN_TOUCH_CHARS = Array.from("Get In Touch").map((ch, i) => ({
  key: `git-char-${i}`,
  ch,
}));

// ---------- animation variant helpers ----------
const wordContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};
const wordItem = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: "easeOut" as const },
  },
};

const letterContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
};
const letterItem = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" as const },
  },
};

const contactLinkHover = {
  rest: {},
  hover: {},
};
const iconNudge = {
  rest: { x: 0 },
  hover: {
    x: 6,
    transition: { type: "spring" as const, stiffness: 400, damping: 20 },
  },
};
const underlineDraw = {
  rest: { scaleX: 0, originX: 0 },
  hover: {
    scaleX: 1,
    originX: 0,
    transition: { duration: 0.3, ease: "easeOut" as const },
  },
};

// Floating label field component
function FloatingField({
  id,
  label,
  value,
  onChange,
  type = "text",
  required = false,
  multiline = false,
  rows = 5,
  ocid,
  delay = 0,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  multiline?: boolean;
  rows?: number;
  ocid?: string;
  delay?: number;
}) {
  const [focused, setFocused] = useState(false);
  const floated = focused || value.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay }}
      className="relative pt-5"
    >
      <motion.label
        htmlFor={id}
        animate={{
          y: floated ? 0 : 20,
          scale: floated ? 0.78 : 1,
          color: focused
            ? "hsl(var(--accent))"
            : "hsl(var(--muted-foreground))",
        }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        style={{ originX: 0 }}
        className="absolute top-0 left-0 text-xs tracking-widest uppercase pointer-events-none"
      >
        {label}
      </motion.label>

      {multiline ? (
        <Textarea
          id={id}
          data-ocid={ocid}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          rows={rows}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="rounded-none border-x-0 border-t-0 border-b border-border bg-transparent px-0 resize-none focus-visible:ring-0 focus-visible:border-transparent transition-colors"
        />
      ) : (
        <input
          id={id}
          data-ocid={ocid}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full bg-transparent border-0 border-b border-border px-0 py-2 text-sm text-foreground placeholder-transparent focus:outline-none focus:border-transparent transition-colors"
        />
      )}

      {/* Animated accent line */}
      <motion.div
        animate={{ scaleX: focused ? 1 : 0 }}
        initial={{ scaleX: 0 }}
        style={{ originX: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="absolute bottom-0 left-0 h-px w-full bg-accent"
      />
    </motion.div>
  );
}

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

  // Contact section in-view for border sweep
  const contactRef = useRef<HTMLElement>(null);
  const contactInView = useInView(contactRef, { once: true, margin: "-80px" });
  const headingRef = useRef<HTMLHeadingElement>(null);
  const headingInView = useInView(headingRef, { once: true, margin: "-60px" });
  const labelRef = useRef<HTMLParagraphElement>(null);
  const labelInView = useInView(labelRef, { once: true, margin: "-60px" });

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
              initial={{ opacity: 0, y: 32 }}
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
              initial={{ opacity: 0, y: 32 }}
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
              initial={{ opacity: 0, y: 32 }}
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
              initial={{ opacity: 0, x: -32 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-display text-4xl md:text-5xl font-light">
                Selected <span className="text-accent">Works</span>
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
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
            <motion.div
              data-ocid="projects.loading_state"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.4, delay: (i - 1) * 0.07 }}
                  className="space-y-3"
                >
                  <Skeleton className="aspect-[4/3] w-full" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </motion.div>
              ))}
            </motion.div>
          ) : filteredProjects.length === 0 ? (
            <motion.div
              data-ocid="projects.empty_state"
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
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
        className="py-24 border-t border-border"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <h2 className="font-display text-4xl md:text-5xl font-light">
              Our <span className="text-accent">Services</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {SERVICES.map((service, idx) => {
              const Icon = service.icon;
              const ocidIndex = idx + 1;
              return (
                <motion.div
                  key={service.title}
                  data-ocid={`services.card.${ocidIndex}`}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.45, delay: idx * 0.1 }}
                  whileHover={{ y: -6, scale: 1.03 }}
                  className="group flex flex-col items-center justify-center gap-4 border border-border bg-secondary/30 px-4 py-8 cursor-default transition-all duration-300 hover:border-accent hover:bg-accent/10 hover:shadow-[0_0_24px_rgba(var(--accent-rgb),0.15)]"
                >
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.35, delay: idx * 0.1 + 0.15 }}
                    className="flex items-center justify-center w-10 h-10 border border-border group-hover:border-accent transition-colors duration-300"
                  >
                    <Icon className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors duration-300" />
                  </motion.div>
                  <span className="text-sm font-light tracking-wide text-center leading-snug group-hover:text-foreground transition-colors duration-300">
                    {service.title}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-24 border-t border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            {/* Left: Image */}
            <motion.div
              initial={{ opacity: 0, x: -48 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
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
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="space-y-8 lg:pt-8"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: 0.15 }}
              >
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
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="border-l-2 border-accent pl-6"
              >
                <p className="font-display text-xl text-muted-foreground">
                  {aboutLoading ? (
                    <Skeleton className="h-7 w-72" />
                  ) : (
                    about?.tagline || ""
                  )}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-foreground/70 leading-relaxed space-y-4"
              >
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
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─────────────── Contact ─────────────── */}
      <section
        ref={contactRef}
        id="contact"
        className="relative py-24 border-t border-border overflow-hidden"
      >
        {/* Animated sweep line on top border */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: contactInView ? 1 : 0 }}
          transition={{ duration: 1.1, ease: "easeOut" }}
          style={{ originX: 0 }}
          className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-accent via-accent/60 to-transparent"
        />

        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
            {/* ── Left panel ── */}
            <div className="flex flex-col justify-center">
              {/* "Get In Touch" label — letter by letter */}
              <motion.p
                ref={labelRef}
                variants={letterContainer}
                initial="hidden"
                animate={labelInView ? "visible" : "hidden"}
                className="flex overflow-hidden text-xs tracking-widest uppercase text-accent mb-6"
              >
                {GET_IN_TOUCH_CHARS.map(({ key, ch }) => (
                  <motion.span key={key} variants={letterItem}>
                    {ch === " " ? "\u00a0" : ch}
                  </motion.span>
                ))}
              </motion.p>

              {/* Heading — word by word */}
              <motion.h2
                ref={headingRef}
                variants={wordContainer}
                initial="hidden"
                animate={headingInView ? "visible" : "hidden"}
                className="flex flex-wrap gap-x-3 font-display text-4xl md:text-5xl font-light mb-6 leading-tight overflow-hidden"
              >
                {["Let's", "Create"].map((word) => (
                  <motion.span key={word} variants={wordItem}>
                    {word}
                  </motion.span>
                ))}
                <motion.span variants={wordItem} className="text-accent">
                  Together
                </motion.span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.55, delay: 0.35 }}
                className="text-muted-foreground leading-relaxed mb-8"
              >
                Available for new projects, collaborations, and consultations.
                Share your vision and we&#39;ll craft something extraordinary.
              </motion.p>

              {/* Contact links */}
              <div className="flex flex-col gap-4">
                {[
                  {
                    href: "tel:+971558336172",
                    icon: Phone,
                    label: "+971 55 833 6172",
                    delay: 0.1,
                    hoverColor: "text-foreground",
                  },
                  {
                    href: "tel:+918296541957",
                    icon: Phone,
                    label: "+91 82965 41957",
                    delay: 0.2,
                    hoverColor: "text-foreground",
                  },
                  {
                    href: "mailto:landcube0@gmail.com",
                    icon: Mail,
                    label: "landcube0@gmail.com",
                    delay: 0.3,
                    hoverColor: "text-foreground",
                  },
                ].map(({ href, icon: Icon, label, delay }) => (
                  <motion.a
                    key={href}
                    href={href}
                    initial="rest"
                    whileHover="hover"
                    animate="rest"
                    variants={contactLinkHover}
                    custom={delay}
                    className="inline-flex items-center gap-3 text-sm text-muted-foreground w-fit group"
                  >
                    <motion.span
                      variants={iconNudge}
                      className="text-muted-foreground group-hover:text-accent transition-colors"
                    >
                      <Icon className="h-4 w-4" />
                    </motion.span>
                    <span className="relative">
                      {label}
                      <motion.span
                        variants={underlineDraw}
                        className="absolute bottom-[-2px] left-0 h-px w-full bg-accent"
                      />
                    </span>
                  </motion.a>
                ))}

                {/* WhatsApp link */}
                <motion.a
                  href="https://wa.me/971558336172"
                  target="_blank"
                  rel="noopener noreferrer"
                  initial="rest"
                  whileHover="hover"
                  animate="rest"
                  variants={contactLinkHover}
                  className="inline-flex items-center gap-3 text-sm text-muted-foreground w-fit group"
                >
                  <motion.span
                    variants={iconNudge}
                    style={{ color: "#25D366" }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 32 32"
                      fill="currentColor"
                      className="h-4 w-4"
                    >
                      <title>WhatsApp</title>
                      <path d="M16 2C8.268 2 2 8.268 2 16c0 2.522.658 4.89 1.806 6.938L2 30l7.294-1.772A13.93 13.93 0 0 0 16 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 25.6a11.55 11.55 0 0 1-5.892-1.608l-.422-.252-4.33 1.052 1.082-4.21-.276-.434A11.558 11.558 0 0 1 4.4 16C4.4 9.59 9.59 4.4 16 4.4S27.6 9.59 27.6 16 22.41 27.6 16 27.6zm6.344-8.664c-.348-.174-2.058-1.014-2.376-1.13-.318-.116-.55-.174-.782.174-.232.348-.898 1.13-1.102 1.362-.202.232-.404.26-.752.086-.348-.174-1.47-.542-2.8-1.726-1.034-.922-1.732-2.06-1.936-2.408-.202-.348-.022-.536.152-.708.156-.156.348-.406.522-.608.174-.202.232-.348.348-.58.116-.232.058-.436-.028-.608-.088-.174-.782-1.888-1.072-2.586-.282-.678-.57-.586-.782-.596l-.666-.012c-.232 0-.608.086-.926.434-.318.348-1.216 1.188-1.216 2.896s1.244 3.358 1.418 3.59c.174.232 2.45 3.74 5.938 5.244.83.358 1.478.572 1.982.732.832.264 1.59.226 2.188.138.668-.1 2.058-.842 2.348-1.656.29-.814.29-1.512.204-1.656-.086-.144-.318-.232-.666-.406z" />
                    </svg>
                  </motion.span>
                  <span className="relative">
                    Chat on WhatsApp
                    <motion.span
                      variants={{
                        rest: { scaleX: 0, originX: 0 },
                        hover: {
                          scaleX: 1,
                          originX: 0,
                          transition: { duration: 0.3, ease: "easeOut" },
                        },
                      }}
                      className="absolute bottom-[-2px] left-0 h-px w-full"
                      style={{ backgroundColor: "#25D366" }}
                    />
                  </span>
                </motion.a>
              </div>
            </div>

            {/* ── Right panel — form / success ── */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7 }}
            >
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="success"
                    data-ocid="contact.success_state"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex flex-col items-center justify-center text-center py-16 px-8 border border-border h-full min-h-[320px] gap-6"
                  >
                    {/* SVG draw-in check circle */}
                    <motion.svg
                      aria-label="Message sent successfully"
                      role="img"
                      viewBox="0 0 52 52"
                      className="w-16 h-16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <motion.circle
                        cx="26"
                        cy="26"
                        r="24"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-accent"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                      />
                      <motion.path
                        d="M14 26l8 8 16-16"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-accent"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{
                          duration: 0.5,
                          delay: 0.6,
                          ease: "easeOut",
                        }}
                      />
                    </motion.svg>

                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9, duration: 0.4 }}
                    >
                      <p className="font-display text-2xl font-light mb-2">
                        Message sent!
                      </p>
                    </motion.div>
                    <motion.p
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.05, duration: 0.4 }}
                      className="text-muted-foreground text-sm"
                    >
                      We&#39;ll be in touch soon.
                    </motion.p>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.2, duration: 0.4 }}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-none text-xs tracking-widest uppercase mt-2"
                        onClick={() => setSubmitted(false)}
                      >
                        Send another
                      </Button>
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleContactSubmit}
                    className="space-y-8"
                  >
                    <FloatingField
                      id="contact-name"
                      label="Name"
                      value={contactName}
                      onChange={setContactName}
                      required
                      ocid="contact.input"
                      delay={0.1}
                    />
                    <FloatingField
                      id="contact-phone"
                      label="Phone Number"
                      value={contactPhone}
                      onChange={setContactPhone}
                      type="tel"
                      ocid="contact.phone.input"
                      delay={0.18}
                    />
                    <FloatingField
                      id="contact-email"
                      label="Email"
                      value={contactEmail}
                      onChange={setContactEmail}
                      type="email"
                      required
                      ocid="contact.email.input"
                      delay={0.26}
                    />
                    <FloatingField
                      id="contact-message"
                      label="Message"
                      value={contactMessage}
                      onChange={setContactMessage}
                      required
                      multiline
                      rows={5}
                      ocid="contact.message.textarea"
                      delay={0.34}
                    />

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
                      viewport={{ once: true, margin: "-60px" }}
                      transition={{ duration: 0.5, delay: 0.42 }}
                    >
                      {/* Shimmer submit button */}
                      <motion.button
                        data-ocid="contact.submit_button"
                        type="submit"
                        disabled={submitContact.isPending}
                        whileHover={
                          submitContact.isPending ? {} : { scale: 1.02 }
                        }
                        whileTap={
                          submitContact.isPending ? {} : { scale: 0.98 }
                        }
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 25,
                        }}
                        className="relative w-full h-12 overflow-hidden bg-accent text-accent-foreground text-xs tracking-widest uppercase font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {/* Shimmer sweep overlay */}
                        {!submitContact.isPending && (
                          <motion.span
                            aria-hidden
                            className="absolute inset-0 pointer-events-none"
                            style={{
                              background:
                                "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%)",
                              backgroundSize: "200% 100%",
                            }}
                            initial={{ backgroundPositionX: "200%" }}
                            whileHover={{ backgroundPositionX: "-200%" }}
                            transition={{ duration: 0.65, ease: "easeInOut" }}
                          />
                        )}
                        {submitContact.isPending ? (
                          <span className="flex items-center justify-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Sending...
                          </span>
                        ) : (
                          "Send Message"
                        )}
                      </motion.button>
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
