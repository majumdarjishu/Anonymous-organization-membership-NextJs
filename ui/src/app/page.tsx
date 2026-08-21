"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, Lock, EyeOff, ArrowRight, UserCheck } from 'lucide-react';
import { useMidnight } from '@/context/MidnightContext';

export default function LandingPage() {
  const { status, connectWallet, walletName } = useMidnight();

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-3xl mx-auto space-y-8"
      >
        <motion.div
          animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="mx-auto w-24 h-24 bg-gradient-to-tr from-primary-600 to-primary-400 rounded-3xl p-5 shadow-lg flex items-center justify-center mb-8"
        >
          <UserCheck className="w-full h-full text-white" />
        </motion.div>

        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-slate-900">
          Prove Membership. <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-400">Keep Your Identity Private.</span>
        </h1>

        <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
          Anonymous Organization Membership powered by Midnight Zero-Knowledge proofs lets members verify eligibility without revealing their identity or credentials.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          {status === 'connected' ? (
            <Link href="/dashboard" className="btn-primary px-8 py-4 text-lg w-full sm:w-auto flex items-center justify-center group">
              Go to Dashboard
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          ) : (
            <button onClick={connectWallet} className="btn-primary px-8 py-4 text-lg w-full sm:w-auto flex items-center justify-center group">
              Connect Wallet
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
          <Link href="/verify" className="btn-secondary px-8 py-4 text-lg w-full sm:w-auto text-center">
            Verify Membership
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16">
          {[
            { icon: <Lock />, title: 'Private Credentials', desc: 'Your membership secrets never leave your local device.' },
            { icon: <EyeOff />, title: 'Anonymous Verification', desc: 'Prove you are a member without exposing your name or ID.' },
            { icon: <Shield />, title: 'Zero-Knowledge Proofs', desc: 'Leverage Midnight Network to verify eligibility securely.' },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="glass-panel p-6 text-left group hover:-translate-y-1 transition-all duration-300"
            >
              <div className="bg-primary-50 w-12 h-12 rounded-xl flex items-center justify-center text-primary-600 mb-4 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
