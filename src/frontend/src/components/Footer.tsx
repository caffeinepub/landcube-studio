import { motion } from "motion/react";

export default function Footer() {
  const year = new Date().getFullYear();
  const utmLink = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`;

  return (
    <motion.footer
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6 }}
      className="border-t border-border mt-24"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12 flex flex-col md:flex-row items-center justify-between gap-4">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-xs text-muted-foreground tracking-widest uppercase"
        >
          © {year}. All rights reserved.
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xs text-muted-foreground"
        >
          Built with ♥ using{" "}
          <a
            href={utmLink}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors underline underline-offset-2"
          >
            caffeine.ai
          </a>
        </motion.p>
      </div>
    </motion.footer>
  );
}
