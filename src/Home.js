import React from 'react';
import './Home.css';

const Home = ({ user }) => {
  return (
    <div className="home-container">
      <h1>Welcome to BlockScribe</h1>
      <p>Your secure and seamless note-taking companion.</p>
      {!user && <p>Please sign in to continue</p>}
    </div>
  );
};

export default Home;