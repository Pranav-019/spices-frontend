import React, { useState, useContext } from 'react'
import './LoginPopup.css'
import { assets } from '../../assets/assets'
import { AuthContext } from '../../Context/AuthContext'
import axios from 'axios'

const LoginPopup = ({setShowLogin}) => {
    const [currState, setCurrState] = useState("Sign Up");
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { setUser } = useContext(AuthContext);

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError(''); // Clear error when user types
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (currState === "Sign Up") {
                const response = await axios.post('http://localhost:5000/api/auth/signup', {
                    name: formData.name,
                    email: formData.email,
                    password: formData.password
                });
                
                console.log('Signup response:', response.data); // Debug log
                
                if (response.data && response.data.token) {
                    localStorage.setItem('userToken', response.data.token);
                    // Set axios default header
                    axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
                    setUser(response.data.user);
                    setShowLogin(false);
                }
            } else {
                const response = await axios.post('http://localhost:5000/api/auth/login', {
                    email: formData.email,
                    password: formData.password
                });

                console.log('Login response:', response.data); // Debug log

                if (response.data && response.data.token) {
                    localStorage.setItem('userToken', response.data.token);
                    // Set axios default header
                    axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
                    setUser(response.data.user);
                    setShowLogin(false);
                }
            }
        } catch (err) {
            console.error('Auth error:', err); // Debug log
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='login-popup'>
            <div className="login-popup-container">
                <div className="login-popup-title">
                    <h2>{currState}</h2>
                    <img onClick={()=>setShowLogin(false)} src={assets.cross_icon} alt="" />
                </div>
                <form onSubmit={handleSubmit} className="login-popup-inputs">
                    {currState === "Sign Up" && (
                        <input 
                            type="text" 
                            placeholder='Enter your name' 
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                        />
                    )}
                    <input 
                        type="email" 
                        placeholder='Email'
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                    />
                    <input 
                        type="password" 
                        placeholder='Password'
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                    />
                    {error && <p className="error-message">{error}</p>}
                    <button type="submit" disabled={loading}>
                        {loading ? 'Please wait...' : (currState === "Login" ? "Login" : "Create account")}
                    </button>
                </form>
                <div className="login-popup-condition">
                    <input type="checkbox" required />
                    <p>By continuing, I agree to the terms of use & privacy policy.</p>
                </div>
                {currState === "Login" 
                    ? <p>Create a new account? <span onClick={()=>setCurrState('Sign Up')}>Click here</span></p>
                    : <p>Already have an account? <span onClick={()=>setCurrState('Login')}>Login here</span></p>
                }
            </div>
        </div>
    )
}

export default LoginPopup
