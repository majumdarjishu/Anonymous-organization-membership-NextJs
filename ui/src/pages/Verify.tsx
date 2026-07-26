import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { Shield, Lock, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function Verify() {
  const { walletAddress, incrementMemberCount } = useWallet();
  const [step, setStep] = useState(1);
  const [secretInput, setSecretInput] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<'success' | 'failure' | null>(null);

  if (!walletAddress) {
    return <Navigate to="/" replace />;
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secretInput) return;
    setIsSubmitting(true);
    setStep(2);
    
    try {
      // Simulate: Step 2 Load Credential, Step 3 Generate Witness, Step 4 Gen ZK Proof
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStep(3);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setStep(4);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setResult('success');
      incrementMemberCount();
      setStep(5);
    } catch (err) {
      setResult('failure');
      setStep(5);
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { num: 1, title: 'Select Organization' },
    { num: 2, title: 'Load Credential' },
    { num: 3, title: 'Generate Witness' },
    { num: 4, title: 'Generate ZK Proof' },
    { num: 5, title: 'Verification Result' }
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Membership Verification</h1>
        <p className="text-gray-500 mt-2">Zero-Knowledge Proof Wizard</p>
      </div>

      {/* Progress Bar */}
      <div className="relative">
        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
          <motion.div 
            style={{ width: `${(step / 5) * 100}%` }} 
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-600 transition-all duration-500"
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          {steps.map(s => (
            <span key={s.num} className={step >= s.num ? 'text-primary-600 font-semibold' : ''}>{s.title}</span>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="card-base">
            <div className="flex items-center space-x-4 mb-6">
              <div className="bg-primary-100 p-3 rounded-full text-primary-600">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Provide Secret Witness</h2>
                <p className="text-sm text-gray-500">Your pre-image secret never leaves your device.</p>
              </div>
            </div>
            
            <form onSubmit={handleVerify}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Confidential Secret Pre-Image</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input 
                    type="password" 
                    placeholder="Enter your confidential secret..." 
                    className="input-field pl-10"
                    value={secretInput}
                    onChange={(e) => setSecretInput(e.target.value)}
                    required
                  />
                </div>
              </div>
              <button type="submit" className="btn-primary w-full flex justify-center items-center py-3">
                Start ZK Verification Process
              </button>
            </form>
          </motion.div>
        )}

        {step > 1 && step < 5 && (
          <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card-base text-center py-12">
            <RefreshCw className="h-12 w-12 text-primary-500 animate-spin mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing Cryptography</h2>
            <p className="text-gray-500">
              {step === 2 && 'Loading confidential membership credential from local storage...'}
              {step === 3 && 'Generating private witness data...'}
              {step === 4 && 'Computing Zero-Knowledge Proof...'}
            </p>
          </motion.div>
        )}

        {step === 5 && (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card-base">
            {result === 'success' ? (
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">MEMBERSHIP VERIFIED</h2>
                <p className="text-gray-500 mb-8">Zero-Knowledge Proof accepted by the Midnight Network.</p>
                
                <div className="bg-gray-50 rounded-lg p-4 text-left border border-gray-200 mb-8">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-gray-500">Organization ID:</div>
                    <div className="font-mono text-gray-900 truncate">AnonOrg-1</div>
                    <div className="text-gray-500">Verification Time:</div>
                    <div className="text-gray-900">{new Date().toLocaleString()}</div>
                    <div className="text-gray-500">Commitment Hash:</div>
                    <div className="font-mono text-gray-900 truncate">0x{Math.random().toString(16).slice(2, 10)}...</div>
                  </div>
                </div>
                
                <button onClick={() => { setStep(1); setSecretInput(''); setResult(null); }} className="btn-secondary w-full">
                  Verify Another Credential
                </button>
              </div>
            ) : (
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">MEMBERSHIP NOT VERIFIED</h2>
                <p className="text-gray-500 mb-8">The provided witness did not match any allowed commitment.</p>
                <button onClick={() => { setStep(1); setSecretInput(''); setResult(null); }} className="btn-primary w-full">
                  Try Again
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
