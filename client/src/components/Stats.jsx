import { motion } from 'framer-motion';

export default function Stats() {
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

  const stats = [
    { label: '70% more retention', value: 'Active practice beats passive watching' },
    { label: '3.2x faster learning', value: 'With instant feedback and exercises' },
    { label: '10,000+ tutorials', value: 'Supported and growing daily' },
  ];

  return (
    <section className="section stats-section">
      <div className="section-container">
        <motion.div
          className="stats-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {stats.map((stat, i) => (
            <motion.div key={i} className="stat-card" variants={itemVariants}>
              <div className="stat-value">{stat.label}</div>
              <div className="stat-label">{stat.value}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
