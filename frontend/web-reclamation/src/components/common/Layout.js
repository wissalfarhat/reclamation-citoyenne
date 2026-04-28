import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

const Layout = ({ children }) => {
  return (
    <div className="app-layout">
      <Header />
      <div className="layout-content">
        <Sidebar />
        <main className="main-content">
          {children}  {}
          <Outlet />   {}
        </main>
      </div>
    </div>
  );
};

export default Layout;