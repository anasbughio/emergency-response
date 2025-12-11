// components/Layout.jsx
import React from 'react';

function Layout({ children }) {
  return (
    <div>
      {/* Maybe a Navbar here */}
      <main>{children}</main> 
      {/* Maybe a Footer here */}
    </div>
  );
}
export default Layout;