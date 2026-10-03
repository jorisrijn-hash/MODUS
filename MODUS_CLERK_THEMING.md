# Theming the hosted Clerk screens

`accounts.withmodus.co` is served by Clerk, not by this application. The
`appearance` prop and `src/app/globals.css` reach only the components
mounted inside MODUS (`/sign-in`, `/sign-up`, the user button). They do
**not** reach the hosted screens, so those pages keep Clerk's defaults
until they are themed in the dashboard.

## Which screens are hosted

Anything Clerk serves on its own domain, including:

- the OAuth continuation and consent steps of a Google sign-in;
- account management opened from the user button when it is not embedded;
- verification, recovery and any forced-password or MFA step;
- the fallback `accounts.<domain>` sign-in page.

## Steps

In the Clerk Dashboard, with the **production** instance selected
(top-left instance switcher — a change made to development does not
affect `clerk.withmodus.co`):

1. **Customization → Appearance**.
2. **Theme**: choose the light base. The MODUS surface is a warm light
   canvas; starting from a dark base means fighting every subsequent
   value.
3. **Colors** — set these to match `globals.css`:

   | Dashboard field | Value | MODUS token |
   |---|---|---|
   | Primary | `#1E3B2E` | `--accent` |
   | Primary text / on-primary | `#FFFFFF` | `--accent-foreground` |
   | Background | `#D7D7D0` | `--canvas` |
   | Card / surface | `#F4F4E7` | `--surface` |
   | Text | `#1A1614` | `--text-primary` |
   | Secondary text | `#3C3834` | `--text-secondary` |
   | Muted text | `#585751` | `--text-muted` |
   | Border / input border | `#BDBDB5` | `--line` |
   | Danger | the `--danger` value in `globals.css` | `--danger` |

4. **Typography**: set the body font to **Geist** and the heading font to
   **Noto Serif**, matching `src/app/layout.tsx`. If the dashboard offers
   only a font URL, use the Google Fonts entries for those two families —
   they are the same ones the app loads.
5. **Shape**: border radius `0.5rem` for inputs and cards; the primary
   action is a **pill**, so set the button radius to its maximum. This is
   the one value most likely to differ from the in-app screens, where the
   pill comes from `.cl-formButtonPrimary` in `globals.css`.
6. **Branding → Logo**: upload the bare ink mark (the same glyph
   `LogoMark` renders), not the wordmark lockup. The in-app screens show
   the mark alone above the heading.
7. **Branding**: if the plan allows it, disable "Clerk branding" so the
   hosted screens match the in-app ones, which do not show it.
8. Save, then open `https://accounts.withmodus.co/sign-in` in a private
   window and compare against
   `e2e-screens/auth-sign-in-desktop.png`.

## Limitations, stated plainly

- **This cannot be done from the repository.** There is no API in this
  codebase that sets dashboard appearance; it is a manual change in
  Clerk, and nothing in the test suite can assert it.
- **The two surfaces can drift.** The in-app values live in
  `globals.css` under the `cl-` rules; the hosted values live in Clerk.
  Changing one does not change the other, and only a visual comparison
  will catch a divergence.
- **Some hosted screens expose less.** Clerk's appearance controls do not
  cover every element on every hosted screen; expect the OAuth
  continuation steps in particular to retain some Clerk styling whatever
  is configured.
- **Custom CSS on hosted pages is plan-dependent.** If the plan does not
  include it, the colour, font, shape and logo settings above are the
  full extent of what can be matched.
