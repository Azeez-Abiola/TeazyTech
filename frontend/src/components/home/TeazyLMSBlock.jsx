import { ArrowUpRight, BookOpen, Award, Users, PlayCircle } from "lucide-react";

const TeazyLMSBlock = () => {
  const features = [
    {
      Icon: BookOpen,
      title: "Structured Courses",
      desc: "Follow a clear learning path from beginner to advanced EdTech mastery.",
    },
    {
      Icon: PlayCircle,
      title: "Video Lessons",
      desc: "Watch practical, hands-on tutorials recorded by expert educators.",
    },
    {
      Icon: Award,
      title: "Certificates",
      desc: "Earn certificates you can share with your school and on LinkedIn.",
    },
    {
      Icon: Users,
      title: "Community",
      desc: "Connect with thousands of educators in our growing learning community.",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-[#f4f7fc] py-24">
      {/* Decorative shapes */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-0 h-[500px] w-[500px] translate-x-1/3 -translate-y-1/3 rounded-full bg-[#233463]/8 blur-[80px]"
      />

      <div className="container relative z-10">
        {/* Section label */}
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-[0.35em] text-neutral-900">
            Learning Management System
          </span>
          <div className="mx-auto mt-3 h-[2px] w-24 bg-gradient-to-r from-[#233463] to-transparent" />
        </div>

        <div className="mt-16 grid items-center gap-16 lg:grid-cols-2">
          {/* Left — feature cards */}
          <div className="grid gap-5 sm:grid-cols-2">
            {features.map(({ Icon, title, desc }) => (
              <div
                key={title}
                className="flex flex-col gap-4 border border-neutral-200 bg-white p-7 shadow-sm transition-shadow hover:shadow-md"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#233463]/10">
                  <Icon className="h-5 w-5 text-[#233463]" strokeWidth={1.5} />
                </span>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-900">
                  {title}
                </h3>
                <p className="text-xs leading-5 text-neutral-500">{desc}</p>
              </div>
            ))}
          </div>

          {/* Right — copy */}
          <div>
            <h2 className="font-display text-4xl font-medium uppercase leading-[1.05] text-neutral-900 md:text-5xl lg:text-6xl">
              Learn With
              <br />
              Teazy Tech
              <br />
              <span className="text-[#2F6FCC]">Online</span>
            </h2>

            <p className="mt-6 max-w-md text-base leading-7 text-neutral-500">
              The Teazy Tech Learning Management System gives you on-demand
              access to our full library of professional development courses —
              learn at your own pace, on any device, from anywhere in the world.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-6">
              <a
                href="https://www.teazytech.online"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2.5 bg-[#233463] px-7 py-3.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-90"
              >
                Start Learning
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>

              <a
                href="https://www.teazytech.online"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 border-b border-neutral-400 pb-0.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-700 transition-colors hover:border-[#2F6FCC] hover:text-[#2F6FCC]"
              >
                Browse Courses
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TeazyLMSBlock;
