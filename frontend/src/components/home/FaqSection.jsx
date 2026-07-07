import { useState } from "react";
import { FaPlus, FaTimes } from "react-icons/fa";

const faqs = [
  {
    question: "Am I paying for the resources or guide?",
    answer:
      "No. Most of our resources and guides are completely free for teachers. For premium resources, we always ensure they remain affordable for educators.",
  },
  {
    question: "Can I get help with an EdTech tool that's not mentioned here?",
    answer:
      "Absolutely. Join our community and we'll support you with any educational technology tool you're struggling with, even if it's not currently listed on our platform.",
  },
  {
    question: "Can my school become part of the physical training?",
    answer:
      "Yes. Simply send us an email with your school's name and location and we'll organize a customized on-site training session.",
  },
  {
    question: "Can you train my school privately?",
    answer:
      "Yes. We provide private workshops for schools looking to improve their staff's technology integration skills.",
  },
  {
    question: "I'm not tech-savvy. Can I still benefit?",
    answer:
      "Definitely. Our programs are designed for beginners and experienced educators alike. We teach step-by-step with practical examples.",
  },
  {
    question: "How long before I see results?",
    answer:
      "Most educators notice improved classroom engagement within a few weeks of consistently applying what they learn.",
  },
];

const FaqSection = () => {
  const [open, setOpen] = useState(0);

  return (
    <section className="bg-white py-24">
      <div className="container">
        <div className="mx-auto max-w-4xl">
          <h2 className="font-display text-4xl font-medium uppercase leading-[1.02] text-neutral-900 md:text-6xl">
            (Frequently
            <br />
            Asked Questions)
          </h2>

          <div className="mt-14">
            {faqs.map((faq, index) => {
              const isOpen = open === index;
              return (
                <div key={index} className="border-b border-neutral-200">
                  <button
                    onClick={() => setOpen(isOpen ? -1 : index)}
                    className="flex w-full flex-nowrap items-center justify-between gap-4 py-6 text-left sm:gap-6"
                  >
                    <h3 className="text-base font-bold text-neutral-900 sm:text-lg">
                      {faq.question}
                    </h3>
                    <span className="shrink-0 text-[#2F6FCC]">
                      {isOpen ? <FaTimes /> : <FaPlus />}
                    </span>
                  </button>

                  <div
                    className={`grid transition-all duration-300 ease-out ${
                      isOpen ? "grid-rows-[1fr] opacity-100 pb-6" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="max-w-2xl text-sm leading-7 text-neutral-500">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
