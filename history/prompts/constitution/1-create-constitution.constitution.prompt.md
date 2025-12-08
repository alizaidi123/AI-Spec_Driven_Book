---
id: 1
title: Create constitution
stage: constitution
date: 2025-12-08
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: main
user: human
command: /sp.constitution
labels: [constitution, governance, setup]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - .specify/memory/constitution.md
tests:
 - none
---

## Prompt

Create project-wide rules for a 10-chapter technical book titled "Physical AI & Humanoid Robotics".

Constraints:
- Output only plain text and code blocks, no images, no diagrams, no special math formatting.
- Target: senior CS/EE students and practitioners who know Python and basic robotics.
- Tone: clear, practical, concise, slightly conversational, but academically trustworthy.
- Focus: physical AI concepts, humanoid hardware, control, perception, learning, safety, deployment.
- All examples and code must be coherent, self-contained, and implementation-focused.
- Avoid long repetitive introductions; prioritize actionable explanations and real-world context.
- Keep chapters roughly balanced in length.

## Response snapshot

Created a comprehensive constitution for the "Physical AI & Humanoid Robotics" book project with six core principles:

1. Technical Accuracy and Practical Implementation
2. Progressive Learning Structure
3. Implementation-First Approach
4. Hardware-Agnostic Design Patterns
5. Safety and Ethical Considerations
6. Reproducible Research and Documentation

The constitution also includes content standards, development process, and governance rules.

## Outcome

- ✅ Impact: Created foundational governance document for the book project
- 🧪 Tests: none
- 📁 Files: 1 file updated (.specify/memory/constitution.md)
- 🔁 Next prompts: Chapter development and implementation planning
- 🧠 Reflection: Constitution provides clear guidelines for maintaining technical accuracy and educational quality

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Begin chapter specification development