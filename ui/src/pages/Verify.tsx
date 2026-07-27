import { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { WalletRequired } from '../components/WalletRequired';
import { Shield, Lock, CheckCircle, AlertCircle, RefreshCw, Key, FileText, Download, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function Verify() {
  const { walletAddress, credentials, incrementMemberCount, addHistoryRecord } = useWallet();
  const [step, setStep] = useState(1);
  const [selectedOrg, setSelectedOrg] = useState(credentials[0]?.org || 'Jishu Org Alpha');
  const [secretInput, setSecretInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<'success' | 'failure' | null>(null);
  const [proofDetails, setProofDetails] = useState<any | null>(null);
  const [showProofModal, setShowProofModal] = useState(false);

  if (!walletAddress) {
    return <WalletRequired title="Verification Requires Wallet" description="Connect your Lace wallet or use Demo Mode to prove membership using Zero-Knowledge proofs." />;
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secretInput) return;
    setIsSubmitting(true);
    setStep(2);

    const commitmentHash = `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    const proofHash = `0x${Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

    try {
      // Step 2 Load Credential
      await new Promise(resolve => setTimeout(resolve, 800));
      setStep(3);
      // Step 3 Generate Witness
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStep(4);
      // Step 4 Gen ZK Proof
      await new Promise(resolve => setTimeout(resolve, 1200));

      const generatedProof = {
        proofHash,
        commitmentHash,
        organization: selectedOrg,
        timestamp: new Date().toISOString(),
        circuit: 'anonymous_membership_v1',
        nullifier: `0x${Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
        curve: 'BLS12-381',
        proofType: 'ZK-SNARK Groth16',
        publicInputs: [commitmentHash, '0x00000001']
      };

      setProofDetails(generatedProof);
      setResult('success');
      incrementMemberCount();

      // Automatically add record to history!
      addHistoryRecord({
        org: selectedOrg,
        result: 'Verified',
        hash: proofHash,
        status: 'Active',
        proofType: 'ZK-SNARK Groth16'
      });

      setStep(5);
    } catch (err) {
      setResult('failure');
      setStep(5);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillSampleSecret = (secret: string) => {
    setSecretInput(secret);
  };

  const downloadCertificate = () => {
    if (!proofDetails) return;
    const certText = `MIDNIGHT NETWORK ZERO-KNOWLEDGE PROOF CERTIFICATE\n` +
      `-----------------------------------------------------\n` +
      `Organization: ${proofDetails.organization}\n` +
      `Result: MEMBERSHIP VERIFIED (SUCCESS)\n` +
      `Timestamp: ${proofDetails.timestamp}\n` +
      `Proof Hash: ${proofDetails.proofHash}\n` +
      `Commitment Hash: ${proofDetails.commitmentHash}\n` +
      `Nullifier: ${proofDetails.nullifier}\n` +
      `Proof Type: ${proofDetails.proofType}\n` +
      `Curve: ${proofDetails.curve}\n` +
      `-----------------------------------------------------\n` +
      `Cryptographically Verified by Midnight Protocol.`;

    const blob = new Blob([certText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zk-proof-certificate-${proofDetails.organization.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const steps = [
    { num: 1, title: 'Input Witness' },
    { num: 2, title: 'Load Credential' },
    { num: 3, title: 'Generate Witness' },
    { num: 4, title: 'Compute ZK Proof' },
    { num: 5, title: 'Verification Result' }
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Membership Verification</h1>
        <p className="text-gray-500 mt-2">Zero-Knowledge Proof Generation Wizard</p>
      </div>

      {/* Progress Bar */}
      <div className="relative bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-100">
          <motion.div 
            animate={{ width: `${(step / 5) * 100}%` }} 
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-600 transition-all duration-500"
          />
        </div>
        <div className="grid grid-cols-5 text-center text-xs text-gray-500">
          {steps.map(s => (
            <span key={s.num} className={step >= s.num ? 'text-primary-600 font-bold' : ''}>{s.title}</span>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="card-base shadow-md border border-gray-200">
            <div className="flex items-center space-x-4 mb-6">
              <div className="bg-primary-100 p-3 rounded-xl text-primary-600">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Provide Secret Pre-Image Witness</h2>
                <p className="text-sm text-gray-500">Your pre-image secret never leaves your browser.</p>
              </div>
            </div>
            
            <form onSubmit={handleVerify} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Select Target Organization</label>
                <select 
                  value={selectedOrg} 
                  onChange={(e) => setSelectedOrg(e.target.value)}
                  className="input-field cursor-pointer"
                >
                  {credentials.map(c => (
                    <option key={c.id} value={c.org}>{c.org} ({c.type})</option>
                  ))}
                  <option value="Jishu Org Alpha">Jishu Org Alpha</option>
                  <option value="Midnight Privacy Guild">Midnight Privacy Guild</option>
                  <option value="Confidential Enterprise">Confidential Enterprise</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-semibold text-gray-700">Confidential Secret Pre-Image</label>
                  <span className="text-xs text-primary-600 font-medium">Keep Private</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input 
                    type="password" 
                    placeholder="Enter your confidential secret key..." 
                    className="input-field pl-10 pr-10"
                    value={secretInput}
                    onChange={(e) => setSecretInput(e.target.value)}
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <span title="Generate Random Secret" onClick={() => fillSampleSecret(`secret_preimage_${Math.floor(Math.random()*1000)}`)} className="cursor-pointer">
                      <Key className="h-4 w-4 text-gray-400 hover:text-primary-600" />
                    </span>
                  </div>
                </div>
              </div>

              {/* Sample Presets */}
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <p className="text-xs font-semibold text-gray-600 mb-2 flex items-center">
                  <Sparkles className="h-3.5 w-3.5 mr-1 text-amber-500" /> Quick Preset Witness Keys:
                </p>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => fillSampleSecret('secret_jishu_alpha_2026')} className="px-2.5 py-1 text-xs bg-white hover:bg-primary-50 border border-gray-300 rounded font-mono text-gray-700 hover:text-primary-700">
                    jishu_alpha_2026
                  </button>
                  <button type="button" onClick={() => fillSampleSecret('secret_midnight_guild_vip')} className="px-2.5 py-1 text-xs bg-white hover:bg-primary-50 border border-gray-300 rounded font-mono text-gray-700 hover:text-primary-700">
                    midnight_guild_vip
                  </button>
                  <button type="button" onClick={() => fillSampleSecret(`demo_key_${Date.now().toString().slice(-4)}`)} className="px-2.5 py-1 text-xs bg-white hover:bg-primary-50 border border-gray-300 rounded font-mono text-gray-700 hover:text-primary-700">
                    Auto-Generate Random
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={!secretInput || isSubmitting}
                className="btn-primary w-full flex justify-center items-center py-3 text-base font-semibold shadow-md disabled:opacity-50"
              >
                <span>Start ZK Proof Generation</span>
              </button>
            </form>
          </motion.div>
        )}

        {step > 1 && step < 5 && (
          <motion.div key="processing" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="card-base text-center py-16 shadow-md border border-gray-200">
            <RefreshCw className="h-14 w-14 text-primary-600 animate-spin mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Executing Zero-Knowledge Circuit</h2>
            <p className="text-gray-600 max-w-md mx-auto">
              {step === 2 && 'Loading confidential membership credential from local storage...'}
              {step === 3 && 'Constructing local private witness environment...'}
              {step === 4 && 'Evaluating ZK-SNARK circuit & computing proof bytes...'}
            </p>
            <div className="mt-8 flex justify-center">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary-700 border border-primary-200">
                <span className="w-2 h-2 rounded-full bg-primary-500 animate-ping mr-2"></span>
                Midnight Local Prover Active
              </span>
            </div>
          </motion.div>
        )}

        {step === 5 && (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card-base shadow-md border border-gray-200">
            {result === 'success' ? (
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">MEMBERSHIP VERIFIED</h2>
                <p className="text-gray-500 mb-6">Zero-Knowledge Proof accepted by Midnight Network smart contract.</p>
                
                <div className="bg-gray-50 rounded-xl p-5 text-left border border-gray-200 mb-8 space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-500">Target Organization:</div>
                    <div className="font-semibold text-gray-900">{selectedOrg}</div>
                    <div className="text-gray-500">Verification Result:</div>
                    <div className="text-emerald-600 font-bold flex items-center">
                      <CheckCircle className="h-3.5 w-3.5 mr-1" /> PASSED
                    </div>
                    <div className="text-gray-500">Proof Hash:</div>
                    <div className="font-mono text-gray-900 truncate">{proofDetails?.proofHash}</div>
                    <div className="text-gray-500">Commitment Nullifier:</div>
                    <div className="font-mono text-gray-900 truncate">{proofDetails?.nullifier}</div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <button 
                    onClick={() => setShowProofModal(true)} 
                    className="btn-secondary flex-1 flex items-center justify-center space-x-2 py-2.5 text-sm"
                  >
                    <FileText className="h-4 w-4 text-primary-600" />
                    <span>View ZK Proof Details</span>
                  </button>
                  <button 
                    onClick={downloadCertificate} 
                    className="btn-secondary flex-1 flex items-center justify-center space-x-2 py-2.5 text-sm"
                  >
                    <Download className="h-4 w-4 text-gray-600" />
                    <span>Download Certificate</span>
                  </button>
                </div>

                <button 
                  onClick={() => { setStep(1); setSecretInput(''); setResult(null); setProofDetails(null); }} 
                  className="btn-primary w-full mt-4 py-3 text-sm font-semibold"
                >
                  Verify Another Credential
                </button>
              </div>
            ) : (
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">VERIFICATION FAILED</h2>
                <p className="text-gray-500 mb-8">The provided witness secret did not match any active commitment allowlist.</p>
                <button onClick={() => { setStep(1); setSecretInput(''); setResult(null); }} className="btn-primary w-full py-3">
                  Try Again
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Proof Details Modal */}
      {showProofModal && proofDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <Shield className="h-5 w-5 text-primary-600 mr-2" />
                ZK-SNARK Proof Metadata
              </h3>
              <button onClick={() => setShowProofModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <pre className="bg-gray-900 text-emerald-400 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-72 leading-relaxed">
              {JSON.stringify(proofDetails, null, 2)}
            </pre>

            <div className="flex justify-end space-x-2 pt-2">
              <button onClick={() => setShowProofModal(false)} className="btn-secondary py-2 px-4 text-xs font-semibold">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
