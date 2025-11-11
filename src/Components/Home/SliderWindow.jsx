import React, { useState } from 'react'
import Slider from 'react-slick'
import { gigCat } from '../../Data/GigCat.js';

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import './SliderWindow.scss';


export default function SliderWindow() {
    const settings = {
        infinite: true,
        speed: 500,
        slidesToShow: 5,
        slidesToScroll: 1
    }

    
    return (
        <div className="slider-container">
            <div className="slider">
                <Slider {...settings}>
                    {
                        gigCat.map(gig => (
                            <div className="slider-gig-card">
                                <div className="gig-card-img">
                                    <img src={gig.image} alt="Gig" />
                                    <div className="gig-card-title">{gig.name}</div>
                                </div>
                            </div>
                        ))
                    }
                </Slider>
            </div>
        </div>
    )
}