import React, { useContext } from 'react'
import './FoodDisplay.css'
import FoodItem from '../FoodItem/FoodItem'
import { StoreContext } from '../../Context/StoreContext'

const FoodDisplay = ({ category }) => {
  const { foodList, isLoading, error } = useContext(StoreContext);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading products...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  const filteredFoodList = category === "All" 
    ? foodList 
    : foodList.filter(item => item.category === category);

  return (
    <div className="food-display" id="food-display">
      <h2>All Spices</h2>
      <div className="food-display-items">
        {filteredFoodList.map((item) => (
          <FoodItem
            key={item._id}
            _id={item._id}
            name={item.name}
            price={item.price}
            description={item.description}
            image={item.image}
          />
        ))}
      </div>
    </div>
  )
}

export default FoodDisplay;
