import { Navigate } from "react-router-dom";
import { isTokenExpired } from '../utils/auth';

export const PrivateRoute = ({ children, allowedRoles }) => {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    // if (!user || !token || isTokenExpired(token)) {
    //     console.log('token cleared from private route!')
    //     localStorage.removeItem("user");
    //     localStorage.removeItem("token");

    //     Swal.fire({
    //         toast: true,
    //         icon: 'warning',
    //         title: 'Session expired. Please login again!',
    //         showConfirmButton: false,
    //         timer: 3000,
    //         timerProgressBar: true,
    //         customClass: {
    //             popup: 'swal-custom-popup',
    //             title: 'swal-custom-title'
    //         }
    //     });
    //     return <Navigate to="/auth/login" replace />
    // }

    if (allowedRoles && !allowedRoles.includes(user.role))
        return <Navigate to="/unauthorized" replace />

    return children;
};