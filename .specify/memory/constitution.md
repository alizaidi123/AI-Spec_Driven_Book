<!-- SYNC IMPACT REPORT:
Version change: N/A (initial) → 1.0.0
Modified principles: N/A
Added sections: All principles and sections (initial constitution)
Removed sections: None
Templates requiring updates: N/A
Follow-up TODOs: None
-->

# Physical AI & Humanoid Robotics Book Constitution

## Core Principles

### I. Technical Accuracy and Practical Implementation
All content must be technically accurate, verified through implementation or simulation, and represent current best practices in humanoid robotics and physical AI. Code examples must be coherent, self-contained, and tested for correctness. Theoretical concepts must be grounded in practical applications that readers can implement themselves.

### II. Progressive Learning Structure
Content must follow a logical progression from foundational concepts to advanced implementations, with each chapter building upon previous material. Mathematical concepts should be introduced as needed rather than upfront, and all examples must be accessible to senior CS/EE students with Python knowledge. Cross-references between chapters must be explicit and helpful.

### III. Implementation-First Approach
Every concept must be demonstrated through concrete, runnable code examples that readers can execute and modify. Code must be well-documented, follow Python best practices, and include error handling where appropriate. Simulation environments and real hardware considerations must be clearly distinguished, with safety guidelines emphasized for physical implementations.

### IV. Hardware-Agnostic Design Patterns
Examples and architectures should emphasize reusable design patterns that work across different humanoid platforms. When platform-specific code is necessary, it must be clearly isolated and alternatives documented. The focus should be on transferable skills and concepts rather than vendor-specific implementations.

### V. Safety and Ethical Considerations
All physical AI and humanoid implementations must include explicit safety considerations and ethical implications. Code examples must include safety checks, bounds validation, and emergency stop mechanisms where applicable. Discussion of societal impact and responsible AI development must be integrated throughout rather than isolated to a single chapter.

### VI. Reproducible Research and Documentation
All experiments, simulations, and results presented in the book must be reproducible with provided code and configurations. Dependencies must be clearly specified, version-controlled, and installation procedures documented. Figures, tables, and experimental results must include sufficient detail for readers to reproduce them independently.

## Content Standards and Constraints
All content must target senior CS/EE students and practitioners familiar with Python and basic robotics concepts. Mathematical notation must be consistent throughout the book, with symbols defined locally when first used and in a comprehensive glossary. All code examples must be licensed appropriately for educational use and avoid proprietary algorithms or trade secrets.

## Development and Review Process
All chapters must undergo technical review by subject matter experts in robotics and AI. Code examples must be tested in simulation environments before publication. Each chapter must include exercises and practical projects that reinforce the concepts taught. Peer review must verify both technical accuracy and pedagogical effectiveness.

## Governance
This constitution governs all aspects of the Physical AI & Humanoid Robotics book development. All contributions must comply with these principles. Amendments require documentation of rationale and approval by the editorial board. All pull requests must verify compliance with these principles before merging.

## Additional Project Rules for AI-Spec_Driven_Book

### I. Spec-Driven Development Process
No vibe coding: every change must be driven by spec → plan → tasks → implement. All development must follow this strict sequence with formal documentation at each stage.

### II. System Architecture
Keep frontend static (Docusaurus/Vercel). Backend is a separate FastAPI service. Never expose secrets in frontend. All OpenAI/Qdrant/Neon credentials stay server-side.

### III. RAG System Requirements
RAG answers must cite sources (chapter filename + section heading if available). Add "Selection-only mode": when user provides selected text, the assistant must answer using only that text; if not answerable, say so.

### IV. Resource Constraints
Keep everything lightweight for free-tier deployment. No images and no LaTeX/math rendering in chatbot responses.

**Version**: 1.0.0 | **Ratified**: 2025-12-08 | **Last Amended**: 2025-12-16
