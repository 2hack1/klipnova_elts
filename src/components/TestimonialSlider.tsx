import { useState, useEffect } from "react";

interface Testimonial {
  name: string;
  role: string;
  image: string;
  quote: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Aman kumar",
    role: "Managing Director",
    image: "/img/home/user_images.jpg",
    quote: "Working with Klipnova Solutions was a great experience. Their team provided innovative marketing strategies and modern web solutions."
  },
  {
    name: "Alisha patel",
    role: "Founder of Softbelly",
    image: "/img/home/user_images.jpg",
    quote: "Klipnova Solutions helped us improve our online presence with creative marketing strategies and professional support. Great experience working with their team."
  },
  {
    name: "Jai",
    role: "Founder Of STRAWX",
    image: "/img/home/user_images.jpg",
    quote: "Reliable service and innovative solutions. Our business engagement and digital reach improved significantly after working with them."
  },
  {
    name: "Kapil Agrawal",
    role: "Co-founder KlipNova Solutions",
    image: "/img/home/user_images.jpg",
    quote: "As the founder, we continuously learn and research every day to build strong brands and innovative tech solutions that make every client feel like family."
  }
];

// Extended list with cloned items at the end to allow smooth infinite loop transition on all devices
const EXTENDED_TESTIMONIALS = [...TESTIMONIALS, ...TESTIMONIALS.slice(0, 3)];

export function TestimonialSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);

  // Auto rotation
  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleNext = () => {
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
  };

  // Watch slide index to handle loop reset back to 0 seamlessly
  useEffect(() => {
    if (currentIndex === TESTIMONIALS.length) {
      const timer = setTimeout(() => {
        // Disable transitions and instantly reset index to 0
        setIsTransitioning(false);
        setCurrentIndex(0);
      }, 600); // Matches transition duration (0.6s)
      return () => clearTimeout(timer);
    }
  }, [currentIndex]);

  const goToSlide = (idx: number) => {
    setIsTransitioning(true);
    setCurrentIndex(idx);
  };

  return (
    <div className="container-fluid py-5 wow fadeInUp" data-wow-delay="0.1s">
      <div className="container py-5">
        <div className="section-title text-center position-relative pb-3 mb-4 mx-auto" style={{ maxWidth: "600px" }}>
          <h5 className="fw-bold text-primary text-uppercase">Testimonial</h5>
          <h1 className="mb-0">What Our Clients Say About Our Digital Services</h1>
        </div>
        
        <div className="position-relative overflow-hidden py-2 px-1">
          {/* Slider Track */}
          <div 
            className="testimonial-track" 
            style={{ 
              "--active-index": currentIndex,
              transition: isTransitioning ? "transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)" : "none"
            } as React.CSSProperties}
          >
            {EXTENDED_TESTIMONIALS.map((t, i) => (
              <div className="testimonial-slide px-3" key={i}>
                <div className="testimonial-item bg-light my-3 rounded p-4 border" style={{ minHeight: "220px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div className="d-flex align-items-center border-bottom pb-3 mb-3">
                    <img 
                      className="img-fluid rounded-circle" 
                      src={t.image} 
                      style={{ width: "60px", height: "60px", objectFit: "cover" }} 
                      alt={t.name}
                    />
                    <div className="ps-3">
                      <h4 className="text-primary h5 mb-1">{t.name}</h4>
                      <small className="text-uppercase text-muted" style={{ fontSize: "11px" }}>{t.role}</small>
                    </div>
                  </div>
                  <div className="text-muted flex-grow-1" style={{ fontStyle: "italic", fontSize: "14px", lineHeight: "1.6" }}>
                    "{t.quote}"
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Indicators / Navigation Dots */}
          <div className="d-flex justify-content-center gap-2 mt-4">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                className="btn btn-sm rounded-circle p-0"
                style={{
                  width: "12px",
                  height: "12px",
                  background: (currentIndex % TESTIMONIALS.length) === i ? "rgb(255, 179, 0)" : "#ccc",
                  border: "none",
                  transition: "background-color 0.3s"
                }}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Responsive sliding CSS using variable --active-index */}
      <style>{`
        .testimonial-track {
          display: flex;
          transform: translateX(calc(-1 * var(--active-index) * 100%));
        }
        .testimonial-slide {
          flex: 0 0 100%;
          max-width: 100%;
        }
        @media (min-width: 768px) {
          .testimonial-track {
            transform: translateX(calc(-1 * var(--active-index) * 50%));
          }
          .testimonial-slide {
            flex: 0 0 50%;
            max-width: 50%;
          }
        }
        @media (min-width: 992px) {
          .testimonial-track {
            transform: translateX(calc(-1 * var(--active-index) * 33.333%));
          }
          .testimonial-slide {
            flex: 0 0 33.333%;
            max-width: 33.333%;
          }
        }
      `}</style>
    </div>
  );
}
