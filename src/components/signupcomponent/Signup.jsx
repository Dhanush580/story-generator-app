import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Signup.css';
import { useNavigate } from 'react-router-dom'; 
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Signup = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    useEffect(() => {
        if (formData.password) {
            let strength = 0;
            if (formData.password.length > 5) strength += 1;
            if (formData.password.length > 8) strength += 1;
            if (/[A-Z]/.test(formData.password)) strength += 1;
            if (/[0-9]/.test(formData.password)) strength += 1;
            if (/[^A-Za-z0-9]/.test(formData.password)) strength += 1;
            setPasswordStrength((strength / 5) * 100);
        } else {
            setPasswordStrength(0);
        }
    }, [formData.password]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            alert("Passwords don't match!");
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Signup failed");
                return;
            }
            navigate('/story-generation');
        } catch (err) {
            alert("Server error");
            console.error(err);
        }
    };

    const getStrengthColor = () => {
        if (passwordStrength < 30) return '#ff4d4d';
        if (passwordStrength < 70) return '#ffcc00';
        return '#00cc66';
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };
    

    return (
        <div className="signup-container">
            <div className="signup-holder">
                <h2 className='signup-heading'>Signup to get started</h2>
                <form className="signup-form" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="signup-input"
                            placeholder=" "
                            required
                        />
                        <label className="input-label">Full Name</label>
                    </div>

                    <div className="input-group">
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="signup-input"
                            placeholder=" "
                            required
                        />
                        <label className="input-label">Email Address</label>
                    </div>

                    <div className="input-group password-input-group">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="signup-input"
                            placeholder=" "
                            required
                        />
                        <label className="input-label">Password</label>
                        <button 
                            type="button" 
                            className="password-toggle"
                            onClick={togglePasswordVisibility}
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                        <div className="password-strength">
                            <div 
                                className="strength-bar" 
                                style={{
                                    width: `${passwordStrength}%`,
                                    backgroundColor: getStrengthColor()
                                }}
                            ></div>
                        </div>
                    </div>

                    <div className="input-group password-input-group">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="signup-input"
                            placeholder=" "
                            required
                        />
                        <label className="input-label">Confirm Password</label>
                        <button 
                            type="button" 
                            className="password-toggle"
                            onClick={toggleConfirmPasswordVisibility}
                        >
                            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>

                    <button type="submit" className="signup-btn">
                        Sign Up
                    </button>
                </form>

                <p className="login-link">
                    Already have an account? <Link to="/login">Log in</Link>
                </p>
                <p className='login-link'><Link to="/">Go Back to Home</Link></p>
            </div>
        </div>
    );
};

export default Signup;