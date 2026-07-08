import { createFileRoute, Link } from "@tanstack/react-router";
import { KlipnovaLayout } from "@/components/KlipnovaLayout";

export const Route = createFileRoute("/service")({
  head: () => ({
    meta: [
      { title: "Our Services — Klipnova Solutions" },
      {
        name: "description",
        content: "Explore the wide range of digital and IT services offered by Klipnova Solutions, including Web Development, App Development, SEO, and Branding.",
      },
    ],
  }),
  component: Services,
});

function Services() {
  return (
    <KlipnovaLayout>
      {/* Page Header Start */}
      <div className="container-fluid bg-primary py-5 bg-header" style={{ marginBottom: "90px" }}>
        <div className="row py-5">
          <div className="col-12 pt-lg-5 mt-lg-5 text-center">
            <h1 className="display-4 text-white animated zoomIn">Services</h1>
            <Link to="/" className="h5 text-white text-decoration-none">Home</Link>
            <i className="far fa-circle text-white px-2"></i>
            <span className="h5 text-white">Services</span>
          </div>
        </div>
      </div>
      {/* Page Header End */}

      {/* Services Start */}
      <div className="container-fluid py-5 wow fadeInUp" data-wow-delay="0.1s">
        <div className="container py-5">
          <div className="section-title text-center position-relative pb-3 mb-5 mx-auto" style={{ maxWidth: "600px" }}>
            <h5 className="fw-bold text-primary text-uppercase">Our Services</h5>
            <h1 className="mb-0">Custom IT Solutions for Your Successful Business</h1>
          </div>
          <div className="row g-5">
            <div className="col-lg-4 col-md-6 wow zoomIn" data-wow-delay="0.3s">
              <div className="service-item bg-light rounded d-flex flex-column align-items-center justify-content-center text-center p-4">
                <div className="service-icon mb-3" style={{ width: "60px", height: "60px", background: "rgb(255, 179, 0)", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <i className="fa fa-shield-alt text-white"></i>
                </div>
                <h4 className="mb-3">Web Development</h4>
                <p className="m-0">Creating modern, responsive, and user-friendly websites designed for business growth and strong online presence.</p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 wow zoomIn" data-wow-delay="0.6s">
              <div className="service-item bg-light rounded d-flex flex-column align-items-center justify-content-center text-center p-4">
                <div className="service-icon mb-3" style={{ width: "60px", height: "60px", background: "rgb(255, 179, 0)", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <i className="fa fa-chart-pie text-white"></i>
                </div>
                <h4 className="mb-3">Data Analytics</h4>
                <p className="m-0">Helping businesses understand customer behavior and performance through smart digital insights and analytics.</p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 wow zoomIn" data-wow-delay="0.9s">
              <div className="service-item bg-light rounded d-flex flex-column align-items-center justify-content-center text-center p-4">
                <div className="service-icon mb-3" style={{ width: "60px", height: "60px", background: "rgb(255, 179, 0)", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <i className="fa fa-code text-white"></i>
                </div>
                <h4 className="mb-3">Apps Development</h4>
                <p className="m-0">Building smooth, scalable, and innovative mobile applications for modern business needs.</p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 wow zoomIn" data-wow-delay="0.3s">
              <div className="service-item bg-light rounded d-flex flex-column align-items-center justify-content-center text-center p-4">
                <div className="service-icon mb-3" style={{ width: "60px", height: "60px", background: "rgb(255, 179, 0)", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <i className="fab fa-android text-white"></i>
                </div>
                <h4 className="mb-3">Digital Branding</h4>
                <p className="m-0">Building a powerful brand identity that helps your business stand out and connect with the right audience digitally.</p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 wow zoomIn" data-wow-delay="0.6s">
              <div className="service-item bg-light rounded d-flex flex-column align-items-center justify-content-center text-center p-4">
                <div className="service-icon mb-3" style={{ width: "60px", height: "60px", background: "rgb(255, 179, 0)", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <i className="fa fa-search text-white"></i>
                </div>
                <h4 className="mb-3">Social Media Management</h4>
                <p className="m-0">Managing and growing your brand across Instagram, Facebook, LinkedIn, and other platforms with engaging content.</p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 wow zoomIn" data-wow-delay="0.9s">
              <div className="position-relative bg-primary rounded h-100 d-flex flex-column align-items-center justify-content-center text-center p-5">
                <h3 className="text-white mb-3">Call Us For Quote</h3>
                <p className="text-white mb-3">Ready to grow your business online? Get in touch with us today.</p>
                <h2 className="text-white mb-0">+913 147 5945</h2>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Services End */}

      {/* Testimonials (Static display fallback) */}
      <div className="container-fluid py-5 wow fadeInUp" data-wow-delay="0.1s">
        <div className="container py-5">
          <div className="section-title text-center position-relative pb-3 mb-4 mx-auto" style={{ maxWidth: "600px" }}>
            <h5 className="fw-bold text-primary text-uppercase">Testimonial</h5>
            <h1 className="mb-0">What Our Clients Say About Our Digital Services</h1>
          </div>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="testimonial-item bg-light p-4 rounded">
                <div className="d-flex align-items-center border-bottom pb-3 mb-3">
                  <img className="rounded-circle" src="/img/testimonial-1.jpg" style={{ width: "50px", height: "50px" }} alt="Client 1" />
                  <div className="ps-3">
                    <h5 className="text-primary mb-1">John Doe</h5>
                    <small className="text-uppercase text-muted">CEO, TechCorp</small>
                  </div>
                </div>
                <p className="m-0">Klipnova Solutions delivered a state of the art website that elevated our digital presence. Highly recommended!</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="testimonial-item bg-light p-4 rounded">
                <div className="d-flex align-items-center border-bottom pb-3 mb-3">
                  <img className="rounded-circle" src="/img/testimonial-2.jpg" style={{ width: "50px", height: "50px" }} alt="Client 2" />
                  <div className="ps-3">
                    <h5 className="text-primary mb-1">Alice Smith</h5>
                    <small className="text-uppercase text-muted">Marketing Director</small>
                  </div>
                </div>
                <p className="m-0">Their social media management increased our engagement by 150%. Their creative team is outstanding.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="testimonial-item bg-light p-4 rounded">
                <div className="d-flex align-items-center border-bottom pb-3 mb-3">
                  <img className="rounded-circle" src="/img/testimonial-3.jpg" style={{ width: "50px", height: "50px" }} alt="Client 3" />
                  <div className="ps-3">
                    <h5 className="text-primary mb-1">Michael Brown</h5>
                    <small className="text-uppercase text-muted">Business Owner</small>
                  </div>
                </div>
                <p className="m-0">The ELTS tracking application has streamlined our operations and saved us countless hours of manual reporting.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </KlipnovaLayout>
  );
}
