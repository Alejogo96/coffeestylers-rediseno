# Coffeestylers · mobile-first redesign (prototype)

A clickable prototype in plain HTML and CSS, with no dependencies and no build step. It shows the proposed redesign for Coffeestylers, a specialty coffee shop in Bogotá.

- **View in the browser:** https://alejogo96.github.io/coffeestylers-rediseno/ (needs GitHub Pages enabled: Settings → Pages → Deploy from a branch → `main` / root)
- **Design in Figma:** https://www.figma.com/design/m9PN26xtjHffV3s5cXyfS9

## Screens

| File | Screen |
|---|---|
| `index.html` | Home |
| `shop.html` | Shop, with profile filters |
| `product.html` | Coffee detail: grind, quantity and bar recipe |
| `visit.html` | Hours, "open now" status and a text menu |
| `subscribe.html` | Subscription builder |

## Responsive

Mobile first, with three layouts: phone (390 px, bottom navigation), tablet (700 px and up) and desktop (900 px and up, top navigation, hairline columns, two-column pages). Checked at 390, 820 and 1440 px with no horizontal overflow.

## Storytelling and motion

Inspired by the reference, and all of it honors `prefers-reduced-motion` (content simply shows, nothing is pinned or animated):

- Intro screen on the first visit of a session: "Coffee is understood cup by cup."
- Giant wordmark that rises into place, and a marquee strip.
- Manifesto that lights up word by word as you scroll.
- Pinned story "From bean to cup": four chapters (Farm, Roast, Bar, Community) driven by scroll, with a progress line.
- Fade-up reveals, hover states on cards and links, a header that hides on scroll down, light parallax on photos.
- "Invert" button (desktop header) that flips the color theme.

## Visual direction

Adjusted to the reference (santalarch.com): two neutrals (`#F0EFED` and `#0F0F0F`), large phrases in a light weight of a single sans-serif, numbered sections and plenty of air. The pink of the coffee bags (`#E8C6D6`) is the only accent. Typefaces: Archivo Black (logotype), Inter and Roboto Mono.

## Notes

- This is a prototype: there is no real checkout, and the photos are labelled placeholders.
- Missing facts appear in [brackets] (origin, altitude, prices, recipe, story text).
- Phase 1 of the project is a custom Tiendanube theme. The filters, the "open now" status and the subscription builder are phase 2 interactions.
- To test the responsive layouts, resize the browser: 390 px (phone), 820 px (tablet) and 1440 px (desktop).

## Photos and parallax depth

Product, bar and Coffee Run Club photos are hot-linked from the current store's CDN (coffeestylers.com), so the prototype shows real brand imagery. Before launch, download and host them, or replace them with a new shoot.

Parallax layers: photos drift and zoom inside their frames (`data-par`, `data-zoom`), the hero wordmark and alternate product cards float at different speeds (`data-lift`), and an outlined "Puro Flow — Los Prohibidos" line slides sideways as you scroll (`data-px`). All of it is off with `prefers-reduced-motion`.
