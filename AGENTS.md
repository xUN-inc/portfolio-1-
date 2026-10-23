# Portfolio content preferences

The owner selected a permanent pool for featured/selected project sections:
AgRag, FocusReport, CashVault, Asteroid, TRACE, RoomQuest, Qnext, AI Calling Agent,
Agency Challenge, Document Intelligence, and excelbot. Keep featured selections
within this pool. `data/portfolio.json` contains the canonical slugs in
`featuredProjectPolicy`. Both the homepage and work page use the same pool.

Show no more than six selected projects or repository rows at once. Preserve
mobile horizontal browsing and explicit pagination.

The broader library can include substantial public and personally owned private
projects. Exclude empty repositories, basic exercises, generated commit/activity
projects, forks presented as original work, and duplicate versions of one product.
Private projects open portfolio case studies, not inaccessible GitHub URLs.
Keep their source checkouts and detailed assessments under ignored `planning/`.

INDine is company work: keep it in venture/company context and out of the project
catalogue. Do not publish or link its company source code. The owner declined
reviewing organization-owned private source in this task.

Use genuine app screenshots or accurately labelled captures of real app output.
Do not generate app mockups, invent data/results, or imply an unconnected frontend
is a working end-to-end deployment. Record upstream attribution and capture limits
in `THIRD_PARTY_NOTICES.md`.

Edit source templates and data, then run `npm run build` to update generated HTML
and `content.json`. Run `npm test` for relevant functional changes.

Keep the original full portfolio at `/` with its existing design and interactions.
`/simple/` is an alternative concise landing page, not a replacement homepage. Keep it
short: identity, skills, direction, and clear links into the full portfolio.
The owner asked to keep this work local on branch `simplified` until they authorize
pushing or publishing it.

On `/simple/`, show a prominent portrait on mobile and explicitly answer: Who I am,
Who I want to be (labelled “What I’m working toward”), and Skills. Keep the full `/` homepage layout unchanged; its
metadata may use the owner-approved AI builder/entrepreneur/agent-deployment title.
Do not reintroduce the removed BSc entry. Remaining education is a closed disclosure
on About. Canonical URLs use the owned `siteURL` unless explicitly overridden.
