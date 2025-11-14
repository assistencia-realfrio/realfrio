"use client";

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Index from './pages/Index';
import ServiceOrders from './pages/ServiceOrders';
import Clients from './pages/Clients';
import Activities from './pages/Activities';
import TimeEntries from './pages/TimeEntries';
import Equipments from './pages/Equipments';
import Settings from './pages/Settings';
import Login from './pages/Login';
import { useAuth } from './hooks/useAuth';
import SessionContextProvider from './components/SessionContextProvider';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <SessionContextProvider>
        <AppRoutes />
      </SessionContextProvider>
    </Router>
  );
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout>
              <Index />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/service-orders"
        element={
          <PrivateRoute>
            <Layout>
              <ServiceOrders />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/clients"
        element={
          <PrivateRoute>
            <Layout>
              <Clients />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/activities"
        element={
          <PrivateRoute>
            <Layout>
              <Activities />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/time-entries"
        element={
          <PrivateRoute>
            <Layout>
              <TimeEntries />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/equipments"
        element={
          <PrivateRoute>
            <Layout>
              <Equipments />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <PrivateRoute>
            <Layout>
              <Settings />
            </Layout>
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default App;