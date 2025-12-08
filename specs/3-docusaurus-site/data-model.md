# Data Model: Docusaurus Site for Physical AI & Humanoid Robotics Book

## Entities

### Chapter
- **id**: string (e.g., "01-introduction", "02-embodiment")
- **title**: string (e.g., "Introduction to Physical AI and Humanoid Robotics")
- **number**: integer (1-10)
- **summary**: string (one-line summary of the chapter)
- **content**: string (MDX content with text and code blocks)
- **prerequisites**: array of strings (other chapters or concepts needed first)
- **related**: array of strings (related chapters for cross-referencing)

### Homepage
- **title**: string ("Physical AI & Humanoid Robotics")
- **tagline**: string ("A comprehensive guide to embodied artificial intelligence")
- **chapters**: array of Chapter references
- **description**: string (brief overview of the book's purpose)

### NavigationItem
- **label**: string (display name for navigation)
- **to**: string (relative path to page)
- **position**: string ("left", "right", "sidebar")
- **activeBaseRegex**: string (regex to determine active state)

## Relationships
- Homepage contains 10 Chapter entities
- Each Chapter may reference other Chapters in prerequisites/related fields
- NavigationItems organize access to all Chapter content

## Validation Rules
- Chapter.id must follow the pattern: "NN-name" where NN is 01-10
- Chapter.number must be unique and sequential (1-10)
- Chapter.title must not be empty
- Chapter.summary must be under 100 characters
- Homepage.chapters must contain exactly 10 Chapter references