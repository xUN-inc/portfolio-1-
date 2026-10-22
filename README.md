# Akshun Chauhan — portfolio

A fast, portable portfolio built from the existing site. The warm studio design includes an expressive cursor, draggable Earth, a solar experiment, compact project selection, career history, venture pages, photo-led news, and a sourced portfolio guide. Five featured projects lead to nine case studies, including one approved private-project summary. Programming experience is calculated from 2016; the 100+ lifetime project count is separate from the public GitHub library. No frontend framework, runtime package dependencies, or database is required for the portfolio.

## Run locally

Requires Node.js 22 or newer.

```sh
npm run build
npm run dev
```

Open `http://127.0.0.1:4173`. `npm run preview` serves the production `dist/` folder instead. The development server is local only. Reload the browser after edits.

## Edit the portfolio

- `src/index.template.html`: home page layout and static copy.
- `data/portfolio.json`: biography, current focus, ventures, projects, recommendations, recognition, press, and LinkedIn highlights.
- `style.css`: responsive layout, self-hosted fonts, and visual styling.
- `lib/portfolio.mjs`: shared rendering, repository filtering, and source-based assistant.
- `script.js`: browser interactions and live GitHub updates.
- `scripts/build.mjs`: renders the home page, individual case study pages, structured data, and `dist/`.

`index.html`, `projects/*/index.html`, `robots.txt`, and `404.html` are generated. Edit the template or JSON and run `npm run build`; do not edit generated pages directly.

## Dynamic GitHub data

Visitors get fresh public metadata from GitHub for the reviewed `repositorySelection` catalogue. New or unreviewed repositories do not enter the public portfolio automatically. Approved private summaries are merged separately and link to a case study, without publishing a private source URL. Results are cached in their browser for 30 minutes. Fetches are paginated, forked and archived repositories are excluded from the library, and repository descriptions are treated as plain text. Search and category filters work with the live results. Pagination replaces the six visible projects rather than appending more rows.

If GitHub is unavailable or rate-limited, the last good browser cache or the embedded repository snapshot stays available. The interface states which data is displayed. There is no GitHub access token in the browser.

Refresh the crawlable snapshot with:

```sh
npm run sync:github
npm run build
```

`GITHUB_TOKEN` is optional for the build-time sync, and must stay in the environment. The committed GitHub Actions workflow refreshes content every six hours **after these changes are pushed to the repository's default branch and Actions is enabled**. It commits refreshed source snapshots and generated pages. It does not deploy the website. Automatic deployment can be connected to the eventual host separately.

## LinkedIn, recommendations, and press

The initial content comes from the original portfolio, the public LinkedIn profile, RDP, rdnewsNOW, United Way Central Alberta, and Xun Innovation. Each quote, story, and recognition links to its source. Recommendations reproduce the full original text from the owner’s previous portfolio, with LinkedIn source links; legacy headshots are hidden until current photos can be verified. No ratings are added. NASA recognition is explicitly the Edmonton event win.

**LinkedIn is not automatically scraped.** The site currently displays two sourced full recommendations and a selected community highlight, with links to current LinkedIn activity. Automatic retrieval of all recommendations and posts requires an authorized data provider or a user-supplied export. Press now includes an automatically refreshed collection of verified matches. `npm run sync:public` checks Google News RSS, refreshes metadata and downloads publisher photos, and retains the last good content when a source is unavailable. Name and research/location context filters reduce namesake matches. The search cannot guarantee an exhaustive record of the web.

You can edit the JSON directly, import a local editorial feed, or connect a trusted HTTPS JSON endpoint:

```sh
npm run sync:content -- /absolute/path/to/content.json
# Or set CONTENT_FEED_URL and optional CONTENT_FEED_TOKEN in the environment:
npm run sync:content
npm run build
```

Supported optional top-level arrays:

```json
{
  "recommendations": [
    {
      "name": "Actual recommender name",
      "initials": "AN",
      "context": "Accurate professional context",
      "quote": "Approved short excerpt",
      "summary": "A faithful summary of the recommendation.",
      "url": "https://www.linkedin.com/in/akshunchauhan/details/recommendations/"
    }
  ],
  "linkedinActivity": [
    {
      "title": "Actual post title",
      "publisher": "Actual author",
      "type": "Post",
      "description": "Accurate summary.",
      "url": "https://www.linkedin.com/feed/update/ACTUAL-POST-ID/"
    }
  ],
  "press": [
    {
      "title": "Actual article title",
      "publisher": "Publication",
      "date": "2026-10-20",
      "type": "In the news",
      "description": "Accurate summary.",
      "url": "https://publication.example/actual-article"
    }
  ]
}
```

Omitted arrays stay unchanged; supplied arrays replace that collection. Required fields, URL schemes, and LinkedIn domains are validated before writing. This import expects normalized JSON; it is not a direct parser for LinkedIn's raw ZIP/CSV export. Store `CONTENT_FEED_URL` and `CONTENT_FEED_TOKEN` as repository secrets to use the optional feed in the scheduled workflow. Review your provider's content and permissions before connecting it.

## Portfolio guide

The chat is a working local retrieval guide, **not a generative LLM service**. It matches questions to documented biography, projects, skills, business, education, recommendations, and press, and returns source links. Unsupported questions get a clear fallback. No chat content is sent to a third party or stored between page loads.

A later LLM upgrade should use a server-side endpoint with rate limits and the same verified knowledge base. Never put a model API key in this site's JavaScript or JSON.

## SEO and deployment

The build outputs a standard static `dist/` directory suitable for Firebase Hosting, Cloudflare Pages, Netlify, or another static host. The site has crawlable HTML, unique case study titles and descriptions, ProfilePage/Person and CreativeWork structured data, semantic headings, accessible navigation, and a custom 404 page.

When the final domain is chosen, build with its HTTPS origin:

```sh
SITE_URL=https://your-real-domain.ca npm run build
```

Additional pages include `/work/`, `/about/`, `/ventures/xun-innovation/`, `/news/`, and individual news stories.

This adds canonical URLs, absolute Open Graph/social image URLs, and `sitemap.xml`. Without a final domain, the build intentionally omits those URLs instead of inventing a canonical address. Add the same `SITE_URL` as a repository variable for the scheduled workflow. Serve `dist/` as static files with real 404 handling; no SPA catch-all rewrite is needed. No deployment, Firebase project, domain purchase, or remote push has been performed.

## Verification

```sh
npm run build
npm test
```

Tests cover repository sanitation and filtering, source-based answers and unknown questions, content import validation, crawlable page structure, and local link/asset integrity. Browser verification covers live GitHub fetching, search, filtering, show-more, chat, journal switching, responsive layouts, and project navigation.

## Content and assets to review

- Confirm your exact current title, all ventures, and any newer achievements before public launch. The Xun founder role follows the work-experience entry in the linked Portfolio- repository.
- The résumé at `docs/ak.pdf` is updated from the supplied current DOCX, rendered to PDF and visually checked; original DOCX files are unchanged.
- The portrait, project screenshots, and self-hosted Averta fonts come from the original repository. Confirm that the font licenses cover public web use.
- `images/editorial/nasa-team.jpg` and `nasa-win.webp` are RDP photos from the linked NASA project article. Their use should follow RDP's image permissions. Image credit: Red Deer Polytechnic.
- Private repositories and internal source code remain outside the public GitHub feed. A repository link supplied by the original site can require access.

Public reference sources: [RDP project story](https://rdpolytech.ca/news/blog-nasa-space-apps-challenge-our-journey), [LinkedIn](https://www.linkedin.com/in/akshunchauhan/), [Xun Innovation](https://xuninnovation.ca/), [rdnewsNOW](https://rdnewsnow.com/2025/10/20/rdp-team-wins-norquest-hackathon-by-simulating-impact-of-asteroid-hitting-earth/), [United Way magazine](https://caunitedway.ca/wp-content/uploads/2025/11/Digital-Magazine-.pdf).

## Public-source update connections (version 3)

`npm run sync:public` is working and was run against the real public sources. Google News RSS requires no key. The first run refreshed 10 article pages and checked three relevant Google News matches. Eleven verified stories are included. Public-source sync is now part of the six-hour GitHub workflow; it becomes scheduled only after the workflow is pushed to the repository default branch and GitHub Actions is enabled. No remote push or deployment has been performed.

For broader Google web search beyond Google News, optionally set `SERPAPI_API_KEY` in the environment/repository secrets. This uses SerpAPI's Google search endpoint. No key is included in the website.

LinkedIn returned HTTP 999 for the public profile request. The code preserves sourced recommendations instead of bypassing that restriction. Set `LINKEDIN_FEED_URL` and optional `LINKEDIN_FEED_TOKEN` to an authorized normalized JSON provider for ongoing recommendations and activity. Existing public LinkedIn article pages are reachable and their photos/metadata were refreshed. The build writes the real sync result into `content.json`; browser components revalidate that same-origin snapshot.

The solar illustration is a simplified, labeled cosine experiment with overhead sunlight, not campus telemetry or a complete PV performance model. Its control and meter share one mathematical model. Animation stops offscreen, and reduced-motion preferences are respected. The Anatomy geometry helpers are MIT licensed; see `THIRD_PARTY_NOTICES.md`.

### Studio refresh

The homepage features five projects with genuine interface images: ConfRAG, Asteroid, Energy Innovation Link, Qnext, and TRACE. The reviewed library contains 14 projects, including the approved private Pilates summary, and stays at six per page. Mobile selected work is a horizontal, swipeable row. News rotates in sets of three on desktop and one on mobile, with previous/next and pause controls, and stops while hovered, focused, hidden, or outside the viewport. Reduced motion starts it paused.

The desktop hero centers the circular portrait above the introduction, with a role typing line that stops offscreen and respects reduced motion. The mobile hero retains its original compact layout. The earlier Earth and solar toy are removed from the page. A draggable contact postcard supports both pointer and keyboard movement. Career roles and both ventures live in `data/portfolio.json`, with full career context also on `/about/`. RDP role dates are confirmed from the supplied résumé: Scientific Data Analyst from January 2025, and Applied Research Tech – Data Analyst from May to December 2024. Private repository code and credentials are not included. With the owner’s permission, a curated Pilates Workout Platform summary is included in the case studies and portfolio guide; the workbench includes that approved summary alongside reviewed public projects.

### Programming history, recognition, and presentations

Programming began in 2016. The site calculates approximate calendar years of programming from the current UTC year, separately from employment history. The 100+ overall project count is owner supplied and includes personal, professional, private, and research work; it is not the public repository count. The 2019 All India Science Competition win and World Science Congress organizer are recorded in the current résumé; the model-making category comes from the owner and earlier résumé. The speaking section includes two résumé-backed co-presentations (September 17, 2024 at NAIT, and March 12, 2025 at RDP) and the publicly documented RDP Energy Test Hub appearance.

Technology logos now appear alongside the relevant project and on its detail page. There is no separate technology section. The Pilates case study describes work in development and does not claim a production launch.

### Light and purple dark themes

The header switch is available on the home page, case studies, archives, venture pages, speaking page, and 404 page. Light mode remains the initial default. The selected theme is remembered in local storage and applied in the document head before the page paints, with cross-tab updates. When browser storage is unavailable the switch still works for the current page. Both themes respect reduced-motion settings, and the canvas Earth redraws its palette when the theme changes.

### Current résumé import

Both supplied February 2026 DOCX versions contain the same professional content. The profile now records the RDP position dates, Computer Programming Diploma (2024) with President’s List recognition, BSc Computer Science at IGNOU (2022), and two dated research presentations with co-authors and venues. Homepage presentation cards remain compact; full citations live on `/speaking/`. The portfolio guide answers from the same structured records.

The résumé also supplies Red Deer Advocate, Central Alberta Online, and CTV source links. Those pages were inaccessible to the research tools, so their entries are described as résumé-linked coverage and link to the original publisher. No article text or broadcast transcript was copied. The shared NASA team image is credited to RDP. The metadata refresh job can try those publisher domains using its normal public requests.

## Authentic images & recommendations

`images/projects/*-live.jpg` are captures of the actual public Asteroid, Qnext, Xun Innovation, and INDine websites (October 2026). `confrag-interface.jpg` shows the unmodified original ConfRAG frontend running locally, without its API backend; it is explicitly labelled an interface preview. EIL and TRACE use the owner’s original application screenshots. No generated app mockups are used. Projects without a screenshot use a text-only documentation cover. Company logos come from their official websites; exact quote text comes from the owner’s `Portfolio-` repository; its legacy recommendation photos are no longer displayed.

Recommendation excerpts scroll continuously right to left, with complete text in a popup. Hover and keyboard focus pause the loop; the pause control switches to a manually scrollable row. Reduced motion removes animation and duplicated cards from the displayed row. The duplicate group is inert and hidden from assistive technology. Research presentations use dated, sourced bibliographic rows with no invented illustrations.

## Recommendation excerpts and current profile data

Cards show a word-boundary excerpt (up to 310 characters), with a native modal for the complete, unchanged quote. Escape, the close control, or the backdrop closes it; focus returns to the original control. The marquee stops while the modal is open.

On 21 October 2026, the public LinkedIn search result confirmed Shehan Herathge at CF Power Ltd. Direct LinkedIn requests returned HTTP 999 / 429 and the browser showed a sign-in wall. Current profile photos could not be verified; the old repository photos are no longer displayed. Yash Kumar's exact current LinkedIn profile still needs confirmation. These access limits are not treated as successful photo refreshes.

An authorized recommendation feed may supply `currentContext`, `profileURL`, `profileCheckedAt`, `sourceCheckedAt`, `image`, `imageSource`, and `imageCheckedAt`. Only a photo with a source and check date is displayed. A new image without its own verification metadata cannot inherit verification from a previous photo. Saved checked profile details are retained if a feed omits them. The public server never receives GitHub or LinkedIn access tokens.
