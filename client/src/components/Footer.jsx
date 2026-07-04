import { motion } from 'framer-motion';
import { Github, Twitter, Linkedin } from 'lucide-react';

export default function Footer() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <motion.div
        className="footer-content"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
      >
        <motion.div className="footer-section" variants={itemVariants}>
          <h3>CodeCast</h3>
          <p>Transform tutorials into active learning.</p>
        </motion.div>

        <motion.div className="footer-section social" variants={itemVariants}>
          <div className="social-links">
            <span>Follow us @ </span>
            <a href="https://github.com/sasmit206" aria-label="GitHub"target="_blank" rel="noopener noreferrer">
              <Github size={20} />
            </a>
            <a href="https://x.com/sasmit206" aria-label="X"rel="noopener noreferrer"target="_blank">
              <Twitter size={20} />
            </a>
            <a href="https://www.linkedin.com/in/sasmit-%E3%85%A4-5ab9b5211/"target="_blank" aria-label="LinkedIn">
              <Linkedin size={20} />
            </a>
          </div>
        </motion.div>
      </motion.div>

    </footer>
  );
}
