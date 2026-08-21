"use client";

import { useState } from 'react';
import { useMidnight } from '@/context/MidnightContext';
import { Shield, Key, Loader2, CheckCircle2, Copy } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RegisterPage() {
  const { status } = useMidnight();
  const [secret, setSecret] = useState('');
  const [membershipId, setMembershipId] = useState('');
  const [commitment, setCommitment] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateCommitment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setCommitment(null);

    try {
      // In a real application, you would use a cryptography library matching Midnight's persistentHash
      // Since persistentHash is complex to replicate exactly in JS without the SDK's helpers,
      // we would use a WASM helper or an API endpoint. For the scope of this UI template,
      // we'll simulate the generation to show the flow, but in production you'd use the provided crypto utilities.
      
      // Simulate cryptographic generation delay
      await new Promise(r => setTimeout(r, 1000));
      
      // Generate a mock commitment string for UI demonstration
      const mockCommitment = Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
      setCommitment(mockCommitment);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (commitment) {
      navigator.clipboard.writeText(commitment);
    }
  };

  if (status !== 'connected') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="glass-panel p-10 max-w-md w-full text-center">
          <Shield className="w-16 h-16 text-primary-300 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Wallet Required</h2>
          <p className="text-slate-500 mb-8">Connect your wallet to register your membership.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-slate-900">Membership Registration</h1>
        <p className="text-slate-500 mt-2">Generate a zero-knowledge commitment to join the organization.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-panel p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
            <Key className="w-5 h-5 mr-2 text-primary-500" />
            1. Private Credentials
          </h2>
          <form onSubmit={generateCommitment} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Membership ID</label>
              <input
                type="number"
                value={membershipId}
                onChange={(e) => setMembershipId(e.target.value)}
                placeholder="e.g. 12345"
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Private Secret (32-byte hex)</label>
              <input
                type="text"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder="Enter 64 hex characters"
                className="input-field font-mono text-sm"
                required
              />
              <p className="text-xs text-slate-500 mt-2">Save this secret! You will need it to verify your membership later.</p>
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="btn-primary w-full py-3 flex items-center justify-center"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Commitment'
              )}
            </button>
          </form>
        </div>

        <div className="glass-panel p-8 bg-slate-50 border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-indigo-500" />
            2. Public Commitment
          </h2>
          
          {!commitment ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400 border-2 border-dashed border-slate-300 rounded-xl">
              <Shield className="w-12 h-12 mb-2 opacity-50" />
              <p className="text-sm">Generate your credentials first</p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm relative group">
                <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Your Commitment Hash</p>
                <p className="font-mono text-sm text-slate-800 break-all">{commitment}</p>
                <button
                  onClick={copyToClipboard}
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors"
                  title="Copy to clipboard"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 bg-green-50 rounded-xl border border-green-200 flex items-start">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 mr-3 shrink-0" />
                <p className="text-sm text-green-800">
                  Provide this commitment hash to the Organization Admin. They will register it on the blockchain. Once registered, you can verify anonymously!
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
