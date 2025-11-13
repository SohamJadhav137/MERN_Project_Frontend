import React from 'react'
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
// Sample url of img is below
// https://mern-project-gig-uploads.s3.eu-north-1.amazonaws.com/upload/1762961006070-intro.webp
export default function ImageSlider(prop) {
    const images = prop.imageURLs
    const settings = {
        customPaging: function (i) {
            return (
                <a>
                    <img src={`${baseUrl}/abstract0${i + 1}.jpg`} />
                </a>
            );
        },
        dots: true,
        dotsClass: "slick-dots slick-thumb",
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1
    };

    return (
        <div className="gig-pic">
            <div className="image-slider">
                <Slider {...settings}>
                    {
                        images.map(img => (
                            <div>
                                <img src={img} />
                            </div>
                        ))
                    }
                    <div>
                        <img src={baseUrl + "/abstract02.jpg"} />
                    </div>
                </Slider>
            </div>
        </div>
    )
}
