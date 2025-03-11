// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Dashboard from './components/dashboard/Dashboard';
import ProductList from './components/products/ProductList';
import CategoryList from './components/categories/CategoryList';
import SupplierList from './components/suppliers/SupplierList';
import InventoryList from './components/inventory/InventoryList';
import { Container } from '@mui/material';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Container style={{ marginTop: '20px' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/categories" element={<CategoryList />} />
            <Route path="/suppliers" element={<SupplierList />} />
            <Route path="/inventory" element={<InventoryList />} />
          </Routes>
        </Container>
      </div>
    </Router>
  );
}

export default App;