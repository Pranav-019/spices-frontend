import React, { useContext, useState, useEffect } from 'react'
import './ExploreMenu.css'
import { StoreContext } from '../../Context/StoreContext'
import axios from 'axios';

const ExploreMenu = ({ category, setCategory }) => {

  const [menuList, setMenuList] = useState([]);
  const { menu_list } = useContext(StoreContext);

  // Fetch menu list from API
  useEffect(() => {
    axios.get('https://spices-backend-2jr1.vercel.app/api/products')
      .then((response) => {
        // Filter out duplicate categories by creating a Set of category names
        const uniqueCategories = [
          ...new Map(
            response.data.map(item => [item.category, item]) // Create a map with category as key
          ).values()
        ];
        // Map the filtered unique categories to get required fields
        const categories = uniqueCategories.map(item => ({
          category_name: item.category,
          category_image: item.image,
        }));
        setMenuList(categories);
      })
      .catch((error) => {
        console.error("Error fetching menu list:", error);
      });
  }, []);

  return (
    <div className='explore-menu' id='explore-menu'>
      <h1>Explore our Spices</h1>
      <p className='explore-menu-text'>Explore a World of Flavors: Elevate Every Meal with Our Premium Spices!</p>
      <div className="explore-menu-list">
        {menuList.map((item, index) => {
          return (
            <div
              onClick={() => setCategory(prev => prev === item.category_name ? "All" : item.category_name)}
              key={index}
              className={`explore-menu-list-item ${category === item.category_name ? 'active' : ''}`}
            >
              <img
                src={item.category_image}
                className={category === item.category_name ? "active" : ""}
                alt={item.category_name}
              />
              <p>{item.category_name}</p>
            </div>
          );
        })}
      </div>
      <hr />
    </div>
  );
}

export default ExploreMenu;
