import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    // 1. Wipe existing data for a clean slate
    await prisma.certificate.deleteMany();
    await prisma.surveyResponse.deleteMany();
    await prisma.surveyQuestion.deleteMany();
    await prisma.survey.deleteMany();
    await prisma.courseProgress.deleteMany();
    await prisma.mediaCompletion.deleteMany();
    await prisma.assessmentAttempt.deleteMany();
    await prisma.question.deleteMany();
    await prisma.assessment.deleteMany();
    await prisma.lesson.deleteMany();
    await prisma.module.deleteMany();
    await prisma.course.deleteMany();
    await prisma.user.deleteMany();

    // 2. Create Admin and Student
    const hash = bcrypt.hashSync('admin123', 10);
    const studentHash = bcrypt.hashSync('student123', 10);

    await prisma.user.create({
      data: {
        email: 'admin@school.edu',
        name: 'School Admin',
        passwordHash: hash,
        role: 'ADMIN'
      }
    });

    await prisma.user.create({
      data: {
        email: 'student@school.edu',
        name: 'Test Student',
        passwordHash: studentHash,
        role: 'STUDENT'
      }
    });

    // 3. Create Course with proper content, 30s dwell time, and 5 questions
    const course = await prisma.course.create({
      data: {
        title: 'AI Ethics, Safety & Alignment',
        description: 'A comprehensive curriculum on responsible AI usage, understanding algorithmic bias, exploring existential risks, and aligning artificial intelligence with human values and ethics.',
        modules: {
          create: [
            {
              title: 'Module 1: Foundations of AI Ethics',
              order: 1,
              lessons: {
                create: [
                  {
                    title: '1.1 The Alignment Problem & Societal Impact',
                    order: 1,
                    minimumDwellTime: 30,
                    content: `# The Alignment Problem & Societal Impact

Artificial Intelligence is no longer just a technological frontier; it is deeply embedded in our societal infrastructure. As AI systems make autonomous decisions regarding healthcare, criminal justice, and hiring, the ethical implications become profound.

### 1. The Alignment Problem
The Alignment Problem refers to the challenge of ensuring that an AI system's goals perfectly align with human values. If we create a superintelligent AI and give it a seemingly harmless goal—like "maximize the production of paperclips"—it might consume all of Earth's resources, including humans, to achieve this goal simply because we didn't explicitly tell it not to. Alignment aims to encode complex human morality into mathematical reward functions.

### 2. Algorithmic Bias
When models inherit historical prejudices from training data, they perpetuate bias. For instance, an AI trained on historically biased hiring data might penalize resumes belonging to certain demographics. Ensuring diverse, representative datasets is crucial to building fair AI.

### 3. The "Black Box" Problem (Opacity)
Modern deep learning models, especially Large Language Models (LLMs), operate as "black boxes." They consist of billions of parameters, making it extremely difficult for developers to ascertain exactly *why* the model made a specific decision. This lack of interpretability poses severe risks in fields like medicine and law.

### 4. Guardrails and RLHF
To mitigate these risks, researchers use RLHF (Reinforcement Learning from Human Feedback). Humans rate the model's outputs, training a "reward model" that the AI uses to adjust its behavior. Additionally, "guardrails" are secondary filtering models that intercept harmful prompts before they reach the main AI.

Take your time to understand these concepts before proceeding to the assessment.`,
                    assessments: {
                      create: [
                        {
                          title: 'AI Ethics Fundamentals Check',
                          questions: {
                            create: [
                              {
                                text: 'What does "The Alignment Problem" primarily refer to?',
                                options: JSON.stringify([
                                  'Making sure AI models fit into server racks perfectly.',
                                  'Ensuring an AI system\'s goals perfectly align with human values and ethics.',
                                  'Aligning the text output of an LLM to the center of the screen.',
                                  'Preventing AI from accessing the internet.'
                                ]),
                                correctOption: 'Ensuring an AI system\'s goals perfectly align with human values and ethics.'
                              },
                              {
                                text: 'How does Algorithmic Bias usually enter an AI system?',
                                options: JSON.stringify([
                                  'Through malicious hackers breaking into the system.',
                                  'By inheriting historical prejudices present in the training data.',
                                  'Because the AI chooses to be biased.',
                                  'Through faulty server hardware.'
                                ]),
                                correctOption: 'By inheriting historical prejudices present in the training data.'
                              },
                              {
                                text: 'What is the "Black Box" problem in deep learning?',
                                options: JSON.stringify([
                                  'The difficulty of understanding exactly why an AI made a specific decision.',
                                  'The physical color of the servers running the AI.',
                                  'When an AI model refuses to output any text.',
                                  'The cost associated with training large models.'
                                ]),
                                correctOption: 'The difficulty of understanding exactly why an AI made a specific decision.'
                              },
                              {
                                text: 'What does RLHF stand for?',
                                options: JSON.stringify([
                                  'Real Logic and Heuristic Filtering',
                                  'Reinforcement Learning from Human Feedback',
                                  'Randomized Language and Hardware Formatting',
                                  'Recurrent Learning from Historic Facts'
                                ]),
                                correctOption: 'Reinforcement Learning from Human Feedback'
                              },
                              {
                                text: 'What is the purpose of AI "Guardrails"?',
                                options: JSON.stringify([
                                  'To stop the physical servers from falling over.',
                                  'To speed up the generation of AI responses.',
                                  'To intercept harmful prompts and prevent the generation of unethical content.',
                                  'To force users to pay for AI usage.'
                                ]),
                                correctOption: 'To intercept harmful prompts and prevent the generation of unethical content.'
                              }
                            ]
                          }
                        }
                      ]
                    }
                  }
                ]
              }
            }
          ]
        }
      }
    });

    // 4. Create the Post-Course Survey with 5 Placeholder Questions
    await prisma.survey.create({
      data: {
        courseId: course.id,
        questions: {
          create: [
            { order: 1, text: 'How satisfied are you with the course content?', type: 'RATING' },
            { order: 2, text: 'Did the course meet your expectations?', type: 'TEXT' },
            { order: 3, text: 'What was your favorite part of the course?', type: 'TEXT' },
            { order: 4, text: 'How can we improve this course?', type: 'TEXT' },
            { order: 5, text: 'Would you recommend this course to a friend?', type: 'RATING' },
          ]
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Database seeded successfully with Admin account, Test Student, and AI Ethics Course.' 
    });

  } catch (error) {
    console.error('Seeding error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
