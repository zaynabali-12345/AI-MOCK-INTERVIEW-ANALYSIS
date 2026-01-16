import React from 'react';
import { Star } from 'lucide-react';
import feedbackImage from '../assets/feedbackimage.jpeg'; // Import the image

export default function FeedbackSection() {
  const testimonials = [
    {
      name: "Riya Sharma",
      title: "B.Tech Student",
      rating: 5,
      text: "The AI interview felt almost like a real HR round! I loved how it gave me instant feedback on my tone and confidence. The dashboard clearly showed where I need to improve before my actual interview.",
      image: "👩‍🎓"
    },
    {
      name: "Aditya Mehta",
      title: "System Analyst Trainee (Intern)",
      rating: 5,
      text: "I’ve tried several mock interview tools, but this one actually analyzes your performance in depth. The sentiment analysis and question variety make every session feel unique.",
      image: "👨‍💻"
    },
    {
      name: "Sneha Patel",
      title: "MBA Graduate",
      rating: 5,
      text: "This project helped me overcome my interview anxiety. The AI feedback on communication style and body language was surprisingly accurate. Highly recommended for freshers!",
      image: "👩‍💼"
    },
    {
      name: "Arjun Nair",
      title: "Engineering Student",
      rating: 5,
      text: "Loved the clean interface and the detailed performance graphs! I could track my improvement across multiple attempts. It’s like having a personal interview coach available anytime.",
      image: "👨‍🎓"
    }
  ];

  return (
    <div className="feedback-section-container">
      {/* Content */}
      <div className="feedback-content-wrapper">
        {/* Section Header */}
        <div className="feedback-section-header">
          <h2>Feedback That Fuels Innovation 💬</h2>
        </div>

        {/* TOP 2 BOXES */}
        <div className="feedback-grid-top">
          {/* Box 1 - Quote Card */}
          <div className="feedback-quote-card glass-card">
            <div className="feedback-quote-content">
              <p className="feedback-quote-text">
                Your success stories drive us forward. The AI Mock Interview platform is designed to make interview preparation smarter, data-driven, and stress-free.
                <br/><br/>
                Every feedback helps us refine our algorithms and create a more personalized interview experience for you.
                <br/><br/>
                Practice. Improve. Succeed. 🚀
              </p>
              <div className="feedback-quote-icon">
                <span>"</span>
              </div>
            </div>
          </div>

          {/* Box 2 - Image Card */}
          <div className="feedback-image-card glass-card">
            <img src={feedbackImage} alt="AI-powered feedback session" className="feedback-image" />
          </div>
        </div>

        {/* BOTTOM 4 BOXES - Testimonials */}
        <div className="feedback-grid-bottom">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial-card-new glass-card">
              {/* Star Rating */}
              <div className="star-rating">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={i < testimonial.rating ? 'star-filled' : 'star-empty'}
                  />
                ))}
              </div>

              {/* Testimonial Text */}
              <p className="testimonial-text">{testimonial.text}</p>

              {/* Author Info */}
              <div className="testimonial-author-info">
                <div className="author-avatar-new">
                  {testimonial.image}
                </div>
                <div>
                  <h4 className="author-name">{testimonial.name}</h4>
                  <p className="author-title">{testimonial.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}