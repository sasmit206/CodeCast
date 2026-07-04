import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function Hero({ onSubmit, loading, error }) {
  const [url, setUrl] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (url.trim()) onSubmit(url.trim());
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
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

  return (
    <section className="hero-section">
      {/* Animated background elements */}
      <motion.div
        className="hero-bg-orb orb-1"
        animate={{ y: [0, -30, 0], x: [0, 15, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="hero-bg-orb orb-2"
        animate={{ y: [0, 25, 0], x: [0, -20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
      />

      <motion.div
        className="hero-content"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Main headline */}
        <motion.div variants={itemVariants}>
          <h1 className="hero-title">
            Transform YouTube<br />
            tutorials into<br />
            <span className="accent-text">active learning.</span>
          </h1>
        </motion.div>

        {/* Subheading */}
        <motion.p className="hero-description" variants={itemVariants}>
          Stop passively watching tutorials. CodeCast generates MCQs and coding challenges
          from any YouTube video, turning tutorials into deliberate practice.
        </motion.p>

        {/* CTA Form */}
        <motion.form className="hero-form" onSubmit={handleSubmit} variants={itemVariants}>
          <div className="form-group">
            <input
              className="form-input"
              type="url"
              placeholder="Paste a YouTube link…"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading}
              required
            />
            <button
              className="form-button"
              type="submit"
              disabled={loading || !url.trim()}
            >
              {loading ? (
                <>
                  <span className="spinner" />
                  Generating…
                </>
              ) : (
                <>
                  Get started
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
          {error && <p className="form-error">{error}</p>}
        </motion.form>

        {/* Trust elements */}
        <motion.div className="hero-trust" variants={itemVariants}>
          <p className="trust-text">No sign-up required • Works with any YouTube tutorial</p>
        </motion.div>
      </motion.div>
    </section>
  );
}
