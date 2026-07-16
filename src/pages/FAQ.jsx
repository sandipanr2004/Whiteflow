import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { CrowdCanvas } from '../components/CrowdCanvas';

const faqs = [
  {
    question: "What is Whiteflow?",
    answer: "Whiteflow is an infinite canvas platform built for real-time collaboration. It allows teams to brainstorm, design, and plan together without boundaries."
  },
  {
    question: "Is it really free?",
    answer: "Yes! The core features of Whiteflow are completely free to use. We believe collaboration tools should be accessible to everyone."
  },
  {
    question: "How many people can collaborate at once?",
    answer: "Currently, our platform supports up to 50 simultaneous collaborators on a single canvas without any performance degradation."
  },
  {
    question: "Can I export my canvases?",
    answer: "Absolutely. You can export your entire canvas or selected areas as PNG, SVG, or PDF files straight from the board menu."
  },
  {
    question: "Is my data secure?",
    answer: "Security is our top priority. All connections are encrypted, and we use enterprise-grade cloud providers to ensure your data is safe and backed up."
  }
];

const AccordionItem = ({ faq, isOpen, onClick }) => {
  return (
    <div className="border-b border-black/10 dark:border-white/10 last:border-0">
      <button
        className="w-full py-6 flex items-center justify-between text-left focus:outline-none"
        onClick={onClick}
      >
        <span className="text-xl font-medium text-foreground">{faq.question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="text-muted-foreground"
        >
          <ChevronDown size={24} />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-lg text-muted-foreground leading-relaxed">
              {faq.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="relative overflow-hidden min-h-screen pt-32 pb-20 px-6 md:px-12 bg-background">
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
         <CrowdCanvas src="/images/peeps/all-peeps.png" rows={15} cols={7} />
      </div>
      <div className="relative z-10 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="font-anton uppercase text-6xl md:text-8xl tracking-tight mb-6">
            FREQUENTLY <br/> ASKED <span className="text-[var(--color-yellow)]">QUESTIONS</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-16 max-w-2xl">
            Everything you need to know about the product and how it works. Can't find an answer? Feel free to reach out to our team.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white dark:bg-zinc-900 rounded-3xl p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/5 dark:border-white/10"
        >
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              faq={faq}
              isOpen={openIndex === index}
              onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
};
