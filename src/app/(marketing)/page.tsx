import { PricingTable } from "@/components/marketing/pricing-table";
import { Strata } from "@/components/marketing/strata";
import { ButtonLink } from "@/components/ui/button";
import { site } from "@/config/site";

const steps = [
  {
    title: "Answer six questions",
    body: "Hosting, framework, database, auth, billing and analytics. Pick a provider for each, or accept the defaults.",
  },
  {
    title: "Your agent provisions it",
    body: "Accounts, keys and environment variables are created through each provider's CLI. Nothing to copy and paste.",
  },
  {
    title: "Run it and ship",
    body: "Marketing site, sign-in, dashboard, billing and admin all work locally. Deploy when you're ready.",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 pt-16 pb-20 md:grid-cols-[1.1fr_1fr] md:pt-24">
        <div>
          <h1 className="display text-5xl sm:text-6xl lg:text-7xl">{site.tagline}</h1>
          <p className="prose-measure mt-6 text-lg text-ink-soft">{site.description}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/sign-up">Start free</ButtonLink>
            <ButtonLink href="/pricing" variant="secondary">
              See pricing
            </ButtonLink>
          </div>
        </div>
        <Strata />
      </section>

      <section id="how" className="border-y border-rule bg-surface">
        <div className="mx-auto w-full max-w-6xl px-5 py-16">
          <h2 className="display text-3xl sm:text-4xl">How it works</h2>
          <ol className="mt-10 grid gap-10 md:grid-cols-3">
            {steps.map((step, i) => (
              <li key={step.title} className="border-t-2 border-ink pt-4">
                <span className="display text-4xl text-ink-soft">{i + 1}</span>
                <h3 className="mt-3 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-ink-soft">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-16">
        <h2 className="display text-3xl sm:text-4xl">What&apos;s already built</h2>
        <dl className="mt-10 grid gap-x-12 md:grid-cols-2">
          {site.features.map((f) => (
            <div key={f.title} className="border-t border-rule py-5">
              <dt className="font-semibold">{f.title}</dt>
              <dd className="mt-1 text-ink-soft">{f.body}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="border-y border-rule bg-surface">
        <div className="mx-auto w-full max-w-6xl px-5 py-16">
          <h2 className="display text-3xl sm:text-4xl">Pricing</h2>
          <p className="mt-3 text-ink-soft">Start free. Upgrade when you outgrow it.</p>
          <div className="mt-10">
            <PricingTable />
          </div>
        </div>
      </section>

      <section id="faq" className="mx-auto w-full max-w-3xl px-5 py-16">
        <h2 className="display text-3xl sm:text-4xl">Questions</h2>
        <div className="mt-8 divide-y divide-rule border-y border-rule">
          {site.faq.map((item) => (
            <details key={item.q} className="group py-4">
              <summary className="cursor-pointer list-none font-semibold marker:hidden">
                <span className="flex items-center justify-between gap-4">
                  {item.q}
                  <span aria-hidden className="text-ink-soft transition-transform group-open:rotate-45">
                    +
                  </span>
                </span>
              </summary>
              <p className="mt-3 text-ink-soft">{item.a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
