import React, { useEffect, useState } from 'react'

export default function Orders() {

  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem("token");

      if(!token){
        console.log("Token not found, user not logged in");
        return;
      }

      try{
        const res = await fetch("http://localhost:5000/api/orders", {
          headers: { "Content-type": "application/json", "Authorization": `Bearer ${token}`}
        });

        if(!res.ok)
          throw new Error("Failed to fetch orders!");
        
        const data = await res.json();
        setOrders(data);
      } catch(error){
        console.error(error);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div>Orders coming soon...</div>
  )
}
