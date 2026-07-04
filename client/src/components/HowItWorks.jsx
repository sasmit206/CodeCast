import { motion } from 'framer-motion';
import { Circle } from 'lucide-react';

export default function HowItWorks() {
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

  const steps = [
    {
      number: '1',
      title: 'Paste a YouTube link',
      description: 'Share the tutorial URL. CodeCast analyzes the entire video automatically.',
    },
    {
      number: '2',
      title: 'Practice with exercises',
      description: 'Answer MCQs and write code. Get instant feedback on every answer.',
    },
    {
      number: '3',
      title: 'Track your progress',
      description: 'See detailed results. Know exactly what you mastered and what to review.',
    },
  ];

  return (
    <section className="section how-it-works-section">
      <div className="section-container">
        <motion.div
          className="section-header"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          <motion.h2 className="section-title" variants={itemVariants}>
            Three simple steps.
          </motion.h2>
        </motion.div>

        <motion.div
          className="steps-container"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {steps.map((step, i) => (
            <motion.div key={i} className="step-card" variants={itemVariants}>
              <div className="step-number">{step.number}</div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
              {i < steps.length - 1 && <div className="step-connector" />}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
