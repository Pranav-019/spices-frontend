import React, { useEffect, useState } from 'react';
import axios from 'axios';

import basket_icon from './basket_icon.png'
import logo from './logo.png'
import log from './log.png'
import header from './header.png'
import search_icon from './search_icon.png'
import menu_1 from './menu_1.png'
import menu_2 from './menu_2.png'
import menu_3 from './menu_3.png'
import menu_4 from './menu_4.png'
import menu_5 from './menu_5.png'
import menu_6 from './menu_6.png'
import menu_7 from './menu_7.png'
import menu_8 from './menu_8.png'
import rating_starts from './rating_starts.png'
import food_1 from './food_1.png'
import food_2 from './food_2.png'
import food_3 from './food_3.png'
import food_4 from './food_4.png'
import food_5 from './food_5.png'
import food_6 from './food_6.png'
import food_7 from './food_7.png'
import food_8 from './food_8.png'
import food_9 from './food_9.png'
import food_10 from './food_10.png'
import food_11 from './food_11.png'
import food_12 from './food_12.png'
import food_13 from './food_13.png'
import food_14 from './food_14.png'
import food_15 from './food_15.png'
import food_16 from './food_16.png'
import food_17 from './food_17.png'
import food_18 from './food_18.png'
import food_19 from './food_19.png'
import food_20 from './food_20.png'
import food_21 from './food_21.png'
import food_22 from './food_22.png'
import food_23 from './food_23.png'
import food_24 from './food_24.png'
import food_25 from './food_25.png'
import food_26 from './food_26.png'
import food_27 from './food_27.png'
import food_28 from './food_28.png'
import food_29 from './food_29.png'
import food_30 from './food_30.png'
import food_31 from './food_31.png'
import food_32 from './food_32.png'

import add_icon_white from './add_icon_white.png'
import add_icon_green from './add_icon_green.png'
import remove_icon_red from './remove_icon_red.png'
import app_store from './app_store.png'
import play_store from './play_store.png'
import linkedin_icon from './linkedin_icon.png'
import facebook_icon from './facebook_icon.png'
import twitter_icon from './twitter_icon.png'
import cross_icon from './cross_icon.png'
import selector_icon from './selector_icon.png'

export const assets = {
    logo,
    log,
    basket_icon,
    header,
    search_icon,
    rating_starts,
    add_icon_green,
    add_icon_white,
    remove_icon_red,
    app_store,
    play_store,
    linkedin_icon,
    facebook_icon,
    twitter_icon,
    cross_icon,
    selector_icon
}

export const menu_list = [
    {
        menu_name: "Chillies",
        menu_image: menu_1
    },
    {
        menu_name: "Pepper",
        menu_image: menu_2
    },
    {
        menu_name: "Coriander Seeds",
        menu_image: menu_3
    },
    {
        menu_name: "Ginger",
        menu_image: menu_4
    },
    {
        menu_name: "Mustard",
        menu_image: menu_5
    },
    {
        menu_name: "Fenugreek",
        menu_image: menu_6
    },
    {
        menu_name: "Cumin",
        menu_image: menu_7
    },
    {
        menu_name: "Ilaichi",
        menu_image: menu_8
    }]

export const food_list = [
    {
        food_id: 1,
        food_name: "Red Chilly Powder",
        food_image: food_1,
        food_price: 149,
        food_desc: "Food provides essential nutrients for overall health and well-being",
        food_category: "Chillies"
    },
    {
        food_id: 2,
        food_name: "Kashmiri Red Chili Powder",
        food_image: food_2,
        food_price: 99,
        food_desc: "Food provides essential nutrients for overall health and well-being",
        food_category: "Chillies"
    }, {
        food_id: 3,
        food_name: "Guntur Red Chili Powder",
        food_image: food_3,
        food_price: 149,
        food_desc: "Food provides essential nutrients for overall health and well-being",
        food_category: "Chillies"
    }, {
        food_id: 4,
        food_name: "Byadgi Red Chili Powder",
        food_image: food_4,
        food_price: 199,
        food_desc: "Food provides essential nutrients for overall health and well-being",
        food_category: "Chillies"
    }, {
        food_id: 5,
        food_name: "Malabar Black Pepper",
        food_image: food_5,
        food_price: 199,
        food_desc: "Food provides essential nutrients for overall health and well-being",
        food_category: "Pepper"
    }, {
        food_id: 6,
        food_name: "Tellicherry Pepper",
        food_image: food_6,
        food_price: 149,
        food_desc: "Food provides essential nutrients for overall health and well-being",
        food_category: "Pepper"
    }, {
        food_id: 7,
        food_name: "White Pepper",
        food_image: food_7,
        food_price: 249,
        food_desc: "Food provides essential nutrients for overall health and well-being",
        food_category: "Pepper"
    }, {
        food_id: 8,
        food_name: "Kashmiri Pepper",
        food_image: food_8,
        food_price: 199,
        food_desc: "Food provides essential nutrients for overall health and well-being",
        food_category: "Pepper"
    }, {
        food_id: 9,
        food_name: "Dhania Seeds",
        food_image: food_9,
        food_price: 199,
        food_desc: "Food provides essential nutrients for overall health and well-being",
        food_category: "Coriander Seeds"
    }, {
        food_id: 10,
        food_name: "Kothimbir (Maharashtrian Coriander)",
        food_image: food_10,
        food_price: 99,
        food_desc: "Food provides essential nutrients for overall health and well-being",
        food_category: "Coriander Seeds"
    }, {
        food_id: 11,
        food_name: "Rajasthani Coriander",
        food_image: food_11,
        food_price: 249,
        food_desc: "Food provides essential nutrients for overall health and well-being",
        food_category: "Coriander Seeds"
    }, {
        food_id: 12,
        food_name: "Gujarat Coriander",
        food_image: food_12,
        food_price: 129,
        food_desc: "Food provides essential nutrients for overall health and well-being",
        food_category: "Coriander Seeds"
    },
    {
        food_id: 13,
        food_name: "Yellow Mustard",
        food_image: food_13,
        food_price: 249,
        food_desc: "Food provides essential nutrients for overall health and well-being",
        food_category: "Mustard"
    },
    {
        food_id: 14,
        food_name: "Black Mustard",
        food_image: food_14,
        food_price: 189,
        food_desc: "Food provides essential nutrients for overall health and well-being",
        food_category: "Mustard"
    }, {
        food_id: 15,
        food_name: "Brown Mustard",
        food_image: food_15,
        food_price: 149,
        food_desc: "Food provides essential nutrients for overall health and well-being",
        food_category: "Mustard"
    }, {
        food_id: 16,
        food_name: "White Mustard",
        food_image: food_16,
        food_price: 99,
        food_desc: "Food provides essential nutrients for overall health and well-being",
        food_category: "Mustard"
    }, {
        food_id: 17,
        food_name: "Kasuri Methi Seeds",
        food_image: food_17,
        food_price: 149,
        food_desc: "Food provides essential nutrients for overall health and well-being",
        food_category: "Fenugreek"
    }, {
        food_id: 18,
        food_name: "Gujarat Fenugreek Seeds",
        food_image: food_18,
        food_price: 129,
        food_desc: "Food provides essential nutrients for overall health and well-being",
        food_category: "Fenugreek"
    }, {
        food_id: 19,
        food_name: "Tamil Nadu Fenugreek Seeds",
        food_image: food_19,
        food_price: 299,
        food_desc: "Food provides essential nutrients for overall health and well-being",
        food_category: "Fenugreek"
    }, {
        food_id: 20,
        food_name: "Organic Fenugreek Seeds",
        food_image: food_20,
        food_price: 149,
        food_desc: "Food provides essential nutrients for overall health and well-being",
        food_category: "Fenugreek"
    }, {
        food_id: 21,
        food_name: "Brown Jeera",
        food_image: food_21,
        food_price: 199,
        food_desc: "Food provides essential nutrients for overall health and well-being",
        food_category: "Cumin"
    }, {
        food_id: 22,
        food_name: "Black Jeera (Shahi Jeera)",
        food_image: food_22,
        food_price: 199,
        food_desc: "Food provides essential nutrients for overall health and well-being",
        food_category: "Cumin"
    }, {
        food_id: 23,
        food_name: "Mix Veg Pulao",
        food_image: food_23,
        food_price: 99,
        food_desc: "Food provides essential nutrients for overall health and well-being",
        food_category: "Cumin"
    }, {
        food_id: 24,
        food_name: "Rice Zucchini",
        food_image: food_24,
        food_price: 149,
        food_desc: "Food provides essential nutrients for overall health and well-being",
        food_category: "Cumin"
    },
    {
        food_id: 25,
        food_name: "Cheese Pasta",
        food_image: food_25,
        food_price: 199,
        food_desc: "Food provides essential nutrients for overall health and well-being",
        food_category: "Pasta"
    },
    {
        food_id: 26,
        food_name: "Tomato Pasta",
        food_image: food_26,
        food_price: 189,
        food_desc: "Food provides essential nutrients for overall health and well-being",
        food_category: "Pasta"
    }, {
        food_id: 27,
        food_name: "Creamy Pasta",
        food_image: food_27,
        food_price: 249,
        food_desc: "Food provides essential nutrients for overall health and well-being",
        food_category: "Pasta"
    }, {
        food_id: 28,
        food_name: "Chicken Pasta",
        food_image: food_28,
        food_price: 299,
        food_desc: "Food provides essential nutrients for overall health and well-being",
        food_category: "Pasta"
    }, {
        food_id: 29,
        food_name: "Buttter Noodles",
        food_image: food_29,
        food_price: 149,
        food_desc: "Food provides essential nutrients for overall health and well-being",
        food_category: "Noodles"
    }, {
        food_id: 30,
        food_name: "Veg Noodles",
        food_image: food_30,
        food_price: 129,
        food_desc: "Food provides essential nutrients for overall health and well-being",
        food_category: "Noodles"
    }, {
        food_id: 31,
        food_name: "Somen Noodles",
        food_image: food_31,
        food_price: 249,
        food_desc: "Food provides essential nutrients for overall health and well-being",
        food_category: "Noodles"
    }, {
        food_id: 32,
        food_name: "Cooked Noodles",
        food_image: food_32,
        food_price: 159,
        food_desc: "Food provides essential nutrients for overall health and well-being",
        food_category: "Noodles"
    }
]
