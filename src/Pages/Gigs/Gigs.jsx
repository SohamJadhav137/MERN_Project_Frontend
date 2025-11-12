import React, { useEffect, useState } from 'react'

import { Link, useLocation } from 'react-router-dom';

import './Gigs.scss';
import GigCard from '../../Components/Gigs/GigCard';
import {gigs} from '../../Data/GigsData';

export default function Gigs() {

  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(false);
  const { search } = useLocation();
  const category = decodeURIComponent(new URLSearchParams(search).get("category"));
  const [activeButton, setActiveButton] = useState("best-selling");

  console.log("Received gigs:", gigs);
  
  const sortAscend = () => {
    const copyArray = [...gigs]

    copyArray.sort((a, b) => a.price - b.price)
    setGigs(copyArray)
    setActiveButton("ascend")
  }

  const sortDescend = () => {
    const copyArray = [...gigs]

    copyArray.sort((a, b) => b.price - a.price)
    setGigs(copyArray)
    setActiveButton("descend")
  }

  const orderBestSelling = () => {
    const copyArray = [...gigs]

    copyArray.sort((a, b) => b.reviews - a.reviews)
    setGigs(copyArray)
    setActiveButton("best-selling")
  }

  const orderRating = () => {
    const copyArray = [...gigs]

    copyArray.sort((a, b) => b.rating - a.rating)
    setGigs(copyArray)
    setActiveButton("rating")
  }

  useEffect(() => {
    const fetchCatGigs = async (category) => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/api/category/${encodeURIComponent(category)}`);
        const data = await response.json();
        setGigs(data);
      } catch (error) {
        console.error("Some error occured while fetching gigs category wise:", error);
      }
      setLoading(false);
    };
    
    fetchCatGigs(category);
  }, [category]);

  return (
    <div className='gigs-main'>

      <div className="breadcrump">
        <div className="breadcrump-container">
          <span> <Link to='/'>Home</Link> &gt; <Link to={`/category?category=${category}`}>{category}</Link></span>
        </div>
      </div>

      <div className="category-heading">
        <div className="category-heading-container">
          <h2>{category}</h2>
        </div>
      </div>

      <div className="sort-options">
        <div className="sort-options-container">
          <span>Sort By:</span>
          <button className={activeButton === 'best-selling' ? 'active' : ''} onClick={orderBestSelling}>Best Selling</button>
          <button className={activeButton === 'descend' ? 'active' : ''} onClick={sortDescend}>Price (High to Low)</button>
          <button className={activeButton === 'ascend' ? 'active' : ''} onClick={sortAscend}>Price (Low to High)</button>
          <button className={activeButton === 'rating' ? 'active' : ''} onClick={orderRating}>Rating</button>
        </div>
      </div>
      <div className="gigs">
        <div className="gigs-container">
          {
            loading ? (
              <p>Loading gigs...</p>
            )
            :
            gigs.map((gig) => (
              <GigCard key={gig._id} gig={gig}/>
            ))
          }
        </div>
      </div>
    </div>
  )
}
