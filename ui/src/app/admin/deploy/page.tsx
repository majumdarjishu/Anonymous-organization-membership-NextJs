"use client";

import React, { useState } from 'react';
import { useMidnight } from '@/context/MidnightContext';
import { Shield, Server, FileCode, CheckCircle, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';
import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';
import { getCompiledContract, createMidnightProviders, PRIVATE_STATE_ID } from '@/lib/midnight';

export default function DeployPage() {
  const { status, connectWallet, walletName, network, deployContractAction } = useMidnight();
  const [deployState, setDeployState] = useState<'idle' | 'preparing' | 'waiting_approval' | 'submitted' | 'deployed' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [deployedAddress, setDeployedAddress] = useState('');

  const handleDeploy = async () => {
    setDeployState('preparing');
    setErrorMessage('');
    
    try {
      setDeployState('waiting_approval');
      
      const contractAddress = await deployContractAction();
      
      setDeployedAddress(contractAddress);
      setDeployState('deployed');
      
    } catch (err: any) {
      console.error("Deployment failed:", err);
      setErrorMessage(err.message || err.toString());
      setDeployState('error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-10">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Contract Deployment</h1>
        <p className="text-slate-500 mt-2">Deploy the Anonymous Membership Organisation contract using your connected wallet.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center gap-3 text-primary-600">
            <Server className="w-6 h-6" />
            <h2 className="text-xl font-semibold text-slate-900">Environment</h2>
          </div>
          
          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-500">Network</span>
              <span className="font-mono font-medium text-slate-900 bg-slate-100 px-2 py-1 rounded">{network.name || 'undeployed'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-500">Wallet</span>
              {status === 'connected' ? (
                <span className="font-medium text-emerald-600 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" /> {walletName}
                </span>
              ) : (
                <span className="text-amber-500 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" /> Not connected
                </span>
              )}
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-slate-500">Contract</span>
              <span className="font-mono font-medium text-slate-900 bg-slate-100 px-2 py-1 rounded truncate max-w-[200px]">anonymous-membership-organisation</span>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center gap-3 text-primary-600">
            <Shield className="w-6 h-6" />
            <h2 className="text-xl font-semibold text-slate-900">Action</h2>
          </div>

          <div className="pt-2 h-full flex flex-col justify-center">
            {status !== 'connected' ? (
              <div className="text-center space-y-4">
                <p className="text-sm text-slate-500">Connect your Midnight Wallet to deploy the contract.</p>
                <button onClick={connectWallet} className="btn-primary w-full justify-center">
                  Connect Wallet
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {deployState === 'idle' && (
                  <button onClick={handleDeploy} className="btn-primary w-full justify-center">
                    Deploy Contract <ArrowRight className="ml-2 w-4 h-4" />
                  </button>
                )}
                
                {deployState === 'preparing' && (
                  <div className="text-center p-4 bg-primary-50 rounded-xl text-primary-700 flex flex-col items-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Preparing deployment...</span>
                  </div>
                )}

                {deployState === 'waiting_approval' && (
                  <div className="text-center p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 flex flex-col items-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Waiting for wallet approval...</span>
                  </div>
                )}

                {deployState === 'submitted' && (
                  <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 flex flex-col items-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Transaction submitted... Waiting for confirmation...</span>
                  </div>
                )}

                {deployState === 'deployed' && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-emerald-700 font-medium">
                      <CheckCircle className="w-5 h-5" />
                      Contract Deployed!
                    </div>
                    <div className="text-xs font-mono break-all bg-white p-2 rounded border border-emerald-100 text-slate-600">
                      {deployedAddress}
                    </div>
                  </div>
                )}

                {deployState === 'error' && (
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-rose-700 font-medium">
                      <AlertTriangle className="w-5 h-5" />
                      Deployment Failed
                    </div>
                    <div className="text-sm text-rose-600 overflow-auto max-h-32 p-2 bg-white rounded border border-rose-100">
                      {errorMessage}
                    </div>
                    <button onClick={() => setDeployState('idle')} className="btn-secondary w-full justify-center mt-2 text-sm">
                      Try Again
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
