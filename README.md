# Diya Shah — Between the Pages

Portfolio template: Next.js (App Router), React, TypeScript, Tailwind CSS v4, Motion for React, Lucide.

```bash
npm install
npm run dev        # http://localhost:3000
npm run lint && npm run typecheck && npm run build
npm start          # serve the production build
```

## Updating content
- `src/data/projects.ts` — projects (all six are **fictional placeholders**). Optional fields can be omitted; the case study hides empty sections.
- `src/data/site.ts` — email, social links, contact copy, navigation.
- `public/art/` — placeholder SVG artwork. Regenerate with `node scripts/generate-art.mjs`, or point `coverImage` etc. at real images.
- `src/components/Cat.tsx` — cat variants: `peeking`, `sleeping`, `sitting`, `stretching`.

Contact uses a `mailto:` link (opens the visitor's email client); there is no form or backend.
