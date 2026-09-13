# Course Platform: Product & Implementation Specification

## 1. Objective

Build the complete course platform from start to finish as a polished, production-ready product.

The implementation should not stop at a basic MVP if important pieces are missing. Make sensible product and engineering decisions independently, fill gaps, fix inconsistencies, and complete anything required for the final experience to be delivered directly to students.

The result should feel like a real school-built product, not an AI-generated template.

---

## 2. Account & Authentication

### Authentication model

Use a **pre-registered account system only**.

- Do **not** use Microsoft authentication.
- Do **not** use GEMS ID / Microsoft credentials.
- Do **not** require students to register themselves.
- Students should receive an account that has already been created for them.
- Login should use a simple:
  - Email / username
  - Password
- The school/admin side should be able to create and manage student accounts.
- Never request, store, or require a master list of existing school passwords.
- Passwords must be securely hashed.
- Implement normal secure session handling, logout, password-reset/recovery flow where appropriate, and protection against obvious authentication abuse.

The student experience should be extremely simple: receive their account details, open the platform, log in, and start their assigned courses.

---

## 3. Course Experience

The existing course structure should remain broadly intact, but the interface and presentation should be substantially improved.

Each course should support:

- Course overview
- Sections/modules
- Lessons
- Text content
- Images
- Audio
- Video
- Questions/assessments
- Progress tracking
- Completion state
- Final assessment where applicable
- Certificate eligibility
- Certificate generation
- Certificate verification

Content should be structured cleanly so additional courses can be added later without rewriting the application.

---

## 4. Media Completion Verification

The platform must prevent students from simply clicking through lessons and using AI to answer questions without actually engaging with the course.

### Video

For every required video:

- Track playback progress.
- Determine the percentage watched.
- A video should only count as completed after the student has watched the required majority of it.
- Target threshold: **90% watched** unless a course explicitly specifies another threshold.
- Do not count simply loading the video as completion.
- Where technically practical, account for seeking/skipping so students cannot jump to the end and immediately receive completion credit.
- Store video completion data in the database.

### Audio

Where audio is required:

- Track meaningful playback/completion.
- Store completion state.
- Prevent a simple page visit from counting as completion.

### Text / Reading

For substantial reading sections:

- Track the student's time spent on the relevant lesson/section.
- Enforce a **minimum 30-second dwell time** for substantial text sections.
- Completion should require both:
  - the student reaching the relevant content/end of the section, and
  - the minimum dwell-time requirement being satisfied.
- Do not make the timer trivially bypassable by clicking rapidly through the interface.
- Store reading/completion information in the database.

These checks should improve genuine course engagement without making the platform frustrating or excessively restrictive.

---

## 5. Assessments

Assessments should be integrated naturally into the course rather than feeling like a separate generic quiz system.

Track:

- Questions attempted
- Correct answers
- Incorrect answers
- Score
- Percentage
- Attempts
- Completion status
- Time/date of attempts
- Course and lesson association
- Relevant assessment metadata

The system should calculate scores reliably on the server side wherever appropriate.

Do not rely entirely on client-side scoring.

---

## 6. Student Data & External Database

All important student and course information must persist in a **real external production database**.

Do not use:

- localhost-only storage
- temporary in-memory state
- fragile local JSON files
- browser localStorage as the source of truth
- databases that disappear after deployment/reset
- development-only persistence

Preferred database:

- PostgreSQL

A managed PostgreSQL provider is acceptable and preferred if it simplifies deployment and maintenance.

The database should persist at minimum:

### Student

- Student ID
- Name
- Email/username
- Account status
- Assigned courses
- Course progress
- Completion status
- Scores
- Assessment history
- Certificate information
- Relevant timestamps
- Leaderboard information where applicable

### Course progress

- Course ID
- Student ID
- Current section/lesson
- Lessons completed
- Media completion
- Video watch percentage
- Reading dwell/completion status
- Assessment attempts
- Overall percentage
- Completion date

### Certificates

- Certificate ID
- Student ID
- Student name
- Course
- Completion date
- Certificate status
- Verification ID/token
- Certificate URL
- PDF location/reference
- Issued timestamp

Use proper relational structure, indexes, constraints, and secure access patterns.

The system should be designed so data remains available after redeployments, server restarts, or resets.

---

## 7. Certificates

Students must retain a **PDF certificate option**.

The certificate should be:

- Downloadable
- Printable
- Suitable for keeping as a school record
- Professionally designed
- Consistent with the school's visual identity

### Verification

Use one of these approaches, selecting the most practical and sustainable option:

1. A very low-cost/free external certificate verification service such as Credly, if its available API/workflow and pricing make sense.
2. A custom certificate verification system built directly into this website.

Do not introduce an expensive service unnecessarily.

### Preferred custom verification behavior

If using the custom system:

Each certificate receives a unique verification ID/token.

The certificate contains a verification link such as:

`https://[platform-domain]/verify/[certificate-id]`

When someone opens the link, the website should display a clean verification page confirming that the certificate is genuine and issued by the school.

The verification page should show only appropriate verification information, such as:

- Certificate status
- Student name
- Course/program name
- Completion/issue date
- Certificate ID
- Issuing school/organization

Do not expose unnecessary private student information.

### Automated certificate creation

The system should automatically generate the certificate when all completion requirements are satisfied.

The certificate generation system should dynamically insert:

- Student name
- Course name
- Completion date
- Certificate ID
- Verification information
- School branding

The PDF and verification record should be generated without requiring manual intervention for every student.

If an external certificate platform is used, integrate its API/workflow cleanly. If that creates unnecessary cost or complexity, use the custom verification system.

---

## 8. Leaderboard

Include a simple leaderboard if it fits the course structure.

It should be useful without turning the platform into a noisy gamification dashboard.

Possible ranking factors:

- Score
- Completed courses
- Progress
- Achievement points, if appropriate

Keep it restrained.

The leaderboard should not dominate the UI or make the product feel like a game.

---

## 9. Visual Design Direction

This is extremely important.

Create and follow a dedicated **design system** for the entire application.

The interface should look:

- Modern
- Polished
- Calm
- Professional
- School-appropriate
- Premium
- Consistent
- Human-designed

It should **not** look like:

- A generic AI dashboard
- A copied SaaS template
- A collection of random cards
- An over-engineered futuristic AI interface
- A maximalist gamification platform
- A page filled with gradients, glassmorphism, glowing effects, or unnecessary animations

### Design principles

- Strong typography hierarchy
- Excellent spacing
- Consistent component system
- Clear navigation
- Subtle visual hierarchy
- Purposeful use of color
- Good empty states
- Clear progress indicators
- Responsive design
- Accessible contrast
- Thoughtful loading/error states
- Small, meaningful animations only where they improve usability

Use cards only when they improve information hierarchy.

Avoid putting everything inside a card.

Avoid excessive rounded containers.

Avoid excessive shadows.

Avoid unnecessary badges.

Avoid decorative UI that does not communicate anything.

The final product should feel deliberately designed rather than generated.

---

## 10. Required Design System Markdown

Create a dedicated `DESIGN_SYSTEM.md` file and treat it as a **source of truth** for the frontend.

Before implementing or modifying UI, follow this document.

It should define:

### Brand

- Product personality
- Visual tone
- Color palette
- Typography
- Logo/branding treatment
- Icon style
- Image treatment

### Layout

- Page width
- Grid system
- Spacing scale
- Section spacing
- Navigation dimensions
- Mobile behavior

### Components

Define visual and interaction rules for:

- Buttons
- Inputs
- Forms
- Navigation
- Course cards
- Lesson pages
- Progress indicators
- Video players
- Audio players
- Assessment questions
- Score displays
- Certificates
- Tables
- Leaderboards
- Alerts
- Modals
- Empty states
- Loading states
- Error states

### Interaction

Define:

- Hover behavior
- Focus behavior
- Active states
- Disabled states
- Transitions
- Loading behavior
- Success/error feedback

### Content

Define:

- Heading hierarchy
- Body text
- Captions
- Labels
- Helper text
- Error messages
- Button wording

The design system should be practical enough that another developer can build a new page and have it visually match the rest of the product.

**Do not deviate from `DESIGN_SYSTEM.md` unless there is a strong product reason to update the design system itself.**

---

## 11. Admin / School Management

The platform should include whatever basic administration functionality is necessary to operate the system without developer intervention.

At minimum, consider:

- Create student accounts
- Manage students
- Assign courses
- View progress
- View scores
- View completion
- View issued certificates
- Access certificate verification information
- Manage course content where appropriate

Do not overbuild the admin panel.

Build only what is necessary for the school to operate the platform reliably.

---

## 12. Reliability & Security

The application should be production-ready.

Implement sensible:

- Authentication security
- Authorization
- Server-side validation
- Input validation
- Database constraints
- Error handling
- Secure password storage
- API protection
- Rate limiting where appropriate
- Secure environment variables
- Proper deployment configuration
- Database migrations
- Logging
- Backup-friendly persistence

Never expose secrets in frontend code.

Never hardcode production credentials.

Do not use fake persistence merely to make the demo appear functional.

---

## 13. Deployment

The application should be deployable without requiring me to manually repair unfinished infrastructure.

Choose practical, low-cost infrastructure.

The system should include:

- Frontend deployment
- Backend/API deployment if required
- Managed PostgreSQL
- Environment variable configuration
- Database migration/setup
- Production build configuration
- Seed/admin setup where necessary

Prefer free or extremely low-cost services where they are reliable enough for the expected usage.

Do not select expensive infrastructure just because it is convenient.

---

## 14. Autonomous Completion Requirement

This is a critical requirement.

When given this specification, **do not stop after implementing only the obvious features**.

Work through the product from beginning to end and identify anything missing that would prevent it from being a complete deliverable.

Make reasonable decisions independently.

If a requirement is ambiguous:

1. Choose the most sensible option.
2. Prefer the simplest reliable implementation.
3. Prefer low-cost infrastructure.
4. Prefer maintainability.
5. Prefer the student experience.
6. Do not stop and ask for approval unless the decision genuinely requires information that cannot be inferred.

If something is technically incomplete, implement the missing piece.

If something is visually inconsistent, fix it.

If a page needs loading/error/empty states, add them.

If an API needs validation, add it.

If the database needs another table or relationship, create it.

If a certificate flow needs verification, complete it.

If deployment requires configuration, provide it.

If a user journey has a dead end, fix it.

The goal is a **finished product**, not a partially implemented codebase.

---

## 15. Quality-Control Pass

Before considering the product complete, perform a full end-to-end review.

Test the complete flow:

1. Student account is pre-created.
2. Student logs in with email/username and password.
3. Student sees assigned courses.
4. Student opens a course.
5. Student reads required content.
6. Reading dwell time is tracked.
7. Student watches required media.
8. Video progress is tracked.
9. Student completes assessments.
10. Scores are calculated and persisted.
11. Course progress is persisted.
12. Student reaches completion.
13. Certificate is automatically generated.
14. PDF certificate can be downloaded/printed.
15. Certificate has a verification ID/link.
16. Verification page correctly confirms authenticity.
17. Student data survives refresh/redeployment.
18. Leaderboard updates where applicable.
19. Admin can inspect student progress.
20. Unauthorized users cannot access protected student/admin information.

Fix any issues discovered during this process.

---

## 16. Final Product Standard

The final result should feel like a real, carefully designed educational platform that a school could confidently give to students.

The priorities are:

**Reliability > usability > visual quality > unnecessary features.**

Keep the product focused.

Add small useful features when they genuinely improve the experience, but do not turn the interface into a feature museum.

The final implementation should be polished enough to hand directly to the student/user with no obvious unfinished sections.

---

## 17. Implementation Decision Rule

When choosing between multiple technically valid approaches, use this order:

1. Secure
2. Reliable
3. Simple
4. Low-cost
5. Maintainable
6. Good user experience
7. Visually polished

Do not choose a technically impressive solution merely because it is impressive.

Build the thing that works.
