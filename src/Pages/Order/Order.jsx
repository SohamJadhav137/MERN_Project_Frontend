import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

export default function Order() {

    const orderId = useParams();
    

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try{
                const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
                    headers: { Authorization: `Bearer ${token}`}
                })

                if (response.ok) {
                    const data = await response.json();
                    // console.log(data);
                    setGigTitle(data.gig.title);
                    setCoverImage(data.gig.coverImageURL)
                }
                else {
                    console.error("Failed to fetch single gig details:\n", response.status);
                }
            } catch (error) {
                console.error("Some error occured while fetching single gig details:\n", error);
            }
        }

        fetchOrderDetails();
    }, [orderId])

    // Fetch gig details
    useEffect(() => {
        const fetchGigTitle = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/gigs/${orderId.gigId}`, {
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
    }, [orderId.gigId]);

    return (
        <div className='order-container'>
            <div className="order">
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
                                        `Seller Name: {username}`
                                }
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
