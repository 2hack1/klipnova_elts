import { createFileRoute, Link } from "@tanstack/react-router";
import { KlipnovaLayout } from "@/components/KlipnovaLayout";
import { TestimonialSlider } from "@/components/TestimonialSlider";

export const Route = createFileRoute("/testimonial")({
  head: () => ({
    meta: [
      { title: "Testimonials — Klipnova Solutions" },
      {
        name: "description",
        content: "See what our clients say about our custom IT and digital marketing solutions.",
      },
    ],
  }),
  component: TestimonialPage,
});

function TestimonialPage() {
  return (
    <KlipnovaLayout>
      {/* Page Header Start */}
      <div className="container-fluid bg-primary py-5 bg-header" style={{ marginBottom: "90px" }}>
        <div className="row py-5">
          <div className="col-12 pt-lg-5 mt-lg-5 text-center">
            <h1 className="display-4 text-white animated zoomIn">Testimonial</h1>
            <Link to="/" className="h5 text-white text-decoration-none">Home</Link>
            <i className="far fa-circle text-white px-2"></i>
            <span className="h5 text-white">Testimonial</span>
          </div>
        </div>
      </div>
      {/* Page Header End */}

      <TestimonialSlider />
    </KlipnovaLayout>
  );
}
