---
name: es-design
description: Re-theme and re-word an Everything Stack app for the user's product — design tokens, typography, the stack-strata hero, marketing copy, plans and pricing — while keeping accessibility and dark mode intact. Use when the user gives a product name, brand, colors or audience, or asks to "make it look like my brand", "change the design", "write the landing page".
---

# es-design

Use the official `frontend-design` and `web-design-guidelines` skills for direction and review.
This skill describes how *this* codebase is themed.

## Where design lives

- **Tokens** — `src/app/globals.css` `:root` (light) and the dark media query: `--paper`,
  `--surface`, `--ink`, `--ink-soft`, `--rule`, `--signal` (the one accent, primary buttons only),
  `--stratum-1..6` + `--on-stratum-1..6` (hero bands and their text). Components only use tokens.
- **Type** — `src/app/layout.tsx` loads one variable family (Archivo with the `wdth` axis).
  `.display` = expanded width, heavy. Swap the family in one place.
- **Copy** — `src/config/site.ts` (name, tagline, description, features, FAQ, plans).
- **Hero** — `src/components/marketing/strata.tsx` draws the real stack from `src/config/stack.ts`.
  For a product that isn't about developer tooling, replace the hero visual with the most
  characteristic thing in *that* product's world (a live demo, the core object, real numbers) —
  the strata are the template's own identity, not a requirement.

## Process

1. Ground it in the product: who uses it, what they do, the vocabulary of their world.
2. Write a compact plan: 4–6 named hex colors, typeface(s), layout idea, one principle that makes
   it theirs. Check it isn't a generic default (cream + terracotta serif; black + acid green;
   identical rounded cards with soft shadows; ALL-CAPS eyebrows; "→" on every link).
3. Edit tokens + copy. Keep one bold element; keep the rest quiet.
4. Contrast: every text/background pair ≥ 4.5:1 (large display ≥ 3:1) in light **and** dark.
   Update `--on-stratum-*` if you change strata colors.
5. Copy: sentence case, plain verbs, from the user's side. Buttons say what happens
   ("Upgrade to Pro", not "Submit"). Errors say what happened and how to fix it.
6. Screenshot desktop + mobile, light + dark (`npm run test:e2e` writes `test-results/screens/`), review, fix.

## Don'ts

No lorem ipsum. No stock "Trusted by" logo walls with fake brands. No fake testimonials or
metrics presented as real. Respect `prefers-reduced-motion`. Keep visible focus states.
