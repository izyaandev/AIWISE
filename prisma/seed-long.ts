import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const longMarkdownContent = `
# The Comprehensive Guide to Advanced State Management

Welcome to the most thorough exploration of state management you will ever read. This lesson is designed to test how long-form content is rendered and tracked within the platform.

## 1. Introduction to State

State is the heart of any interactive application. Without state, an application is merely a static document, incapable of responding to user input, network events, or time. In the context of modern web applications, state represents the data that determines the current condition of the UI.

### 1.1 The Ephemeral vs. The Persistent
State can be broadly categorized into two types: ephemeral and persistent.
- **Ephemeral State**: Also known as local state, this is data that is only relevant to a specific component or a small subtree of components. Examples include the open/closed status of a dropdown menu, the current text in an input field before it is submitted, or the active tab in a navigation bar.
- **Persistent State**: Also known as global or server state, this is data that needs to be shared across the entire application and often synced with a backend database. Examples include user authentication status, fetched data from an API, or items in a shopping cart.

## 2. The Evolution of State Management

The way we manage state has evolved significantly over the years. Understanding this evolution provides valuable context for why we use the tools we use today.

### 2.1 The DOM as the Source of Truth
In the early days of jQuery, the DOM itself was often used as the primary source of truth. Developers would read values directly from the DOM, perform calculations, and write the results back. This approach quickly became unmaintainable as applications grew in complexity, leading to "spaghetti code" and unpredictable behavior.

### 2.2 The Rise of MVC and Two-Way Data Binding
Frameworks like AngularJS introduced the Model-View-Controller (MVC) pattern and two-way data binding. This allowed changes in the model to automatically reflect in the view, and vice versa. While a significant improvement, two-way data binding could sometimes lead to cascading updates that were difficult to trace and debug.

### 2.3 Flux and Unidirectional Data Flow
React popularized the concept of unidirectional data flow and the Flux architecture. In this paradigm, data flows in a single direction: Actions trigger Dispatchers, which update Stores, which notify Views to re-render. This predictable flow made it much easier to reason about state changes and paved the way for libraries like Redux.

## 3. Deep Dive into Redux

Redux is perhaps the most well-known implementation of the Flux architecture. It introduces three core principles:
1. **Single Source of Truth**: The entire state of your application is stored in an object tree within a single store.
2. **State is Read-Only**: The only way to change the state is to emit an action, an object describing what happened.
3. **Changes are Made with Pure Functions**: To specify how the state tree is transformed by actions, you write pure reducers.

### 3.1 Anatomy of a Reducer
A reducer is a pure function that takes the previous state and an action, and returns the next state.
\`\`\`javascript
const initialState = { count: 0 };

function counterReducer(state = initialState, action) {
  switch (action.type) {
    case 'INCREMENT':
      return { count: state.count + 1 };
    case 'DECREMENT':
      return { count: state.count - 1 };
    default:
      return state;
  }
}
\`\`\`

## 4. Modern Alternatives: Context and Hooks

With the introduction of Hooks in React 16.8, developers gained powerful new tools for managing state without relying on external libraries like Redux for every use case.

### 4.1 The Context API
The Context API allows you to pass data through the component tree without having to pass props down manually at every level (prop drilling). When combined with the \`useReducer\` hook, it can provide a lightweight, built-in alternative to Redux for moderately complex state.

### 4.2 Server State Libraries
For managing persistent state fetched from an API, dedicated server state libraries like React Query, SWR, and Apollo Client have become increasingly popular. These tools handle complex tasks like caching, background fetching, pagination, and optimistic updates out of the box, allowing developers to focus on building features.

## 5. Conclusion

State management is a vast and continuously evolving topic. By understanding the core concepts and the historical context of different approaches, you can make informed decisions about which tools are best suited for your specific application requirements.
`;

async function main() {
  console.log('Seeding long testing course...');

  const course = await prisma.course.create({
    data: {
      title: 'Testing Course: Long Content & Quiz',
      description: 'A dedicated course to test long-form content rendering and detailed quizzes.',
      modules: {
        create: [
          {
            title: 'Module 1: Extensive Reading',
            order: 1,
            lessons: {
              create: [
                {
                  title: 'Deep Dive into State Management',
                  order: 1,
                  content: longMarkdownContent,
                  minimumDwellTime: 5,
                }
              ]
            }
          }
        ]
      }
    }
  });

  const firstModule = await prisma.module.findFirst({ where: { courseId: course.id } });
  const textLesson = await prisma.lesson.findFirst({ where: { moduleId: firstModule?.id } });

  if (textLesson) {
    await prisma.assessment.create({
      data: {
        lessonId: textLesson.id,
        title: 'State Management Comprehensive Quiz',
        questions: {
          create: [
            {
              text: 'What is the primary difference between ephemeral and persistent state?',
              options: JSON.stringify([
                'Ephemeral state is global, persistent is local',
                'Ephemeral is local to a component, persistent is shared globally and synced',
                'Ephemeral state requires a database, persistent does not',
                'There is no difference'
              ]),
              correctOption: 'Ephemeral is local to a component, persistent is shared globally and synced'
            },
            {
              text: 'Which architecture popularized unidirectional data flow?',
              options: JSON.stringify(['MVC', 'MVVM', 'Flux', 'Two-way binding']),
              correctOption: 'Flux'
            },
            {
              text: 'What are the three core principles of Redux?',
              options: JSON.stringify([
                'Multiple stores, mutable state, side effects',
                'Single source of truth, read-only state, pure functions (reducers)',
                'Two-way binding, DOM as source of truth, pure functions',
                'Context API, Hooks, Server State'
              ]),
              correctOption: 'Single source of truth, read-only state, pure functions (reducers)'
            },
            {
              text: 'Which hook, when combined with Context API, can serve as a lightweight alternative to Redux?',
              options: JSON.stringify(['useState', 'useEffect', 'useReducer', 'useCallback']),
              correctOption: 'useReducer'
            }
          ]
        }
      }
    });
  }

  console.log('Long testing course seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
