import { createFileRoute, Link } from "@tanstack/react-router";
import { KlipnovaLayout } from "@/components/KlipnovaLayout";

export const Route = createFileRoute("/team")({
  head: () => ({
    meta: [
      { title: "Team Members — Klipnova Solutions" },
      {
        name: "description",
        content: "Meet our professional staff ready to help your business with digital marketing and IT solutions.",
      },
    ],
  }),
  component: TeamPage,
});

function TeamPage() {
  return (
    <KlipnovaLayout>
      {/* Page Header Start */}
      <div className="container-fluid bg-primary py-5 bg-header" style={{ marginBottom: "90px" }}>
        <div className="row py-5">
          <div className="col-12 pt-lg-5 mt-lg-5 text-center">
            <h1 className="display-4 text-white animated zoomIn">Team Members</h1>
            <Link to="/" className="h5 text-white text-decoration-none">Home</Link>
            <i className="far fa-circle text-white px-2"></i>
            <span className="h5 text-white">Team</span>
          </div>
        </div>
      </div>
      {/* Page Header End */}

      {/* Team Start */}
      <div className="container-fluid py-5 wow fadeInUp" data-wow-delay="0.1s">
        <div className="container py-5">
          <div className="section-title text-center position-relative pb-3 mb-5 mx-auto" style={{ maxWidth: "600px" }}>
            <h5 className="fw-bold text-primary text-uppercase">Team Members</h5>
            <h1 className="mb-0">Professional Staff Ready to Help Your Business</h1>
          </div>
          <div className="row g-5">
            <div className="col-lg-4 wow slideInUp" data-wow-delay="0.3s">
              <div className="team-item bg-light rounded overflow-hidden">
                <div className="team-img position-relative overflow-hidden">
                  <img className="img-fluid w-100" src="/img/home/employe image/profile_img.png" alt="" />
                  <div className="team-social">
                    <a className="btn btn-lg btn-primary btn-lg-square rounded" href="#"><i className="fab fa-twitter fw-normal"></i></a>
                    <a className="btn btn-lg btn-primary btn-lg-square rounded" href="#"><i className="fab fa-facebook-f fw-normal"></i></a>
                    <a className="btn btn-lg btn-primary btn-lg-square rounded" href="#"><i className="fab fa-instagram fw-normal"></i></a>
                    <a className="btn btn-lg btn-primary btn-lg-square rounded" href="#"><i className="fab fa-linkedin-in fw-normal"></i></a>
                  </div>
                </div>
                <div className="text-center py-4">
                  <h4 className="text-primary">Adi Sharma</h4>
                  <p className="text-uppercase m-0">Founder</p>
                </div>
              </div>
            </div>
            <div className="col-lg-4 wow slideInUp" data-wow-delay="0.6s">
              <div className="team-item bg-light rounded overflow-hidden">
                <div className="team-img position-relative overflow-hidden">
                  <img className="img-fluid w-100" src="/img/home/employe image/kapil1.png" alt="" />
                  <div className="team-social">
                    <a className="btn btn-lg btn-primary btn-lg-square rounded" href="#"><i className="fab fa-twitter fw-normal"></i></a>
                    <a className="btn btn-lg btn-primary btn-lg-square rounded" href="#"><i className="fab fa-facebook-f fw-normal"></i></a>
                    <a className="btn btn-lg btn-primary btn-lg-square rounded" href="#"><i className="fab fa-instagram fw-normal"></i></a>
                    <a className="btn btn-lg btn-primary btn-lg-square rounded" href="#"><i className="fab fa-linkedin-in fw-normal"></i></a>
                  </div>
                </div>
                <div className="text-center py-4">
                  <h4 className="text-primary">Kapil agrawal</h4>
                  <p className="text-uppercase m-0">Co-founder</p>
                </div>
              </div>
            </div>
            <div className="col-lg-4 wow slideInUp" data-wow-delay="0.9s">
              <div className="team-item bg-light rounded overflow-hidden">
                <div className="team-img position-relative overflow-hidden">
                  <img className="img-fluid w-100" src="/img/home/employe image/vinay3.png" alt="" />
                  <div className="team-social">
                    <a className="btn btn-lg btn-primary btn-lg-square rounded" href="#"><i className="fab fa-twitter fw-normal"></i></a>
                    <a className="btn btn-lg btn-primary btn-lg-square rounded" href="#"><i className="fab fa-facebook-f fw-normal"></i></a>
                    <a className="btn btn-lg btn-primary btn-lg-square rounded" href="#"><i className="fab fa-instagram fw-normal"></i></a>
                    <a className="btn btn-lg btn-primary btn-lg-square rounded" href="#"><i className="fab fa-linkedin-in fw-normal"></i></a>
                  </div>
                </div>
                <div className="text-center py-4">
                  <h4 className="text-primary">Vinay bhagat</h4>
                  <p className="text-uppercase m-0">Social Media Manager & AI Expert</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Team End */}
    </KlipnovaLayout>
  );
}
