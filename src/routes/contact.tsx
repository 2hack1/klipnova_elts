import { createFileRoute, Link } from "@tanstack/react-router";
import { KlipnovaLayout } from "@/components/KlipnovaLayout";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — Klipnova Solutions" },
      {
        name: "description",
        content: "Get in touch with Klipnova Solutions. Call us, send an email, or visit our office. We are here to answer your questions.",
      },
    ],
  }),
  component: Contact,
});

function Contact() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Thank you for your message! We will get back to you shortly.");
  };

  return (
    <KlipnovaLayout>
      {/* Page Header Start */}
      <div className="container-fluid bg-primary py-5 bg-header" style={{ marginBottom: "90px" }}>
        <div className="row py-5">
          <div className="col-12 pt-lg-5 mt-lg-5 text-center">
            <h1 className="display-4 text-white animated zoomIn">Contact Us</h1>
            <Link to="/" className="h5 text-white text-decoration-none">Home</Link>
            <i className="far fa-circle text-white px-2"></i>
            <span className="h5 text-white">Contact</span>
          </div>
        </div>
      </div>
      {/* Page Header End */}

      {/* Contact Start */}
      <div className="container-fluid py-5 wow fadeInUp" data-wow-delay="0.1s">
        <div className="container py-5">
          <div className="section-title text-center position-relative pb-3 mb-5 mx-auto" style={{ maxWidth: "600px" }}>
            <h5 className="fw-bold text-primary text-uppercase">Contact Us</h5>
            <h1 className="mb-0">If You Have Any Query, Feel Free To Contact Us</h1>
          </div>
          <div className="row g-5 mb-5">
            <div className="col-lg-4">
              <div className="d-flex align-items-center wow fadeIn" data-wow-delay="0.1s">
                <div className="bg-primary d-flex align-items-center justify-content-center rounded" style={{ width: "60px", height: "60px" }}>
                  <i className="fa fa-phone-alt text-white"></i>
                </div>
                <div className="ps-4">
                  <h5 className="mb-2">Call to ask any question</h5>
                  <h4 className="text-primary mb-0">+913 147 5945</h4>
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="d-flex align-items-center wow fadeIn" data-wow-delay="0.4s">
                <div className="bg-primary d-flex align-items-center justify-content-center rounded" style={{ width: "60px", height: "60px" }}>
                  <i className="fa fa-envelope-open text-white"></i>
                </div>
                <div className="ps-4">
                  <h5 className="mb-2">Email to get free quote</h5>
                  <h4 className="text-primary mb-0">klipnovasolution@gmail.com</h4>
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="d-flex align-items-center wow fadeIn" data-wow-delay="0.8s">
                <div className="bg-primary d-flex align-items-center justify-content-center rounded" style={{ width: "60px", height: "60px" }}>
                  <i className="fa fa-map-marker-alt text-white"></i>
                </div>
                <div className="ps-4">
                  <h5 className="mb-2">Visit our office</h5>
                  <h4 className="text-primary mb-0">Morar, Gwalior (M.P.), India</h4>
                </div>
              </div>
            </div>
          </div>
          <div className="row g-5">
            <div className="col-lg-6 wow slideInUp" data-wow-delay="0.3s">
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <input type="text" className="form-control border-0 bg-light px-4" placeholder="Your Name" style={{ height: "55px" }} required />
                  </div>
                  <div className="col-md-6">
                    <input type="email" className="form-control border-0 bg-light px-4" placeholder="Your Email" style={{ height: "55px" }} required />
                  </div>
                  <div className="col-12">
                    <input type="text" className="form-control border-0 bg-light px-4" placeholder="Subject" style={{ height: "55px" }} required />
                  </div>
                  <div className="col-12">
                    <textarea className="form-control border-0 bg-light px-4 py-3" rows={4} placeholder="Message" required></textarea>
                  </div>
                  <div className="col-12">
                    <button className="btn btn-primary w-100 py-3" type="submit">Send Message</button>
                  </div>
                </div>
              </form>
            </div>
            <div className="col-lg-6 wow slideInUp" data-wow-delay="0.6s">
              <iframe
                className="position-relative rounded w-100 h-100"
                src="https://maps.google.com/maps?q=Morar,Gwalior,Madhya%20Pradesh,India&t=&z=13&ie=UTF8&iwloc=&output=embed"
                frameBorder="0"
                style={{ minHeight: "350px", border: 0 }}
                allowFullScreen={true}
                aria-hidden="false"
                tabIndex={0}
                title="Google Map"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
      {/* Contact End */}
    </KlipnovaLayout>
  );
}
