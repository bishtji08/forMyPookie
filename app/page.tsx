'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, Sparkles, Mail, MessageCircle, Shield, ArrowRight } from 'lucide-react';
import { Footer } from '@/components/footer';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('error') || params.get('error_description')) {
      router.replace(`/login?${params.toString()}`);
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff1f5] via-[#f8eaff] to-[#fffaf5] overflow-hidden">
      {/* Floating hearts background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-rose-300/30"
            initial={{ y: '100vh', x: `${Math.random() * 100}%`, opacity: 0 }}
            animate={{ y: '-10vh', opacity: [0, 0.6, 0] }}
            transition={{
              duration: 8 + Math.random() * 6,
              repeat: Infinity,
              delay: Math.random() * 8,
            }}
          >
            <Heart className="w-6 h-6 fill-current" />
          </motion.div>
        ))}
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 md:px-12">
        <div className="flex items-center gap-2">
          <Heart className="w-7 h-7 text-rose-500 fill-rose-400/30" />
          <span className="font-display text-xl font-bold text-rose-600">For My Pookie</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium text-rose-600 hover:text-rose-700 transition"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-rose-400 to-lavender-400 rounded-full hover:shadow-lg hover:shadow-rose-300/50 transition-all"
          >
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-20 pb-32 md:pt-32 md:pb-40">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 backdrop-blur-sm border border-rose-200/50">
            <Sparkles className="w-4 h-4 text-rose-400" />
            <span className="text-sm text-rose-600 font-medium">A love letter, reimagined</span>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-display text-5xl md:text-7xl font-bold text-rose-600 mb-6 max-w-3xl leading-tight"
        >
          Say sorry the right way.
          <br />
          <span className="text-gradient-romantic">Make her smile again.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg md:text-xl text-rose-400/80 max-w-2xl mb-10 font-body"
        >
          A private, cinematic love letter platform for couples. Create a personalized
          romantic experience, share it with a secure link, and let your story do the talking.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link
            href="/signup"
            className="group inline-flex items-center gap-2 px-8 py-3.5 text-base font-medium text-white bg-gradient-to-r from-rose-400 to-lavender-400 rounded-full hover:shadow-xl hover:shadow-rose-300/50 transition-all"
          >
            Create Your Love Letter
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/love/demo"
            className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-medium text-rose-600 bg-white/60 backdrop-blur-sm rounded-full border border-rose-200/50 hover:bg-white/80 transition-all"
          >
            <Mail className="w-5 h-5" />
            See an Example
          </Link>
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 px-6 pb-32 md:px-12">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="font-display text-3xl md:text-4xl font-bold text-center text-rose-600 mb-16"
          >
            Everything you need to say it properly
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Mail,
                title: 'Cinematic Experience',
                desc: 'A beautiful, scroll-driven love letter with apology, memories, funny moments, and a gentle invitation.',
              },
              {
                icon: MessageCircle,
                title: 'Private Real-Time Chat',
                desc: 'After she responds, talk it out in a secure 1-on-1 chat built just for the two of you.',
              },
              {
                icon: Shield,
                title: 'Secure & Private',
                desc: 'Unique secure links, QR codes, and role-based access. No one else sees your story.',
              },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="glass rounded-2xl p-8 text-center"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-100 to-lavender-100 mb-5">
                  <f.icon className="w-7 h-7 text-rose-500" />
                </div>
                <h3 className="font-display text-xl font-semibold text-rose-700 mb-3">{f.title}</h3>
                <p className="text-sm text-rose-400/70 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

    </div>
  );
}
