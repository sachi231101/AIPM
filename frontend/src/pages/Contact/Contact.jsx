import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

export default function Contact() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    await new Promise((r) => setTimeout(r, 1000));
    toast.success("Your message has been sent! We'll get back to you within 24 hours.");
    reset();
  };

  return (
    <>
      {/* Hero */}
      <section className="inner-page-hero text-white text-center py-5">
        <div className="container py-3">
          <h1 className="display-5 fw-bold">Contact Us</h1>
          <p className="lead text-white-75">We'd love to hear from you</p>
        </div>
      </section>

      <section className="py-5">
        <div className="container">
          <div className="row g-5">
            {/* Contact Info */}
            <div className="col-lg-4">
              <h4 className="fw-bold mb-4">Get in Touch</h4>
              <p className="text-muted mb-4">
                Have questions or need more information about our courses? We’re here to help! Our team will get back to you within 24 hours.
              </p>

              {[
                { 
                  icon: "bi-geo-alt-fill", 
                  color: "#0F4C81", 
                  title: "Branch 1 – Ramamurthy Nagar", 
                  lines: ["183, 2nd Floor, 1st Main Road", "Opp, Old Police Station, Next to Uttam Sagar Hotel", "Above Nilgiris, Ramamurthy Nagar, Bengaluru – 560016", "Phone: +91 99641 94324"] 
                },
                { 
                  icon: "bi-geo-alt-fill", 
                  color: "#1E88E5", 
                  title: "Branch 2 – Malleshwaram", 
                  lines: ["235, Sampige Rd", "Malleshwaram 15 & 16th cross", "Sampige Main Road, Bengaluru – 560003", "Phone: +91 96202 22392"] 
                },
                { 
                  icon: "bi-envelope-fill", 
                  color: "#2E7D32", 
                  title: "Email", 
                  lines: ["aadyainstitute2016@gmail.com"] 
                },
                { 
                  icon: "bi-clock-fill", 
                  color: "#F9A825", 
                  title: "Working Hours", 
                  lines: ["Monday – Saturday: 8:00 AM – 9:00 PM", "Sunday: 10:00 AM – 2:00 PM"] 
                },
              ].map((info, i) => (
                <div key={i} className="d-flex gap-3 mb-4">
                  <div
                    className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ width: 44, height: 44, background: `${info.color}20` }}
                  >
                    <i className={`bi ${info.icon}`} style={{ color: info.color }}></i>
                  </div>
                  <div>
                    <p className="fw-semibold mb-1 small">{info.title}</p>
                    {info.lines.map((line, j) => <p key={j} className="text-muted small mb-0">{line}</p>)}
                  </div>
                </div>
              ))}

              <div className="d-flex gap-3 mt-4">
                {["bi-linkedin", "bi-twitter-x", "bi-facebook", "bi-instagram"].map((icon, i) => (
                  <a key={i} href="#" className="btn btn-light btn-sm d-flex align-items-center justify-content-center" style={{ width: 36, height: 36 }}>
                    <i className={`bi ${icon}`}></i>
                  </a>
                ))}
              </div>
            </div>

            {/* Contact Form */}
            <div className="col-lg-8">
              <div className="card border-0 shadow-sm p-4 p-md-5">
                <h5 className="fw-bold mb-4">Send Us a Message</h5>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-medium small">Full Name <span className="text-danger">*</span></label>
                      <input
                        {...register("name", { required: "Name is required" })}
                        className={`form-control ${errors.name ? "is-invalid" : ""}`}
                        placeholder="Your full name"
                      />
                      {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-medium small">Email Address <span className="text-danger">*</span></label>
                      <input
                        type="email"
                        {...register("email", { required: "Email is required", pattern: { value: /^\S+@\S+$/i, message: "Invalid email" } })}
                        className={`form-control ${errors.email ? "is-invalid" : ""}`}
                        placeholder="your@email.com"
                      />
                      {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-medium small">Phone Number</label>
                      <input
                        type="tel"
                        {...register("phone")}
                        className="form-control"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-medium small">Query Type <span className="text-danger">*</span></label>
                      <select
                        {...register("queryType", { required: "Please select a query type" })}
                        className={`form-select ${errors.queryType ? "is-invalid" : ""}`}
                      >
                        <option value="">-- Select Type --</option>
                        <option>Student Placement Query</option>
                        <option>Company Partnership</option>
                        <option>Institute Registration</option>
                        <option>Technical Support</option>
                        <option>Other</option>
                      </select>
                      {errors.queryType && <div className="invalid-feedback">{errors.queryType.message}</div>}
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-medium small">Subject <span className="text-danger">*</span></label>
                      <input
                        {...register("subject", { required: "Subject is required" })}
                        className={`form-control ${errors.subject ? "is-invalid" : ""}`}
                        placeholder="Brief subject of your message"
                      />
                      {errors.subject && <div className="invalid-feedback">{errors.subject.message}</div>}
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-medium small">Message <span className="text-danger">*</span></label>
                      <textarea
                        {...register("message", { required: "Message is required", minLength: { value: 20, message: "Message must be at least 20 characters" } })}
                        className={`form-control ${errors.message ? "is-invalid" : ""}`}
                        rows={5}
                        placeholder="Write your message here..."
                      ></textarea>
                      {errors.message && <div className="invalid-feedback">{errors.message.message}</div>}
                    </div>
                    <div className="col-12">
                      <button type="submit" className="btn btn-primary px-5" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <><span className="spinner-border spinner-border-sm me-2"></span>Sending...</>
                        ) : (
                          <><i className="bi bi-send me-2"></i>Send Message</>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Placeholder */}
      <section className="pb-5">
        <div className="container">
          <div className="row g-4">
            <div className="col-md-6">
              <div
                className="rounded-4 overflow-hidden shadow-sm d-flex align-items-center justify-content-center"
                style={{ height: 250, background: "linear-gradient(135deg, #e3f0ff 0%, #f8f9fa 100%)", border: "1px solid #dee2e6" }}
              >
                <div className="text-center text-muted">
                  <i className="bi bi-map-fill fs-1 text-primary mb-3 d-block"></i>
                  <h6 className="fw-semibold">Google Maps</h6>
                  <small>Aadya Institute – Ramamurthy Nagar Branch</small>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div
                className="rounded-4 overflow-hidden shadow-sm d-flex align-items-center justify-content-center"
                style={{ height: 250, background: "linear-gradient(135deg, #fff8e1 0%, #f8f9fa 100%)", border: "1px solid #dee2e6" }}
              >
                <div className="text-center text-muted">
                  <i className="bi bi-map-fill fs-1 text-warning mb-3 d-block"></i>
                  <h6 className="fw-semibold">Google Maps</h6>
                  <small>Aadya Institute – Malleshwaram Branch</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
