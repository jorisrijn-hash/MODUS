import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

const metrics = [
  { value: "78%", label: "Faster response time" },
  { value: "26%", label: "Increase in bookings" },
  { value: "€42K+", label: "Annual value created" },
];

export function CaseStudy() {
  return (
    <section className="border-t border-line bg-graphite py-20 text-paper md:py-24">
      <Container>
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1fr_auto] lg:gap-16">
          <div>
            <Reveal>
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-paper/45">
                Case Study · Illustrative example
              </p>
            </Reveal>
            <Reveal delay={0.06}>
              <h2 className="mt-4 text-balance text-2xl font-semibold md:text-3xl">
                From fragmented to focused.
              </h2>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="mt-3 max-w-md text-[14.5px] leading-relaxed text-paper/65">
                A multi-location service business unified its systems,
                automated manual work and reduced response time. That&apos;s a
                representative pattern of what a MODUS engagement targets.
              </p>
            </Reveal>
            <Reveal delay={0.18}>
              <a
                href="#final-cta"
                className="group mt-6 inline-flex items-center gap-1.5 text-[14px] font-medium text-paper"
              >
                Read the Full Case Study
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-200 ease-modus group-hover:translate-x-0.5"
                  strokeWidth={1.75}
                />
              </a>
            </Reveal>
          </div>

          <div className="flex gap-8 border-t border-paper/15 pt-6 lg:border-l lg:border-t-0 lg:pl-16 lg:pt-0">
            {metrics.map((m, i) => (
              <Reveal key={m.label} delay={0.1 + i * 0.06}>
                <p className="text-2xl font-semibold md:text-3xl">{m.value}</p>
                <p className="mt-1 max-w-[9rem] text-[12px] text-paper/55">
                  {m.label}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
