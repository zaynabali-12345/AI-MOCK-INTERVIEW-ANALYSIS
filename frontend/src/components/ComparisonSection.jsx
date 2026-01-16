import React from 'react';
import { Check, X, Layers } from 'lucide-react';

export default function ComparisonSection() {
  const features = [
    {
      landio: 'Offers real-time voice-based HR simulations',
      others: 'Only provide text-based or pre-recorded interviews'
    },
    {
      landio: 'Integrates resume analyzer + career advisor in one dashboard',
      others: 'Require separate tools for career & resume review'
    },
    {
      landio: 'Provides GD (Group Discussion) and HR round practice together',
      others: 'Focus only on coding or technical interview prep'
    },
    {
      landio: 'Delivers AI-driven feedback and performance analytics instantly',
      others: 'Feedback is manual, generic, or delayed'
    },
    {
      landio: 'Includes job ranking & interview review insights from real candidates',
      others: 'No insight into real job trends or candidate experiences'
    }
  ];

  return (
    <div className="comparison-section-container">
      {/* Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "radial-gradient(125% 125% at 50% 100%, #000000 40%, #350136 100%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-7xl w-full">
        {/* Header */}
        <div className="comparison-header">
          <div className="comparison-header-eyebrow">
            <Layers size={16} />
            <span className="uppercase tracking-wider">COMPARISON</span>
          </div>
          <h2 className="comparison-main-heading">
            Why Choose Us?
          </h2>
          <p className="text-gray-400 text-lg">
            Because we don’t just simulate interviews — we prepare you for your entire career journey.
          </p>
        </div>

        {/* Comparison Card */}
        <div className="comparison-card">
          <table className="comparison-html-table">
            <thead>
              <tr className="comparison-header-row">
                <th className="table-header-cell">
                  <div className="table-header-content">
                    <div className="header-icon-wrapper">
                      <div className="header-icon-inner"></div>
                    </div>
                    <h3>My AI Mock Interview</h3>
                  </div>
                </th>
                <th className="table-header-cell">
                  <div className="table-header-content">
                    <Layers size={32} className="text-gray-500" />
                    <h3>Other Platforms</h3>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {features.map((feature, index) => (
                <tr key={index} className="feature-row-anim">
                  <td className="feature-cell">
                    <div className="feature-content">
                      <div className="feature-icon-check">
                        <Check size={14} className="text-white" strokeWidth={3} />
                      </div>
                      <p>{feature.landio}</p>
                    </div>
                  </td>
                  <td className="feature-cell">
                    <div className="feature-content">
                      <div className="feature-icon-cross">
                        <X size={12} className="text-gray-600" strokeWidth={3} />
                      </div>
                      <p className="text-gray-500 text-base leading-relaxed">{feature.others}</p>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}