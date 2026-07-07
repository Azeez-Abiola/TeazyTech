import { useState } from "react";
import { useForm, ValidationError } from "@formspree/react";
import { MapPin, Phone, Mail, Clock, ArrowRight } from "lucide-react";

export default function FormSection({ setShowSuccess, setShowFailure }) {
  const [state, handleFormspreeSubmit] = useForm("xanjnnwz");
  const [fields, setFields] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [showError, setShowError] = useState({
    name: false,
    email: false,
    phone: false,
    message: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    if (!fields.name || !fields.email || !fields.phone || !fields.message) {
      setShowError({
        name: !fields.name,
        email: !fields.email,
        phone: !fields.phone,
        message: !fields.message,
      });
      return;
    }

    // Validate email format
    if (!fields.email.includes("@") || !fields.email.includes(".")) {
      setShowError((prev) => ({ ...prev, email: true }));
      return;
    }

    // Validate phone is numeric
    if (isNaN(fields.phone)) {
      setShowError((prev) => ({ ...prev, phone: true }));
      return;
    }

    // Submit to Formspree
    await handleFormspreeSubmit(e);

    // Handle Formspree response
    if (state.succeeded) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 4000);
      // Reset form
      setFields({
        name: "",
        email: "",
        phone: "",
        message: "",
      });
    } else if (state.errors) {
      setShowFailure(true);
      setTimeout(() => setShowFailure(false), 4000);
    }
  };

  const handleFormChange1 = (e) => {
    setFields((prev) => ({
      ...prev,
      name: e.target.value,
    }));
    setShowError((prev) => ({
      ...prev,
      name: e.target.value === "",
    }));
  };

  const handleFormChange2 = (e) => {
    setFields((prev) => ({
      ...prev,
      email: e.target.value,
    }));
    setShowError((prev) => ({
      ...prev,
      email:
        e.target.value === "" ||
        !e.target.value.includes("@") ||
        !e.target.value.includes("."),
    }));
  };

  const handleFormChange3 = (e) => {
    setFields((prev) => ({
      ...prev,
      phone: e.target.value,
    }));
    setShowError((prev) => ({
      ...prev,
      phone: e.target.value === "" || isNaN(e.target.value),
    }));
  };

  const handleFormChange4 = (e) => {
    setFields((prev) => ({
      ...prev,
      message: e.target.value,
    }));
    setShowError((prev) => ({
      ...prev,
      message: e.target.value === "",
    }));
  };

  const inputClass = (hasError) =>
    `w-full border bg-white px-4 py-3.5 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-[#2F6FCC] focus:ring-2 focus:ring-[#2F6FCC]/15 ${
      hasError ? "border-red-400" : "border-neutral-200"
    }`;

  const labelClass =
    "mb-2 block text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-800";

  const contactRows = [
    {
      icon: MapPin,
      label: "Address",
      lines: ["Lagos State, Nigeria"],
    },
    {
      icon: Phone,
      label: "Phone",
      lines: ["+234 81 4430 6629"],
    },
    {
      icon: Mail,
      label: "Email",
      lines: ["hello@teazytech.org"],
    },
  ];

  return (
    <section className="bg-[#fafafa] py-24">
      <div className="container">
        {/* Heading */}
        <div className="text-center">
          <h2 className="font-display text-5xl font-medium uppercase leading-none text-neutral-900 md:text-7xl">
            Get In Touch
          </h2>
          <p className="mx-auto mt-6 max-w-md text-sm leading-7 text-neutral-500">
            We'd love to hear from you. Please fill out the form below or reach
            out via our contact details.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl items-start gap-10 lg:grid-cols-[1fr_1.3fr]">
          {/* Contact information card */}
          <div className="rounded-2xl bg-white p-8 shadow-[0_20px_50px_-30px_rgb(15_23_42/0.25)]">
            <h3 className="font-display text-xl font-medium uppercase text-neutral-900">
              Contact Information
            </h3>

            <ul className="mt-8 space-y-7">
              {contactRows.map((row) => (
                <li key={row.label} className="flex gap-4">
                  <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-blue-50">
                    <row.icon className="h-4 w-4 text-[#2F6FCC]" />
                  </span>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                      {row.label}
                    </p>
                    {row.lines.map((line) => (
                      <p key={line} className="mt-1 text-sm font-medium text-neutral-800">
                        {line}
                      </p>
                    ))}
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-8 border-t border-neutral-100 pt-7">
              <div className="flex gap-4">
                <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-blue-50">
                  <Clock className="h-4 w-4 text-[#2F6FCC]" />
                </span>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                    Business Hours
                  </p>
                  <p className="mt-1 text-sm font-medium text-neutral-800">
                    Mon - Fri: 9:00 AM - 5:00 PM
                  </p>
                  <p className="text-sm font-medium text-neutral-800">
                    Sat - Sun: Closed
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-5">
              <div>
                <label className={labelClass} htmlFor="contact-name">
                  Full Name
                </label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  value={fields.name}
                  onChange={handleFormChange1}
                  className={inputClass(showError.name)}
                />
                {showError.name && (
                  <p className="mt-1.5 text-xs text-red-500">
                    Please enter your name.
                  </p>
                )}
              </div>

              <div>
                <label className={labelClass} htmlFor="contact-email">
                  Email Address
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  value={fields.email}
                  onChange={handleFormChange2}
                  className={inputClass(showError.email)}
                />
                <ValidationError prefix="Email" field="email" errors={state.errors} />
                {showError.email && (
                  <p className="mt-1.5 text-xs text-red-500">
                    Please enter a valid email address.
                  </p>
                )}
              </div>

              <div>
                <label className={labelClass} htmlFor="contact-phone">
                  Phone Number
                </label>
                <input
                  id="contact-phone"
                  name="phone"
                  type="tel"
                  placeholder="080 0000 0000"
                  value={fields.phone}
                  onChange={handleFormChange3}
                  className={inputClass(showError.phone)}
                />
                {showError.phone && (
                  <p className="mt-1.5 text-xs text-red-500">
                    Please enter a valid phone number.
                  </p>
                )}
              </div>

              <div>
                <label className={labelClass} htmlFor="contact-message">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={5}
                  placeholder="How can we help you?"
                  value={fields.message}
                  onChange={handleFormChange4}
                  className={inputClass(showError.message)}
                />
                {showError.message && (
                  <p className="mt-1.5 text-xs text-red-500">
                    Please enter a message.
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={state.submitting}
                className="flex w-full items-center justify-center gap-3 bg-[#233463] py-4 text-[11px] font-bold uppercase tracking-[0.25em] text-white transition-colors hover:bg-[#2F6FCC] disabled:opacity-60"
              >
                {state.submitting ? "Sending..." : "Send Message"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
