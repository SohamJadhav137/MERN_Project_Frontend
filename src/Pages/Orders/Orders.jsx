import React, { useContext, useEffect, useState } from 'react'

import './Orders.scss';
import OrderCard from '../../Components/Orders/OrderCard';
import { getSocket } from '../../socket';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import OrderStatusFilter from '../../Components/Orders/OrderStatusFilter';

export default function Orders() {

  const socket = getSocket();
  const [orders, setOrders] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Fetching orders
  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        console.log("Token not found, user not logged in");
        return;
      }

      try {
        const res = await fetch("http://localhost:5000/api/orders", {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok)
          throw new Error("Failed to fetch orders!");

        const data = await res.json();
        setOrders(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchOrders();
  }, []);

  // Handling orders socket events
  useEffect(() => {
    if (!socket) return;

    const handleSocketEvents = (payload) => {
      const updatedOrder = payload.updatedOrder;

      setOrders(prevOrders => prevOrders.map(order => order?._id === updatedOrder._id ? updatedOrder : order));
    };

    const events = [
      "orderInitiated",
      "orderDeclined",
      "orderDelivered",
      "orderCompleted",
      "orderRevision",
      "orderCancellationRequest",
      "orderCancelAccept",
      "orderCancelReject",
      "orderCancelled"
    ];

    events.forEach(event => socket.on(event, handleSocketEvents));

    return () => {
      events.forEach(event => socket.off(event, handleSocketEvents));
    }
  }, [socket]);

  // Receive new order socket event
  useEffect(() => {
    if (!socket) return;

    const receiveNewOrder = (payload) => {
      setOrders(prev => [payload.createdOrder, ...prev]);
    }

    socket.on("orderReceived", receiveNewOrder);

    return () => {
      socket.off("orderReceived", receiveNewOrder);
    };
  }, []);

  // Order status resolved
  useEffect(() => {
  const exists =
    selectedStatus === "all" ||
    orders.some(o => o.status === selectedStatus);

  if (!exists) setSelectedStatus("all");
}, [orders, selectedStatus]);

  const filteredOrders =
    selectedStatus === "all"
      ? orders
      : orders.filter(order => order.status === selectedStatus);
  return (
    <div className='orders-container'>
      <div className="orders">

        <div className="orders-page-title">
          My Orders
        </div>

        {orders.length > 0 && (
          <OrderStatusFilter
            orders={orders}
            selectedStatus={selectedStatus}
            onChange={setSelectedStatus}
          />
        )}

        {/* {
          orders.length === 0 ?
            <div className="orders-empty-text">
              <div className="gig-container">
                <DotLottieReact
                  src="https://lottie.host/4902329f-05ba-429e-882a-6c2b90c883fa/DWDDPVY1Mu.lottie"
                  loop
                  autoplay
                  style={{ height: '350px' }}
                />
              </div>
              You haven't placed any orders yet...
            </div>
            :
            <div className="order-list">
              {
                orders.map(order => (
                  <OrderCard key={order?._id} order={order} />
                ))
              }
            </div>
        } */}

        {
          filteredOrders.length === 0 ? (
            <div className="orders-empty-text">
              <div className="gig-container">
                <DotLottieReact
                  src="https://lottie.host/4902329f-05ba-429e-882a-6c2b90c883fa/DWDDPVY1Mu.lottie"
                  loop
                  autoplay
                  style={{ height: '350px' }}
                />
              </div>
              You haven't placed any orders yet...
            </div>
          ) : (
            <div className="order-list">
              {
                filteredOrders.map(order => (
                  <OrderCard key={order?._id} order={order} />
                ))
              }
            </div>
          )
        }

      </div>
    </div>
  )
}
