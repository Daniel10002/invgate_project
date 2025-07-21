// frontend/src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    // Inicializar el estado del usuario desde localStorage de forma segura
    const [user, setUser] = useState(() => {
        try {
            const savedUser = localStorage.getItem('user');
            const parsedUser = savedUser ? JSON.parse(savedUser) : null;
            return parsedUser;
        } catch (error) {
            console.error("AuthContext: Error parsing user from localStorage at init:", error);
            // Si hay un error al parsear, limpiar localStorage para evitar bucles
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            return null;
        }
    });

    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true);

    const API_ROOT_URL = `http://${window.location.hostname}:8000/api/`; 
    const API_USERS_DETAIL_URL = `${API_ROOT_URL}users/`; 
    const API_AUTH_URL = `${API_ROOT_URL}auth/`; 

    // Función de logout centralizada para asegurar la limpieza
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        console.log("AuthContext: User logged out.");
        setLoading(false); // Asegurarse de que el estado de carga se reinicie
    };

    useEffect(() => {
        const loadUserFromToken = async () => {
            // Si no hay token, no hay usuario que cargar
            if (!token) {
                setLoading(false);
                return;
            }

            // Si el usuario ya está cargado y parece completo, no hacer otra llamada
            // Consideramos "completo" si tiene ID, es_doctor y userprofile
            if (user && user.id && typeof user.es_doctor === 'boolean' && user.userprofile) {
                setLoading(false);
                return;
            }

            let userIdToFetch = user?.id; // Intentar obtener el ID del usuario del estado actual
            if (!userIdToFetch) { // Si el ID no está en el estado, intentar de localStorage
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    try {
                        const parsedStoredUser = JSON.parse(storedUser);
                        userIdToFetch = parsedStoredUser.id;
                    } catch (e) {
                        console.error("Error parsing user ID from localStorage during rehydration:", e);
                        logout(); // Si localStorage está corrupto, cerrar sesión
                        return;
                    }
                }
            }

            // Si aún no tenemos un ID de usuario, no podemos cargar el perfil
            if (!userIdToFetch) {
                console.warn("AuthContext: No user ID found to fetch full profile during rehydration. Logging out.");
                logout(); 
                return;
            }

            try {
                const response = await fetch(`${API_USERS_DETAIL_URL}${userIdToFetch}/`, {
                    headers: {
                        'Authorization': `Token ${token}`
                    }
                });

                if (response.ok) {
                    const userData = await response.json();
                    setUser(userData);
                    localStorage.setItem('user', JSON.stringify(userData)); 
                    console.log("AuthContext: Usuario completo cargado/rehidratado:", userData);
                } else {
                    console.error("AuthContext: Error al cargar usuario completo desde token:", response.status, await response.text());
                    logout(); // Si el token no es válido o el usuario no existe, cerrar sesión
                }
            } catch (error) {
                console.error("AuthContext: Error de red al cargar usuario completo:", error);
                logout(); // Error de red, cerrar sesión
            } finally {
                setLoading(false); // Siempre establecer loading a false al finalizar
            }
        };

        // Pequeña demora para asegurar que el DOM se renderice y evitar race conditions
        const timer = setTimeout(() => {
            loadUserFromToken();
        }, 50); 

        return () => clearTimeout(timer); // Limpiar el timer en el cleanup
    }, [token, user]); // Dependencia del token y user para re-ejecutar cuando cambian

    const login = async (username_input, password_input) => {
        setLoading(true); 
        try {
            // Limpiar localStorage antes de un nuevo intento de login
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            const authResponse = await fetch(API_AUTH_URL, { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: username_input, password: password_input }),
            });

            if (!authResponse.ok) {
                const errorData = await authResponse.json();
                throw new Error(errorData.non_field_errors ? errorData.non_field_errors[0] : 'Usuario o contraseña incorrectos.');
            }

            const authData = await authResponse.json();
            const receivedToken = authData.token;
            const userId = authData.user_id; 

            localStorage.setItem('token', receivedToken); 
            setToken(receivedToken); 

            // SEGUNDA LLAMADA: Obtener el perfil completo del usuario
            const userProfileResponse = await fetch(`${API_USERS_DETAIL_URL}${userId}/`, {
                headers: {
                    'Authorization': `Token ${receivedToken}`
                }
            });

            if (!userProfileResponse.ok) {
                console.error("AuthContext: Error al obtener el perfil completo del usuario después del login:", userProfileResponse.status, await userProfileResponse.text());
                logout(); 
                throw new Error("Error al cargar el perfil de usuario.");
            }

            const fullUserData = await userProfileResponse.json();
            console.log("AuthContext: Usuario completo obtenido después del login:", fullUserData);

            localStorage.setItem('user', JSON.stringify(fullUserData)); 
            setUser(fullUserData); 

            return true;
        } catch (error) {
            console.error('AuthContext: Error de login:', error);
            logout(); 
            throw error;
        } finally {
            setLoading(false); 
        }
    };

    const updateUserInContext = (updatedUserObject) => {
        setUser(updatedUserObject);
        localStorage.setItem('user', JSON.stringify(updatedUserObject));
        console.log("AuthContext: Usuario actualizado en contexto:", updatedUserObject);
    };

    const contextValue = useMemo(() => ({
        user,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        logout, // Asegurarse de que logout esté disponible en el contexto
        updateUserInContext,
    }), [user, token, loading]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
