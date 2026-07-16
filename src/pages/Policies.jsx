import React from 'react';
import { motion } from 'framer-motion';
import { CrowdCanvas } from '../components/CrowdCanvas';

export const Policies = () => {
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
            PRIVACY <span className="text-[var(--color-yellow)]">POLICIES</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-16 max-w-2xl">
            We care about your data. Here is how we collect, use, and protect your information.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white dark:bg-zinc-900 rounded-3xl p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/5 dark:border-white/10 prose dark:prose-invert max-w-none text-foreground/80"
        >
          <section className="mb-10">
            <h2 className="text-2xl font-bold font-display uppercase tracking-wider text-foreground mb-4">1. Information Collection</h2>
            <p className="leading-relaxed mb-4">
              We collect information to provide better services to all our users. We collect information in the following ways: information you give us, and information we get from your use of our services.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold font-display uppercase tracking-wider text-foreground mb-4">2. Use of Information</h2>
            <p className="leading-relaxed mb-4">
              We use the information we collect from all of our services to provide, maintain, protect and improve them, to develop new ones, and to protect Whiteflow and our users.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold font-display uppercase tracking-wider text-foreground mb-4">3. Data Security</h2>
            <p className="leading-relaxed mb-4">
              We work hard to protect Whiteflow and our users from unauthorized access to or unauthorized alteration, disclosure or destruction of information we hold. In particular, we encrypt many of our services using SSL.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-bold font-display uppercase tracking-wider text-foreground mb-4">4. Sharing of Information</h2>
            <p className="leading-relaxed mb-4">
              We do not share personal information with companies, organizations and individuals outside of Whiteflow unless one of the following circumstances applies: with your consent, for external processing, or for legal reasons.
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  );
};
