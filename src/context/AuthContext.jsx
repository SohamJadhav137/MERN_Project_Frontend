import { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || null);
    const [token, setToken] = useState(localStorage.getItem("token") || null);

    const navigate = useNavigate();

    const login = (userData, token) => {
        setUser(userData);
        setToken(token);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", token);
    }

    const logout = async () => {
        try{
            await fetch('http://localhost:5000/api/auth/logout', { method: 'POST', credentials: 'include' });
        } catch(error) {
            console.error("Logout error!",error);
        }
        setUser(null);
        setToken(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        navigate('/login');
    }

    return(
        <AuthContext.Provider value={{ user, token, login, logout}}>
            {children}
        </AuthContext.Provider>
    );
};