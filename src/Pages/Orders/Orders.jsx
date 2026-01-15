import React, { useContext, useEffect, useState } from 'react'

import './Orders.scss';
import OrderCard from '../../Components/Orders/OrderCard';
import { getSocket } from '../../socket';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import OrderStatusFilter from '../../Components/Orders/OrderStatusFilter';
import { AuthContext } from '../../context/AuthContext';

export default function Orders() {

  const { user } = useContext(AuthContext);
  const socket = getSocket();
  const [orders, setOrders] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [orderDetails, setOrderDetails] = useState({}); // Store gig and user details by orderId index
  const [searchQuery, setSearchQuery] = useState('');
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Fetching orders
  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        console.log("Token not found, user not logged in");
        return;
      }

      try {
        setOrdersLoading(true);

        const res = await fetch("http://localhost:5000/api/orders", {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok)
          throw new Error("Failed to fetch orders!");

        const data = await res.json();
        setOrders(data);
      } catch (error) {
        console.error(error);
      } finally {
        setOrdersLoading(false)
      }
    };

    fetchOrders();
  }, []);

  // Fetch gig and user details for all orders
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || orders.length === 0) return;

    const fetchDetailsForOrders = async () => {

      setDetailsLoading(true);

      const details = {};

      for (const order of orders) {
        try {
          // Fetch gig details
          const gigResponse = await fetch(`http://localhost:5000/api/gigs/${order.gigId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          let gigTitle = null;
          let coverImage = null;
          if (gigResponse.ok) {
            const gigData = await gigResponse.json();
            gigTitle = gigData.gig?.title;
            coverImage = gigData.gig?.coverImageURL;
          }

          // Fetch user details
          let userDetails = null;
          let userId = null;
          if (user.role === 'seller') {
            userId = order.buyerId;
          } else {
            userId = order.sellerId;
          }

          if (userId) {
            const userResponse = await fetch(`http://localhost:5000/api/user/${userId}`, {
              headers: { Authorization: `Bearer ${token}` }
            });

            if (userResponse.ok) {
              const userData = await userResponse.json();
              userDetails = userData.user;
            }
          }

          details[order._id] = {
            gigTitle,
            coverImage,
            userDetails
          };
        } catch (error) {
          console.error(`Error fetching details for order ${order._id}:`, error);
          details[order._id] = {
            gigTitle: null,
            coverImage: null,
            userDetails: null
          };
        }
      }

      setOrderDetails(details);
      setDetailsLoading(false);
    };

    fetchDetailsForOrders();
  }, [orders]);

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

  // console.log(orderDetails)

  const filteredOrders =
    selectedStatus === "all"
      ? orders
      : orders.filter(order => order.status === selectedStatus);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const searchedOrders =
    normalizedQuery === ""
      ? filteredOrders
      : filteredOrders.filter(order => {
        const gigTitle =
          orderDetails[order._id]?.gigTitle?.toLowerCase() || "";

        const fullOrderId = order._id.toLowerCase();
        const shortOrderId = order._id.slice(-6).toLowerCase();

        return (
          gigTitle.includes(normalizedQuery) ||
          shortOrderId.includes(normalizedQuery) ||
          fullOrderId.includes(normalizedQuery)
        );
      });

  return (
    <div className='orders-container'>
      <div className="orders">

        <div className="orders-page-title">
          My Orders
        </div>

        {detailsLoading ? (
          /* Orders loading */
          <div className="orders-empty-text">
            <div className="gig-container">
              <DotLottieReact
                src="https://lottie.host/693ee959-eaec-464b-927a-99281f3d2511/95oDLlg8vi.lottie"
                loop
                autoplay
                style={{ height: "150px" }}
              />
            </div>
            Loading orders...
          </div>
        ) : orders.length === 0 ? (
          /* New user */
          <div className="orders-empty-text">
            <div className="gig-container">
              <DotLottieReact
                src="https://lottie.host/4902329f-05ba-429e-882a-6c2b90c883fa/DWDDPVY1Mu.lottie"
                loop
                autoplay
                style={{ height: "350px" }}
              />
            </div>
            You haven't placed any orders yet...
          </div>
        ) : searchedOrders.length === 0 ? (
          /* Filter/search empty */
          <div className="orders-empty-text">
            <div className="gig-container">
              <DotLottieReact
                src="https://lottie.host/c53dd459-03d1-4a08-84a6-4a409242d14f/yAUDLZG2Vm.lottie"
                loop
                autoplay
                style={{ height: "150px" }}
              />
            </div>
            No orders found.
          </div>
        ) : detailsLoading ? (
          /* Details loading */
          <div className="orders-empty-text">
            <div className="gig-container">
              <DotLottieReact
                src="https://lottie.host/693ee959-eaec-464b-927a-99281f3d2511/95oDLlg8vi.lottie"
                loop
                autoplay
                style={{ height: "150px" }}
              />
            </div>
            Loading order details...
          </div>
        ) : (
          /* Normal list */
          <div className="order-list">
            {searchedOrders.map(order => (
              <OrderCard
                key={order._id}
                order={order}
                gigTitle={orderDetails[order._id]?.gigTitle}
                coverImage={orderDetails[order._id]?.coverImage}
                userDetails={orderDetails[order._id]?.userDetails}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
