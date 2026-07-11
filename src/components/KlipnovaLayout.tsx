import { Link, useLocation } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { StylesheetLoader } from "./StylesheetLoader";

interface KlipnovaLayoutProps {
  children: ReactNode;
}

const KLIPNOVA_STYLES = [
  "https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Rubik:wght@400;500;600;700&display=swap",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.10.0/css/all.min.css",
  "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.4.1/font/bootstrap-icons.css",
  "/lib/animate/animate.min.css",
  "/css/bootstrap.min.css",
  "/css/style.css"
];

export function KlipnovaLayout({ children }: KlipnovaLayoutProps) {
  const loc = useLocation();
  const [isSticky, setIsSticky] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 45);
      setShowBackToTop(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Set up WOW slide-in/fade-in animations & CounterUp count-up animations
  useEffect(() => {
    // 1. WOW Scroll Animations
    const wowObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const delay = el.getAttribute("data-wow-delay");
            const duration = el.getAttribute("data-wow-duration");
            if (delay) el.style.animationDelay = delay;
            if (duration) el.style.animationDuration = duration;

            el.classList.add("animated");
            el.style.visibility = "visible";
            wowObserver.unobserve(el);
          }
        });
      },
      { threshold: 0.1 }
    );

    const wowElements = document.querySelectorAll(".wow");
    wowElements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      htmlEl.style.visibility = "hidden";
      wowObserver.observe(htmlEl);
    });

    // 2. CounterUp Animations
    const animateCounter = (el: HTMLElement) => {
      const targetStr = el.getAttribute("data-target") || "0";
      const target = parseInt(targetStr, 10);
      if (isNaN(target) || target <= 0) return;

      const duration = 1500; // 1.5 seconds
      const startTime = performance.now();

      const update = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = progress * (2 - progress); // Ease out quad
        const current = Math.floor(ease * target);

        el.innerText = current.toString();

        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          el.innerText = target.toString() + "+";
        }
      };
      requestAnimationFrame(update);
    };

    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            animateCounter(el);
            counterObserver.unobserve(el);
          }
        });
      },
      { threshold: 0.1 }
    );

    const counters = document.querySelectorAll('[data-toggle="counter-up"]');
    counters.forEach((el) => {
      const htmlEl = el as HTMLElement;
      const origText = htmlEl.textContent || "0";
      const cleanNum = origText.replace(/[^0-9]/g, "");
      htmlEl.setAttribute("data-target", cleanNum);
      htmlEl.textContent = "0";
      counterObserver.observe(htmlEl);
    });

    return () => {
      wowElements.forEach((el) => wowObserver.unobserve(el));
      counters.forEach((el) => counterObserver.unobserve(el));
    };
  }, [loc.pathname]);

  const scrollToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Helper to determine if a route is active
  const isActive = (path: string) => {
    if (path === "/" && loc.pathname === "/") return "active";
    if (path !== "/" && loc.pathname.startsWith(path)) return "active";
    return "";
  };

  return (
    <div className="klipnova-theme" style={{ fontFamily: "'Nunito', sans-serif" }}>
      {/* Stylesheets and Fonts Specific to Klipnova */}
      <StylesheetLoader hrefs={KLIPNOVA_STYLES} />

      {/* Spinner - simple React spinner */}
      <div id="spinner" className="bg-white position-fixed translate-middle w-100 vh-100 top-50 start-50 d-flex align-items-center justify-content-center" style={{ zIndex: 99999, opacity: 0, pointerEvents: "none", transition: "opacity 0.3s ease" }}>
        <div className="spinner"></div>
      </div>

      {/* Topbar Start */}
      <div className="container-fluid bg-dark px-5 d-none d-lg-block">
        <div className="row gx-0">
          <div className="col-lg-8 text-center text-lg-start mb-2 mb-lg-0">
            <div className="d-inline-flex align-items-center" style={{ height: "45px" }}>
              <small className="me-3 text-light"><i className="fa fa-map-marker-alt me-2"></i>Morar, Gwalior (M.P.), India</small>
              <small className="me-3 text-light"><i className="fa fa-phone-alt me-2"></i>+91 314 759 45</small>
              <small className="text-light"><i className="fa fa-envelope-open me-2"></i>klipnovasolution@gmail.com</small>
            </div>
          </div>
          <div className="col-lg-4 text-center text-lg-end">
            <div className="d-inline-flex align-items-center" style={{ height: "45px" }}>
              <a className="btn btn-sm btn-outline-light btn-sm-square rounded-circle me-2" href="#"><i className="fab fa-twitter fw-normal"></i></a>
              <a className="btn btn-sm btn-outline-light btn-sm-square rounded-circle me-2" href="#"><i className="fab fa-facebook-f fw-normal"></i></a>
              <a className="btn btn-sm btn-outline-light btn-sm-square rounded-circle me-2" href="#"><i className="fab fa-linkedin-in fw-normal"></i></a>
              <a className="btn btn-sm btn-outline-light btn-sm-square rounded-circle me-2" href="#"><i className="fab fa-instagram fw-normal"></i></a>
              <a className="btn btn-sm btn-outline-light btn-sm-square rounded-circle" href="#"><i className="fab fa-youtube fw-normal"></i></a>
            </div>
          </div>
        </div>
      </div>
      {/* Topbar End */}

      {/* Navbar Start */}
      <div className="container-fluid position-relative p-0">
        <nav className={`navbar navbar-expand-lg navbar-dark px-5 py-3 py-lg-0 ${isSticky ? "sticky-top shadow-sm" : ""}`} style={isSticky ? { top: 0, position: "fixed", width: "100%", zIndex: 999, background: "#ffffff" } : {}}>
          <Link to="/" className="navbar-brand p-0">
            <h1 className="m-0"><i className="me-2"></i>Klip<span style={{ color: "rgb(255, 179, 0)" }}>Nova</span> </h1>
            <div className="check" style={{ fontSize: "14px", color: "#bbb", textAlign: "center", textTransform: "uppercase", letterSpacing: "2px", marginTop: "-5px" }}>
              — Solutions —
            </div>
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-controls="navbarCollapse"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation"
          >
            <span className="fa fa-bars"></span>
          </button>

          <div className={`collapse navbar-collapse ${mobileMenuOpen ? "show" : ""}`} id="navbarCollapse">
            <div className="navbar-nav ms-auto py-0">
              <Link to="/" className={`nav-item nav-link ${isActive("/")}`}>Home</Link>
              <Link to="/about" className={`nav-item nav-link ${isActive("/about")}`}>About</Link>
              <Link to="/service" className={`nav-item nav-link ${isActive("/service")}`}>Services</Link>

              {/* Dropdown with hover styling */}
              <div className="nav-item dropdown dropdown-hover">
                <a href="#" className="nav-link dropdown-toggle" data-bs-toggle="dropdown">Pages</a>
                <div className="dropdown-menu m-0">
                  <Link to="/feature" className="dropdown-item">Our features</Link>
                  <Link to="/team" className="dropdown-item">Team Members</Link>
                  <Link to="/testimonial" className="dropdown-item">Testimonial</Link>
                  <Link to="/quote" className="dropdown-item">Free Quote</Link>
                </div>
              </div>

              <Link to="/contact" className={`nav-item nav-link ${isActive("/contact")}`}>Contact</Link>

              {/* Added ELTS option */}
              <Link
                to="/elts"
                className="nav-item nav-link px-3 py-2 ms-lg-3 rounded bg-warning text-dark font-weight-bold"
                style={{ fontWeight: "700", alignSelf: "center", display: "inline-block" }}
              >
                <i className="fa fa-map-marker-alt me-1"></i> ELTS App
              </Link>
            </div>
          </div>
        </nav>
      </div>
      {/* Navbar End */}

      {/* Main Content */}
      <div className="content-wrapper">
        {children}
      </div>

      {/* Footer Start */}
      <div className="container-fluid bg-dark text-light mt-5 wow fadeInUp" data-wow-delay="0.1s" style={{ background: "#091E3E" }}>
        <div className="container">
          <div className="row gx-5">
            <div className="col-lg-4 col-md-6 footer-about" style={{ marginTop: "-20px", background: "#06A3DA", padding: "30px", borderRadius: "4px" }}>
              <div className="d-flex flex-column align-items-center justify-content-center text-center h-100">
                <Link to="/" className="text-white text-decoration-none">
                  <h1 className="m-0 text-white"><span style={{ color: "rgb(9, 30, 62)" }}>Klip</span><span style={{ color: "rgb(255, 179, 0)" }}>Nova</span></h1>
                </Link>
                <p className="mt-3 text-white">We deliver cutting-edge digital solutions tailored for your business success, including IT consulting, custom software, and employee tracking platforms.</p>
              </div>
            </div>
            <div className="col-lg-8 col-md-6">
              <div className="row gx-5">
                <div className="col-lg-4 col-md-12 pt-5 mb-5">
                  <div className="section-title section-title-sm position-relative pb-3 mb-4">
                    <h3 className="text-light mb-0">Get In Touch</h3>
                  </div>
                  <div className="d-flex mb-2">
                    <i className="bi bi-geo-alt text-primary me-2"></i>
                    <p className="mb-0">Morar, Gwalior (M.P.), India</p>
                  </div>
                  <div className="d-flex mb-2">
                    <i className="bi bi-envelope-open text-primary me-2"></i>
                    <p className="mb-0">klipnovasolution@gmail.com</p>
                  </div>
                  <div className="d-flex mb-2">
                    <i className="bi bi-telephone text-primary me-2"></i>
                    <p className="mb-0">+91 314 759 45</p>
                  </div>
                  <div className="d-flex mt-4">
                    <a className="btn btn-primary btn-square me-2" href="#"><i className="fab fa-twitter fw-normal"></i></a>
                    <a className="btn btn-primary btn-square me-2" href="#"><i className="fab fa-facebook-f fw-normal"></i></a>
                    <a className="btn btn-primary btn-square me-2" href="#"><i className="fab fa-linkedin-in fw-normal"></i></a>
                    <a className="btn btn-primary btn-square" href="#"><i className="fab fa-instagram fw-normal"></i></a>
                  </div>
                </div>
                <div className="col-lg-4 col-md-12 pt-0 pt-lg-5 mb-5">
                  <div className="section-title section-title-sm position-relative pb-3 mb-4">
                    <h3 className="text-light mb-0">Quick Links</h3>
                  </div>
                  <div className="link-animated d-flex flex-column justify-content-start">
                    <Link className="text-light mb-2 text-decoration-none" to="/"><i className="bi bi-arrow-right text-primary me-2"></i>Home</Link>
                    <Link className="text-light mb-2 text-decoration-none" to="/about"><i className="bi bi-arrow-right text-primary me-2"></i>About Us</Link>
                    <Link className="text-light mb-2 text-decoration-none" to="/service"><i className="bi bi-arrow-right text-primary me-2"></i>Our Services</Link>
                    <Link className="text-light mb-2 text-decoration-none" to="/team"><i className="bi bi-arrow-right text-primary me-2"></i>Meet The Team</Link>
                    <Link className="text-light text-decoration-none" to="/contact"><i className="bi bi-arrow-right text-primary me-2"></i>Contact Us</Link>
                  </div>
                </div>
                <div className="col-lg-4 col-md-12 pt-0 pt-lg-5 mb-5">
                  <div className="section-title section-title-sm position-relative pb-3 mb-4">
                    <h3 className="text-light mb-0">Products & Apps</h3>
                  </div>
                  <div className="link-animated d-flex flex-column justify-content-start">
                    <Link className="text-light mb-2 text-decoration-none" to="/elts"><i className="bi bi-arrow-right text-primary me-2"></i>ELTS Tracking App</Link>
                    <Link className="text-light mb-2 text-decoration-none" to="/feature"><i className="bi bi-arrow-right text-primary me-2"></i>Features</Link>
                    <Link className="text-light mb-2 text-decoration-none" to="/testimonial"><i className="bi bi-arrow-right text-primary me-2"></i>Testimonials</Link>
                    <Link className="text-light text-decoration-none" to="/quote"><i className="bi bi-arrow-right text-primary me-2"></i>Request Quote</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="container-fluid text-white" style={{ background: "#061429" }}>
        <div className="container text-center">
          <div className="row justify-content-end">
            <div className="col-lg-8 col-md-6">
              <div className="d-flex align-items-center justify-content-center" style={{ height: "75px" }}>
                <p className="mb-0">&copy; <a className="text-white border-bottom" href="#">Klipnova solutions</a>. All Rights Reserved. Designed by <a className="text-white border-bottom" href="https://htmlcodex.com">HTML Codex</a></p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Footer End */}

      {/* Back to Top */}
      <a
        href="#"
        onClick={scrollToTop}
        className={`btn btn-lg btn-primary btn-lg-square rounded back-to-top ${showBackToTop ? "d-inline-block" : "d-none"}`}
        style={{ position: "fixed", bottom: "45px", right: "45px", zIndex: 99 }}
      >
        <i className="bi bi-arrow-up"></i>
      </a>

      {/* Custom dropdown hover CSS */}
      <style>{`
        @media (min-width: 992px) {
          .dropdown-hover:hover .dropdown-menu {
            display: block;
            margin-top: 0;
            opacity: 1;
            visibility: visible;
            transition: all 0.3s ease;
          }
        }
      `}</style>
    </div>
  );
}
