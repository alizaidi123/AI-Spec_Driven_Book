# Quickstart: Docusaurus Site for Physical AI & Humanoid Robotics Book

## Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Basic knowledge of MDX and React

## Setup Instructions

1. **Install Docusaurus**:
   ```bash
   npx create-docusaurus@latest humanoid-robotics-book classic
   cd humanoid-robotics-book
   ```

2. **Install additional dependencies**:
   ```bash
   npm install --save-dev @docusaurus/module-type-aliases @docusaurus/tsconfig @docusaurus/preset-classic
   ```

3. **Replace default content** with book chapters in `docs/` directory:
   - Create files: `01-introduction.mdx`, `02-embodiment.mdx`, etc.
   - Use proper frontmatter for each chapter

4. **Update sidebar configuration** in `sidebars.ts`:
   - List chapters in correct order (01-10)
   - Include proper labels and paths

5. **Customize homepage** in `src/pages/index.tsx`:
   - Replace default content with book title, tagline, and chapter grid
   - Implement chapter tiles with number, title, summary, and links

6. **Run the development server**:
   ```bash
   npm run start
   ```

## File Structure
```
humanoid-robotics-book/
├── docs/
│   ├── 01-introduction.mdx
│   ├── 02-embodiment.mdx
│   ├── 03-sensing-and-actuation.mdx
│   ├── 04-control-systems.mdx
│   ├── 05-locomotion.mdx
│   ├── 06-manipulation.mdx
│   ├── 07-perception.mdx
│   ├── 08-learning.mdx
│   ├── 09-safety.mdx
│   └── 10-deployment-and-tooling.mdx
├── src/
│   └── pages/
│       └── index.tsx
├── sidebars.ts
└── docusaurus.config.js
```

## Running the Site
- Development: `npm run start`
- Build: `npm run build`
- Serve build locally: `npm run serve`

## Key Constraints
- All content must be text-only (no images)
- Code examples must be in fenced code blocks
- No mathematical formatting (use plain text explanations)