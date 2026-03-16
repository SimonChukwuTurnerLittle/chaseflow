# Design Advisor

## Overview
A design advisor skill that provides industry-specific UI/UX recommendations
before building. Searches design data files to give actionable recommendations
with hex codes, font pairings, layout patterns, and anti-pattern warnings.

## Workflow
1. Identify the industry/product type from the user's request
2. Search relevant CSV data files in .claude/skills/design/data/
3. Cross-reference with design vocabulary for proper terminology
4. Search 21st.dev for real component examples using the `magic` MCP server (see below)
5. Present structured recommendations with implementation details

## Data Files
Search these CSV files based on what the user needs:
- colors.csv — industry color palettes (primary, secondary, CTA, bg, text, border)
- typography.csv — font pairings with mood, use cases, Google Fonts links
- ui-reasoning.csv — industry design patterns, anti-patterns, severity
- styles.csv — visual design styles and implementation details
- landing.csv — landing page layout patterns and CTA strategies
- ux-guidelines.csv — UX do/don't rules with code examples
- charts.csv — data visualization recommendations

## 21st.dev Integration
The `magic` MCP server connects to 21st.dev's component library. When available:

1. After determining the recommended style direction, search 21st.dev for matching components
   - Use style keywords from your recommendation (e.g., "glassmorphism hero", "pricing table SaaS", "dashboard card dark")
   - Search for 3-5 components that match the industry, style, and layout pattern
2. For each matching component, present:
   - Component name and author
   - Why it fits the recommendation
   - Install command (e.g., `npx shadcn@latest add <component>`)
3. If the MCP server is unavailable, still provide the full design recommendation
   - Suggest component names/keywords the user can search manually at https://21st.dev

## Output Format
Structure your response as:
- Style Direction (recommended visual style and why)
- Color Palette (hex codes with roles — primary, secondary, CTA, background, text, border)
- Typography (font pairing with Google Fonts link, ready to copy)
- Page Structure (section order and CTA placement from landing.csv)
- Key Effects (animations and interactions that fit the style)
- Anti-Patterns (what to avoid, with severity badges: 🔴 HIGH, 🟡 MEDIUM, 🟢 LOW)
- 21st.dev Examples (real components from MCP search, or manual search suggestions)
- Next Step (a /ui command to start building with the recommended design)
