# Analytics Events Reference

Custom events tracked via Vercel Analytics. Search the codebase with `grep track(` to find instrumentation points.

| Event | Properties | Triggered By | File |
|---|---|---|---|
| `contact_form_submitted` | `{ status: "success" \| "error" }` | Contact form submission | `src/components/ContactForm.tsx` |
| `franchise_form_step` | `{ step: number, from: number }` | Advancing to next step in franchise form | `src/app/franchise/apply/page.tsx` |
| `franchise_form_submitted` | `{ status: "success" \| "error", brand: string }` | Final form submission | `src/app/franchise/apply/page.tsx` |
| `franchise_cta` | `{ source: string, action: string, brand?: string }` | Any franchise CTA button click | Multiple components |
| `whatsapp_order` | `{ source: "navbar" \| "homepage" \| "brand_page", brand: string }` | WhatsApp order button click | Navbar, BrandsSection, BrandCTA |
| `brand_card_clicked` | `{ brand: string }` | Clicking a brand card on homepage | `src/components/BrandsSection.tsx` |
| `scroll_depth` | `{ percent: 25 \| 50 \| 75 \| 90 }` | Scroll milestones | `src/lib/use-scroll-depth.ts` |

## Adding a New Event

```tsx
import { track } from '@vercel/analytics';

track('event_name', { property: 'value' });
```

Events appear in Vercel Analytics dashboard under the "Events" tab.
