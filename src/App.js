import logo from './logo.svg';
import './App.css';
import Homepage from './pages/Homepage';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import OnboardingWizard from './pages/OnboardingWizard';
import Dashboard from './pages/Dashboard';
import TrainerExercises from './pages/TrainerExercises';
import TrainerLibrary from './pages/TrainerLibrary';
import TrainerRecipes from './pages/TrainerRecipes';
import TrainerPayments from './pages/TrainerPayments';
import NewsManager from './pages/NewsManager';
import Settings from './pages/Settings';
import Clients from './pages/Clients';
import Trainers from './pages/Trainers';
import Logout from './pages/Logout';
import Routines from './pages/Routines'; // ajusta la ruta según tu estructura
import Progress from './pages/Progress';   // ajusta la ruta según tu estructura
import Payments from './pages/Payments';   // ajusta la ruta según tu estructura

import {Toaster} from 'react-hot-toast';

import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <>
      <Toaster
        containerStyle={{
          zIndex: 9999 // For the container
        }}
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            color: 'white',
            background: 'green',
            zIndex: 9999 // For toasts
          },
          success: {
            icon: '👍',
          },
          error: {
            icon: '👎',
            background: 'red',
            zIndex: 9999 // For toasts
          }
        }
        } />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/wizard" element={<OnboardingWizard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/trainer-exercises" element={<TrainerExercises />} />
          <Route path="/trainer-library" element={<TrainerLibrary />} />
          <Route path="/trainer-recipes" element={<TrainerRecipes />} />
          <Route path="/trainer-payments" element={<TrainerPayments />} />
          <Route path="/news-manager" element={<NewsManager />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/clients" element={<Clients />} /> {/* Added Clients Route */}
          <Route path="/trainers" element={<Trainers />} /> {/* Added Trainers Route */}
          <Route path="/auth/logout" element={<Logout />} />
          <Route path="/routines" element={<Routines />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/payments" element={<Payments />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;