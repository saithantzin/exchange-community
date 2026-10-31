import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

const DEMO_USERS = {
  MDY: {
    id: 2,
    name: 'Thant Zin',
    username: 'thantzin',
    email: 'thantzin@exchange.mm',
    city: 'Mandalay (Chanayethazan)',
    cityCode: 'MDY',
    phone: '09798123456',
    role: 'user',
    communicationContacts: {
      telegram: '@thantzin_mdy',
      viber: '+959798123456',
      facebook: 'https://facebook.com/thantzin.mm',
      alternative: '',
      preferredMethod: 'telegram'
    },
    bio: 'Photography and tech gear enthusiast in Mandalay. Dedicated to circular reuse.',
    joined: 'January 2024',
    rating: 4.95,
    completedExchanges: 6,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80'
  },
  YGN: {
    id: 3,
    name: 'Kyaw Zin Htet',
    username: 'kyawzin',
    email: 'kyawzin@exchange.mm',
    city: 'Yangon (Kamayut)',
    cityCode: 'YGN',
    phone: '09450987654',
    role: 'user',
    communicationContacts: {
      telegram: '@kyawzin_ygn',
      viber: '+959450987654',
      facebook: 'https://facebook.com/kyawzin.htet',
      alternative: '',
      preferredMethod: 'viber'
    },
    bio: 'Software engineer based in Kamayut, Yangon. Constantly cycling pre-loved tech gadgets and audio gear.',
    joined: 'August 2023',
    rating: 4.88,
    completedExchanges: 22,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80'
  }
};

function formatUserFromBackend(backendUser) {
  if (!backendUser) return null;

  const contacts = {};
  if (Array.isArray(backendUser.communication_contacts)) {
    backendUser.communication_contacts.forEach(c => {
      const p = (c.platform || '').toLowerCase();
      if (p.includes('telegram')) contacts.telegram = c.contact_value;
      else if (p.includes('viber')) contacts.viber = c.contact_value;
      else if (p.includes('facebook') || p.includes('messenger')) contacts.facebook = c.contact_value;
      else contacts.alternative = c.contact_value;

      if (c.is_preferred) {
        contacts.preferredMethod = p.includes('telegram') ? 'telegram' : p.includes('facebook') ? 'facebook' : 'viber';
      }
    });
  }

  const townshipName = backendUser.township?.name || '';
  const regionName = backendUser.state_region?.name || '';
  const cityDisplay = townshipName && regionName ? `${townshipName}, ${regionName}` : (backendUser.city || 'Yangon');

  return {
    id: backendUser.id,
    name: backendUser.name,
    username: backendUser.username,
    email: backendUser.email,
    phone: backendUser.phone || '',
    city: cityDisplay,
    cityCode: cityDisplay.toLowerCase().includes('mandalay') ? 'MDY' : 'YGN',
    role: backendUser.role || 'user',
    communicationContacts: {
      telegram: contacts.telegram || '',
      viber: contacts.viber || '',
      facebook: contacts.facebook || '',
      alternative: contacts.alternative || '',
      preferredMethod: contacts.preferredMethod || 'telegram'
    },
    bio: backendUser.bio || 'Community member dedicated to mindful item swapping.',
    rating: Number(backendUser.rating) || 5.0,
    avatar: backendUser.profile_image || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80'
  };
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('recirculate_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [loading, setLoading] = useState(false);
  const isLoggedIn = Boolean(currentUser);

  // Sync user state to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('recirculate_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('recirculate_user');
    }
  }, [currentUser]);

  // On mount, if a token exists, verify and refresh profile from Laravel backend
  useEffect(() => {
    const token = localStorage.getItem('recirculate_token');
    if (token) {
      authService.getMe()
        .then(res => {
          if (res?.success && res.data) {
            setCurrentUser(formatUserFromBackend(res.data));
          }
        })
        .catch(err => {
          console.warn('Backend session verification failed, keeping cached session:', err?.message);
        });
    }
  }, []);

  /**
   * Login with Laravel API (with fallback simulation if backend offline)
   */
  const login = async (loginCredential, password) => {
    if (!loginCredential || !password) {
      return { success: false, message: 'Please provide both username/email and password.' };
    }

    setLoading(true);
    try {
      const response = await authService.login({ login: loginCredential, password });
      if (response?.success && response.data) {
        const { user, token } = response.data;
        localStorage.setItem('recirculate_token', token);
        const formatted = formatUserFromBackend(user);
        setCurrentUser(formatted);
        setLoading(false);
        return { success: true, user: formatted };
      }
    } catch (err) {
      console.warn('Laravel API login failed, checking fallback:', err);
      // If backend returned a specific error (e.g. invalid credentials or account suspended)
      if (err.response?.data?.message) {
        setLoading(false);
        return { success: false, message: err.response.data.message };
      }
    }

    // Fallback simulation for offline testing
    const fallbackUser = loginCredential.toLowerCase().includes('yangon') || loginCredential.toLowerCase().includes('kyaw')
      ? DEMO_USERS.YGN
      : DEMO_USERS.MDY;

    setCurrentUser(fallbackUser);
    setLoading(false);
    return { success: true, user: fallbackUser };
  };

  /**
   * Register with Laravel API
   */
  const register = async (userData) => {
    if (!userData.name || !userData.email || !userData.password) {
      return { success: false, message: 'All required fields must be filled.' };
    }

    setLoading(true);
    try {
      const payload = {
        name: userData.name,
        username: userData.username || userData.name.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now().toString().slice(-4),
        email: userData.email,
        password: userData.password,
        phone: userData.phone || '',
        state_region_id: userData.state_region_id || null,
        township_id: userData.township_id || null,
        address: userData.address || '',
        communication_contacts: []
      };

      if (userData.communicationContacts) {
        const c = userData.communicationContacts;
        if (c.telegram) payload.communication_contacts.push({ platform: 'Telegram', contact_value: c.telegram, is_preferred: c.preferredMethod === 'telegram' });
        if (c.viber) payload.communication_contacts.push({ platform: 'Viber', contact_value: c.viber, is_preferred: c.preferredMethod === 'viber' });
        if (c.facebook) payload.communication_contacts.push({ platform: 'Facebook Messenger', contact_value: c.facebook, is_preferred: c.preferredMethod === 'facebook' });
        if (c.alternative) payload.communication_contacts.push({ platform: 'Alternative', contact_value: c.alternative, is_preferred: c.preferredMethod === 'alternative' });
      }

      const response = await authService.register(payload);
      if (response?.success && response.data) {
        const { user, token } = response.data;
        localStorage.setItem('recirculate_token', token);
        const formatted = formatUserFromBackend(user);
        setCurrentUser(formatted);
        setLoading(false);
        return { success: true, user: formatted };
      }
    } catch (err) {
      console.warn('Laravel registration failed, using fallback:', err);
      if (err.response?.data?.message) {
        setLoading(false);
        return { success: false, message: err.response.data.message, errors: err.response.data.errors };
      }
    }

    // Local fallback
    const newUser = {
      id: Date.now(),
      name: userData.name,
      username: userData.username || userData.name.toLowerCase().replace(/\s+/g, '_'),
      email: userData.email,
      city: userData.city || 'Mandalay (MDY)',
      cityCode: userData.city?.includes('YGN') ? 'YGN' : 'MDY',
      phone: userData.phone || '09xxxxxxxxx',
      communicationContacts: userData.communicationContacts || {
        telegram: userData.telegram || '',
        viber: userData.viber || '',
        facebook: userData.facebook || '',
        alternative: userData.alternative || '',
        preferredMethod: userData.preferredMethod || 'viber'
      },
      bio: 'New community member dedicated to mindful item swapping.',
      joined: 'Joined this month',
      rating: 5.0,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80'
    };
    setCurrentUser(newUser);
    setLoading(false);
    return { success: true, user: newUser };
  };

  /**
   * Logout
   */
  const logout = async () => {
    await authService.logout();
    localStorage.removeItem('recirculate_token');
    localStorage.removeItem('admin_token');
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
        loading,
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
