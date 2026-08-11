import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

// tailwind-merge's default config has no idea this project's compound
// typography scale (text-display/text-h1.../text-label — see the
// `--text-*` tokens in app/globals.css) exists. Left at its defaults, it
// silently drops one of two `text-*` classes whenever a size token
// (text-small) and a color token (text-accent, text-heading, ...) are
// merged together — it can't tell they're not actually conflicting (they
// set different CSS properties), so it keeps only whichever one appears
// last. That was a real, previously-unnoticed bug: e.g. `<CardTitle>`
// (`cn("text-h4 font-heading text-heading", className)`) was rendering at
// the browser's default font size everywhere, having quietly lost
// "text-h4" every time. Registering the scale as its own font-size group
// fixes it for every `cn()` call in the app, not just the ones already
// found.
const customTwMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        "text-display-xl",
        "text-display",
        "text-h1",
        "text-h2",
        "text-h3",
        "text-h4",
        "text-body-lg",
        "text-body",
        "text-small",
        "text-caption",
        "text-button",
        "text-label",
      ],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return customTwMerge(clsx(inputs))
}
