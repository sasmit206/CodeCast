import { motion } from 'framer-motion';

export default function Problem() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
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
    <section className="section problem-section">
      <div className="section-container">
        <motion.div
          className="section-header"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          <motion.h2 className="section-title" variants={itemVariants}>
            The problem with tutorials?
          </motion.h2>
          <motion.p className="section-subtitle" variants={itemVariants}>
            You watch, you understand in the moment,
            then you forget.
            <br /> This is tutorial hell: endless watching, zero retention.
          </motion.p>
        </motion.div>

        <motion.div
          className="problem-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {[
            {
              title: 'Passive learning',
              description: 'Watching videos creates an illusion of understanding, but leaves no lasting memory.',
            },
            {
              title: 'Zero practice',
              description: 'You never write code to apply what you learned.',
            },
            {
              title: 'Lack of feedback',
              description: 'Without exercises, you never know if you truly understood the material.',
            },
          ].map((item, i) => (
            <motion.div key={i} className="problem-card" variants={itemVariants}>
              <div className="card-dot" />
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="solution-highlight"
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          <p>
            <strong>CodeCast solves this</strong> by automatically generating practice questions
            and coding challenges from any YouTube tutorial. 
            <br />
            Active learning, instant feedback,
            real retention.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
