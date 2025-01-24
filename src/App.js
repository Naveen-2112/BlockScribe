import React, { useState,useEffect } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import {jwtDecode} from 'jwt-decode';
import {BrowserRouter as Router, Route, Routes, Navigate, useNavigate, Link } from 'react-router-dom';
import './styles.css';
import Home from './Home';
import Dashboard from './Dashboard';

function App() {
  
  const [user,setUser]=useState(null);

  const handleLoginSuccess = (credentialResponse) => {
    // console.log("Login Success:", credentialResponse);

    // Decode the JWT to get user info
    const decodedToken = jwtDecode(credentialResponse.credential);
    // console.log("User Info:", decodedToken);
    localStorage.setItem('user', JSON.stringify(decodedToken));
    // Display user details
    alert(`Welcome, ${decodedToken.name}`);
    setUser(decodedToken);

  };

  const handleLoginFailure = () => {
    console.error("Login Failed");
  };

  const handleLogout=()=>
  {
    localStorage.removeItem('user');
    setUser(null);
    // console.log('User logged out');

  }

  useEffect(()=>{
    const storeduser=localStorage.getItem('user');
    if(storeduser){
      setUser(JSON.parse(storeduser));
    }
  }, []);

  return (
    <GoogleOAuthProvider clientId="1057977205993-52l6hjsq4urhhe4aptbnmfu6tk8q62l0.apps.googleusercontent.com">
      <Router>
        <nav>
          <Link to="/" class="link">Home</Link> | <Link to="/dashboard" class="link">Dashboard</Link>
          {user ? (
            <div>
              <h2>Hello, {user.name}</h2>
              <button onClick={handleLogout}>Logout</button>
            </div>
          ):(
          <GoogleLogin
            onSuccess={handleLoginSuccess}
            onError={handleLoginFailure}
          />)}
        </nav>


        <Routes>
          <Route path="/" element={user ? <Navigate to="/dashboard"/> : <Home />} />
          {/* <Route path="/dashboard" element={user ? <Dashboard/> : <Navigate to="/"></Navigate>} /> */}
          <Route path="/dashboard" element={user ? <Dashboard user={user}/> : <Navigate to="/" />} />

        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}
// const Home = ({ user }) => {
//   return <h2>Welcome to BlockScribe, Please sign in to continue</h2>;
// };

// const Dashboard = () => {
//   return <h2>Dashboard(protected)</h2>
// }

export default App;
