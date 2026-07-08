import { createFileRoute, Link } from "@tanstack/react-router";
import { KlipnovaLayout } from "@/components/KlipnovaLayout";

export const Route = createFileRoute("/feature")({
  head: () => ({
    meta: [
      { title: "Our Features — Klipnova Solutions" },
      {
        name: "description",
        content: "Discover why businesses choose Klipnova Solutions. We deliver the best digital solutions, professional staff, and reliable support to grow your business.",
      },
    ],
  }),
  component: FeaturesPage,
});

function FeaturesPage() {
  return (
    <KlipnovaLayout>
      {/* Page Header Start */}
      <div className="container-fluid bg-primary py-5 bg-header" style={{ marginBottom: "90px" }}>
        <div className="row py-5">
          <div className="col-12 pt-lg-5 mt-lg-5 text-center">
            <h1 className="display-4 text-white animated zoomIn">Features</h1>
            <Link to="/" className="h5 text-white text-decoration-none">Home</Link>
            <i className="far fa-circle text-white px-2"></i>
            <span className="h5 text-white">Features</span>
          </div>
        </div>
      </div>
      {/* Page Header End */}

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

      {/* Vendor List (Static) */}
      <div className="container-fluid py-5 wow fadeInUp" data-wow-delay="0.1s">
        <div className="container py-5 mb-5">
          <div className="bg-white p-4 rounded shadow-sm">
            <div className="d-flex flex-wrap justify-content-around align-items-center gap-4">
              <img src="/img/vendor-1.jpg" style={{ height: "40px", opacity: 0.6 }} alt="Vendor 1" />
              <img src="/img/vendor-2.jpg" style={{ height: "40px", opacity: 0.6 }} alt="Vendor 2" />
              <img src="/img/vendor-3.jpg" style={{ height: "40px", opacity: 0.6 }} alt="Vendor 3" />
              <img src="/img/vendor-4.jpg" style={{ height: "40px", opacity: 0.6 }} alt="Vendor 4" />
              <img src="/img/vendor-5.jpg" style={{ height: "40px", opacity: 0.6 }} alt="Vendor 5" />
              <img src="/img/vendor-6.jpg" style={{ height: "40px", opacity: 0.6 }} alt="Vendor 6" />
            </div>
          </div>
        </div>
      </div>
    </KlipnovaLayout>
  );
}
