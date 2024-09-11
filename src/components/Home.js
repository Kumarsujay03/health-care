import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div>
      <h1>Welcome to the CSV Data Management App</h1>
      <Link to="/login">Login</Link> | <Link to="/upload">Upload CSV</Link>
    </div>
  );
};

export default Home;
