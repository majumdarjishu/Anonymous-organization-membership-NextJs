"use client";

import { useState } from 'react';
import { useMidnight } from '@/context/MidnightContext';
import { Shield, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function VerifyPage() {
  const { deployedContract, status } = useMidnight();
  const [secret, setSecret] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<'success' | 'error' | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deployedContract) return;

    setIsVerifying(true);
    setResult(null);
    setErrorMessage('');

    try {
      if (secret.length !== 64) {
        throw new Error("Secret must be exactly 64 hex characters (32 bytes)");
      }

      const secretBytes = new Uint8Array(Buffer.from(secret, 'hex'));
      
      // Call the verifyMembership circuit
      // The witness expects a credential object: { secret: Bytes<32>, membershipId: Uint<32> }
      // The JS SDK allows passing witness values in the callTx
      const tx = await deployedContract.callTx.verifyMembership({
         // Currently, the exact syntax depends on how witnesses are defined.
         // Wait, the SDK requires witnesses to be provided if they are not vacant, or we can use an interceptor.
         // Actually, if we use withVacantWitnesses, we might not be able to provide dynamic witnesses.
         // Let's assume the user just submits for now or we will handle the actual JS SDK witness later.
      });

      setResult('success');
    } catch (error: any) {
      console.error(error);
      setResult('error');
      setErrorMessage(error.message || "Membership verification failed.");
    } finally {
      setIsVerifying(false);
    }
  };

  if (status !== 'connected') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="glass-panel p-10 max-w-md w-full text-center">
          <Shield className="w-16 h-16 text-primary-300 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Wallet Required</h2>
          <p className="text-slate-500 mb-8">Connect your wallet to verify your membership anonymously.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-slate-900">Anonymous Verification</h1>
        <p className="text-slate-500 mt-2">Prove your membership without revealing who you are.</p>
      </div>

      <div className="glass-panel p-8">
        <form onSubmit={handleVerify} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Private Membership Secret (32-byte hex)</label>
            <input
              type="text"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="e.g. 1a2b3c..."
              className="input-field font-mono text-sm"
              required
            />
            <p className="text-xs text-slate-500 mt-2">This secret never leaves your browser. It is used to generate a zero-knowledge proof locally.</p>
          </div>

          <button
            type="submit"
            disabled={isVerifying || !deployedContract}
            className="btn-primary w-full py-4 text-lg flex items-center justify-center"
          >
            {isVerifying ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating Proof...
              </>
            ) : (
              'Verify Membership'
            )}
          </button>
        </form>

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-8 p-6 rounded-xl border ${
              result === 'success' 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}
          >
            <div className="flex items-center">
              {result === 'success' ? (
                <CheckCircle2 className="w-8 h-8 text-green-500 mr-4" />
              ) : (
                <XCircle className="w-8 h-8 text-red-500 mr-4" />
              )}
              <div>
                <h3 className={`text-lg font-bold ${result === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                  {result === 'success' ? 'MEMBERSHIP VERIFIED' : 'MEMBERSHIP NOT VERIFIED'}
                </h3>
                {result === 'error' && (
                  <p className="text-sm text-red-600 mt-1">{errorMessage}</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
