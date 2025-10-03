import './App.css';
import { BrowserRouter, Route, Routes} from 'react-router-dom';
import Dashboard from './components/Pages/Dashboard';
import Layout from './components/layout/Layout';
import PatientRegistration from './components/Pages/PatientRegistration';
import PatientHistory from './components/Pages/PatientHistory';
import Login from './components/Pages/Login';
import WaitingPatients from './utils/WaitingPatients';
import UserManagement from './components/Pages/UserManagement';
import DispensaryManagement from './components/Pages/DispensaryManagement';
import DispensaryIssue from './components/Pages/DispensaryIssue';
import DoctorConsultation from './components/Pages/DoctorConsultation';
import PatientsManagement from './components/Pages/PatientsManagement';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/waiting-patients" element={<Layout><WaitingPatients /></Layout>} />
        <Route path="/patient-registration" element={<Layout><PatientRegistration /></Layout>} />
        <Route path="/patient-history" element={<Layout><PatientHistory /></Layout>} />
        <Route path="/user-management" element={<Layout><UserManagement /></Layout>} />
        <Route path="/dispensary-management" element={<Layout><DispensaryManagement /></Layout>} />
        <Route path='/dispensary-issue' element={<Layout><DispensaryIssue /></Layout>} />
        <Route path='/doctor-consultation' element={<Layout><DoctorConsultation /></Layout>} />
        <Route path='/patients-management' element={<Layout><PatientsManagement /></Layout>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
