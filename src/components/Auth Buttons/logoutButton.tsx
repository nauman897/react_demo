import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Cookies from 'js-cookie';

const LogoutButton = () => {
  const { logout } = useAuth0();

  const handleLogout = () => {
    Cookies.remove('ybcb-user'); 
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  return (
    <button onClick={handleLogout} className="logout-btn" style={{borderRadius: '10px'}}>
      Log Out 
    </button>
  );
};

export default LogoutButton;
