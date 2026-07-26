import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WalletProvider } from './context/WalletContext';
import { PageLayout } from './components/PageLayout';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { Admin } from './pages/Admin';
import { Verify } from './pages/Verify';
import { Credentials } from './pages/Credentials';
import { History } from './pages/History';
import { Privacy } from './pages/Privacy';
import { About } from './pages/About';

function App() {
  return (
    <WalletProvider>
      <Router>
        <PageLayout>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/verify" element={<Verify />} />
            <Route path="/credentials" element={<Credentials />} />
            <Route path="/history" element={<History />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </PageLayout>
      </Router>
    </WalletProvider>
  );
}

export default App;
