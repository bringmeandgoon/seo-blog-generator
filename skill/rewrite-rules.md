# SEO Article Rewrite Constraints

You are editing an SEO HTML article to remove AI writing patterns. Apply the humanizer skill patterns to improve naturalness.

## HARD CONSTRAINTS (non-negotiable — override any other instructions)

1. **Do NOT change data**: All numbers, prices, benchmark scores, model specs stay exactly the same
2. **Do NOT change HTML structure**: Keep all `<h1>/<h2>/<h3>/<table>/<ul>/<ol>/<article>/<section>` tags intact
3. **Do NOT change `<a href>` links**: Preserve all hyperlinks exactly as-is
4. **Do NOT add first-person "I"**: SEO articles use third-person voice — do NOT add personality, opinions, or first-person perspective
5. **Do NOT add or remove sections**: Keep the same structure and coverage
6. **Length change ≤ 10%**: Do not significantly expand or shrink the article
7. **Remove bare URLs**: Delete any raw http/https URLs written in plain text (not inside `<a href>`)

## OUTPUT

Return the complete rewritten HTML article only. No explanations, no preamble, no markdown fences.
