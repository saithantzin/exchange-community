import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const DEMO_USERS = {
  MDY: {
    id: 1,
    name: 'Thant Zin',
    email: 'thantzin@exchange.mm',
    city: 'Mandalay (MDY)',
    cityCode: 'MDY',
    phone: '09798123456',
    bio: 'Architecture student & woodcraft enthusiast living near 78th street, Mandalay. Passionate about second-hand circular reuse.',
    joined: 'January 2024',
    rating: 4.9,
    completedExchanges: 6,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80'
  },
  YGN: {
    id: 3,
    name: 'Kyaw Zin Htet',
    email: 'kyawzin@exchange.mm',
    city: 'Yangon (YGN)',
    cityCode: 'YGN',
    phone: '09450987654',
    bio: 'Software engineer based in Kamayut, Yangon. Constantly cycling pre-loved tech gadgets, audio gear, and books.',
    joined: 'August 2023',
    rating: 5.0,
    completedExchanges: 22,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80'
  }
};

export function AuthProvider({ children }) {
  // By default, start as Guest or load saved session
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('recirculate_user');
    return saved ? JSON.parse(saved) : null;
  });

  const isLoggedIn = Boolean(currentUser);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('recirculate_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('recirculate_user');
    }
  }, [currentUser]);

  const login = (email, password) => {
    // Validated login
    if (!email || !password) {
      return { success: false, message: 'Please provide both email and password.' };
    }
    // Simulation
    const userToLogin = email.toLowerCase().includes('yangon') || email.toLowerCase().includes('kyaw')
      ? DEMO_USERS.YGN
      : DEMO_USERS.MDY;

    setCurrentUser(userToLogin);
    return { success: true, user: userToLogin };
  };

  const register = (userData) => {
    if (!userData.name || !userData.email || !userData.password) {
      return { success: false, message: 'All required fields must be filled.' };
    }
    const newUser = {
      id: Date.now(),
      name: userData.name,
      email: userData.email,
      city: userData.city || 'Mandalay (MDY)',
      cityCode: userData.city?.includes('YGN') ? 'YGN' : 'MDY',
      phone: userData.phone || '09xxxxxxxxx',
      bio: 'New community member dedicated to mindful item swapping.',
      joined: 'Joined this month',
      rating: 5.0,
      completedExchanges: 0,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80'
    };
    setCurrentUser(newUser);
    return { success: true, user: newUser };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const quickLogin = (city = 'MDY') => {
    setCurrentUser(city === 'YGN' ? DEMO_USERS.YGN : DEMO_USERS.MDY);
  };

  const updateProfile = (updatedFields) => {
    setCurrentUser(prev => ({
      ...prev,
      ...updatedFields
    }));
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoggedIn,
        login,
        register,
        logout,
        quickLogin,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
