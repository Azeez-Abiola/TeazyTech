import { Link } from "react-router-dom";
import { Bot, Sparkles, ArrowUpRight } from "lucide-react";

const TeazyAIBlock = () => {
  return (
    <section className="relative overflow-hidden bg-[#0d1117] py-24">
      {/* Decorative glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-[#2F6FCC]/20 blur-[120px]"
      />

      <div className="container relative z-10">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* Left — copy */}
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#2F6FCC]/40 bg-[#2F6FCC]/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.25em] text-[#6ea8ff]">
              <Bot className="h-3.5 w-3.5" />
              Teazy AI
            </span>

            <h2 className="mt-6 font-display text-4xl font-medium uppercase leading-[1.05] text-white md:text-5xl lg:text-6xl">
              AI-Powered
              <br />
              Tools for
              <br />
              <span className="text-[#6ea8ff]">Educators</span>
            </h2>

            <p className="mt-6 max-w-md text-base leading-7 text-white/60">
              Teazy AI gives educators instant access to intelligent tools
              designed specifically for teaching — from lesson plan generators
              to assessment assistants, all powered by cutting-edge AI.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-6">
              <a
                href="https://ai.teazytech.online"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2.5 bg-[#2F6FCC] px-7 py-3.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-90"
              >
                Launch Teazy AI
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>

              <span className="text-xs text-white/40">
                Free for educators
              </span>
            </div>
          </div>

          {/* Right — feature pills */}
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                icon: "✦",
                title: "Lesson Plan Generator",
                desc: "Create detailed, curriculum-aligned lesson plans in seconds.",
              },
              {
                icon: "✦",
                title: "Assessment Builder",
                desc: "Auto-generate quizzes, rubrics, and marking schemes.",
              },
              {
                icon: "✦",
                title: "Content Simplifier",
                desc: "Break down complex topics for any learning level.",
              },
              {
                icon: "✦",
                title: "Classroom Q&A",
                desc: "Get instant answers to pedagogy and EdTech questions.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex flex-col gap-3 border border-white/10 bg-white/[0.04] p-6 transition-colors hover:border-[#2F6FCC]/40 hover:bg-white/[0.06]"
              >
                <span className="text-lg text-[#6ea8ff]">{item.icon}</span>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-white">
                  {item.title}
                </h3>
                <p className="text-xs leading-5 text-white/50">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TeazyAIBlock;
