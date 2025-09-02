import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Route, Routes} from 'react-router-dom';
import Dashboard from './components/Pages/Dashboard';
import Layout from './components/layout/Layout';
import WaitingPatients from './components/Pages/WaitingPatients';
import PatientRegistration from './components/Pages/PatientRegistration';
import PatientHistory from './components/Pages/PatientHistory';
import Login from './components/Pages/Login';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/waiting-patients" element={<Layout><WaitingPatients /></Layout>} />
        <Route path="/patient-registration" element={<Layout><PatientRegistration /></Layout>} />
        <Route path="/patient-history" element={<Layout><PatientHistory /></Layout>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
