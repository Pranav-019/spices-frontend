import React from 'react'
import './Header.css'

const Header = () => {
    return (
        <div className='header'>
            <div className='header-contents' id='home'>
                <h2>Add Some Spice to your Life</h2>
                <p>Choose from a diverse Spices featuring a delectable array to make your meal deliciously marvellous.</p>
                <a href="#food-display"><button>View Menu</button></a>
            </div>
        </div>
    )
}

export default Header
