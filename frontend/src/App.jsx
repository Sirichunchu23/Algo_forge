import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';

import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Problems from './pages/Problems';
import EditorPage from './pages/EditorPage';
import MySubmissions from './pages/MySubmissions';
import Profile from './pages/Profile';

import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProblems from './pages/admin/AdminProblems';
import AdminProblemForm from './pages/admin/AdminProblemForm';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSubmissions from './pages/admin/AdminSubmissions';
import NotFound from './pages/NotFound';

export default function App() {
  const { user } = useAuthStore();

  return (
    <BrowserRouter>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1c1c1c', color: '#f5f5f5',
            border: '1px solid #2a2a2a', fontFamily: 'Outfit, sans-serif',
            fontSize: '0.875rem',
          },
          success: { iconTheme: { primary: '#00c853', secondary: '#000' } },
          error: { iconTheme: { primary: '#f44336', secondary: '#000' } },
        }}
      />

      <Routes>
        {/* Auth pages — no navbar */}
        <Route path="/login" element={user ? <Navigate to="/problems" replace /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/problems" replace /> : <Register />} />

        {/* Student pages — with navbar */}
        <Route path="/" element={
          <ProtectedRoute>
            <Navbar />
            <main style={{ paddingTop: '3.5rem' }}>
              <Navigate to="/problems" replace />
            </main>
          </ProtectedRoute>
        } />

        <Route path="/problems" element={
          <ProtectedRoute>
            <Navbar />
            <main style={{ paddingTop: '3.5rem' }}><Problems /></main>
          </ProtectedRoute>
        } />

        <Route path="/problems/:slug" element={
          <ProtectedRoute>
            <EditorPage />
          </ProtectedRoute>
        } />

        <Route path="/submissions" element={
          <ProtectedRoute role="student">
            <Navbar />
            <main style={{ paddingTop: '3.5rem' }}><MySubmissions /></main>
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute>
            <Navbar />
            <main style={{ paddingTop: '3.5rem' }}><Profile /></main>
          </ProtectedRoute>
        } />

        {/* Admin pages */}
        <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="problems" element={<AdminProblems />} />
          <Route path="problems/new" element={<AdminProblemForm />} />
          <Route path="problems/:id/edit" element={<AdminProblemForm />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="submissions" element={<AdminSubmissions />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
