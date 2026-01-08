import { Navigate } from "react-router-dom";

export const PrivateRoute = ({ children, allowedRoles }) => {
    const user = JSON.parse(localStorage.getItem("user"));

    if(!user) return <Navigate to="/auth/login" replace/>
    
    if(allowedRoles && !allowedRoles.includes(user.role))
        return <Navigate to="/unauthorized" replace/>

    return children;
};