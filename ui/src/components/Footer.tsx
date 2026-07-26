import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Shield className="h-6 w-6 text-primary-600" />
            <span className="text-xl font-bold text-gray-900 tracking-tight">Jishu Org</span>
          </div>
          
          <div className="flex space-x-6 text-sm text-gray-500">
            <Link to="/about" className="hover:text-primary-600 transition-colors">About</Link>
            <Link to="/privacy" className="hover:text-primary-600 transition-colors">Privacy Model</Link>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-primary-600 transition-colors">GitHub Repository</a>
          </div>
        </div>
        
        <div className="mt-8 border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-400">
          <p>© 2026 Jishu Org. Confidential Credentials Category.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <span>Powered by Midnight Network</span>
            <span>MIT License</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
