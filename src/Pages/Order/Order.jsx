import React, { useContext, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import './Order.scss';
import { getCurrentUser } from '../../utils/getCurrentUser';

export default function Order() {

    const { user } = useContext(AuthContext);

    const { id } = useParams();
    const [order, setOrder] = useState(null);
    let gigId = order?.gigId,
        sellerId = order?.sellerId,
        buyerId = order?.buyerId

    const [gigTitle, setGigTitle] = useState(null);
    const [coverImage, setCoverImage] = useState(null);
    const [username, setUsername] = useState(null);
    const [userId, setUserId] = useState(null);

    const navigate = useNavigate();

    // set userId based on role
    useEffect(() => {
        if (!order) return;

        if (user.role === 'seller') {
            setUserId(buyerId);
        }
        else {
            setUserId(sellerId);
        }
    }, [order, user.role]);


    const options = {
        year: "numeric",
        month: "short",
        day: "numeric",
        timeZone: "UTC"
    };
    const finalCreatedDate = order ? new Date(order.createdAt).toLocaleDateString('en-us', options) : '';
    const finalUpdatedDate = order ? new Date(order.updatedAt).toLocaleDateString('en-us', options) : '';

    const token = localStorage.getItem("token");

    // Fetch single order
    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/orders/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                })

                if (response.ok) {
                    const data = await response.json();
                    setOrder(data);
                }
                else {
                    console.error("Failed to fetch single order details:\n", response.status);
                }
            } catch (error) {
                console.error("Some error occured while fetching order details:\n", error);
            }
        }

        fetchOrderDetails();
    }, [id]);

    // Fetch gig details
    useEffect(() => {
        const fetchGigTitle = async () => {
            if (!gigId) return;

            try {
                const response = await fetch(`http://localhost:5000/api/gigs/${gigId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    // console.log(data);
                    setGigTitle(data.gig.title);
                    setCoverImage(data.gig.coverImageURL)
                }
                else {
                    console.error("Failed to fetch gig details:\n", response.status);
                }
            } catch (error) {
                console.error("Some error occured while fetching gig details:\n", error);
            }
        }

        fetchGigTitle();
    }, [gigId]);

    // Fetch user details
    useEffect(() => {
        const fetchUserName = async () => {
            if (!userId) return;

            try {
                const response = await fetch(`http://localhost:5000/api/user/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    // console.log(data);
                    setUsername(data.user.username);
                }
                else {
                    console.error("Failed to fetch gig title:\n", response.status);
                }
            } catch (error) {
                console.error("Some error occured while fetching gig title:\n", error);
            }
        }

        fetchUserName();
    }, [userId]);

    const redirectToChat = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/conversations/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                console.log(data)
                navigate(`/messages/${data._id}`);
            }
            else {
                console.error('Failed to fetch conversationId:', response.status);
            }
        } catch (error) {
            console.error('Some error occured while fetching conversationId', error);
        }
    }

    return (
        <div className='order-container'>
            <div className="order">
                <div className="order-back-button">
                    <span>
                        <Link to='/orders' className='link'>
                            <FontAwesomeIcon icon="fa-solid fa-arrow-left" /> Orders
                        </Link>
                    </span>
                </div>
                <div className="order-title">

                    <div className="order-title-preview">
                        <img src={coverImage} alt="" />
                    </div>
                    <div className="order-title-info">
                        <div>
                            <span className='order-title-info-gig-name'>{gigTitle}</span>
                            <br />
                            <span>
                                {
                                    user.role === 'seller' ?
                                        `Buyer Name: ${username}`
                                        :
                                        `Seller Name: ${username}`
                                }
                            </span>
                        </div>
                    </div>
                    <div className='order-title-status'>
                        <span>STATUS: {order?.status}</span>
                    </div>
                </div>
                <div className="order-desc">
                    <div className="order-desc-attr">
                        <table>
                            <tbody>
                                <tr>
                                    <td><span className='order-attr'>Order ID:</span></td>
                                    <td><span>{order?._id}</span></td>
                                </tr>
                                <tr>
                                    <td><span className='order-attr'>Ordered On:</span></td>
                                    <td><span>{finalCreatedDate}</span></td>
                                </tr>
                                <tr>
                                    <td><span className='order-attr'>Price:</span></td>
                                    <td><span>₹{order?.price}</span></td>
                                </tr>
                            </tbody>
                        </table>

                        <div className="order-status">
                            <span className='order-status-title'>Order Status:</span>
                            <div className='order-status-items'>
                                <span>ACTIVE </span>
                                <span>--- DELIVERED </span>
                                <span>--- COMPLETED</span>
                            </div>
                            <div className="order-action">
                                {
                                    order?.status === 'active' ?
                                        <button>Deliver Work</button>
                                        :
                                        <div>
                                            <span>Seller has not delivered the order yet.</span>
                                        </div>

                                }
                                {
                                    order?.status === 'delivered' &&
                                    <div className="order-complete">
                                        <table>
                                            <tbody>
                                                <tr>
                                                    <td><span>Delivered On: </span></td>
                                                    <td><span>{finalUpdatedDate}</span></td>
                                                </tr>
                                                <tr>
                                                    <td><span>Message: </span></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td><span>File:</span></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        {
                                                            user.role === 'buyer' ?
                                                                <button>Accept Order</button>
                                                                :
                                                                <span>Waiting for buyer's approval...</span>
                                                        }
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                }
                                {/* Seller && status = active */}

                                {/* Buyer && status = active */}

                                {/* Buyer|Seller && status = delivered */}

                                <div className='order-open-chat-button' onClick={redirectToChat}>
                                    <button>Open Chat <FontAwesomeIcon icon="fa-solid fa-comment" /></button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
