// import React, { createContext, useContext, useState, useEffect } from 'react';
// import api, { getStoredAccessToken, isValidTokenString } from '../services/api';

// const AuthContext = createContext(null);

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(() => {
//     try {
//       const token = getStoredAccessToken();
//       const savedUser = localStorage.getItem('user');
//       console.log(`[AUTH DEBUG] AuthProvider initial state: hasToken=${Boolean(token)} tokenLength=${token ? token.length : 0} hasSavedUser=${Boolean(savedUser)}`);
//       if (token && savedUser) {
//         const parsed = JSON.parse(savedUser);
//         console.log(`[AUTH DEBUG] current user initialized: ${parsed?.email || parsed?.id}`);
//         return parsed;
//       }
//     } catch (e) {
//       console.warn('[AUTH DEBUG] Error parsing stored user:', e);
//     }
//     return null;
//   });

//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     let isMounted = true;

//     const verifyUserSession = async () => {
//       const token = getStoredAccessToken();
//       console.log(`[AUTH DEBUG] verifyUserSession on mount: access token exists: ${Boolean(token)} token length: ${token ? token.length : 0}`);
//       if (token) {
//         try {
//           const res = await api.get('/auth/me/');
//           if (isMounted && res && res.success && res.data) {
//             console.log(`[AUTH DEBUG] verifyUserSession success for user: ${res.data.email}`);
//             setUser(res.data);
//             localStorage.setItem('user', JSON.stringify(res.data));
//           }
//         } catch (err) {
//           console.warn('[AUTH DEBUG] verifyUserSession error on mount:', err?.message || err);
//           if (isMounted && !getStoredAccessToken()) {
//             console.log('[AUTH DEBUG] token wiped after failed recovery, clearing user state');
//             setUser(null);
//           }
//         }
//       } else {
//         if (isMounted) {
//           setUser(null);
//         }
//       }
//       if (isMounted) {
//         setLoading(false);
//       }
//     };

//     verifyUserSession();

//     return () => {
//       isMounted = false;
//     };
//   }, []);

//   const login = (userData, tokenData) => {
//     console.log(`[AUTH DEBUG] login() called: hasUserData=${Boolean(userData)} hasTokenData=${Boolean(tokenData)}`);

//     let accessToken = null;
//     let refreshToken = null;

//     if (typeof tokenData === 'string') {
//       accessToken = tokenData;
//     } else if (tokenData && typeof tokenData === 'object') {
//       accessToken =
//         tokenData.access_token ||
//         tokenData.accessToken ||
//         tokenData.token ||
//         (tokenData.tokens && (tokenData.tokens.access_token || tokenData.tokens.accessToken || tokenData.tokens.token));
//       refreshToken =
//         tokenData.refresh_token ||
//         tokenData.refreshToken ||
//         (tokenData.tokens && (tokenData.tokens.refresh_token || tokenData.tokens.refreshToken));
//     }

//     if (!accessToken && userData && typeof userData === 'object') {
//       accessToken = userData.access_token || userData.accessToken || userData.token;
//     }

//     if (isValidTokenString(accessToken)) {
//       localStorage.setItem('access_token', accessToken.trim());
//       console.log(`[AUTH DEBUG] access token received: true`);
//       console.log(`[AUTH DEBUG] access token stored: true`);
//     } else {
//       console.warn(`[AUTH DEBUG] access token received: false`);
//     }

//     if (isValidTokenString(refreshToken)) {
//       localStorage.setItem('refresh_token', refreshToken.trim());
//     }

//     const userObj = (userData && userData.user) ? userData.user : userData;
//     if (userObj && typeof userObj === 'object') {
//       localStorage.setItem('user', JSON.stringify(userObj));
//       setUser(userObj);
//       console.log(`[AUTH DEBUG] current user: ${userObj.email || userObj.id}`);
//     }

//     setLoading(false);
//   };

//   const updateUser = (userData) => {
//     if (userData) {
//       localStorage.setItem('user', JSON.stringify(userData));
//       setUser(userData);
//     }
//   };

//   const logout = async () => {
//     console.log('[AUTH DEBUG] Explicit logout initiated by user');
//     try {
//       const refreshToken = localStorage.getItem('refresh_token');
//       await api.post('/auth/logout/', refreshToken ? { refresh_token: refreshToken } : {});
//     } catch (e) {
//       console.warn('[AUTH DEBUG] Network error on logout:', e);
//     } finally {
//       localStorage.removeItem('user');
//       localStorage.removeItem('access_token');
//       localStorage.removeItem('refresh_token');
//       setUser(null);
//       setLoading(false);
//       console.log('[AUTH DEBUG] Logout complete. All stored tokens cleared.');
//     }
//   };

//   const isCustomer = user?.role === 'CUSTOMER';
//   const isOwner = user?.role === 'OWNER';
//   const isAdmin = user?.role === 'ADMIN';

//   return (
//     <AuthContext.Provider value={{ user, loading, login, updateUser, logout, isCustomer, isOwner, isAdmin }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };




import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { getStoredAccessToken, isValidTokenString } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const token = getStoredAccessToken();
      const savedUser = localStorage.getItem('user');

      console.log(
        `[AUTH DEBUG] AuthProvider initial state: hasToken=${Boolean(token)} tokenLength=${token ? token.length : 0} hasSavedUser=${Boolean(savedUser)}`
      );

      if (token && savedUser) {
        const parsed = JSON.parse(savedUser);

        console.log(
          `[AUTH DEBUG] current user initialized: ${parsed?.email || parsed?.id}`
        );

        return parsed;
      }
    } catch (e) {
      console.warn('[AUTH DEBUG] Error parsing stored user:', e);
    }

    return null;
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const verifyUserSession = async () => {
      const token = getStoredAccessToken();

      console.log(
        `[AUTH DEBUG] verifyUserSession on mount: access token exists: ${Boolean(token)} token length: ${token ? token.length : 0}`
      );

      if (token) {
        try {
          const res = await api.get('/auth/me/');

          if (isMounted && res && res.success && res.data) {
            console.log(
              `[AUTH DEBUG] verifyUserSession success for user: ${res.data.email}`
            );

            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
          }
        } catch (err) {
          console.warn(
            '[AUTH DEBUG] verifyUserSession error on mount:',
            err?.message || err
          );

          if (isMounted && !getStoredAccessToken()) {
            console.log(
              '[AUTH DEBUG] token wiped after failed recovery, clearing user state'
            );

            setUser(null);
            localStorage.removeItem('user');
          }
        }
      } else {
        if (isMounted) {
          setUser(null);
        }
      }

      if (isMounted) {
        setLoading(false);
      }
    };

    verifyUserSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = (userData, tokenData) => {
    console.log(
      `[AUTH DEBUG] login() called: hasUserData=${Boolean(userData)} hasTokenData=${Boolean(tokenData)}`
    );

    let accessToken = null;
    let refreshToken = null;

    if (typeof tokenData === 'string') {
      accessToken = tokenData;
    } else if (tokenData && typeof tokenData === 'object') {
      accessToken =
        tokenData.access_token ||
        tokenData.accessToken ||
        tokenData.access ||
        tokenData.token ||
        (tokenData.tokens &&
          (
            tokenData.tokens.access_token ||
            tokenData.tokens.accessToken ||
            tokenData.tokens.access ||
            tokenData.tokens.token
          ));

      refreshToken =
        tokenData.refresh_token ||
        tokenData.refreshToken ||
        tokenData.refresh ||
        (tokenData.tokens &&
          (
            tokenData.tokens.refresh_token ||
            tokenData.tokens.refreshToken ||
            tokenData.tokens.refresh
          ));
    }

    if (!accessToken && userData && typeof userData === 'object') {
      accessToken =
        userData.access_token ||
        userData.accessToken ||
        userData.access ||
        userData.token ||
        (userData.tokens &&
          (
            userData.tokens.access_token ||
            userData.tokens.accessToken ||
            userData.tokens.access ||
            userData.tokens.token
          ));
    }

    if (!refreshToken && userData && typeof userData === 'object') {
      refreshToken =
        userData.refresh_token ||
        userData.refreshToken ||
        userData.refresh ||
        (userData.tokens &&
          (
            userData.tokens.refresh_token ||
            userData.tokens.refreshToken ||
            userData.tokens.refresh
          ));
    }

    if (isValidTokenString(accessToken)) {
      localStorage.setItem('access_token', accessToken.trim());

      console.log('[AUTH DEBUG] access token received: true');
      console.log('[AUTH DEBUG] access token stored: true');
    } else {
      console.warn('[AUTH DEBUG] access token received: false');
    }

    if (isValidTokenString(refreshToken)) {
      localStorage.setItem('refresh_token', refreshToken.trim());

      console.log('[AUTH DEBUG] refresh token stored: true');
    } else {
      console.warn('[AUTH DEBUG] refresh token received: false');
    }

    const userObj =
      userData && userData.user
        ? userData.user
        : userData;

    if (userObj && typeof userObj === 'object') {
      localStorage.setItem('user', JSON.stringify(userObj));
      setUser(userObj);

      console.log(
        `[AUTH DEBUG] current user: ${userObj.email || userObj.id}`
      );
    } else {
      console.warn('[AUTH DEBUG] No valid user object received during login');
    }

    setLoading(false);
  };

  const updateUser = (userData) => {
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    }
  };

  const logout = async () => {
    console.log('[AUTH DEBUG] Explicit logout initiated by user');

    try {
      const refreshToken = localStorage.getItem('refresh_token');

      await api.post(
        '/auth/logout/',
        refreshToken ? { refresh: refreshToken } : {}
      );
    } catch (e) {
      console.warn('[AUTH DEBUG] Network error on logout:', e);
    } finally {
      localStorage.removeItem('user');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');

      setUser(null);
      setLoading(false);

      console.log(
        '[AUTH DEBUG] Logout complete. All stored tokens cleared.'
      );
    }
  };

  const isCustomer = user?.role === 'CUSTOMER';
  const isOwner = user?.role === 'OWNER';
  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        updateUser,
        logout,
        isCustomer,
        isOwner,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used within an AuthProvider'
    );
  }

  return context;
};