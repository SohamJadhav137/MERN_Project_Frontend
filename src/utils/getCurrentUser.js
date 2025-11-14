import { jwtDecode } from "jwt-decode";

export const getCurrentUser = () => {
    const token = localStorage.getItem("token");
    if(!token) return null;
    
    try { 
        const decode = jwtDecode(token);
        return { id: decode?.id, role: decode?.role };
    } catch (error) {
        console.error("Invalid token:\n",error);
        return null;
    }
}