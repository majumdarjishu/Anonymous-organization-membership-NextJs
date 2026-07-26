import { Link } from 'react-router-dom';
import { Fingerprint, Lock, Zap, ArrowRight, CheckCircle, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export function Landing() {
  return (
    <div className="flex flex-col gap-24 py-8">
      {/* Hero Section */}
      <section className="relative text-center px-4 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="inline-flex items-center space-x-2 bg-primary-50 text-primary-700 px-4 py-1.5 rounded-full text-sm font-medium mb-8">
            <Zap className="h-4 w-4" />
            <span>Powered by Midnight Network</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight mb-6">
            Prove Organization Membership <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600">Without Revealing Your Identity</span>
          </h1>
          <p className="text-xl text-gray-500 mb-10 leading-relaxed max-w-3xl mx-auto">
            Midnight Network enables members to privately prove organization membership using Zero-Knowledge Credentials while keeping their identity, membership details, and personal information completely confidential.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link to="/verify" className="btn-primary text-lg px-8 py-3 w-full sm:w-auto flex items-center justify-center space-x-2">
              <span>Verify Membership</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link to="/about" className="btn-secondary text-lg px-8 py-3 w-full sm:w-auto">
              Learn How It Works
            </Link>
          </div>
        </motion.div>
      </section>

      {/* How it Works */}
      <section className="max-w-7xl mx-auto px-4 w-full">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
          <p className="text-gray-500 mt-4 text-lg">Four steps to absolute privacy.</p>
        </div>
        <div className="grid md:grid-cols-4 gap-8">
          {[
            { icon: Users, title: 'Issue Credential', desc: 'Organization Issues Confidential Membership Credential' },
            { icon: Lock, title: 'Private Witness', desc: 'Member Generates Private Witness locally on device' },
            { icon: Fingerprint, title: 'ZK Proof', desc: 'Zero-Knowledge Membership Proof is generated' },
            { icon: CheckCircle, title: 'Verify', desc: 'Organization Verifies Membership Without Revealing Identity' }
          ].map((step, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="card-base text-center relative">
              <div className="w-12 h-12 mx-auto bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center mb-4">
                <step.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Step {i + 1}: {step.title}</h3>
              <p className="text-gray-500 text-sm">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 w-full">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900">Enterprise Features</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            'Anonymous Membership Verification',
            'Confidential Credentials',
            'Zero-Knowledge Proofs',
            'Private Member Authentication',
            'Tamper-Proof Membership Records',
            'Privacy-First Organization Management'
          ].map((feature, i) => (
            <div key={i} className="flex items-start space-x-3 p-4">
              <CheckCircle className="h-6 w-6 text-primary-500 shrink-0" />
              <span className="text-gray-700 font-medium">{feature}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
