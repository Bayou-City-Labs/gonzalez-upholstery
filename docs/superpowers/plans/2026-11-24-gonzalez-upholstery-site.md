# Gonzalez Auto Upholstery Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a single-page Next.js brochure/lead-gen site for Gonzalez Auto Upholstery, styled by a new `gonzalez` theme on the shared `@ds/*` design system, with a contact form that writes leads to Postgres and emails a notification.

**Architecture:** A new sibling repo `~/Projects/gonzalez-upholstery-theme` defines the brand theme (`defineTheme`, contrast-gated) and builds it to one static `dist/gonzalez.css` file, exactly like `bcl-design-system` builds `dist/bcl.css`. That file is committed into this Next.js app as a static asset — the app has **no runtime `npm` dependency on `@ds/*`**, so deploys aren't affected by sibling-repo paths. All app markup is plain JSX using `.ds-*` classes (the design system's documented zero-build mode). The contact form is a Next.js server action that inserts into a Neon Postgres table and sends a Resend email.

**Tech Stack:** Next.js 16 (App Router, already scaffolded), TypeScript, `@ds/tokens`/`@ds/css`/`@ds/react` (theme-repo-only, via `file:` links), Storybook (theme repo only), Vitest, Neon Postgres (`@neondatabase/serverless`), Resend.

## Global Constraints

- No Tailwind, no hardcoded hex/px values in the app — only `.ds-*` classes and `var(--ds-*)` tokens (design system's AGENTS.md rule).
- Every theme must define every `ColorRoles` key for **both** light and dark schemes, and must pass `checkThemeContrast` (zero regressions) before the theme build succeeds.
- No star ratings, no review quotes, no invented testimonials/metrics anywhere on the site (spec rule, matches the design system's own "no fake content" rule).
- Address/phone/hours ship as real content (carhq.org values: 10730 Jones Rd, Houston, TX 77065; (832) 723-3036; Mon–Fri 8–6, Sat 8–1, closed Sun), with `// TODO: confirm NAP with client before launch` left as a source comment only — never rendered on the page.
- Creating the Neon project/database and the Resend account/API key are account-level actions — **pause and ask the user for explicit go-ahead before Task 10's Neon MCP calls**, and the user supplies the Resend API key (never generate or guess a real credential).

---

## Phase A — Theme repo (`~/Projects/gonzalez-upholstery-theme`)

### Task 1: Scaffold the theme repo structure

**Files:**
- Create: `~/Projects/gonzalez-upholstery-theme/package.json`
- Create: `~/Projects/gonzalez-upholstery-theme/tsconfig.base.json`
- Create: `~/Projects/gonzalez-upholstery-theme/tsconfig.json`
- Create: `~/Projects/gonzalez-upholstery-theme/.gitignore`
- Create: `~/Projects/gonzalez-upholstery-theme/packages/theme/package.json`
- Create: `~/Projects/gonzalez-upholstery-theme/packages/theme/tsconfig.build.json`
- Create: `~/Projects/gonzalez-upholstery-theme/vitest.config.ts`

**Interfaces:**
- Produces: a `@gonzalez/theme` npm workspace package at `packages/theme`, depending on `@ds/tokens`/`@ds/css`/`@ds/react` via `file:../../design-system/packages/*`.

- [ ] **Step 1: Create the directory and root `package.json`**

```bash
mkdir -p ~/Projects/gonzalez-upholstery-theme/packages/theme/src
mkdir -p ~/Projects/gonzalez-upholstery-theme/packages/theme/scripts
mkdir -p ~/Projects/gonzalez-upholstery-theme/packages/theme/test
cd ~/Projects/gonzalez-upholstery-theme
git init
```

Write `package.json`:

```json
{
  "name": "gonzalez-upholstery-theme",
  "version": "0.1.0",
  "private": true,
  "description": "Gonzalez Auto Upholstery — a brand theme (@gonzalez/theme) on top of the generic design system (@ds/*).",
  "type": "module",
  "workspaces": ["packages/theme"],
  "engines": { "node": ">=22.18" },
  "scripts": {
    "build": "npm run build -w @gonzalez/theme",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "test": "vitest run",
    "check": "npm run build && npm run typecheck && npm run test"
  },
  "dependencies": {
    "@ds/css": "file:../design-system/packages/css",
    "@ds/react": "file:../design-system/packages/react",
    "@ds/tokens": "file:../design-system/packages/tokens"
  },
  "devDependencies": {
    "@types/node": "^24",
    "@types/react": "^19.3.0",
    "@types/react-dom": "^19.2.3",
    "react": "^19.3.1",
    "react-dom": "^19.3.1",
    "typescript": "^5.9.3",
    "vitest": "^5.1.1"
  }
}
```

- [ ] **Step 2: Write `tsconfig.base.json`** (copied verbatim from `~/Projects/BayouCityLabs/bcl-design-system/tsconfig.base.json` — same compiler floor as the rest of the design system)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "resolveJsonModule": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

- [ ] **Step 3: Write `tsconfig.json`**

```json
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "noEmit": true,
    "allowImportingTsExtensions": true,
    "types": ["node", "vitest/globals"]
  },
  "include": ["packages/theme/src", "packages/theme/scripts", "packages/theme/test", "vitest.config.ts"]
}
```

- [ ] **Step 4: Write `.gitignore`**

```
node_modules/
dist/
*.log
```

- [ ] **Step 5: Write `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["packages/*/test/**/*.test.ts"],
  },
});
```

- [ ] **Step 6: Write `packages/theme/package.json`**

```json
{
  "name": "@gonzalez/theme",
  "version": "0.1.0",
  "description": "Gonzalez Auto Upholstery theme for the design system: tokens, fonts, and the stitch-line motif.",
  "type": "module",
  "sideEffects": ["*.css"],
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    },
    "./gonzalez.css": "./dist/gonzalez.css",
    "./theme.css": "./dist/theme.css",
    "./tokens.json": "./dist/tokens.json",
    "./fonts/*": "./dist/fonts/*"
  },
  "files": ["dist", "src"],
  "scripts": {
    "build": "tsc -p tsconfig.build.json && node scripts/build.ts"
  },
  "dependencies": {
    "@ds/css": "file:../../../design-system/packages/css",
    "@ds/react": "file:../../../design-system/packages/react",
    "@ds/tokens": "file:../../../design-system/packages/tokens",
    "@fontsource-variable/big-shoulders": "^5.3.0",
    "@fontsource-variable/work-sans": "^5.3.0"
  },
  "peerDependencies": {
    "react": ">=19"
  }
}
```

- [ ] **Step 7: Write `packages/theme/tsconfig.build.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "declaration": true,
    "noEmit": false,
    "types": []
  },
  "include": ["src"]
}
```

- [ ] **Step 8: Install dependencies and confirm the workspace resolves**

```bash
cd ~/Projects/gonzalez-upholstery-theme
npm install
```

Expected: completes with no errors (confirms `@fontsource-variable/big-shoulders` and `@fontsource-variable/work-sans` exist on the registry, and the `file:../design-system/packages/*` links resolve since `~/Projects/design-system` already exists and has been built — if `@ds/*` haven't been built yet, run `npm run build` in `~/Projects/design-system` first).

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "Scaffold gonzalez-upholstery-theme repo"
```

---

### Task 2: Define the Gonzalez theme tokens and pass the contrast gate

**Files:**
- Create: `packages/theme/src/theme.ts`
- Create: `packages/theme/test/theme.test.ts`

**Interfaces:**
- Consumes: `defineTheme`, `ColorRoles`, `checkThemeContrast`, `neutralTheme` from `@ds/tokens` (Task 1's dependency).
- Produces: `export const gonzalezTheme: ThemeDefinition` and `export const palette` from `theme.ts` — consumed by Task 3's build script and Task 4's `index.ts`.

- [ ] **Step 1: Write `packages/theme/src/theme.ts`**

```ts
/**
 * Gonzalez Auto Upholstery — a theme for the generic design system (@ds/*).
 * Deep garage-ink charcoal + cognac-leather accent + muted steel secondary.
 * Dark-first. Big Shoulders (headings) / Work Sans (body).
 * Edit values here, then `npm run build` (the build fails on contrast regressions).
 */
import { defineTheme } from "@ds/tokens";

export const palette = {
  /** Garage-ink charcoal — the base. 950 is near-black. */
  ink: {
    50: "#f6f6f6",
    100: "#eaeaea",
    200: "#cfcfd1",
    300: "#a8a9ac",
    400: "#7d7f83",
    500: "#5c5e62",
    600: "#454649",
    700: "#333436",
    800: "#232426",
    850: "#1a1b1c",
    900: "#131314",
    950: "#0c0c0d",
    1000: "#070708",
  },
  /** Cognac leather — the accent. 400 is the brand signal. */
  cognac: {
    50: "#fbf3ec",
    100: "#f4e1cd",
    200: "#e7c093",
    300: "#d99f60",
    400: "#c67e3c",
    500: "#a9632a",
    600: "#874d21",
    700: "#663a1a",
    800: "#482b15",
    900: "#2c1a0e",
  },
  /** Steel — secondary/info/links. */
  steel: {
    50: "#f2f4f5",
    100: "#e2e7ea",
    200: "#c3ccd2",
    300: "#9eaab2",
    400: "#798893",
    500: "#5c6b75",
    600: "#48545c",
    700: "#394248",
    800: "#2b3136",
    900: "#1e2225",
  },
  red: { 100: "#fde3df", 300: "#f6a39a", 400: "#ef7a6d", 500: "#e0533f", 600: "#c03d2b", 700: "#9a2f22", 800: "#6e2117", 900: "#3a140f" },
  green: { 100: "#dcf5e4", 300: "#8fdcaa", 400: "#5fc985", 500: "#3bab66", 600: "#2b8a50", 700: "#1f6b3d", 800: "#174d2d", 900: "#0e2e1b" },
  orange: { 100: "#feead9", 300: "#fbbf8a", 400: "#f89c58", 500: "#ec7b2f", 600: "#c95f1c", 700: "#984714", 800: "#6c3410", 900: "#3b1d09" },
  white: "#ffffff",
  black: "#000000",
} as const;

const p = palette;

export const gonzalezTheme = defineTheme({
  name: "gonzalez",
  label: "Gonzalez Auto Upholstery",
  defaultScheme: "dark",
  palette,
  colors: {
    dark: {
      bg: p.ink[950],
      surface: p.ink[900],
      "surface-raised": p.ink[850],
      "surface-sunken": p.ink[1000],
      overlay: "rgb(7 7 8 / 0.72)",
      border: p.ink[800],
      "border-strong": p.ink[700],
      "border-subtle": "#161617",
      text: p.ink[50],
      "text-muted": p.ink[300],
      "text-subtle": p.ink[500],
      "text-inverse": p.ink[950],
      "text-disabled": p.ink[600],
      hover: "rgb(246 246 246 / 0.06)",
      pressed: "rgb(246 246 246 / 0.10)",
      selected: "rgb(201 126 60 / 0.12)",
      accent: p.cognac[400],
      "accent-hover": p.cognac[300],
      "accent-active": p.cognac[500],
      "on-accent": p.ink[950],
      "accent-subtle": "rgb(198 126 60 / 0.14)",
      "accent-text": p.cognac[300],
      secondary: p.steel[400],
      "secondary-hover": p.steel[300],
      "on-secondary": p.ink[950],
      "secondary-subtle": "rgb(121 136 147 / 0.14)",
      "secondary-text": p.steel[300],
      link: p.steel[300],
      "link-hover": p.steel[200],
      focus: p.cognac[400],
      success: p.green[400],
      "success-subtle": "rgb(95 201 133 / 0.12)",
      "success-text": p.green[300],
      "success-border": "rgb(95 201 133 / 0.35)",
      warning: p.orange[400],
      "warning-subtle": "rgb(248 156 88 / 0.12)",
      "warning-text": p.orange[300],
      "warning-border": "rgb(248 156 88 / 0.35)",
      danger: p.red[400],
      "danger-hover": p.red[300],
      "on-danger": p.ink[950],
      "danger-subtle": "rgb(239 122 109 / 0.12)",
      "danger-text": p.red[300],
      "danger-border": "rgb(239 122 109 / 0.35)",
      info: p.steel[300],
      "info-subtle": "rgb(158 170 178 / 0.12)",
      "info-text": p.steel[200],
      "info-border": "rgb(158 170 178 / 0.35)",
    },
    light: {
      bg: p.ink[50],
      surface: p.white,
      "surface-raised": p.white,
      "surface-sunken": p.ink[100],
      overlay: "rgb(12 12 13 / 0.45)",
      border: p.ink[200],
      "border-strong": p.ink[300],
      "border-subtle": "#e2e2e3",
      text: p.ink[950],
      "text-muted": p.ink[600],
      "text-subtle": p.ink[500],
      "text-inverse": p.ink[50],
      "text-disabled": p.ink[300],
      hover: "rgb(12 12 13 / 0.05)",
      pressed: "rgb(12 12 13 / 0.09)",
      selected: "rgb(135 77 33 / 0.10)",
      accent: p.cognac[500],
      "accent-hover": p.cognac[600],
      "accent-active": p.cognac[700],
      "on-accent": p.white,
      "accent-subtle": p.cognac[50],
      "accent-text": p.cognac[700],
      secondary: p.steel[700],
      "secondary-hover": p.steel[800],
      "on-secondary": p.white,
      "secondary-subtle": p.steel[50],
      "secondary-text": p.steel[700],
      link: p.steel[700],
      "link-hover": p.steel[800],
      focus: p.cognac[600],
      success: p.green[600],
      "success-subtle": p.green[100],
      "success-text": p.green[700],
      "success-border": "rgb(43 138 80 / 0.35)",
      warning: p.orange[600],
      "warning-subtle": p.orange[100],
      "warning-text": p.orange[700],
      "warning-border": "rgb(201 95 28 / 0.35)",
      danger: p.red[600],
      "danger-hover": p.red[700],
      "on-danger": p.white,
      "danger-subtle": p.red[100],
      "danger-text": p.red[700],
      "danger-border": "rgb(192 61 43 / 0.35)",
      info: p.steel[700],
      "info-subtle": p.steel[50],
      "info-text": p.steel[700],
      "info-border": "rgb(57 66 72 / 0.35)",
    },
  },
  /** Stitch-line motif colors -> --ds-color-stitch / --ds-color-stitch-strong */
  extraColors: {
    dark: {
      stitch: p.ink[700],
      "stitch-strong": p.cognac[400],
    },
    light: {
      stitch: p.ink[200],
      "stitch-strong": p.cognac[500],
    },
  },
  shadows: {
    dark: {
      xs: "0 1px 0 0 rgb(0 0 0 / 0.25)",
      sm: "0 1px 2px 0 rgb(0 0 0 / 0.35), 0 0 0 1px rgb(246 246 246 / 0.03)",
      md: "0 4px 12px -2px rgb(0 0 0 / 0.45), 0 0 0 1px rgb(246 246 246 / 0.04)",
      lg: "0 12px 32px -8px rgb(0 0 0 / 0.55), 0 0 0 1px rgb(246 246 246 / 0.05)",
      xl: "0 24px 64px -16px rgb(0 0 0 / 0.65), 0 0 0 1px rgb(246 246 246 / 0.06)",
    },
    light: {
      xs: "0 1px 0 0 rgb(12 12 13 / 0.05)",
      sm: "0 1px 2px 0 rgb(12 12 13 / 0.08)",
      md: "0 4px 12px -2px rgb(12 12 13 / 0.10), 0 1px 3px rgb(12 12 13 / 0.06)",
      lg: "0 12px 32px -8px rgb(12 12 13 / 0.16), 0 2px 6px rgb(12 12 13 / 0.06)",
      xl: "0 24px 64px -16px rgb(12 12 13 / 0.22), 0 4px 12px rgb(12 12 13 / 0.08)",
    },
  },
  scales: {
    font: {
      display: '"Big Shoulders Variable", "Big Shoulders", ui-sans-serif, system-ui, sans-serif',
      body: '"Work Sans Variable", "Work Sans", ui-sans-serif, system-ui, sans-serif',
    },
  },
  aliases: {
    "radius-button": "var(--ds-radius-sm)",
    "radius-control": "var(--ds-radius-sm)",
    "heading-weight": "var(--ds-font-weight-bold)",
    "heading-tracking": "var(--ds-tracking-tight)",
  },
});
```

- [ ] **Step 2: Write `packages/theme/test/theme.test.ts`**

```ts
import { checkThemeContrast, neutralTheme } from "@ds/tokens";
import { describe, expect, it } from "vitest";
import { gonzalezTheme } from "../src/theme.ts";

describe("Gonzalez theme contrast", () => {
  for (const r of checkThemeContrast(gonzalezTheme)) {
    it(`${r.scheme}: ${r.fg} on ${r.bg} >= ${r.min} (${r.why})`, () => {
      expect(r.ratio, `${r.fg} on ${r.bg} = ${r.ratio}`).toBeGreaterThanOrEqual(r.min);
    });
  }
});

describe("theme contract", () => {
  it("defines every core color role in both schemes", () => {
    const core = Object.keys(neutralTheme.colors.light).sort();
    expect(Object.keys(gonzalezTheme.colors.light).sort()).toEqual(core);
    expect(Object.keys(gonzalezTheme.colors.dark).sort()).toEqual(core);
  });

  it("is dark-first with the cognac signal as accent", () => {
    expect(gonzalezTheme.defaultScheme).toBe("dark");
    expect(gonzalezTheme.colors.dark.accent).toBe("#c67e3c");
    expect(gonzalezTheme.colors.dark.bg).toBe("#0c0c0d");
  });

  it("provides the stitch motif colors", () => {
    expect(gonzalezTheme.extraColors?.dark?.stitch).toBeDefined();
    expect(gonzalezTheme.extraColors?.light?.["stitch-strong"]).toBeDefined();
  });
});
```

- [ ] **Step 3: Run the tests**

```bash
cd ~/Projects/gonzalez-upholstery-theme
npx vitest run
```

Expected: the "theme contract" tests PASS immediately. Some "Gonzalez theme contrast" sub-tests may FAIL — read each failure's reported `ratio` vs `min`.

- [ ] **Step 4: Fix any contrast failures**

For each failing pair, the fix is always the same shape: move the failing role to a lighter or darker step within its *own* hue scale (never change which hue is used) until the reported ratio clears `min`. For example, if `dark: text-subtle on bg` fails at `2.8 < 3`, change `"text-subtle": p.ink[500]` to `p.ink[600]` in `theme.ts` (darker moves it further from a near-black `bg`, which is backwards — move toward `ink[400]` instead, since `text-subtle` needs *more* separation from `bg`, i.e. lighter). Re-run `npx vitest run` after each change until all contrast tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/theme/src/theme.ts packages/theme/test/theme.test.ts
git commit -m "Add Gonzalez theme tokens, passing the contrast gate"
```

---

### Task 3: Build the theme to a single static CSS file

**Files:**
- Create: `packages/theme/scripts/build.ts`
- Create: `packages/theme/src/brand.css`
- Create: `packages/theme/src/index.ts`

**Interfaces:**
- Consumes: `gonzalezTheme` from `theme.ts` (Task 2), `checkThemeContrast`/`themeToCss`/`themeToDtcg` from `@ds/tokens`.
- Produces: `dist/gonzalez.css` (the file Task 5 copies into the Next.js app), `dist/theme.css`, `dist/tokens.json`, `dist/fonts/*`.

- [ ] **Step 1: Write `packages/theme/src/brand.css`** — the stitch-line motif

```css
/* Gonzalez stitch-line motif: a dashed seam used sparingly as a section divider/accent. */
.gonzalez-stitch {
  height: 1px;
  border: none;
  background-image: repeating-linear-gradient(
    to right,
    var(--ds-color-stitch-strong) 0,
    var(--ds-color-stitch-strong) 10px,
    transparent 10px,
    transparent 18px
  );
}

.gonzalez-stitch--subtle {
  background-image: repeating-linear-gradient(
    to right,
    var(--ds-color-stitch) 0,
    var(--ds-color-stitch) 8px,
    transparent 8px,
    transparent 16px
  );
}
```

- [ ] **Step 2: Write `packages/theme/src/index.ts`**

```ts
/**
 * @gonzalez/theme — Gonzalez Auto Upholstery on the generic design system.
 *
 *   import "@gonzalez/theme/gonzalez.css";   // core styles + Gonzalez tokens + fonts (one file)
 *   <hr className="gonzalez-stitch" />        // the stitch-line motif
 */
export { gonzalezTheme, palette } from "./theme.js";
```

- [ ] **Step 3: Write `packages/theme/scripts/build.ts`**

```ts
/**
 * Builds @gonzalez/theme:
 *   dist/theme.css    Gonzalez tokens (overrides core) + brand fonts + stitch motif CSS
 *   dist/gonzalez.css everything in one file: @ds/css (no core fonts) + theme.css
 *   dist/fonts/       Big Shoulders, Work Sans (variable, OFL)
 *   dist/tokens.json  DTCG export of the theme
 * Fails (exit 1) if any contrast pair regresses.
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { checkThemeContrast, themeToCss, themeToDtcg } from "@ds/tokens";
import { gonzalezTheme } from "../dist/theme.js";

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
mkdirSync(join(dist, "fonts"), { recursive: true });

/* ---------- contrast gate ---------- */
const fails = checkThemeContrast(gonzalezTheme).filter((r) => !r.pass);
if (fails.length) {
  for (const f of fails) console.error(`  ✗ ${f.scheme} ${f.fg} on ${f.bg}: ${f.ratio} < ${f.min} (${f.why})`);
  console.error(`@gonzalez/theme: ${fails.length} contrast failures`);
  process.exit(1);
}

/* ---------- fonts ---------- */
let fonts = "/* Gonzalez Auto Upholstery fonts (OFL) via @fontsource-variable. */\n";
for (const pkg of ["@fontsource-variable/big-shoulders", "@fontsource-variable/work-sans"]) {
  const dir = dirname(require.resolve(`${pkg}/package.json`));
  const css = readFileSync(join(dir, "index.css"), "utf8");
  for (const block of css.match(/\/\*[^*]*\*\/\s*@font-face\s*{[^}]*}/g) ?? []) {
    const files = [...block.matchAll(/url\(\.\/files\/([^)]+)\)/g)].map((m) => m[1]!);
    if (!files.some((f) => /(latin|latin-ext)-/.test(f))) continue;
    for (const f of files) if (existsSync(join(dir, "files", f))) copyFileSync(join(dir, "files", f), join(dist, "fonts", f));
    fonts += block.replaceAll("url(./files/", "url(./fonts/") + "\n";
  }
}

/* ---------- theme.css ---------- */
const brandCss = readFileSync(join(root, "src", "brand.css"), "utf8");
const themeCss = [
  themeToCss(gonzalezTheme, { banner: "@gonzalez/theme — Gonzalez Auto Upholstery tokens. GENERATED from src/theme.ts, do not edit." }),
  fonts,
  `@layer ds.components {\n${brandCss.trim()}\n}`,
].join("\n\n");
writeFileSync(join(dist, "theme.css"), themeCss + "\n");

/* ---------- gonzalez.css (single file) ---------- */
const core = readFileSync(require.resolve("@ds/css/nofonts.css"), "utf8");
writeFileSync(join(dist, "gonzalez.css"), `/*! Gonzalez Auto Upholstery — Design System | @ds/css + @gonzalez/theme */\n${core}\n${themeCss}\n`);
writeFileSync(join(dist, "tokens.json"), JSON.stringify(themeToDtcg(gonzalezTheme), null, 2));

const kb = (s: string) => `${(Buffer.byteLength(s) / 1024).toFixed(1)} kB`;
console.log(`@gonzalez/theme: contrast OK (${checkThemeContrast(gonzalezTheme).length} pairs), theme.css ${kb(themeCss)}, gonzalez.css ${kb(core + themeCss)} -> dist/`);
```

- [ ] **Step 4: Build and verify output**

```bash
cd ~/Projects/gonzalez-upholstery-theme
npm run build -w @gonzalez/theme
ls packages/theme/dist/
```

Expected: prints `@gonzalez/theme: contrast OK (... pairs), ...`, and `packages/theme/dist/gonzalez.css` plus `dist/fonts/*.woff2` exist.

- [ ] **Step 5: Commit**

```bash
git add packages/theme/scripts/build.ts packages/theme/src/brand.css packages/theme/src/index.ts
git commit -m "Build Gonzalez theme to a single static gonzalez.css"
```

---

## Phase B — App: wire the theme and build the static page

### Task 4: Copy the built theme CSS into the Next.js app and wire it into the layout

**Files:**
- Create: `/Users/sam/Projects/gonzalez-upholstery/src/app/gonzalez.css` (copied from the theme repo's build output)
- Create: `/Users/sam/Projects/gonzalez-upholstery/src/app/fonts/` (copied font files)
- Modify: `/Users/sam/Projects/gonzalez-upholstery/src/app/layout.tsx`
- Delete: `/Users/sam/Projects/gonzalez-upholstery/src/app/globals.css`, `/Users/sam/Projects/gonzalez-upholstery/src/app/page.module.css`

**Interfaces:**
- Produces: every later task's markup can use `.ds-*` classes and `var(--ds-*)` tokens, since `gonzalez.css` is loaded once at the root.

- [ ] **Step 1: Copy the built CSS and fonts**

```bash
cp ~/Projects/gonzalez-upholstery-theme/packages/theme/dist/gonzalez.css /Users/sam/Projects/gonzalez-upholstery/src/app/gonzalez.css
mkdir -p /Users/sam/Projects/gonzalez-upholstery/src/app/fonts
cp ~/Projects/gonzalez-upholstery-theme/packages/theme/dist/fonts/*.woff2 /Users/sam/Projects/gonzalez-upholstery/src/app/fonts/
```

- [ ] **Step 2: Fix font paths in the copied CSS**

The theme's `build.ts` emits font `url(./fonts/...)` relative to the theme repo's `dist/` — that's already correct relative to `src/app/`, since both place a `fonts/` directory as a sibling of the CSS file. No edit needed; verify with:

```bash
grep -o 'url(\./fonts/[^)]*)' /Users/sam/Projects/gonzalez-upholstery/src/app/gonzalez.css | head -5
```

Expected: a handful of `url(./fonts/....woff2)` lines, and those exact filenames exist in `src/app/fonts/`.

- [ ] **Step 3: Delete the unused default stylesheets**

```bash
rm /Users/sam/Projects/gonzalez-upholstery/src/app/globals.css
rm /Users/sam/Projects/gonzalez-upholstery/src/app/page.module.css
```

- [ ] **Step 4: Rewrite `layout.tsx`**

```tsx
import type { Metadata } from "next";
import "./gonzalez.css";

export const metadata: Metadata = {
  title: "Gonzalez Auto Upholstery | Houston, TX",
  description: "Family-owned auto upholstery in Houston, TX since 2007 — convertible tops, headliners, seats, custom interiors.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className="ds-text">{children}</body>
    </html>
  );
}
```

- [ ] **Step 5: Verify the dev server starts and the stylesheet loads**

```bash
cd /Users/sam/Projects/gonzalez-upholstery
npm run dev &
sleep 3
curl -s http://localhost:3000/gonzalez.css | head -c 200
curl -s http://localhost:3000/ | grep -o 'gonzalez.css' | head -1
kill %1
```

Expected: the `curl .../gonzalez.css` prints the `/*! Gonzalez Auto Upholstery ... */` banner, and the page HTML references the compiled CSS. (This is a build-wiring check only — load the page in a browser later, in Task 9's manual QA, to confirm fonts/colors render.)

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "Wire the Gonzalez theme CSS into the Next.js app layout"
```

---

### Task 5: Build the Hero, Services, and Footer sections

**Files:**
- Create: `/Users/sam/Projects/gonzalez-upholstery/src/app/components/Hero.tsx`
- Create: `/Users/sam/Projects/gonzalez-upholstery/src/app/components/Services.tsx`
- Create: `/Users/sam/Projects/gonzalez-upholstery/src/app/components/Footer.tsx`
- Create: `/Users/sam/Projects/gonzalez-upholstery/src/app/business-info.ts`

**Interfaces:**
- Produces: `BUSINESS` constant (name, address, phone, hours, services) from `business-info.ts`, imported by `Hero`, `Footer`, and Task 7's `Contact` section.

- [ ] **Step 1: Write `business-info.ts`** — single source of truth for NAP + services

```ts
// TODO: confirm NAP (address/phone/hours) with the client before launch.
// Sourced from carhq.org and Yahoo Local (2026-11-24); Yelp's own listing returned 403 on fetch.
export const BUSINESS = {
  name: "Gonzalez Auto Upholstery",
  tagline: "Family-owned auto upholstery in Houston since 2007.",
  phone: "(832) 723-3036",
  phoneHref: "tel:+18327233036",
  address: {
    street: "10730 Jones Rd",
    city: "Houston",
    state: "TX",
    zip: "77065",
  },
  hours: [
    { days: "Monday – Friday", time: "8:00 AM – 6:00 PM" },
    { days: "Saturday", time: "8:00 AM – 1:00 PM" },
    { days: "Sunday", time: "Closed" },
  ],
  services: [
    {
      name: "Convertible Tops",
      description: "Replacement and repair, including hydraulic system work for power tops.",
    },
    {
      name: "Headliners",
      description: "Clean, imperfection-free headliner replacement and repair.",
    },
    {
      name: "Seat Upholstery",
      description: "Seat repair and full reupholstery in the material of your choice.",
    },
    {
      name: "Door Panels",
      description: "Door panel upholstery repair and replacement to match your interior.",
    },
    {
      name: "Carpet",
      description: "Carpet replacement and repair for worn or damaged interiors.",
    },
    {
      name: "Dashboards",
      description: "Dashboard repair and restoration, from cracks to full re-covering.",
    },
    {
      name: "Custom Interiors",
      description: "Fully custom auto interiors built to your specification.",
    },
  ],
} as const;
```

- [ ] **Step 2: Write `components/Hero.tsx`**

```tsx
import { BUSINESS } from "../business-info";

export function Hero() {
  return (
    <section className="ds-section ds-container" style={{ paddingBlockStart: "var(--ds-space-24)" }}>
      <div className="ds-stack ds-gap-6" style={{ maxWidth: "42rem" }}>
        <span className="ds-eyebrow ds-eyebrow--accent">Houston, TX &middot; Since 2007</span>
        <h1 className="ds-display">{BUSINESS.name}</h1>
        <p className="ds-text ds-text--lg ds-text--muted">
          Convertible tops, headliners, seats, and custom interiors — family-owned,
          done right the first time.
        </p>
        <div className="ds-inline ds-gap-3">
          <a href="#contact" className="ds-button ds-button--primary ds-button--lg">
            Get a Quote
          </a>
          <a href={BUSINESS.phoneHref} className="ds-button ds-button--secondary ds-button--lg">
            Call {BUSINESS.phone}
          </a>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Write `components/Services.tsx`**

```tsx
import { BUSINESS } from "../business-info";

export function Services() {
  return (
    <section className="ds-section ds-container" id="services">
      <hr className="gonzalez-stitch" style={{ marginBottom: "var(--ds-space-12)" }} />
      <h2 className="ds-heading ds-heading--2xl" style={{ marginBottom: "var(--ds-space-8)" }}>
        Services
      </h2>
      <div className="ds-grid ds-grid--auto ds-gap-6" style={{ "--ds-grid-min": "16rem" } as React.CSSProperties}>
        {BUSINESS.services.map((service) => (
          <div key={service.name} className="ds-card ds-card--raised ds-card--spacious">
            <h3 className="ds-heading ds-heading--md" style={{ marginBottom: "var(--ds-space-2)" }}>
              {service.name}
            </h3>
            <p className="ds-text ds-text--sm ds-text--muted">{service.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Write `components/Footer.tsx`**

```tsx
import { BUSINESS } from "../business-info";

export function Footer() {
  return (
    <footer className="ds-container ds-section" style={{ paddingBlock: "var(--ds-space-12)" }}>
      <hr className="gonzalez-stitch gonzalez-stitch--subtle" style={{ marginBottom: "var(--ds-space-8)" }} />
      <div className="ds-inline ds-inline--between ds-gap-6">
        <div className="ds-stack ds-gap-1">
          <p className="ds-text ds-text--semibold">{BUSINESS.name}</p>
          <p className="ds-text ds-text--sm ds-text--muted">
            {BUSINESS.address.street}, {BUSINESS.address.city}, {BUSINESS.address.state} {BUSINESS.address.zip}
          </p>
          <a href={BUSINESS.phoneHref} className="ds-link ds-text--sm">
            {BUSINESS.phone}
          </a>
        </div>
        <div className="ds-stack ds-gap-1">
          {BUSINESS.hours.map((h) => (
            <p key={h.days} className="ds-text ds-text--sm ds-text--muted">
              {h.days}: {h.time}
            </p>
          ))}
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 5: Verify TypeScript compiles**

```bash
cd /Users/sam/Projects/gonzalez-upholstery
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/app/components/Hero.tsx src/app/components/Services.tsx src/app/components/Footer.tsx src/app/business-info.ts
git commit -m "Add Hero, Services, and Footer sections"
```

---

### Task 6: Build the Gallery and About sections

**Files:**
- Create: `/Users/sam/Projects/gonzalez-upholstery/src/app/components/Gallery.tsx`
- Create: `/Users/sam/Projects/gonzalez-upholstery/src/app/components/About.tsx`
- Create: `/Users/sam/Projects/gonzalez-upholstery/public/gallery/placeholder-1.svg` through `placeholder-6.svg`

**Interfaces:**
- Produces: no exports consumed elsewhere — these are leaf page sections, assembled by Task 8's `page.tsx`.

- [ ] **Step 1: Generate 6 placeholder gallery images** (flat-color SVG placeholders, clearly swappable later — avoids depending on an external stock-photo source)

```bash
mkdir -p /Users/sam/Projects/gonzalez-upholstery/public/gallery
for i in 1 2 3 4 5 6; do
cat > /Users/sam/Projects/gonzalez-upholstery/public/gallery/placeholder-$i.svg << EOF
<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480">
  <rect width="640" height="480" fill="#1a1b1c"/>
  <text x="320" y="240" fill="#7d7f83" font-family="sans-serif" font-size="24" text-anchor="middle">
    Project photo $i
  </text>
</svg>
EOF
done
```

- [ ] **Step 2: Write `components/Gallery.tsx`**

```tsx
import Image from "next/image";

const PLACEHOLDERS = [1, 2, 3, 4, 5, 6].map((i) => `/gallery/placeholder-${i}.svg`);

export function Gallery() {
  return (
    <section className="ds-section ds-container" id="gallery">
      <hr className="gonzalez-stitch" style={{ marginBottom: "var(--ds-space-12)" }} />
      <h2 className="ds-heading ds-heading--2xl" style={{ marginBottom: "var(--ds-space-8)" }}>
        Our Work
      </h2>
      <div className="ds-grid" data-cols-md data-cols-lg style={{ "--ds-grid-cols": 1, "--ds-grid-cols-md": 2, "--ds-grid-cols-lg": 3 } as React.CSSProperties}>
        {PLACEHOLDERS.map((src) => (
          <div key={src} className="ds-card" style={{ overflow: "hidden" }}>
            <Image src={src} alt="Gonzalez Auto Upholstery project" width={640} height={480} style={{ width: "100%", height: "auto", display: "block" }} />
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Write `components/About.tsx`**

```tsx
export function About() {
  return (
    <section className="ds-section ds-container" id="about">
      <hr className="gonzalez-stitch" style={{ marginBottom: "var(--ds-space-12)" }} />
      <div className="ds-stack ds-gap-4" style={{ maxWidth: "42rem" }}>
        <h2 className="ds-heading ds-heading--2xl">Family-Owned Since 2007</h2>
        <p className="ds-text ds-text--lg ds-text--muted">
          Gonzalez Auto Upholstery has been serving Houston drivers for nearly two
          decades. We handle everything from a single torn seat to a full custom
          interior build — and we&apos;ll give you a straight answer on what your
          vehicle actually needs before we start.
        </p>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
cd /Users/sam/Projects/gonzalez-upholstery
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/components/Gallery.tsx src/app/components/About.tsx public/gallery/
git commit -m "Add Gallery and About sections"
```

---

### Task 7: Build the contact form UI (client-side only, no backend yet)

**Files:**
- Create: `/Users/sam/Projects/gonzalez-upholstery/src/app/components/ContactForm.tsx`

**Interfaces:**
- Produces: a `<ContactForm />` component with `name="honeypot"` CSS-hidden field and `name`/`phone`/`email`/`jobType`/`message` fields — Task 10's server action reads these exact field names from `FormData`.

- [ ] **Step 1: Write `components/ContactForm.tsx`**

```tsx
"use client";

import { useState } from "react";
import { BUSINESS } from "../business-info";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    const form = e.currentTarget;
    const formData = new FormData(form);
    try {
      const res = await fetch("/api/leads", { method: "POST", body: formData });
      if (!res.ok) throw new Error("submit failed");
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="ds-card ds-card--raised ds-card--spacious">
        <p className="ds-text ds-text--lg">
          Thanks — we got your message and will reach out shortly. You can also call
          us directly at <a href={BUSINESS.phoneHref} className="ds-link">{BUSINESS.phone}</a>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="ds-stack ds-gap-4" style={{ maxWidth: "32rem" }}>
      {/* Honeypot: hidden from real users via CSS, bots that fill every field get rejected server-side. */}
      <div style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }} aria-hidden="true">
        <label>
          Leave this field blank
          <input type="text" name="honeypot" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="ds-field">
        <label className="ds-label" htmlFor="name">Name</label>
        <input className="ds-input" id="name" name="name" type="text" required />
      </div>

      <div className="ds-field">
        <label className="ds-label" htmlFor="phone">Phone</label>
        <input className="ds-input" id="phone" name="phone" type="tel" required />
      </div>

      <div className="ds-field">
        <label className="ds-label" htmlFor="email">
          Email <span className="ds-label__optional">(optional)</span>
        </label>
        <input className="ds-input" id="email" name="email" type="email" />
      </div>

      <div className="ds-field">
        <label className="ds-label" htmlFor="jobType">What do you need done?</label>
        <select className="ds-select__control" id="jobType" name="jobType" required defaultValue="">
          <option value="" disabled>Select one</option>
          <option value="convertible-top">Convertible Top</option>
          <option value="headliner">Headliner</option>
          <option value="seats">Seats</option>
          <option value="door-panels">Door Panels</option>
          <option value="carpet">Carpet</option>
          <option value="dashboard">Dashboard</option>
          <option value="custom-interior">Custom Interior</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="ds-field">
        <label className="ds-label" htmlFor="message">Message</label>
        <textarea className="ds-textarea" id="message" name="message" required />
      </div>

      <button type="submit" className="ds-button ds-button--primary ds-button--lg" disabled={status === "submitting"}>
        {status === "submitting" ? "Sending…" : "Send"}
      </button>

      {status === "error" && (
        <p className="ds-field-error">
          Something went wrong — please call us directly at {BUSINESS.phone}.
        </p>
      )}
    </form>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/sam/Projects/gonzalez-upholstery
npx tsc --noEmit
```

Expected: no errors (an `/api/leads` route doesn't exist yet — that's fine, `fetch` isn't type-checked against routes; Task 10 builds the actual endpoint).

- [ ] **Step 3: Commit**

```bash
git add src/app/components/ContactForm.tsx
git commit -m "Add contact form UI with honeypot field"
```

---

### Task 8: Assemble the page

**Files:**
- Modify: `/Users/sam/Projects/gonzalez-upholstery/src/app/page.tsx` (full rewrite)

**Interfaces:**
- Consumes: `Hero`, `Services`, `Gallery`, `About`, `ContactForm`, `Footer`, `BUSINESS` (all from Tasks 5–7).

- [ ] **Step 1: Rewrite `page.tsx`**

```tsx
import { About } from "./components/About";
import { ContactForm } from "./components/ContactForm";
import { Footer } from "./components/Footer";
import { Gallery } from "./components/Gallery";
import { Hero } from "./components/Hero";
import { Services } from "./components/Services";
import { BUSINESS } from "./business-info";

export default function Home() {
  return (
    <main>
      <Hero />
      <Services />
      <Gallery />
      <About />
      <section className="ds-section ds-container" id="contact">
        <hr className="gonzalez-stitch" style={{ marginBottom: "var(--ds-space-12)" }} />
        <h2 className="ds-heading ds-heading--2xl" style={{ marginBottom: "var(--ds-space-2)" }}>
          Get a Quote
        </h2>
        <p className="ds-text ds-text--muted" style={{ marginBottom: "var(--ds-space-8)" }}>
          Tell us what you need, or call us at {BUSINESS.phone}.
        </p>
        <ContactForm />
      </section>
      <Footer />
    </main>
  );
}
```

- [ ] **Step 2: Run the dev server and visually check the page**

```bash
cd /Users/sam/Projects/gonzalez-upholstery
npm run dev
```

Open `http://localhost:3000` in a browser. Expected: dark charcoal background, cognac-accented primary button, Big Shoulders headings, Work Sans body text, all six sections render in order, stitch-line dividers appear between sections, placeholder gallery images show, the contact form renders with all fields. Stop the dev server (Ctrl+C) when done.

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "Assemble the Gonzalez Auto Upholstery page"
```

---

## Phase C — Contact form backend (requires account setup)

### Task 9: Write and unit-test lead validation

**Files:**
- Create: `/Users/sam/Projects/gonzalez-upholstery/src/app/api/leads/validate.ts`
- Create: `/Users/sam/Projects/gonzalez-upholstery/src/app/api/leads/validate.test.ts`
- Create: `/Users/sam/Projects/gonzalez-upholstery/vitest.config.ts`
- Modify: `/Users/sam/Projects/gonzalez-upholstery/package.json` (add `vitest` devDependency and `test` script)

**Interfaces:**
- Produces: `validateLead(formData: FormData): { ok: true; lead: Lead } | { ok: false; error: string }` and `type Lead = { name: string; phone: string; email: string | null; jobType: string; message: string }` — consumed by Task 10's route handler.

- [ ] **Step 1: Add vitest to the app**

```bash
cd /Users/sam/Projects/gonzalez-upholstery
npm install -D vitest
```

Add to `package.json` `scripts`: `"test": "vitest run"`.

- [ ] **Step 2: Write `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: { environment: "node", globals: true },
});
```

- [ ] **Step 3: Write the failing test** `src/app/api/leads/validate.test.ts`

```ts
import { describe, expect, it } from "vitest";
import { validateLead } from "./validate";

function fd(entries: Record<string, string>) {
  const f = new FormData();
  for (const [k, v] of Object.entries(entries)) f.append(k, v);
  return f;
}

describe("validateLead", () => {
  it("accepts a complete, valid submission", () => {
    const result = validateLead(fd({ name: "Jane Doe", phone: "8325551234", email: "jane@example.com", jobType: "seats", message: "Need two front seats redone." }));
    expect(result).toEqual({
      ok: true,
      lead: { name: "Jane Doe", phone: "8325551234", email: "jane@example.com", jobType: "seats", message: "Need two front seats redone." },
    });
  });

  it("allows email to be omitted", () => {
    const result = validateLead(fd({ name: "Jane Doe", phone: "8325551234", email: "", jobType: "seats", message: "Need two front seats redone." }));
    expect(result).toEqual({ ok: true, lead: { name: "Jane Doe", phone: "8325551234", email: null, jobType: "seats", message: "Need two front seats redone." } });
  });

  it("rejects a submission with the honeypot filled in", () => {
    const result = validateLead(fd({ name: "Jane Doe", phone: "8325551234", email: "", jobType: "seats", message: "test", honeypot: "spam" }));
    expect(result).toEqual({ ok: false, error: "rejected" });
  });

  it("rejects a submission missing a required field", () => {
    const result = validateLead(fd({ name: "", phone: "8325551234", email: "", jobType: "seats", message: "test" }));
    expect(result).toEqual({ ok: false, error: "missing required field" });
  });
});
```

- [ ] **Step 4: Run the test to verify it fails**

```bash
npx vitest run src/app/api/leads/validate.test.ts
```

Expected: FAIL with "Cannot find module './validate'".

- [ ] **Step 5: Write `src/app/api/leads/validate.ts`**

```ts
export type Lead = {
  name: string;
  phone: string;
  email: string | null;
  jobType: string;
  message: string;
};

export type ValidationResult = { ok: true; lead: Lead } | { ok: false; error: string };

export function validateLead(formData: FormData): ValidationResult {
  if (String(formData.get("honeypot") ?? "").length > 0) {
    return { ok: false, error: "rejected" };
  }

  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const jobType = String(formData.get("jobType") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const emailRaw = String(formData.get("email") ?? "").trim();

  if (!name || !phone || !jobType || !message) {
    return { ok: false, error: "missing required field" };
  }

  return { ok: true, lead: { name, phone, email: emailRaw.length > 0 ? emailRaw : null, jobType, message } };
}
```

- [ ] **Step 6: Run the test to verify it passes**

```bash
npx vitest run src/app/api/leads/validate.test.ts
```

Expected: PASS (4 tests).

- [ ] **Step 7: Commit**

```bash
git add src/app/api/leads/validate.ts src/app/api/leads/validate.test.ts vitest.config.ts package.json package-lock.json
git commit -m "Add and test lead validation"
```

---

### Task 10: Create the Neon database and `leads` table

> **STOP before this task's MCP calls.** Creating a Neon project is an account-level, shared-resource action. Ask the user to confirm before running `mcp__Neon__create_project` — do not proceed on an implied yes.

**Files:**
- Create: `/Users/sam/Projects/gonzalez-upholstery/.env.local` (not committed — contains the Neon connection string)
- Modify: `/Users/sam/Projects/gonzalez-upholstery/.gitignore` (confirm `.env*.local` is already ignored)

**Interfaces:**
- Produces: a Postgres `leads` table (`id serial primary key, name text, phone text, email text, job_type text, message text, created_at timestamptz default now()`) and a `DATABASE_URL` environment variable — consumed by Task 11's route handler.

- [ ] **Step 1: Ask the user to confirm creating a new Neon project** for this site (e.g. named `gonzalez-upholstery`). Wait for an explicit yes before continuing.

- [ ] **Step 2: Create the project** (after confirmation) using the Neon MCP tool, then get its connection string.

```
mcp__Neon__create_project with name "gonzalez-upholstery"
mcp__Neon__get_connection_string for the new project's default branch/database
```

- [ ] **Step 3: Create the `leads` table** via `mcp__Neon__run_sql`:

```sql
create table leads (
  id serial primary key,
  name text not null,
  phone text not null,
  email text,
  job_type text not null,
  message text not null,
  created_at timestamptz not null default now()
);
```

- [ ] **Step 4: Verify the table exists**

```
mcp__Neon__get_database_tables for the project
```

Expected: `leads` appears in the list.

- [ ] **Step 5: Confirm `.gitignore` already excludes env files**

```bash
grep -n "\.env" /Users/sam/Projects/gonzalez-upholstery/.gitignore
```

Expected: a line matching `.env*.local` or similar (the default `create-next-app` `.gitignore` already includes this — if missing, add `.env*.local`).

- [ ] **Step 6: Write `.env.local`** with the connection string from Step 2 (never commit this file):

```
DATABASE_URL=<connection string from Step 2>
```

No commit for this step — `.env.local` must stay untracked. If `.gitignore` needed the line added in Step 5, commit only that:

```bash
git add .gitignore
git commit -m "Ensure .env.local is gitignored" --allow-empty
```

---

### Task 11: Build the `/api/leads` route (DB insert + Resend email)

**Files:**
- Create: `/Users/sam/Projects/gonzalez-upholstery/src/app/api/leads/route.ts`
- Modify: `/Users/sam/Projects/gonzalez-upholstery/package.json` (add `@neondatabase/serverless` and `resend` dependencies)

**Interfaces:**
- Consumes: `validateLead` and `Lead` from `./validate` (Task 9), `DATABASE_URL` and `RESEND_API_KEY` env vars.
- Produces: `POST /api/leads` — consumed by `ContactForm.tsx` (Task 7)'s `fetch("/api/leads", ...)`.

- [ ] **Step 1: Ask the user for a Resend API key** (they create the Resend account and key themselves — this plan never generates or guesses a real credential). Once supplied, add it to `.env.local`:

```
RESEND_API_KEY=<key the user supplies>
LEAD_NOTIFICATION_EMAIL=<email address the user wants leads sent to>
```

- [ ] **Step 2: Install dependencies**

```bash
cd /Users/sam/Projects/gonzalez-upholstery
npm install @neondatabase/serverless resend
```

- [ ] **Step 3: Write `src/app/api/leads/route.ts`**

```ts
import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { validateLead } from "./validate";

export async function POST(request: Request) {
  const formData = await request.formData();
  const result = validateLead(formData);

  if (!result.ok) {
    // The honeypot case and the missing-field case both get a generic 400 —
    // never tell a bot which check it tripped.
    return NextResponse.json({ error: "invalid submission" }, { status: 400 });
  }

  const { lead } = result;
  const sql = neon(process.env.DATABASE_URL!);
  await sql`
    insert into leads (name, phone, email, job_type, message)
    values (${lead.name}, ${lead.phone}, ${lead.email}, ${lead.jobType}, ${lead.message})
  `;

  // Lead is saved. An email failure here must not fail the response.
  try {
    const resend = new Resend(process.env.RESEND_API_KEY!);
    await resend.emails.send({
      from: "Gonzalez Auto Upholstery <leads@gonzalezautoupholstery.com>",
      to: process.env.LEAD_NOTIFICATION_EMAIL!,
      subject: `New lead: ${lead.name} (${lead.jobType})`,
      text: `Name: ${lead.name}\nPhone: ${lead.phone}\nEmail: ${lead.email ?? "(not provided)"}\nJob type: ${lead.jobType}\nMessage: ${lead.message}`,
    });
  } catch (err) {
    console.error("Resend notification failed (lead was saved):", err);
  }

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Manual end-to-end test**

```bash
npm run dev
```

In a browser, submit the contact form on `http://localhost:3000#contact` with real-looking test data. Expected: the form shows the "Thanks — we got your message" success state, a new row appears in Neon's `leads` table (verify with `mcp__Neon__run_sql`: `select * from leads order by created_at desc limit 1;`), and the notification email arrives at `LEAD_NOTIFICATION_EMAIL`.

- [ ] **Step 6: Commit**

```bash
git add src/app/api/leads/route.ts package.json package-lock.json
git commit -m "Wire the contact form to Neon and Resend"
```

---

## Self-Review Notes

- **Spec coverage:** Theme repo + deploy-safe CSS (Tasks 1–4), visual direction/palette/type/motif (Task 2–4), all six page sections with real business facts (Tasks 5–8), contact form client UI + honeypot (Task 7), server-side validation + DB + email with the documented failure handling (Tasks 9–11), NAP source comment (Task 5 Step 1), account-action gating (Tasks 10–11). No map embed, no multi-page routing, no CMS — matches "Out of scope."
- **Type consistency:** `Lead`/`ValidationResult` defined once in `validate.ts` (Task 9) and imported, never redefined, in `route.ts` (Task 11). Field names (`name`, `phone`, `email`, `jobType`, `message`, `honeypot`) are identical across `ContactForm.tsx` (Task 7), `validate.ts` (Task 9), and `route.ts` (Task 11).
- **No placeholders:** every step has runnable commands and complete code; the two spec-flagged "unconfirmed" facts (address, contrast values) are handled as concrete, re-runnable verification loops (Task 2 Step 4, Task 10 NAP note), not deferred TODOs in the plan itself.
