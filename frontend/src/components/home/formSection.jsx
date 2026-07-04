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
      {/* <section className="flex flex-col md:flex-row gap-y-5 md:gap-y-0 gap-x-7 items-center justify-center py-20 bg-slate-200">
                <div className="w-[80%] md:w-[32%] bg-white shadow-md rounded-sm p-4">
                    <h1 className="text-[1.4rem] font-medium">Get in touch</h1>
                    <p className="text-black/80 my-1.5">
                        Have questions for us? Do not hesitate to contact us!
                    </p>
                    <ul className="mt-6 flex flex-col justify-center gap-y-2">
                        <li className="flex gap-x-1.5">
                            <svg
                                className="w-5 stroke-indigo-500 fill-indigo-500"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 -960 960 960"
                            >
                                <path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33 23.5 56.5T800-160H160Zm320-280L160-640v400h640v-400L480-440Zm0-80 320-200H160l320 200ZM160-640v-80 480-400Z" />
                            </svg>
                            Teazytech1@gmail.com
                        </li>
                        <li className="flex gap-x-1.5">
                            <svg
                                className="w-4 stroke-indigo-500 fill-indigo-500"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                            >
                                <path d="M23 16.92c0.016-0.714-0.236-1.404-0.673-1.943-0.46-0.566-1.129-0.967-1.925-1.080-0.8-0.098-1.695-0.314-2.586-0.646-0.433-0.159-0.893-0.218-1.344-0.174-0.663 0.064-1.307 0.349-1.819 0.855l-0.72 0.72c-1.77-1.117-3.36-2.667-4.583-4.589l0.726-0.726c0.322-0.33 0.563-0.726 0.707-1.156 0.212-0.632 0.214-1.336-0.039-2.011-0.289-0.753-0.518-1.644-0.644-2.595-0.104-0.714-0.456-1.345-0.963-1.804-0.539-0.486-1.256-0.779-2.027-0.771h-2.996c-0.088 0-0.182 0.004-0.273 0.012-0.824 0.075-1.542 0.478-2.033 1.066s-0.758 1.367-0.683 2.199c0.3 3.076 1.365 6.243 3.216 9.102 1.502 2.413 3.648 4.623 6.298 6.306 2.568 1.697 5.684 2.862 9.086 3.231 0.092 0.009 0.191 0.013 0.288 0.013 0.828-0.003 1.578-0.343 2.118-0.887s0.873-1.297 0.87-2.121zM21 16.92v3c0.001 0.28-0.109 0.53-0.29 0.712s-0.429 0.295-0.706 0.296c-3.149-0.336-5.961-1.391-8.263-2.912-2.428-1.543-4.359-3.537-5.702-5.694-1.697-2.62-2.655-5.481-2.924-8.238-0.024-0.268 0.064-0.526 0.229-0.724s0.403-0.33 0.678-0.355l3.088-0.005c0.271-0.003 0.507 0.094 0.687 0.256 0.17 0.154 0.288 0.366 0.323 0.608 0.142 1.072 0.408 2.117 0.757 3.025 0.081 0.216 0.080 0.447 0.010 0.658-0.049 0.145-0.131 0.281-0.242 0.395l-1.262 1.261c-0.324 0.324-0.379 0.814-0.162 1.201 1.584 2.785 3.839 4.957 6.381 6.378 0.397 0.222 0.882 0.144 1.195-0.166l1.27-1.27c0.166-0.164 0.377-0.257 0.598-0.279 0.152-0.015 0.31 0.005 0.459 0.060 1.022 0.381 2.070 0.636 3.034 0.754 0.241 0.034 0.462 0.166 0.615 0.355 0.147 0.181 0.231 0.412 0.226 0.682z"></path>
                            </svg>
                            +234 81 4430 6629
                        </li>
                        <li className="flex gap-x-1.5">
                            <svg
                                className="fill-indigo-500 stroke-indigo-500 w-5"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 -960 960 960"
                            >
                                <path d="M480-480q33 0 56.5-23.5T560-560q0-33-23.5-56.5T480-640q-33 0-56.5 23.5T400-560q0 33 23.5 56.5T480-480Zm0 294q122-112 181-203.5T720-552q0-109-69.5-178.5T480-800q-101 0-170.5 69.5T240-552q0 71 59 162.5T480-186Zm0 106Q319-217 239.5-334.5T160-552q0-150 96.5-239T480-880q127 0 223.5 89T800-552q0 100-79.5 217.5T480-80Zm0-480Z" />
                            </svg>
                            Lagos State, Nigeria
                        </li>
                    </ul>
                </div>

                <div className="w-[85%] md:w-[48%] lg:w-[35%] bg-white shadow-md rounded-sm p-6">
                    <form onSubmit={handleSubmit} className="**:mb-6">
                        <div>
                            <label id="name" className="flex flex-col">
                                <span className="">Name</span>
                                <input
                                    name="name"
                                    value={fields.name}
                                    onChange={(e) => handleFormChange1(e)}
                                    aria-labelledby="name"
                                    type="text"
                                    className="border border-t-[3px] border-t-slate-300 rounded-md p-1.5 focus:outline-indigo-500"
                                />
                            </label>
                            {showError.name && (
                                <span className="text-red-500 text-sm">
                                    Please enter a value
                                </span>
                            )}
                        </div>

                        <div>
                            <label id="email" className="flex flex-col">
                                <span className="">Email</span>
                                <input
                                    name="email"
                                    value={fields.email}
                                    onChange={(e) => handleFormChange2(e)}
                                    aria-labelledby="email"
                                    type="email"
                                    className="border border-t-[3px] border-t-slate-300 rounded-md p-1.5 focus:outline-indigo-500"
                                />
                                <ValidationError 
                                    prefix="Email" 
                                    field="email"
                                    errors={state.errors}
                                />
                            </label>
                            {showError.email && (
                                <span className="text-red-500 text-sm">
                                    Please enter a valid email
                                </span>
                            )}
                        </div>

                        <div>
                            <label id="phone" className="flex flex-col">
                                <span className="">Phone Number</span>
                                <input
                                    name="phone"
                                    value={fields.phone}
                                    onChange={(e) => handleFormChange3(e)}
                                    aria-labelledby="phone"
                                    type="tel"
                                    className="border border-t-[3px] border-t-slate-300 rounded-md p-1.5 focus:outline-indigo-500"
                                />
                            </label>
                            {showError.phone && (
                                <span className="text-red-500 text-sm">
                                    Please enter a valid phone number
                                </span>
                            )}
                        </div>

                        <div>
                            <label id="message" className="flex flex-col">
                                <span className="">Message</span>
                                <textarea
                                    name="message"
                                    value={fields.message}
                                    onChange={(e) => handleFormChange4(e)}
                                    aria-labelledby="message"
                                    className="h-28 border border-t-[3px] border-t-slate-300 rounded-md p-1.5 focus:outline-indigo-500"
                                />
                                <ValidationError 
                                    prefix="Message" 
                                    field="message"
                                    errors={state.errors}
                                />
                            </label>
                            {showError.message && (
                                <span className="text-red-500 text-sm">
                                    Please type in something
                                </span>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="border w-full my-4 bg-indigo-500 hover:bg-indigo-600
                         active:bg-indigo-800 text-white py-1 disabled:bg-indigo-300 cursor-pointer
                         disabled:cursor-default"
                            disabled={
                                state.submitting ||
                                fields.name === "" ||
                                fields.email === "" ||
                                fields.phone === "" ||
                                fields.message === "" ||
                                showError.name === true ||
                                showError.email === true ||
                                showError.phone === true ||
                                showError.message === true
                            }
                        >
                            {state.submitting ? 'Sending...' : 'Send'}
                        </button>
                        <ValidationError errors={state.errors} />
                    </form>
                </div>
            </section> */}
      <section className="container-page section-y p-20">
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
                Teazytech1@gmail.com
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
