import { stack } from "@/config/stack";

/**
 * The hero's signature element: the app's real stack drawn as strata.
 * Reads src/config/stack.ts, which the agent writes from your answers.
 */
export function Strata() {
  return (
    <figure aria-label="This app's stack, from hosting up to analytics" className="w-full">
      <ol className="flex flex-col-reverse gap-1.5">
        {stack.map((layer, i) => (
          <li
            key={layer.layer}
            className="stratum flex items-baseline justify-between gap-4 rounded-[6px] px-4"
            style={{
              background: `var(--stratum-${i + 1})`,
              color: `var(--on-stratum-${i + 1})`,
              paddingBlock: `${0.7 + (stack.length - i) * 0.12}rem`,
              animationDelay: `${(stack.length - i) * 70}ms`,
            }}
          >
            <span className="text-sm opacity-90">{layer.layer}</span>
            <span className="display text-base sm:text-lg">{layer.provider}</span>
          </li>
        ))}
      </ol>
      <figcaption className="mt-3 text-sm text-ink-soft">
        Chosen in six questions. Provisioned by your coding agent.
      </figcaption>
    </figure>
  );
}
