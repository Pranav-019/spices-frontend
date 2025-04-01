import React, { useState, useContext } from 'react';
import './LoginPopup.css';
import { assets } from '../../assets/assets';
import { AuthContext } from '../../Context/AuthContext';
import axios from 'axios';

const LoginPopup = ({ setShowLogin }) => {
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
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const url = currState === "Sign Up" 
                ? 'https://spices-backend.vercel.app/api/auth/signup' 
                : 'https://spices-backend.vercel.app/api/auth/login';

            const payload = currState === "Sign Up" 
                ? { name: formData.name, email: formData.email, password: formData.password }
                : { email: formData.email, password: formData.password };

            const response = await axios.post(url, payload);
            
            // Store token and update user context
            localStorage.setItem('userToken', response.data.token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
            setUser(response.data.user);
            
            // Close popup
            setShowLogin(false);
        } catch (err) {
            console.error('Auth error:', err);
            
            if (err.response) {
                if (err.response.status === 401) {
                    setError('Invalid email or password');
                } else {
                    setError(err.response.data?.message || `Error: ${err.response.status}`);
                }
            } else if (err.request) {
                setError('No response from server. Please check your connection.');
            } else {
                setError('An unexpected error occurred');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='login-popup'>
            <div className="login-popup-container">
                <div className="login-popup-title">
                    <h2>{currState}</h2>
                    <img onClick={() => setShowLogin(false)} src={assets.cross_icon} alt="Close" />
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
                        minLength={6}
                    />
                    {error && <p className="error-message">{error}</p>}
                    <button type="submit" disabled={loading}>
                        {loading ? 'Please wait...' : currState === "Login" ? "Login" : "Create account"}
                    </button>
                </form>
                <div className="login-popup-condition">
                    <input type="checkbox" required />
                    <p>By continuing, I agree to the terms of use & privacy policy.</p>
                </div>
                {currState === "Login" 
                    ? <p>Create a new account? <span onClick={() => setCurrState('Sign Up')}>Click here</span></p>
                    : <p>Already have an account? <span onClick={() => setCurrState('Login')}>Login here</span></p>
                }
            </div>
        </div>
    );
};

export default LoginPopup;