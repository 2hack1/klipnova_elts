import { createFileRoute, Link } from "@tanstack/react-router";
import { KlipnovaLayout } from "@/components/KlipnovaLayout";

export const Route = createFileRoute("/quote")({
  head: () => ({
    meta: [
      { title: "Free Quote — Klipnova Solutions" },
      {
        name: "description",
        content: "Need a free quote? Contact Klipnova Solutions for custom web development, mobile apps, and digital branding solutions.",
      },
    ],
  }),
  component: QuotePage,
});

function QuotePage() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Thank you! Your quote request has been sent successfully.");
  };

  return (
    <KlipnovaLayout>
      {/* Page Header Start */}
      <div className="container-fluid bg-primary py-5 bg-header" style={{ marginBottom: "90px" }}>
        <div className="row py-5">
          <div className="col-12 pt-lg-5 mt-lg-5 text-center">
            <h1 className="display-4 text-white animated zoomIn">Free Quote</h1>
            <Link to="/" className="h5 text-white text-decoration-none">Home</Link>
            <i className="far fa-circle text-white px-2"></i>
            <span className="h5 text-white">Free Quote</span>
          </div>
        </div>
      </div>
      {/* Page Header End */}

      {/* Quote Start */}
      <div className="container-fluid py-5 wow fadeInUp" data-wow-delay="0.1s">
        <div className="container py-5">
          <div className="row g-5">
            <div className="col-lg-7">
              <div className="section-title position-relative pb-3 mb-5">
                <h5 className="fw-bold text-primary text-uppercase">Request A Quote</h5>
                <h1 className="mb-0">Need A Free Quote? Please Feel Free to Contact Us</h1>
              </div>
              <div className="row gx-3">
                <div className="col-sm-6 wow zoomIn" data-wow-delay="0.2s">
                  <h5 className="mb-4"><i className="fa fa-reply text-primary me-3"></i>Reply within 24 hours</h5>
                </div>
                <div className="col-sm-6 wow zoomIn" data-wow-delay="0.4s">
                  <h5 className="mb-4"><i className="fa fa-phone-alt text-primary me-3"></i>24 hrs telephone support</h5>
                </div>
              </div>
              <p className="mb-4">
                We are ready to provide custom IT consulting and digital marketing quotes to match your business requirements.
                Let us know what your brand needs to succeed online, and we will formulate a structured execution plan.
              </p>
              <div className="d-flex align-items-center mt-2 wow zoomIn" data-wow-delay="0.6s">
                <div className="bg-primary d-flex align-items-center justify-content-center rounded" style={{ width: "60px", height: "60px" }}>
                  <i className="fa fa-phone-alt text-white"></i>
                </div>
                <div className="ps-4">
                  <h5 className="mb-2">Call to ask any question</h5>
                  <h4 className="text-primary mb-0">+913 147 5945</h4>
                </div>
              </div>
            </div>
            <div className="col-lg-5">
              <div className="bg-primary rounded h-100 d-flex align-items-center p-5 wow zoomIn" data-wow-delay="0.9s">
                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-xl-12">
                      <input type="text" className="form-control bg-light border-0" placeholder="Your Name" style={{ height: "55px" }} required />
                    </div>
                    <div className="col-12">
                      <input type="email" className="form-control bg-light border-0" placeholder="Your Email" style={{ height: "55px" }} required />
                    </div>
                    <div className="col-12">
                      <select className="form-select bg-light border-0" style={{ height: "55px" }} required>
                        <option value="">Select A Service</option>
                        <option value="web">Web Development</option>
                        <option value="apps">Apps Development</option>
                        <option value="seo">Social Media Management & SEO</option>
                        <option value="branding">Digital Branding</option>
                      </select>
                    </div>
                    <div className="col-12">
                      <textarea className="form-control bg-light border-0" rows={3} placeholder="Message" required></textarea>
                    </div>
                    <div className="col-12">
                      <button className="btn btn-dark w-100 py-3" type="submit">Request A Quote</button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Quote End */}
    </KlipnovaLayout>
  );
}
