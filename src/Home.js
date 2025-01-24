// Home.js
import React from 'react';
import './Home.css'; // Import the CSS file for styling

const Home = () => {
  return (
    <div className="home-container">
      <h1>Welcome to BlockScribe</h1>
      <p>Your secure and seamless note-taking companion.</p>
      <p>Please sign in to continue.</p>
      {/* <button className="sign-in-button">Sign In with Google</button> */}
    </div>
  );
};

export default Home;
