# Privacy policy — content resolution list

`/privacypolicy` is published and readable. The items below are **release
blockers for the final policy**, not blockers for the rest of the build.

The supplied `privacy.pdf` carries editorial notes and placeholders aimed
at whoever implements it ("Do not publish a provider name here until it is
actually being used", `[12/24 months ...]`, "Possible structure", "Claude
should not invent these periods", "Only include services actually used in
production"). **None of those lines are published.** Where a fact is
genuinely unresolved the page says so plainly instead of inventing one.

| § | Item | Status | What the page currently says | Needed to resolve |
|---|---|---|---|---|
| 6 | Authentication provider | **Unresolved** | "The account system is not yet publicly available. The provider actually used in production will be named in this section before accounts are launched." | Clerk is the intended provider but is **not yet integrated**. Name it only once it is live. |
| 7 | Infrastructure providers | **Partly resolved** | Names **Vercel** for hosting/deployment; says the rest will be named as they enter production. | Vercel confirmed independently (`server: Vercel` on the live domain). Supabase and Clerk are not in production yet. Analytics, communications and security providers undecided. |
| 9 | Retention periods | **Unresolved** | Publishes only the two facts that are actually settled (client information for the duration of the relationship; financial administration per Dutch obligations) and states that diagnostic/enquiry/account periods will be published before the account system launches. | Decide the actual periods. The source's `[12/24 months]` is a choice, not a value — it must match what the implementation really does. |
| 11 | International transfers | **Mechanism listed, specifics unresolved** | Lists adequacy decisions / SCCs / another recognised safeguard. | Confirm which mechanism applies to each provider once the stack is final. |
| 14 | Account deletion | **Conditional** | Phrased conditionally ("Where MODUS accounts are available") and routes requests to `privacy@withmodus.co`. | Accounts do not exist yet. When they do, implement a real verified deletion flow with truthful status and session revocation — an inert button is not enough — and describe what happens to saved diagnostics. |
| 8 | Cookie settings link | **Works** | Promises Cookie Settings; the footer's "Privacy Preferences" control opens the existing consent manager. | None. |

## Contact addresses

All four approved aliases are in place as `mailto:` links whose visible
text and destination are identical, and the old Gmail address appears
nowhere in either published page:

- `hello@withmodus.co` — general and legal enquiries
- `privacy@withmodus.co` — privacy, data rights, deletion, complaints
- `support@withmodus.co` — account and diagnostic support
- `joris@withmodus.co` — direct contact (in `/legal` §13)

These are **receiving aliases only**. Nothing in the codebase uses them as
an outbound sender, and nothing should until a verified transactional
provider exists.

## Scope note

This is content implementation. It is not a statement that the source
policy is legally sufficient.
