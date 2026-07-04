import { motion } from 'framer-motion';
import { CheckCircle, Zap, Brain, Code } from 'lucide-react';

export default function Features() {
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

  const features = [
    {
      icon: Zap,
      title: 'Instant exercises',
      description: 'Upload a YouTube video, get MCQs and coding challenges in seconds.',
    },
    {
      icon: Brain,
      title: 'Active recall',
      description: 'Test your knowledge with targeted questions that reinforce learning.',
    },
    {
      icon: Code,
      title: 'Code execution',
      description: 'Run code directly in the browser. Instant feedback on your solutions.',
    },
    {
      icon: CheckCircle,
      title: 'Progress tracking',
      description: 'See your performance across chapters and identify weak spots.',
    },
  ];

  return (
    <section className="section features-section">
      <div className="section-container">
        <motion.div
          className="section-header"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          <motion.h2 className="section-title" variants={itemVariants}>
            Powerful features for active learning.
          </motion.h2>
        </motion.div>

        <motion.div
          className="features-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div key={i} className="feature-card" variants={itemVariants}>
                <div className="feature-icon">
                  <Icon size={24} />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
