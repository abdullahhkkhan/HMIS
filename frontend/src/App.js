import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Route, Routes} from 'react-router-dom';
import Dashboard from './components/dashboard/Dashboard';
import Layout from './components/layout/Layout';
import WaitingPatients from './components/waiting_patients/WaitingPatients';
import PatientRegistration from './components/patient_registration/PatientRegistration';
import PatientHistory from './components/patient_history/PatientHistory';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/waiting-patients" element={<Layout><WaitingPatients /></Layout>} />
        <Route path="/patient-registration" element={<Layout><PatientRegistration /></Layout>} />
        <Route path="/patient-history" element={<Layout><PatientHistory /></Layout>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
