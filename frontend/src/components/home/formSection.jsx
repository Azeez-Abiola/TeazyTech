import { useState } from "react";
import { useForm, ValidationError } from "@formspree/react";
import { Lightbulb, Headphones, Calendar } from "lucide-react";

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

  return (
    <>
      <section className="container-page section-y p-6 lg:p-20">
        <div className="grid items-start gap-12 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-4xl font-bold tracking-tight text-black md:text-5xl">
              Get in touch
            </h2>
            <p className="mt-4 text-lg text-blue-500">
              Have questions for us? Do not hesitate to contact us!
            </p>
            <ul className="mt-8 space-y-4 text-base">
              <li className="flex items-center text-brand gap-3">
                <span className="grid size-10 place-items-center rounded-[50%] bg-blue-200/30 text-brand">
                  <Lightbulb className="size-4" />
                </span>
                info@teazytech.org
              </li>
              <li className="flex items-center text-brand gap-3">
                <span className="grid size-10 place-items-center rounded-[50%] bg-blue-200/30 text-brand">
                  <Headphones className="size-4" />
                </span>
                +234 81 4430 6629
              </li>
              <li className="flex items-center text-brand gap-3">
                <span className="grid size-10 place-items-center rounded-[50%] bg-blue-200/30 text-brand">
                  <Calendar className="size-4" />
                </span>
                Lagos State, Nigeria
              </li>
            </ul>
          </div>
          <div delay={100}>
            <form className="rounded-3xl border border-border bg-background p-8 shadow-[0_30px_60px_-30px_rgb(15_23_42/0.18)]">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="">
                  <label className="mb-1.5 block text-sm font-medium text-brand">
                    Name
                  </label>
                  <input
                    type="text"
                    placeholder="Name"
                    className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-accent-blue focus:ring-4 focus:ring-accent-blue/15"
                  />
                </div>
                <div className="">
                  <label className="mb-1.5 block text-sm font-medium text-brand">
                    Email
                  </label>
                  <input
                    type="text"
                    placeholder="Email"
                    className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-accent-blue focus:ring-4 focus:ring-accent-blue/15"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-brand">
                    Phone number
                  </label>
                  <input
                    type="text"
                    placeholder="080 0000 000"
                    className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-accent-blue focus:ring-4 focus:ring-accent-blue/15"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-brand">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Messsage"
                    className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-accent-blue focus:ring-4 focus:ring-accent-blue/15"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-brand text-sm font-semibold text-white transition hover:opacity-90"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </section>
      {/* <burttotn
        title="Ready to Transform?"
        description="Join thousands of educators who are enhancing their teaching methods with Teazy Tech's resources and services."
        primary={{ to: "/services", label: "Get Started Today" }}
        secondary={{ to: "/contact", label: "Contact Us" }}
      /> */}
    </>
  );
}
