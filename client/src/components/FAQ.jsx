import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
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

  const faqs = [
    {
      q: 'Which YouTube videos does CodeCast support?',
      a: 'CodeCast works with any YouTube video that has a transcript. This includes most tutorials, lectures, and educational content.',
    },
    {
      q: 'Do I need to create an account?',
      a: 'No. CodeCast is completely free and requires no sign-up. Paste a link, and you\'re ready to learn.',
    },
    {
      q: 'What languages do the coding exercises support?',
      a: 'JavaScript, Python, Java, C++, C#, Go, Rust, and more. CodeCast automatically detects the language from the video.',
    },
    {
      q: 'Can I share my results with others?',
      a: 'Yes. You can generate a shareable link to your assessment results to prove what you\'ve learned.',
    },
  ];

  return (
    <section className="section faq-section">
      <div className="section-container">
        <motion.div
          className="section-header"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          <motion.h2 className="section-title" variants={itemVariants}>
            FA?s
          </motion.h2>
        </motion.div>

        <motion.div
          className="faq-list"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {faqs.map((faq, i) => (
            <motion.div key={i} className="faq-item" variants={itemVariants}>
              <button
                className={`faq-question ${openIndex === i ? 'open' : ''}`}
                onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
              >
                <span>{faq.q}</span>
                <ChevronDown size={20} />
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    className="faq-answer"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  >
                    <p>{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
