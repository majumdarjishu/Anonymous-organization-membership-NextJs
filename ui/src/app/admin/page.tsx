"use client";

import { useState } from 'react';
import { useMidnight } from '@/context/MidnightContext';
import { Shield, Lock, Activity, UserPlus, CheckCircle, AlertCircle, Rocket } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminPage() {
  const { status, walletAddress, deployContractAction, contractAddress } = useMidnight();
  const [commitmentInput, setCommitmentInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployResult, setDeployResult] = useState<{ status: 'success' | 'failure'; address?: string; message?: string } | null>(null);
  const [result, setResult] = useState<{ status: 'success' | 'failure'; txHash?: string; message?: string } | null>(null);

  if (status !== 'connected') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Lock className="w-16 h-16 text-slate-500 mb-6" />
        <h2 className="text-2xl font-bold text-white mb-2">Admin Access Restricted</h2>
        <p className="text-slate-400 max-w-md">Connect with an administrator wallet to manage eligible patients.</p>
      </div>
    );
  }

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commitmentInput || !contractAddress) return;

    // Convert hex string to Uint8Array
    let commitment: Uint8Array;
    try {
      const hex = commitmentInput.startsWith('0x') ? commitmentInput.slice(2) : commitmentInput;
      if (hex.length !== 64) throw new Error("Must be 32 bytes (64 hex characters)");
      commitment = new Uint8Array(Buffer.from(hex, 'hex'));
    } catch (err: any) {
      setResult({ status: 'failure', message: err.message || 'Invalid commitment format' });
      return;
    }

    setIsSubmitting(true);
    setResult(null);

    try {
      // Simulate adding to allowlist
      await new Promise(r => setTimeout(r, 2000));
      const mockTxId = '0x' + Array.from(commitment).map(b => b.toString(16).padStart(2, '0')).join('');
      setResult({ status: 'success', txHash: mockTxId });
      setCommitmentInput('');
    } catch (err: any) {
      console.error(err);
      setResult({ status: 'failure', message: err.message || 'Transaction failed. Are you the admin?' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeployContract = async () => {
    setIsDeploying(true);
    setDeployResult(null);
    try {
      const address = await deployContractAction();
      setDeployResult({ status: 'success', address });
      // Suggest the user to add this to their environment variables
    } catch (err: any) {
      console.error(err);
      setDeployResult({ status: 'failure', message: err.message || 'Deployment failed.' });
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center space-x-4 mb-8">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-xl shadow-lg">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Administrator Console</h1>
          <p className="text-slate-400 mt-1">Manage network participants and eligible patient commitments</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center">
              <UserPlus className="w-5 h-5 text-indigo-400 mr-2" />
              Add Eligible Patient Commitment
            </h2>
            
            <form onSubmit={handleAddPatient} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Patient Commitment Hash (Hex)</label>
                <input 
                  type="text" 
                  placeholder="e.g. 0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef" 
                  className="input-field font-mono text-sm"
                  value={commitmentInput}
                  onChange={(e) => setCommitmentInput(e.target.value)}
                  required
                />
                <p className="text-xs text-slate-500 mt-2">
                  This is the cryptographic hash of the patient's identity. Do NOT submit PII.
                </p>
              </div>

              <button 
                type="submit" 
                disabled={!commitmentInput || isSubmitting || !contractAddress}
                className="w-full relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-medium px-4 py-3 transition-all duration-300 disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting to Network...' : 'Add Patient to Network'}
              </button>
            </form>

            {result && (
              <div className={`mt-6 p-4 rounded-xl border ${result.status === 'success' ? 'bg-emerald-900/20 border-emerald-500/30 text-emerald-400' : 'bg-red-900/20 border-red-500/30 text-red-400'}`}>
                <div className="flex items-start">
                  {result.status === 'success' ? <CheckCircle className="w-5 h-5 mr-3 mt-0.5" /> : <AlertCircle className="w-5 h-5 mr-3 mt-0.5" />}
                  <div>
                    <p className="font-bold">{result.status === 'success' ? 'Patient Added Successfully' : 'Action Failed'}</p>
                    {result.txHash && <p className="text-sm mt-1 opacity-80 font-mono truncate max-w-sm">TxID: {result.txHash}</p>}
                    {result.message && <p className="text-sm mt-1 opacity-80">{result.message}</p>}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="glass-panel p-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Contract Deployment</h3>
            <div className="space-y-4">
              {contractAddress ? (
                <div>
                  <p className="text-xs text-slate-500 mb-1">Contract Status</p>
                  <div className="flex items-center text-sm font-bold text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                    Deployed & Active
                  </div>
                  <p className="text-xs font-mono text-slate-400 mt-2 break-all">{contractAddress}</p>
                </div>
              ) : (
                <div>
                  <p className="text-xs text-slate-400 mb-4">
                    The Smart Contract is not connected. If you have DUST tokens, you can deploy it directly to the network.
                  </p>
                  <button 
                    onClick={handleDeployContract}
                    disabled={isDeploying}
                    className="w-full btn-primary py-3 text-sm flex items-center justify-center disabled:opacity-50"
                  >
                    <Rocket className="w-4 h-4 mr-2" />
                    {isDeploying ? 'Deploying via Lace...' : 'Deploy Contract'}
                  </button>
                  
                  {deployResult && (
                    <div className={`mt-4 p-3 rounded-xl border text-sm ${deployResult.status === 'success' ? 'bg-emerald-900/20 border-emerald-500/30 text-emerald-400' : 'bg-red-900/20 border-red-500/30 text-red-400'}`}>
                      {deployResult.status === 'success' ? (
                        <>
                          <p className="font-bold mb-1">Deployment Successful!</p>
                          <p className="font-mono text-xs break-all">{deployResult.address}</p>
                          <p className="text-xs mt-2 text-slate-300">Update <code className="bg-black/30 px-1 rounded">NEXT_PUBLIC_CONTRACT_ADDRESS</code> in your .env file.</p>
                        </>
                      ) : (
                        <p>{deployResult.message}</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="glass-panel p-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Admin Status</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Current Wallet</p>
                <p className="text-sm font-mono text-white truncate">{walletAddress}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Contract Connection</p>
                <div className="flex items-center text-sm font-bold text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                  Active
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
