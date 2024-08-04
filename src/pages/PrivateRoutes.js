import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { auth } from '../firebase-config';

function PrivateRoute({ component: Component }) {
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setIsAuth(!!user);
      setLoading(false);
    });

    // Clean up subscription on unmount
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Show loading spinner or similar
  }

  return isAuth ? <Component /> : <Navigate to="/login" />;
}

export default PrivateRoute;
