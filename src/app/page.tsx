import Link from "next/link";
import Image from "next/image";
import { brand } from "@/lib/brand";

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-4 w-4"
      aria-hidden="true"
    >
      {diagonal ? (
        <path
          d="M7 17 17 7M7 7h10v10"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M4 12h15m-6-6 6 6-6 6"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

function Check() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5 shrink-0">
      <path
        d="m4 10 4 4 8-8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}


const features = [
  {
    number: "01",
    title: "Your business, online",
    description: "Create a digital storefront, organise your products and give customers a simple way to discover what you sell.",
    tag: "STOREFRONT",
    icon: "↗",
  },
  {
    number: "02",
    title: "Every sale, recorded",
    description: "Keep track of sales, expenses and business transactions. Build a more organised picture of how your business operates.",
    tag: "RECORD KEEPING",
    icon: "＋",
  },
  {
    number: "03",
    title: "Understand your numbers",
    description: "Turn recorded business activity into useful insights that help you understand performance and make informed decisions.",
    tag: "BUSINESS INSIGHTS",
    icon: "⌁",
  },
  {
    number: "04",
    title: "Your Financial Passport",
    description: "Bring relevant business information together into a financial profile you can review and choose to share.",
    tag: "FINANCIAL IDENTITY",
    icon: "◇",
  },
];

const steps = [
  {
    number: "01",
    title: "Set up your business",
    description: "Create your account and provide the basic information needed to establish your business workspace.",
  },
  {
    number: "02",
    title: "Start recording activity",
    description: "Add products, manage your storefront and record your business transactions.",
  },
  {
    number: "03",
    title: "Build your financial picture",
    description: "Use your organised records to understand business performance and develop your Financial Passport.",
  },
  {
    number: "04",
    title: "Explore your next opportunity",
    description: "Review relevant financing opportunities and decide when and with whom to share your financial information.",
  },
];

const faqs = [
  {
    question: "What is Kredix?",
    answer: "Kredix is a business digitisation and financial-readiness platform designed to help Nigerian SMEs organise business activity, understand performance and build a clearer financial profile.",
  },
  {
    question: "Is Kredix a lender?",
    answer: "No. Kredix is not a lender and does not guarantee financing or credit approval. It helps businesses organise information and explore relevant financing opportunities.",
  },
  {
    question: "Do I need a registered business to get started?",
    answer: "You can begin by setting up your business workspace and providing the information requested during onboarding. Any specific requirements for a service will be shown when you use that service.",
  },
  {
    question: "What is a Financial Passport?",
    answer: "A Financial Passport brings relevant business information and financial activity into one organised profile. It is designed to help a business understand and present its financial picture.",
  },
  {
    question: "Will my business information be shared automatically?",
    answer: "Your financial information should only be shared in accordance with the platform's applicable permissions, consent and privacy processes. Review the relevant terms before authorising access.",
  },
];

export default function HomePage() {
  return (
    <main className="overflow-hidden bg-white text-[#24143D]">
      {/* Navigation */}
      <header className="absolute inset-x-0 top-0 z-30 border-b border-white/10 bg-[#1C0B35]/65 shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-2xl">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-12">
          <Link href="/" aria-label="Kredix home" className="flex items-center">
            <Image
              src={brand.logo.wordmark}
              alt="Kredix"
              width={142}
              height={42}
              priority
              className="h-9 w-auto"
            />
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#platform"
              className="text-sm font-medium text-white/75 transition-colors hover:text-[#27E3A6]"
            >
              Platform
            </a>
            <a
              href="#how-it-works"
              className="text-sm font-medium text-white/75 transition-colors hover:text-[#27E3A6]"
            >
              How it works
            </a>
            <a
              href="#why-kredix"
              className="text-sm font-medium text-white/75 transition-colors hover:text-[#27E3A6]"
            >
              Why Kredix
            </a>
            <a
              href="#faqs"
              className="text-sm font-medium text-white/75 transition-colors hover:text-[#27E3A6]"
            >
              FAQs
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden px-3 py-2 text-sm font-semibold text-white/90 transition hover:text-[#27E3A6] sm:inline-flex"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-full bg-[#5725B5] px-5 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-[#431A91] sm:text-sm"
            >
              Get started <Arrow />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative isolate min-h-[680px] overflow-hidden bg-[#1C0B35] px-5 py-20 text-white sm:py-24 lg:flex lg:items-center">
        <style>{`
          @keyframes kredix-float {
            0%, 100% { transform: translateY(0) rotateX(4deg) rotateY(-8deg); }
            50% { transform: translateY(-13px) rotateX(2deg) rotateY(-5deg); }
          }
          @keyframes kredix-orbit {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes kredix-pulse {
            0%, 100% { opacity: .35; transform: scale(.95); }
            50% { opacity: .65; transform: scale(1.05); }
          }
          .kredix-scene { perspective: 1100px; transform-style: preserve-3d; }
          .kredix-card-motion {
            animation: kredix-float 7s ease-in-out infinite;
            transform-style: preserve-3d;
            will-change: transform;
          }
          .kredix-orbit-motion { animation: kredix-orbit 38s linear infinite; }
          .kredix-pulse-motion { animation: kredix-pulse 6s ease-in-out infinite; }
          @media (prefers-reduced-motion: reduce) {
            .kredix-card-motion, .kredix-orbit-motion, .kredix-pulse-motion {
              animation: none !important;
            }
          }
        `}</style>

        <div className="pointer-events-none absolute -right-32 -top-32 h-[430px] w-[430px] rounded-full bg-[#5725B5]/40 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-40 -left-24 h-[420px] w-[420px] rounded-full bg-[#27E3A6]/10 blur-[110px]" />

        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-16 lg:grid-cols-2 lg:gap-12">
          <div className="max-w-2xl">


            <h1 className="mt-6 text-4xl font-extrabold leading-[1.12] tracking-[-0.045em] sm:text-5xl lg:text-[3.7rem]">
              Every sale you make
              <br className="hidden sm:block" /> builds your credit.
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-[#D4C8E5] sm:text-lg">
              Kredix helps Nigerian SMEs digitise their operations, organise
              financial records, understand performance, demonstrate financial
              credibility, and discover relevant financing opportunities.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href="/register"
                className="inline-flex items-center gap-3 rounded-xl bg-[#5725B5] px-7 py-4 text-sm font-bold text-white shadow-[0_12px_35px_rgba(87,37,181,.35)] transition hover:-translate-y-1 hover:bg-[#693BC5]"
              >
                Get Started
                <span aria-hidden="true">→</span>
              </Link>

              <a
                href="#how-it-works"
                className="inline-flex items-center gap-3 rounded-xl border border-white/30 px-7 py-4 text-sm font-semibold text-white transition hover:border-[#27E3A6] hover:bg-white/5"
              >
                See How It Works
              </a>
            </div>

            <p className="mt-7 text-sm font-semibold text-[#BFA9E8]">
              {brand.tagline}
            </p>
          </div>

          {/* Minimal 3D brand and financial card visual */}
          <div className="kredix-scene relative mx-auto flex min-h-[420px] w-full max-w-[560px] items-center justify-center sm:min-h-[500px]">
            <div className="kredix-pulse-motion pointer-events-none absolute h-[300px] w-[300px] rounded-full bg-[#5725B5]/60 blur-[90px] sm:h-[390px] sm:w-[390px]" />

            <div className="kredix-orbit-motion pointer-events-none absolute h-[340px] w-[340px] rounded-full border border-[#27E3A6]/20 sm:h-[430px] sm:w-[430px]" />
            <div className="pointer-events-none absolute h-[270px] w-[270px] rounded-full border border-white/10 sm:h-[350px] sm:w-[350px]" />

            <div className="kredix-card-motion relative w-full max-w-[410px]">
              {/* Floating Kredix mark */}
              <div className="absolute -right-3 -top-8 z-20 flex h-[76px] w-[76px] items-center justify-center rounded-[23px] border border-white/30 bg-gradient-to-br from-[#966FE5] to-[#5725B5] text-4xl font-black text-white shadow-[0_18px_55px_rgba(39,227,166,.2)] sm:-right-5 sm:-top-9 sm:h-[88px] sm:w-[88px]">
                K
              </div>

              <div className="relative overflow-hidden rounded-[28px] border border-white/20 bg-gradient-to-br from-[#58318F]/95 via-[#38205F]/95 to-[#24113D]/95 p-7 shadow-[0_35px_90px_rgba(0,0,0,.45)] backdrop-blur-xl sm:p-9">
                <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#9670ED]/30 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-28 -left-20 h-64 w-64 rounded-full bg-[#27E3A6]/10 blur-3xl" />

                <div className="relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 font-black text-white">
                        K
                      </div>
                      <span className="text-sm font-bold tracking-wide text-white">
                        kredix
                      </span>
                    </div>
                    <span className="rounded-full border border-white/20 px-3 py-1 text-[9px] font-semibold uppercase tracking-widest text-white/70">
                      Your business
                    </span>
                  </div>

                  <p className="mt-9 text-[10px] font-bold uppercase tracking-[.2em] text-[#BFA9F2]">
                    Sell. Get paid. Grow.
                  </p>

                  <h2 className="mt-3 max-w-[290px] text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
                    Every sale builds a stronger story.
                  </h2>

                  <div className="relative mt-8 h-[125px]">
                    <svg
                      viewBox="0 0 340 125"
                      fill="none"
                      className="absolute inset-0 h-full w-full overflow-visible"
                      aria-hidden="true"
                    >
                      <path
                        d="M8 105 C65 105 72 72 123 78 S205 29 250 43 S302 10 330 13"
                        stroke="#27E3A6"
                        strokeWidth="5"
                        strokeLinecap="round"
                      />
                      <path
                        d="M8 105 C65 105 72 72 123 78 S205 29 250 43 S302 10 330 13"
                        stroke="#B6FFE5"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        opacity=".8"
                      />
                      {[[8, 105], [123, 78], [250, 43], [330, 13]].map(
                        ([cx, cy], index) => (
                          <g key={index}>
                            <circle cx={cx} cy={cy} r="10" fill="#27E3A6" opacity=".2" />
                            <circle cx={cx} cy={cy} r="5" fill="#27E3A6" />
                          </g>
                        )
                      )}
                    </svg>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {[
                      ["01", "Sell"],
                      ["02", "Record"],
                      ["03", "Grow"],
                    ].map(([number, label]) => (
                      <div
                        key={number}
                        className="rounded-xl border border-white/15 bg-white/[.07] px-3 py-3"
                      >
                        <p className="text-[9px] font-bold text-[#27E3A6]">
                          {number}
                        </p>
                        <p className="mt-1 text-xs font-semibold text-white">
                          {label}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-white/15 pt-5">
                    <span className="text-[10px] text-white/65">
                      Your business. Your progress.
                    </span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#27E3A6] text-lg font-bold text-[#1C0B35]">
                      ↗
                    </span>
                  </div>
                </div>
              </div>

              {/* Floating mint accent */}
              <div className="absolute -bottom-7 -left-5 z-20 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-[#27E3A6] text-2xl text-[#172B2A] shadow-[0_15px_40px_rgba(39,227,166,.25)]">
                ↗
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brand statement */}
      <section className="bg-[#24143D]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-5 py-9 text-center sm:px-8 md:flex-row md:text-left lg:px-12">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#A995D1]">
              The Kredix approach
            </p>
            <p className="mt-2 text-xl font-bold tracking-tight text-white sm:text-2xl">
              Sell. Get paid. Grow.
            </p>
          </div>
          <p className="max-w-xl text-sm leading-7 text-[#D0C6DE]">
            Move from running your business on scattered information to
            building organised records that can support your next stage of
            growth.
          </p>
        </div>
      </section>

      {/* Platform */}
      <section id="platform" className="scroll-mt-20 bg-white py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#5725B5]">
              One connected platform
            </p>
            <h2 className="mt-5 text-3xl font-extrabold leading-tight tracking-[-0.045em] text-[#24143D] sm:text-5xl">
              Run your business with more clarity.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-[#7A7086]">
              The tools you need to manage business activity and build a more
              complete picture of your business, brought together in one
              workspace.
            </p>
          </div>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <article
                key={feature.number}
                className={`group relative flex min-h-[310px] flex-col overflow-hidden rounded-[22px] border p-7 transition duration-300 hover:-translate-y-1 hover:shadow-xl ${
                  index === 1
                    ? "border-[#5725B5] bg-[#5725B5] text-white"
                    : "border-[#EEEAF4] bg-[#FCFBFE] text-[#24143D]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold tracking-widest ${
                      index === 1 ? "text-[#D5C5F7]" : "text-[#A69AB7]"
                    }`}
                  >
                    {feature.number}
                  </span>
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl text-2xl ${
                      index === 1
                        ? "bg-white/15 text-white"
                        : "bg-[#F0EAFB] text-[#5725B5]"
                    }`}
                  >
                    {feature.icon}
                  </span>
                </div>

                <div className="mt-auto">
                  <p
                    className={`text-[9px] font-bold tracking-[0.18em] ${
                      index === 1 ? "text-[#D5C5F7]" : "text-[#9589A6]"
                    }`}
                  >
                    {feature.tag}
                  </p>
                  <h3 className="mt-3 text-xl font-bold tracking-tight">
                    {feature.title}
                  </h3>
                  <p
                    className={`mt-3 text-sm leading-7 ${
                      index === 1 ? "text-[#E5DDF4]" : "text-[#81768E]"
                    }`}
                  >
                    {feature.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="scroll-mt-20 bg-[#F8F6FB] py-24 sm:py-28"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#5725B5]">
                How it works
              </p>
              <h2 className="mt-5 text-3xl font-extrabold leading-tight tracking-[-0.045em] text-[#24143D] sm:text-5xl">
                A clearer path from business activity to financial readiness.
              </h2>
              <p className="mt-6 text-base leading-8 text-[#7A7086]">
                Start with the business you have today. As you organise your
                activity, you create a clearer record of where your business
                stands and where it could go next.
              </p>
              <Link
                href="/register"
                className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#5725B5] px-6 py-4 text-sm font-bold text-white transition hover:bg-[#431A91]"
              >
                Get started <Arrow />
              </Link>
            </div>

            <div className="space-y-0">
              {steps.map((step, index) => (
                <div
                  key={step.number}
                  className="relative flex gap-5 border-b border-[#E9E3F0] py-7 first:pt-0 last:border-0"
                >
                  <div className="relative flex shrink-0 flex-col items-center">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-extrabold ${
                        index === 0
                          ? "bg-[#5725B5] text-white"
                          : "bg-white text-[#5725B5]"
                      }`}
                    >
                      {step.number}
                    </div>
                    {index !== steps.length - 1 && (
                      <div className="mt-2 h-full w-px bg-[#DDD3EB]" />
                    )}
                  </div>
                  <div className="pb-2">
                    <h3 className="text-lg font-bold text-[#2B1D40]">
                      {step.title}
                    </h3>
                    <p className="mt-2 max-w-lg text-sm leading-7 text-[#81768E]">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Kredix */}
      <section
        id="why-kredix"
        className="scroll-mt-20 bg-white py-24 sm:py-28"
      >
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-2 lg:px-12">
          <div className="relative overflow-hidden rounded-[28px] bg-[#24143D] p-8 sm:p-12">
            <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#5725B5] opacity-50 blur-3xl" />
            <div className="absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-[#27C995] opacity-20 blur-3xl" />

            <div className="relative">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-lg font-bold text-[#27E3A6]">
                  K
                </div>
                <span className="text-sm font-bold text-white">Kredix</span>
              </div>

              <h3 className="mt-12 max-w-md text-3xl font-extrabold leading-tight tracking-[-0.04em] text-white sm:text-4xl">
                Your business has a story. Make the numbers tell it.
              </h3>
              <p className="mt-5 max-w-md text-sm leading-8 text-[#CFC3E0]">
                A business should not have to rely on scattered records when
                it is time to understand performance, demonstrate financial
                activity or explore opportunities.
              </p>

              <div className="mt-10 space-y-4">
                {[
                  "Organised business information",
                  "A clearer view of financial activity",
                  "A financial profile you can review",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 text-sm font-medium text-white"
                  >
                    <span className="text-[#27E3A6]">
                      <Check />
                    </span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#5725B5]">
              Why Kredix
            </p>
            <h2 className="mt-5 text-3xl font-extrabold leading-tight tracking-[-0.045em] text-[#24143D] sm:text-5xl">
              Built for the reality of running a business.
            </h2>
            <p className="mt-6 text-base leading-8 text-[#7A7086]">
              Many small businesses work hard every day but struggle to keep
              their information organised. Sales records, expenses, customer
              details and business documents can end up in different places.
            </p>
            <p className="mt-5 text-base leading-8 text-[#7A7086]">
              Kredix brings important parts of that activity into one
              workspace, helping business owners build better visibility and
              prepare for future opportunities.
            </p>
            <div className="mt-8 border-l-2 border-[#27C995] pl-5">
              <p className="text-lg font-bold leading-8 text-[#35244B]">
                Open for business in minutes. Build for what comes next.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy */}
      <section className="bg-[#F2EEF9] py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 sm:px-8 md:grid-cols-[1fr_auto] md:items-center lg:px-12">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#5725B5]">
              Your business information matters
            </p>
            <h2 className="mt-4 text-3xl font-extrabold tracking-[-0.04em] text-[#24143D] sm:text-4xl">
              Your information. Your business. Your decisions.
            </h2>
            <p className="mt-4 text-sm leading-8 text-[#756A83]">
              Financial information deserves careful handling. Kredix is
              designed around clear access and consent, so business owners can
              understand how their information is used and shared.
            </p>
          </div>
          <Link
            href="/register"
            className="inline-flex w-fit items-center gap-3 rounded-full bg-[#24143D] px-7 py-4 text-sm font-bold text-white transition hover:bg-[#5725B5]"
          >
            Create your account <Arrow />
          </Link>
        </div>
      </section>

      {/* FAQs */}
      <section id="faqs" className="scroll-mt-20 bg-white py-24 sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[0.7fr_1.3fr] lg:gap-24 lg:px-12">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#5725B5]">
              FAQs
            </p>
            <h2 className="mt-5 text-3xl font-extrabold tracking-[-0.045em] text-[#24143D] sm:text-5xl">
              Questions worth asking.
            </h2>
            <p className="mt-5 text-sm leading-8 text-[#81768E]">
              A few things to know before you get started with Kredix.
            </p>
            <a
              href={`mailto:${brand.contact.supportEmail}`}
              className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-[#5725B5] hover:underline"
            >
              Contact support <Arrow diagonal />
            </a>
          </div>

          <div className="divide-y divide-[#EEEAF4]">
            {faqs.map((faq, index) => (
              <details
                key={faq.question}
                open={index === 0}
                className="group py-6"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-base font-bold text-[#302044] marker:hidden">
                  {faq.question}
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F2EDFA] text-lg font-medium text-[#5725B5] transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="max-w-2xl pt-4 text-sm leading-8 text-[#81768E]">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-[#24143D] px-5 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#27E3A6]">
            Your next chapter starts here
          </p>
          <h2 className="mt-5 text-4xl font-extrabold leading-tight tracking-[-0.05em] text-white sm:text-6xl">
            Give your business the financial foundation it deserves.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-[#CFC3E0]">
            Start organising your business activity, understanding your
            performance and building a clearer financial picture.
          </p>
          <Link
            href="/register"
            className="mt-9 inline-flex items-center gap-3 rounded-full bg-[#27E3A6] px-8 py-4 text-sm font-extrabold text-[#173A31] transition hover:-translate-y-0.5 hover:bg-[#55F0BC]"
          >
            Get started with Kredix <Arrow />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#190D2A] text-white">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-12">
          <div className="flex flex-col justify-between gap-10 border-b border-white/10 pb-10 md:flex-row">
            <div className="max-w-sm">
              <Image
                src={brand.logo.wordmark}
                alt="Kredix"
                width={142}
                height={42}
                className="h-9 w-auto brightness-0 invert"
              />
              <p className="mt-5 text-sm leading-7 text-[#B7A9C9]">
                {brand.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-12 sm:gap-20">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#A995D1]">
                  Explore
                </p>
                <div className="mt-5 flex flex-col gap-4 text-sm text-[#D1C7DE]">
                  <a href="#platform" className="hover:text-[#27E3A6]">
                    Platform
                  </a>
                  <a href="#how-it-works" className="hover:text-[#27E3A6]">
                    How it works
                  </a>
                  <a href="#faqs" className="hover:text-[#27E3A6]">
                    FAQs
                  </a>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#A995D1]">
                  Account
                </p>
                <div className="mt-5 flex flex-col gap-4 text-sm text-[#D1C7DE]">
                  <Link href="/login" className="hover:text-[#27E3A6]">
                    Log in
                  </Link>
                  <Link href="/register" className="hover:text-[#27E3A6]">
                    Get started
                  </Link>
                  <a
                    href={`mailto:${brand.contact.supportEmail}`}
                    className="hover:text-[#27E3A6]"
                  >
                    Contact
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-5 pt-7 text-xs text-[#9F91B1] sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} {brand.legalName}. All rights
              reserved.
            </p>
            <p className="max-w-2xl leading-6 sm:text-right">
              {brand.legal.disclaimer}
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
