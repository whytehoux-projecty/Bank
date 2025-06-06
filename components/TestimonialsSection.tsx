import React from "react";
import { AnimatedSection } from "./AnimatedSection";

interface Testimonial {
  name: string;
  title: string;
  company: string;
  content: string;
  rating: number;
  avatar: string;
}

const TestimonialsSection: React.FC = () => {
  const testimonials: Testimonial[] = [
    {
      name: "Sarah Johnson",
      title: "CEO",
      company: "TechStart Inc.",
      content:
        "NovaBank's AI-powered insights have revolutionized how we manage our business finances. The personalized recommendations have saved us thousands in operational costs.",
      rating: 5,
      avatar:
        "https://source.unsplash.com/random/100x100?portrait,professional,woman",
    },
    {
      name: "Michael Chen",
      title: "Entrepreneur",
      company: "Green Energy Solutions",
      content:
        "The digital banking experience is seamless. From account opening to daily transactions, everything is smooth and secure. Their customer support is exceptional.",
      rating: 5,
      avatar:
        "https://source.unsplash.com/random/100x100?portrait,professional,man",
    },
    {
      name: "Emily Rodriguez",
      title: "CFO",
      company: "Global Logistics Corp",
      content:
        "NovaBank's enterprise security features give us peace of mind. The fraud detection system caught several suspicious activities before they could impact our business.",
      rating: 5,
      avatar:
        "https://source.unsplash.com/random/100x100?portrait,professional,businesswoman",
    },
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={`text-lg ${
          index < rating ? "text-yellow-400" : "text-gray-300"
        }`}
      >
        ★
      </span>
    ));
  };

  return (
    <AnimatedSection className="py-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#A41E22] mb-4">
            What Our Customers Say
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust NovaBank for their
            financial needs
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <AnimatedSection
              key={testimonial.name}
              delay={index * 200}
              animation="fadeInUp"
              className="bg-white p-6 rounded-xl shadow-lg hover-lift border border-gray-100 group"
            >
              <div className="flex items-center mb-4">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover mr-4 group-hover:scale-110 transition-transform duration-300"
                />
                <div>
                  <h4 className="font-bold text-[#A41E22]">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {testimonial.title} at {testimonial.company}
                  </p>
                </div>
              </div>

              <div className="mb-4">{renderStars(testimonial.rating)}</div>

              <blockquote className="text-gray-700 italic leading-relaxed">
                "{testimonial.content}"
              </blockquote>
            </AnimatedSection>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#A41E22] to-[#8C1A1F] text-white rounded-lg shadow-lg">
            <span className="text-2xl font-bold mr-2">4.9</span>
            <div className="flex flex-col items-start">
              <div className="flex">{renderStars(5)}</div>
              <span className="text-sm opacity-90">
                Based on 10,000+ reviews
              </span>
            </div>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
};

export default TestimonialsSection;
