import React from 'react';
import { motion } from 'framer-motion';
import { CrowdCanvas } from '../components/CrowdCanvas';

export const Terms = () => {
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
            TERMS OF <span className="text-[var(--color-yellow)]">SERVICE</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-16 max-w-2xl">
            Last updated: October 2023. Please read these terms carefully before using our platform.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white dark:bg-zinc-900 rounded-3xl p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/5 dark:border-white/10 prose dark:prose-invert max-w-none text-foreground/80"
        >
          <section className="mb-10">
            <h2 className="text-2xl font-bold font-display uppercase tracking-wider text-foreground mb-4">1. Acceptance of Terms</h2>
            <p className="leading-relaxed mb-4">
              By accessing and using Whiteflow, you accept and agree to be bound by the terms and provision of this agreement.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold font-display uppercase tracking-wider text-foreground mb-4">2. User Accounts</h2>
            <p className="leading-relaxed mb-4">
              When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold font-display uppercase tracking-wider text-foreground mb-4">3. Intellectual Property</h2>
            <p className="leading-relaxed mb-4">
              The Service and its original content (excluding Content provided by users), features and functionality are and will remain the exclusive property of Whiteflow and its licensors. The Service is protected by copyright, trademark, and other laws of both the United States and foreign countries.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-bold font-display uppercase tracking-wider text-foreground mb-4">4. Termination</h2>
            <p className="leading-relaxed mb-4">
              We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  );
};
