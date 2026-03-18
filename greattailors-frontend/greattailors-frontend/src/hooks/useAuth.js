import { useState, useEffect } from 'react';

export default function useAuth() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('gt_user')) || null;
    } catch { return null; }
  });

  useEffect(() => {
    localStorage.setItem('gt_user', JSON.stringify(user));
  }, [user]);

  const login = (userObj, token) => {
    if (token) localStorage.setItem('gt_token', token);
    setUser(userObj);
  };
  const logout = () => {
    localStorage.removeItem('gt_token');
    localStorage.removeItem('gt_user');
    setUser(null);
  };
  return { user, login, logout, setUser };
}
