import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './HRForm.css';

const HRForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        role: 'Software Developer', // Default role
        company: '',
        experience_level: 'Fresher', // Default experience level
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.role || !formData.company || !formData.experience_level) {
            alert('Please fill out all fields.');
            return;
        }
        // Navigate to the interview page, passing the form data in the state
        navigate('/hr-interview', { state: formData });
    };

    return (
        <div className="hr-form-container">
            <div className="hr-form-card">
                <h1 className="hr-form-title">Prepare for Your Interview</h1>
                <p className="hr-form-subtitle">Fill in your details to begin a personalized HR session.</p>
                <form onSubmit={handleSubmit} className="hr-form">
                    <div className="form-group">
                        <label htmlFor="name">Your Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            placeholder="e.g., Alex Doe"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="role">Role You're Applying For</label>
                        <input
                            type="text"
                            id="role"
                            name="role"
                            list="role-options"
                            placeholder="e.g., Software Developer"
                            value={formData.role}
                            onChange={handleInputChange}
                            required
                        />
                        <datalist id="role-options">
                            <option value="Software Developer Intern" />
                            <option value="System Analyst Trainee" />
                            <option value="Business Analyst" />
                            <option value="UI/UX Designer" />
                        </datalist>
                    </div>
                    <div className="form-group">
                        <label htmlFor="company">Company Name</label>
                        <input
                            type="text"
                            id="company"
                            name="company"
                            placeholder="e.g., TCS, Google, etc."
                            value={formData.company}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="experience_level">Experience Level</label>
                        <select
                            id="experience_level"
                            name="experience_level"
                            value={formData.experience_level}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="Fresher">Fresher</option>
                            <option value="Intern">Intern</option>
                            <option value="1-3 Years">1-3 Years (Experienced)</option>
                            <option value="4+ Years">4+ Years (Senior)</option>
                        </select>
                    </div>
                    <button type="submit" className="start-interview-btn">Start Interview</button>
                </form>
            </div>
        </div>
    );
};

export default HRForm;