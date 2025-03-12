import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container } from '@mui/material';
import Navbar from './components/layout/Navbar';
import Dashboard from './components/dashboard/Dashboard';
import ProductList from './components/products/ProductList';
import CategoryList from './components/categories/CategoryList';
import SupplierList from './components/suppliers/SupplierList';
import InventoryList from './components/inventory/InventoryList';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import UserList from './components/users/UserList';
import Unauthorized from './components/common/Unauthorized';
import ProtectedRoute from './components/common/ProtectedRoute';
import AuthTest from './components/auth/AuthTest';
import { AuthProvider } from './context/AuthContext';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Routes>

          <Route path="/auth-test" element={
  <>
    <Navbar />
    <Container style={{ marginTop: '20px' }}>
      <AuthTest />
    </Container>
  </>
} />
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected routes with layout */}
            <Route
              path="/"
              element={
                <ProtectedRoute
                  element={
                    <>
                      <Navbar />
                      <Container style={{ marginTop: '20px' }}>
                        <Dashboard />
                      </Container>
                    </>
                  }
                />
              }
            />
            
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute
                  element={
                    <>
                      <Navbar />
                      <Container style={{ marginTop: '20px' }}>
                        <Dashboard />
                      </Container>
                    </>
                  }
                />
              }
            />
            
            <Route
              path="/products"
              element={
                <ProtectedRoute
                  element={
                    <>
                      <Navbar />
                      <Container style={{ marginTop: '20px' }}>
                        <ProductList />
                      </Container>
                    </>
                  }
                />
              }
            />
            
            <Route
              path="/categories"
              element={
                <ProtectedRoute
                  element={
                    <>
                      <Navbar />
                      <Container style={{ marginTop: '20px' }}>
                        <CategoryList />
                      </Container>
                    </>
                  }
                />
              }
            />
            
            <Route
              path="/suppliers"
              element={
                <ProtectedRoute
                  element={
                    <>
                      <Navbar />
                      <Container style={{ marginTop: '20px' }}>
                        <SupplierList />
                      </Container>
                    </>
                  }
                />
              }
            />
            
            <Route
              path="/inventory"
              element={
                <ProtectedRoute
                  element={
                    <>
                      <Navbar />
                      <Container style={{ marginTop: '20px' }}>
                        <InventoryList />
                      </Container>
                    </>
                  }
                />
              }
            />
            
            {/* Admin-only routes */}
            <Route
              path="/users"
              element={
                <ProtectedRoute
                  requiredRole="ADMIN"
                  element={
                    <>
                      <Navbar />
                      <Container style={{ marginTop: '20px' }}>
                        <UserList />
                      </Container>
                    </>
                  }
                />
              }
            />
            
            <Route
              path="/register"
              element={
                <ProtectedRoute
                  requiredRole="ADMIN"
                  element={
                    <>
                      <Navbar />
                      <Container style={{ marginTop: '20px' }}>
                        <Register />
                      </Container>
                    </>
                  }
                />
              }
            />
            
            {/* Unauthorized and catch-all routes */}
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;