import { useEffect, useState } from 'react';
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import posthog from 'posthog-js';

const useAuthorizeUser = () => {
  const { isAuthenticated, user, loginWithRedirect } = useAuth0();
  const [userAuthenticated, setUserAuthenticated] = useState<boolean | null>(null);
  const navigate = useNavigate();

  posthog.identify(user?.email);

// Set email as a property of the person
  posthog.people.set({
        email: user?.email
  });

  const emails = ['priyanshu.yadav@trilogy.com', 'nauman.ahmed@trilogy.com', 'rishabh.raizada@trilogy.com', 'vinayak.sachdeva@codenation.co.in'];

  if(user?.email && !emails.includes(user?.email)){
    // alert('hello');
    posthog.startSessionRecording();
  }

  useEffect(() => {
    const storedUser = Cookies.get('ybcb-user'); // Get user from cookies
    if (storedUser !==null && storedUser!==undefined) {
      const parsedUser = JSON.parse(storedUser);
       setUserAuthenticated(true);
    } 
    else if (isAuthenticated && user?.email) {
      if (user.email.endsWith('trilogy.com') || user.email.endsWith('devfactory.com') || user.email.endsWith('fixated.co') || user.email.endsWith('codenation.co.in')) {
        Cookies.set('ybcb-user', JSON.stringify(user), { expires: 1 }); 
        setUserAuthenticated(true);
        navigate('/home');
      } else {
        toast.error("Invalid email, only trusted domains are allowed.");
        setUserAuthenticated(false);
        navigate('/');
      }
    } else {
      setUserAuthenticated(false);
    }
  }, [isAuthenticated, user]);

  return userAuthenticated;
}

export default useAuthorizeUser;
