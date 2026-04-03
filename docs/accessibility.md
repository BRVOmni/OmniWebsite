# Accessibility Statement & Testing Procedure

## Accessibility Statement

Grupo Omniprise is committed to ensuring digital accessibility for people with disabilities. We continually improve the user experience for everyone and apply relevant accessibility standards.

### Conformance Status

The website targets **WCAG 2.1 Level AA** compliance.

### Current Measures

- **Color contrast:** All text meets 4.5:1 minimum contrast ratio against backgrounds
- **Keyboard navigation:** Full support — all interactive elements are reachable and operable via keyboard
- **Screen reader support:** Semantic HTML, proper ARIA attributes, meaningful alt text
- **Focus indicators:** Global `:focus-visible` ring (sky blue, 2px outline) on all interactive elements
- **Reduced motion:** `prefers-reduced-motion` respected across CSS animations, Framer Motion, and JS-driven counters
- **Skip link:** "Skip to content" link on every page for keyboard users
- **Modal dialogs:** Focus trap and Escape key handling on WorkModal and gallery lightbox
- **Form labels:** All form inputs have associated labels with Spanish error messages

### Known Limitations

- Gallery lightbox is not fully tested with screen readers (needs VoiceOver/NVDA testing)
- No high-contrast mode or text-resize controls beyond browser defaults
- Video content is not present; if added in the future, captions will be required

### Feedback

If you encounter accessibility barriers on our website, please contact us:

- **Email:** contacto@omniprise.com.py

We aim to respond to accessibility feedback within 5 business days.

---

## Testing Procedure

### Automated Testing

#### ESLint (every build)

`eslint-plugin-jsx-a11y` catches common issues at lint time:

```bash
cd Website
npm run lint
```

#### axe-core (recommended for E2E)

Integrate axe-core with Playwright to audit every page:

```ts
import { injectAxe, checkA11y } from 'axe-playwright';

test('homepage has no accessibility violations', async ({ page }) => {
  await page.goto('/');
  await injectAxe(page);
  await checkA11y(page, null, { detailedReport: true });
});
```

### Manual Testing Checklist

Run before every major release:

- [ ] **Keyboard navigation:** Tab through every page — all links, buttons, and form fields must be reachable
- [ ] **Focus indicators:** Verify `:focus-visible` ring appears on every interactive element
- [ ] **Skip link:** Press Tab on page load — "Skip to content" link should appear and work
- [ ] **Screen reader (VoiceOver/macOS):** Enable with Cmd+F5, navigate homepage and a brand detail page
- [ ] **Screen reader (NVDA/Windows):** Navigate homepage, franchise form, and gallery lightbox
- [ ] **Color contrast:** Run Lighthouse audit — contrast score should be 100
- [ ] **Reduced motion:** Enable "Reduce motion" in OS settings — verify no animations play
- [ ] **Mobile zoom:** Pinch-zoom to 200% — verify no content is clipped or overlapping
- [ ] **Form errors:** Submit franchise form with empty fields — verify Spanish error messages are announced by screen reader
- [ ] **Gallery lightbox:** Open lightbox, verify Escape closes it, arrow keys navigate, focus is trapped inside

### Recommended Tools

| Tool | Purpose |
|---|---|
| `eslint-plugin-jsx-a11y` | Static analysis (already in use) |
| Lighthouse | Page-level accessibility audit |
| axe DevTools (browser extension) | Interactive page auditing |
| VoiceOver (macOS) | Screen reader testing |
| NVDA (Windows) | Screen reader testing |
