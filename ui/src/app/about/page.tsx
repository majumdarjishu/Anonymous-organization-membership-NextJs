"use client";

import { Shield, Lock, Eye, Building2, Code2, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 space-y-12 animate-in fade-in duration-500">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold text-slate-900">Architecture & About</h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto">
          Built on Midnight Network using Compact and Next.js, prioritizing zero-knowledge proofs for absolute membership privacy.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-panel p-8">
          <div className="bg-primary-100 w-12 h-12 rounded-xl flex items-center justify-center text-primary-600 mb-6">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">The Problem</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            Traditional membership systems require members to present personal identifiers (name, email, membership ID) to prove they belong to an organization. This creates massive identity leakage, as every verification is tracked and correlated across services.
          </p>
        </div>

        <div className="glass-panel p-8">
          <div className="bg-indigo-100 w-12 h-12 rounded-xl flex items-center justify-center text-indigo-600 mb-6">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">The Solution</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            Using Midnight's Zero-Knowledge technology, members generate a public commitment from a private credential. When verifying, they generate a proof locally in their browser. The blockchain verifies the proof without ever seeing the credential.
          </p>
        </div>
      </div>

      <div className="glass-panel p-8 space-y-8">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center">
          <Code2 className="w-6 h-6 mr-3 text-primary-500" />
          Technology Stack
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-2">Smart Contract</h3>
            <p className="text-sm text-slate-600">Written in Compact 0.23, utilizing ZK circuits and persistentHash for verifiable commitments.</p>
          </div>
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-2">Frontend Application</h3>
            <p className="text-sm text-slate-600">Next.js App Router, Tailwind CSS, and Framer Motion for a premium enterprise UI.</p>
          </div>
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-2">Infrastructure</h3>
            <p className="text-sm text-slate-600">Dockerized Midnight Proof Server and Indexer ensuring independent, decentralized verification.</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 rounded-3xl p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/20 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
        
        <h2 className="text-2xl font-bold mb-6 flex items-center relative z-10">
          <ShieldAlert className="w-6 h-6 mr-3 text-primary-400" />
          Security Model
        </h2>
        
        <ul className="space-y-4 relative z-10 text-slate-300">
          <li className="flex items-start">
            <span className="text-primary-400 mr-3">✓</span>
            <span>Private keys and membership secrets NEVER leave the browser or wallet extension.</span>
          </li>
          <li className="flex items-start">
            <span className="text-primary-400 mr-3">✓</span>
            <span>The public ledger only stores commitment hashes and verification counters.</span>
          </li>
          <li className="flex items-start">
            <span className="text-primary-400 mr-3">✓</span>
            <span>All proofs are generated locally by the Midnight Proof Server.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
