import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'

export default function ReviewBox(prop) {
    return (
        <div className="r">
            <div className="header">
                <div className="profile">
                    <FontAwesomeIcon icon="fa-solid fa-circle-user" />
                </div>
                <div className="customer-info">
                    <div className="customer-name">
                        <span>{prop.review.buyerId.username} | From: {prop.review.buyerId.country}</span>
                    </div>
                    <div className="customer-rating">
                        <span>5 <FontAwesomeIcon icon="fa-solid fa-star" /></span>
                    </div>
                </div>
            </div>
            <hr />
            <div className="customer-review">
                <p>{prop.review.comment}</p>
            </div>
            <div className="other-details">
                <div className="gd1">
                    <span className='d1'>₹ {prop.review.price}</span>
                    <br />
                    <span className='d2'>Price</span>
                </div>
                <div className="gd2">
                    <span className='d1'>{`${prop.review.duration === 0 && 'Same day' || prop.review.duration === 1 && '1 day' || prop.review.duration > 1 && `${prop.review.duration} days`}`}</span>
                    <br />
                    <span className='d2'>Duration</span>
                </div>
            </div>
        </div>
    )
}
