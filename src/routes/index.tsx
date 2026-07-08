import { createFileRoute, Link } from "@tanstack/react-router";
import { KlipnovaLayout } from "@/components/KlipnovaLayout";
import { TestimonialSlider } from "@/components/TestimonialSlider";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Klipnova Solutions — Creative & Innovative Digital Solutions" },
      {
        name: "description",
        content: "Smart IT & Digital Solutions for modern brands. Web, mobile apps, digital branding, social media marketing, and location tracking systems.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <KlipnovaLayout>
      {/* Header Carousel Start */}
      <div id="header-carousel" className="carousel slide carousel-fade" data-bs-ride="carousel">
        <div className="carousel-inner">
          <div className="carousel-item active">
            <img className="w-100" src="/img/carousel-1.jpg" alt="Creative & Innovative" style={{ maxHeight: "650px", objectFit: "cover" }} />
            <div className="carousel-caption d-flex flex-column align-items-center justify-content-center">
              <div className="p-3" style={{ maxWidth: "900px" }}>
                <h5 className="text-white text-uppercase mb-3 animated slideInDown">Creative & Innovative</h5>
                <h1 className="display-1 text-white mb-md-4 animated zoomIn">Smart IT & Digital Solutions</h1>
                <Link to="/quote" className="btn btn-primary py-md-3 px-md-5 me-3 animated slideInLeft">Free Quote</Link>
                <Link to="/contact" className="btn btn-outline-light py-md-3 px-md-5 animated slideInRight">Contact Us</Link>
              </div>
            </div>
          </div>
          <div className="carousel-item">
            <img className="w-100" src="/img/carousel-2.jpg" alt="Creative & Innovative" style={{ maxHeight: "650px", objectFit: "cover" }} />
            <div className="carousel-caption d-flex flex-column align-items-center justify-content-center">
              <div className="p-3" style={{ maxWidth: "900px" }}>
                <h5 className="text-white text-uppercase mb-3 animated slideInDown">Creative & Innovative</h5>
                <h1 className="display-1 text-white mb-md-4 animated zoomIn">Creative & Innovative Digital Solution</h1>
                <Link to="/quote" className="btn btn-primary py-md-3 px-md-5 me-3 animated slideInLeft">Free Quote</Link>
                <Link to="/contact" className="btn btn-outline-light py-md-3 px-md-5 animated slideInRight">Contact Us</Link>
              </div>
            </div>
          </div>
        </div>
        <button className="carousel-control-prev" type="button" data-bs-target="#header-carousel" data-bs-slide="prev">
          <span className="carousel-control-prev-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Previous</span>
        </button>
        <button className="carousel-control-next" type="button" data-bs-target="#header-carousel" data-bs-slide="next">
          <span className="carousel-control-next-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Next</span>
        </button>
      </div>
      {/* Header Carousel End */}

      {/* Facts Start */}
      <div className="container-fluid facts py-5 pt-lg-0">
        <div className="container py-5 pt-lg-0">
          <div className="row gx-0">
            <div className="col-lg-4 wow zoomIn" data-wow-delay="0.1s">
              <div className="bg-primary shadow d-flex align-items-center justify-content-center p-4" style={{ height: "150px" }}>
                <div className="bg-white d-flex align-items-center justify-content-center rounded mb-2" style={{ width: "60px", height: "60px" }}>
                  <i className="fa fa-users text-primary"></i>
                </div>
                <div className="ps-4">
                  <h5 className="text-white mb-0">Happy Clients</h5>
                  <h1 className="text-white mb-0" data-toggle="counter-up">4</h1>
                </div>
              </div>
            </div>
            <div className="col-lg-4 wow zoomIn" data-wow-delay="0.3s">
              <div className="bg-light shadow d-flex align-items-center justify-content-center p-4" style={{ height: "150px" }}>
                <div className="bg-primary d-flex align-items-center justify-content-center rounded mb-2" style={{ width: "60px", height: "60px" }}>
                  <i className="fa fa-check text-white"></i>
                </div>
                <div className="ps-4">
                  <h5 className="text-primary mb-0">Projects Done</h5>
                  <h1 className="mb-0" data-toggle="counter-up">3</h1>
                </div>
              </div>
            </div>
            <div className="col-lg-4 wow zoomIn" data-wow-delay="0.6s">
              <div className="bg-primary shadow d-flex align-items-center justify-content-center p-4" style={{ height: "150px" }}>
                <div className="bg-white d-flex align-items-center justify-content-center rounded mb-2" style={{ width: "60px", height: "60px" }}>
                  <i className="fa fa-award text-primary"></i>
                </div>
                <div className="ps-4">
                  <h5 className="text-white mb-0">Win Awards</h5>
                  <h1 className="text-white mb-0" data-toggle="counter-up">1</h1>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Facts End */}

      {/* About Start */}
      <div className="container-fluid py-5 wow fadeInUp" data-wow-delay="0.1s">
        <div className="container py-5">
          <div className="row g-5">
            <div className="col-lg-7">
              <div className="section-title position-relative pb-3 mb-5">
                <h5 className="fw-bold text-primary text-uppercase">About Us</h5>
                <h1 className="mb-0">Smart IT & Digital Solutions for Modern Brands</h1>
              </div>
              <p className="mb-4">
                KlipNova Solutions helps businesses grow digitally with smart marketing, creative branding, and modern technology solutions.
                From social media management to websites and app development, we create powerful digital experiences that help brands stand out online.
              </p>
              <div className="row g-0 mb-3">
                <div className="col-sm-6 wow zoomIn" data-wow-delay="0.2s">
                  <h5 className="mb-3"><i className="fa fa-check text-primary me-3"></i>Creative Solutions</h5>
                  <h5 className="mb-3"><i className="fa fa-check text-primary me-3"></i>Professional Staff</h5>
                </div>
                <div className="col-sm-6 wow zoomIn" data-wow-delay="0.4s">
                  <h5 className="mb-3"><i className="fa fa-check text-primary me-3"></i>Reliable Support</h5>
                  <h5 className="mb-3"><i className="fa fa-check text-primary me-3"></i>Fair Prices</h5>
                </div>
              </div>
              <div className="d-flex align-items-center mb-4 wow fadeIn" data-wow-delay="0.6s">
                <div className="bg-primary d-flex align-items-center justify-content-center rounded" style={{ width: "60px", height: "60px" }}>
                  <i className="fa fa-phone-alt text-white"></i>
                </div>
                <div className="ps-4">
                  <h5 className="mb-2">Call to ask any question</h5>
                  <h4 className="text-primary mb-0">+913 147 5945</h4>
                </div>
              </div>
              <Link to="/quote" className="btn btn-primary py-3 px-5 mt-3 wow zoomIn" data-wow-delay="0.9s">Request A Quote</Link>
            </div>
            <div className="col-lg-5" style={{ minHeight: "500px" }}>
              <div className="position-relative h-100">
                <img className="position-absolute w-100 h-100 rounded wow zoomIn" data-wow-delay="0.9s" src="/img/about.jpg" style={{ objectFit: "cover" }} alt="About Us" />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* About End */}

      {/* Features Choose Us Start */}
      <div className="container-fluid py-5 wow fadeInUp" data-wow-delay="0.1s">
        <div className="container py-5">
          <div className="section-title text-center position-relative pb-3 mb-5 mx-auto" style={{ maxWidth: "600px" }}>
            <h5 className="fw-bold text-primary text-uppercase">Why Choose Us</h5>
            <h1 className="mb-0">We Are Here to Grow Your Business Exponentially</h1>
          </div>
          <div className="row g-5">
            <div className="col-lg-4">
              <div className="row g-5">
                <div className="col-12 wow zoomIn" data-wow-delay="0.2s">
                  <div className="bg-primary rounded d-flex align-items-center justify-content-center mb-3" style={{ width: "60px", height: "60px" }}>
                    <i className="fa fa-cubes text-white"></i>
                  </div>
                  <h4>Best In Industry</h4>
                  <p className="mb-0">From social media management to website and app development, we deliver innovative solutions designed for business growth.</p>
                </div>
                <div className="col-12 wow zoomIn" data-wow-delay="0.6s">
                  <div className="bg-primary rounded d-flex align-items-center justify-content-center mb-3" style={{ width: "60px", height: "60px" }}>
                    <i className="fa fa-award text-white"></i>
                  </div>
                  <h4>Creative Solutions</h4>
                  <p className="mb-0">We create modern digital experiences through branding, social media marketing, websites, and technology solutions designed for business growth.</p>
                </div>
              </div>
            </div>
            <div className="col-lg-4 wow zoomIn" data-wow-delay="0.9s" style={{ minHeight: "350px" }}>
              <div className="position-relative h-100">
                <img className="position-absolute w-100 h-100 rounded wow zoomIn" data-wow-delay="0.1s" src="/img/feature.jpg" style={{ objectFit: "cover" }} alt="Features" />
              </div>
            </div>
            <div className="col-lg-4">
              <div className="row g-5">
                <div className="col-12 wow zoomIn" data-wow-delay="0.4s">
                  <div className="bg-primary rounded d-flex align-items-center justify-content-center mb-3" style={{ width: "60px", height: "60px" }}>
                    <i className="fa fa-users-cog text-white"></i>
                  </div>
                  <h4>Professional Staff</h4>
                  <p className="mb-0">Our creative and technical team works together to deliver modern digital solutions that help businesses grow faster and build a strong online presence.</p>
                </div>
                <div className="col-12 wow zoomIn" data-wow-delay="0.8s">
                  <div className="bg-primary rounded d-flex align-items-center justify-content-center mb-3" style={{ width: "60px", height: "60px" }}>
                    <i className="fa fa-phone-alt text-white"></i>
                  </div>
                  <h4>Reliable Support</h4>
                  <p className="mb-0">We focus on providing professional guidance and responsive communication to help businesses grow smoothly in the digital world.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Features Choose Us End */}

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
                <Link className="btn btn-lg btn-primary rounded mt-3" to="/service">
                  <i className="bi bi-arrow-right"></i>
                </Link>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 wow zoomIn" data-wow-delay="0.6s">
              <div className="service-item bg-light rounded d-flex flex-column align-items-center justify-content-center text-center p-4">
                <div className="service-icon mb-3" style={{ width: "60px", height: "60px", background: "rgb(255, 179, 0)", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <i className="fa fa-chart-pie text-white"></i>
                </div>
                <h4 className="mb-3">Data Analytics</h4>
                <p className="m-0">Helping businesses understand customer behavior and performance through smart digital insights and analytics.</p>
                <Link className="btn btn-lg btn-primary rounded mt-3" to="/service">
                  <i className="bi bi-arrow-right"></i>
                </Link>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 wow zoomIn" data-wow-delay="0.9s">
              <div className="service-item bg-light rounded d-flex flex-column align-items-center justify-content-center text-center p-4">
                <div className="service-icon mb-3" style={{ width: "60px", height: "60px", background: "rgb(255, 179, 0)", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <i className="fa fa-code text-white"></i>
                </div>
                <h4 className="mb-3">Apps Development</h4>
                <p className="m-0">Building smooth, scalable, and innovative mobile applications for modern business needs.</p>
                <Link className="btn btn-lg btn-primary rounded mt-3" to="/service">
                  <i className="bi bi-arrow-right"></i>
                </Link>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 wow zoomIn" data-wow-delay="0.3s">
              <div className="service-item bg-light rounded d-flex flex-column align-items-center justify-content-center text-center p-4">
                <div className="service-icon mb-3" style={{ width: "60px", height: "60px", background: "rgb(255, 179, 0)", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <i className="fab fa-android text-white"></i>
                </div>
                <h4 className="mb-3">Digital Branding</h4>
                <p className="m-0">Building a powerful brand identity that helps your business stand out and connect with the right audience digitally.</p>
                <Link className="btn btn-lg btn-primary rounded mt-3" to="/service">
                  <i className="bi bi-arrow-right"></i>
                </Link>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 wow zoomIn" data-wow-delay="0.6s">
              <div className="service-item bg-light rounded d-flex flex-column align-items-center justify-content-center text-center p-4">
                <div className="service-icon mb-3" style={{ width: "60px", height: "60px", background: "rgb(255, 179, 0)", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <i className="fa fa-search text-white"></i>
                </div>
                <h4 className="mb-3">Social Media Management</h4>
                <p className="m-0">Managing and growing your brand across Instagram, Facebook, LinkedIn, and other platforms with engaging content.</p>
                <Link className="btn btn-lg btn-primary rounded mt-3" to="/service">
                  <i className="bi bi-arrow-right"></i>
                </Link>
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
      <TestimonialSlider />
    </KlipnovaLayout>
  );
}
