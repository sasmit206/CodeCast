import { motion } from 'framer-motion';

export default function Demo() {
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

  return (
    <section className="section demo-section">
      <div className="section-container">
        <motion.div
          className="section-header"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          <motion.h2 className="section-title" variants={itemVariants}>
            See it in action.
          </motion.h2>
          <motion.p className="section-subtitle" variants={itemVariants}>
            From YouTube URL to practice interface in seconds.
          </motion.p>
        </motion.div>

        <motion.div
          className="demo-mockup"
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          <div className="mockup-frame">
            <div className="mockup-header">
              <div className="mockup-dot" />
              <div className="mockup-dot" />
              <div className="mockup-dot" />
            </div>
            <div className="mockup-content">
              <div className="mockup-line" style={{ width: '60%', marginBottom: '20px' }} />
              <div className="mockup-line" style={{ width: '80%', marginBottom: '30px' }} />

              <div className="mockup-exercise">
                <div className="mockup-label">Multiple Choice</div>
                <div className="mockup-line" style={{ width: '100%', marginBottom: '15px' }} />
                <div className="mockup-option" />
                <div className="mockup-option" />
                <div className="mockup-option" />
              </div>

              <div className="mockup-exercise" style={{ marginTop: '30px' }}>
                <div className="mockup-label">Coding</div>
                <div className="mockup-code">
                  <div className="mockup-line" style={{ width: '70%' }} />
                  <div className="mockup-line" style={{ width: '60%' }} />
                  <div className="mockup-line" style={{ width: '75%' }} />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
