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

    // 3. Create Course with proper content, 60s dwell time per submodule, and 1 final quiz
    const course = await prisma.course.create({
      data: {
        title: 'AI WISE: Artificial Intelligence Course',
        description: 'A comprehensive curriculum on responsible AI usage, understanding algorithmic bias, exploring ethics, and aligning artificial intelligence with human values. Designed specifically for Grades 5–8.',
        modules: {
          create: [
            {
              title: 'AI WISE Core Curriculum',
              order: 1,
              lessons: {
                create: [
                  {
                    title: 'Submodule 1: Responsible AI Use',
                    order: 1,
                    minimumDwellTime: 60,
                    content: `# Responsible AI Use\n\nArtificial Intelligence is a powerful tool that can help you find information, generate creative ideas, explain difficult concepts, organize your thoughts, and practice new skills. However, it is essential to remember that **AI is just a tool, not an automatic expert**.\n\nWhile AI can be incredibly useful, it can also make mistakes. There is a very important difference between using AI to *support* your thinking and using AI *instead* of thinking.\n\n### Supporting vs. Replacing\nIf AI helps explain a difficult math concept to you, and you then use that understanding to solve the problem yourself, AI is supporting your learning! \n\nHowever, if you just copy and paste an answer from the AI without understanding it, you might have completed the homework, but you haven't actually learned the skill. Always aim to use AI as a supportive assistant, not a replacement for your own brain!\n\n### Using AI for Learning\nDid you know AI can be your personal learning assistant? Instead of asking an AI tool to simply give you an answer to a question, you can ask it to help you learn!\n\n- **Ask for Explanations:** "Can you explain photosynthesis like I am a 5th grader?"\n- **Ask for Hints:** Instead of saying 'Solve this entire problem,' you could ask, 'Give me one small hint that will help me start this problem.'\n- **Ask for Practice:** "Can you create 3 practice questions about fractions for me?"\n- **Ask for Feedback:** "Here is a paragraph I wrote. Can you give me one tip to make it better?"\n\n### Checking AI Answers\nAI is smart, but it's not perfect. Sometimes, AI can produce information that sounds incredibly confident and correct, but is actually completely wrong! This is sometimes called an "AI hallucination."\n\nJust because an AI gives a confident answer does not mean the information is accurate. AI may give incorrect facts, misunderstand your question, invent fake information, or use outdated material.\n\n**The Golden Rule: Stop → Check → Confirm**\nFor important information, always check the AI's answer using reliable sources. You can use your school textbook, your teacher, official trusted websites, or verified reference materials. Never blindly trust a machine with important facts!\n\n### Academic Honesty\nAcademic honesty means being truthful about the work you submit. It means that when you hand in an assignment, your teacher knows it represents your own brainpower and effort.\n\nDifferent schools, teachers, and competitions may have very different rules about using AI. You should always follow the rules that apply to your specific task. Using AI to practice vocabulary might be perfectly fine, but submitting an AI-generated essay as your own work is usually a violation of academic honesty. **When in doubt, ask your teacher!**\n\n### Privacy and Safe Use\nYou should think carefully before sharing any information with an AI system. The things you type into an AI chatbot are often saved and could be reviewed by the companies that built the AI.\n\n**NEVER share:**\n- Passwords or account logins\n- Private conversations\n- Personal identification information (like your address or phone number)\n- Confidential school documents\n\n### My Responsible AI Toolkit\nResponsible AI use means making good, thoughtful decisions before, during, and after using an AI tool.\n- **Before:** Understand the task and check whether AI is allowed by your teacher.\n- **During:** Always use AI to *support* your thinking rather than *replace* it. Protect your private information.\n- **After:** Check important information and facts for accuracy. Be completely honest about your work.\n\nRemember, AI is a powerful assistant, but **human judgment must remain in charge at all times!**`
                  },
                  {
                    title: 'Submodule 2: AI Ethics',
                    order: 2,
                    minimumDwellTime: 60,
                    content: `# AI Ethics\n\nArtificial Intelligence is a technology that allows computers to perform tasks that usually require human intelligence—like recognizing patterns, understanding language, identifying objects, and answering questions.\n\n**Ethics** is the practice of thinking carefully about what is right, wrong, fair, safe, and responsible.\n\nTherefore, **AI Ethics** means thinking about how AI should be created and used so that it benefits people and avoids causing unnecessary harm.\n\n### Just because we *can*, doesn't mean we *should*\nA computer might be able to do something, but that does not automatically mean it should be allowed to do it! For example, imagine a school building an AI system that watches students through cameras to detect if they are "distracted." While the technology exists to do this, ethically we must ask: Is this necessary? Do students know about it? Who can see the video? What happens if the AI makes a mistake and punishes an innocent student?\n\n### Fairness and Equality\nFairness means treating people appropriately and avoiding unjust discrimination. You might think computers are always perfectly fair because they just follow math, but that's not true!\n\nAI systems learn from massive amounts of information created by humans. If the information used to train an AI contains unfair patterns or historical prejudices, the AI will likely reproduce those exact same unfair patterns.\n\nImagine an AI system used to select students for a special science program. If the historical data it learned from mostly included boys, the AI might start unfairly rejecting girls, even if nobody explicitly programmed it to be sexist! A computer following a rule does not automatically make the rule fair. AI systems must be carefully tested to see how they affect different groups of people.\n\n### Privacy and Personal Information\nPersonal information is any data that tells us something about a specific person. Examples include your name, photograph, voice recording, physical location, school records, or online activity.\n\nAI systems often need large amounts of information to work, but collecting this information creates serious responsibilities. Before information is collected by an AI, we must ethically ask:\n- Why is this needed?\n- Who will be able to see it?\n- How long will it be kept on their servers?\n- Did the person actually understand and agree to let their data be used?\n\nA core ethical principle is **data minimization**: AI companies should collect and share only the absolute minimum amount of information actually needed to complete the task.\n\n### AI Can Make Mistakes\nIt is critical to remember that AI systems are not perfect. An AI may give an incorrect answer, completely misunderstand a question, identify an object incorrectly in a photo, or make a terrible recommendation.\n\nThis becomes extremely important when AI is used to make **important decisions** that affect human lives. Imagine an AI system incorrectly identifies a student as cheating during a digital examination. Ethically, the school should never automatically punish the student simply because a computer said so! A responsible approach requires that a human being reviews the evidence before any final decision is made.\n\n### Transparency and Trust\nTransparency means being completely open and honest about how and when AI is being used. Imagine a school uses a new AI program to help select students for a prestigious leadership camp. For this to be ethical, the students should reasonably be able to know:\n- That AI is being used in the process.\n- What specific information the AI is looking at.\n- What role the AI plays.\n- Whether a human teacher reviews the AI's results.\n\nPeople are much better able to trust and evaluate a system when the important details about how it works are made clear to everyone.\n\n### Building Ethical AI\nCreating an ethical AI system doesn't happen by accident; it requires careful planning! An ethical AI should have a clear purpose and be designed with people’s rights, safety, privacy, and best interests in mind.`
                  },
                  {
                    title: 'Submodule 3: AI Bias',
                    order: 3,
                    minimumDwellTime: 60,
                    content: `# AI Bias\n\nBias means that a decision, a rule, or a system consistently favors or disadvantages a specific thing or a specific group of people.\n\nWe know that humans can have biases, but did you know that AI systems can also produce biased results? AI learns how to behave by looking at patterns in massive amounts of information. \n\nIf the information used to teach an AI system is incomplete, unbalanced, or reflects human prejudices, the AI will likely perform much better for some groups while being unfair to others. An AI system does not need to "intend" to be unfair for its results to be incredibly unfair. This is why we must carefully examine both the data it learns from and the results it produces.\n\n### Where Can Bias Enter AI?\nBias doesn't just magically appear; it can enter an AI system at several specific stages of its creation!\n\n1. **The Data:** This is the most common source. The training information may simply not represent everyone equally.\n2. **The Design:** Developers choose what information the system cares about and what goals it tries to achieve. If a developer forgets to consider a certain demographic, the design is biased.\n3. **The Model:** The math itself might find and amplify weird patterns that aren't actually true.\n4. **The Output:** The final result produced by the AI might be skewed.\n5. **Human Decisions:** Sometimes the AI is fine, but the human using the AI's result acts in a biased way.\n\n### Examples of AI Bias\nAn AI system may work beautifully in some situations and terribly in others. Let's look at some real-world examples of AI bias.\n\n- **Voice Recognition:** A smart speaker may understand certain accents perfectly, but completely fail to understand other accents. Why? Because its training examples did not include enough variety of human voices!\n- **Facial Recognition:** Some camera systems have struggled to detect faces with darker skin tones because the images used to train the AI were mostly of people with lighter skin.\n- **Language Translation:** AI translation tools have sometimes assumed certain jobs are strictly for men (like "doctor") and others for women (like "nurse") based on outdated societal patterns in text data.\n\n### Testing for Fairness\nWe cannot understand every AI problem just by looking at its design blueprint; we actually need to rigorously test how the system performs in the real world!\n\nTesting means giving the AI system hundreds of appropriate examples and comparing its results with the correct answers. Investigators act like scientists, asking:\n- How accurate is the system overall?\n- Does the accuracy change when testing different groups of people?\n- What specific types of mistakes does it make?\n- Are some people or situations completely missing from the test data?\n\nTesting is the only way to turn a "suspicion" of bias into hard "evidence" of bias.\n\n### Fixing Bias\nIf testing discovers a bias problem, what can we do? There are several ways developers can try to fix it:\n\n- **Improve Training Information:** Add more diverse and representative examples to the dataset so the AI learns about everyone.\n- **Improve Labels:** Make sure the human labels on the data are accurate and unbiased.\n- **Change the Design:** Tweak the mathematical model to penalize unfair outcomes.\n- **Add Human Review:** Require a human to double-check the AI's work before a final decision is made.\n\n### Become an AI Bias Detective\nNow it's your turn to think like an investigator! Imagine a fictional AI system used by a library to recommend books to students. As a Bias Detective, you should ask these questions to audit the system:\n1. What does the AI do?\n2. Who uses it?\n3. Who could be negatively affected?\n4. What evidence suggests a problem?\n5. Where did the problem come from?\n6. How can it be fixed?\n\nBy asking these questions, you can help ensure that the AI tools of the future are fair, safe, and beneficial for everyone!`,
                    assessments: {
                      create: [{
                        title: 'Final Course Quiz',
                        questions: {
                          create: [
                            {
                              text: 'What is the main difference between using AI to support your thinking vs. replacing it?',
                              options: JSON.stringify([
                                'Using AI to solve everything instantly is supporting your thinking.',
                                'Using AI to help explain concepts so you can solve problems yourself is supporting your thinking.',
                                'AI cannot be used to support thinking.',
                                'Copying answers is the best way to support your thinking.'
                              ]),
                              correctOption: 'Using AI to help explain concepts so you can solve problems yourself is supporting your thinking.'
                            },
                            {
                              text: 'What should you do if an AI gives you a very confident answer about a historical event?',
                              options: JSON.stringify([
                                'Assume it is 100% correct because AI knows everything.',
                                'Stop, Check, and Confirm the information using a reliable source like a textbook.',
                                'Argue with the AI.',
                                'Share it immediately with all your friends.'
                              ]),
                              correctOption: 'Stop, Check, and Confirm the information using a reliable source like a textbook.'
                            },
                            {
                              text: 'What does "AI Ethics" primarily focus on?',
                              options: JSON.stringify([
                                'Making AI run faster on computers.',
                                'Thinking about how AI should be used so it benefits people and avoids harm.',
                                'Teaching AI how to build other AI systems.',
                                'Making sure AI is as expensive as possible.'
                              ]),
                              correctOption: 'Thinking about how AI should be used so it benefits people and avoids harm.'
                            },
                            {
                              text: 'Why might an AI system make an unfair decision?',
                              options: JSON.stringify([
                                'Because computers hate humans.',
                                'Because it learned from historical data that contained unfair patterns.',
                                'Because math is always unfair.',
                                'Because the AI is trying to be funny.'
                              ]),
                              correctOption: 'Because it learned from historical data that contained unfair patterns.'
                            },
                            {
                              text: 'Can an AI system be biased even if the programmer didn\'t intend for it to be?',
                              options: JSON.stringify([
                                'Yes, because it learns from unbalanced or prejudiced data.',
                                'No, AI is a machine and is always perfectly neutral.',
                                'Yes, but only if it gains consciousness.',
                                'No, math cannot be biased.'
                              ]),
                              correctOption: 'Yes, because it learns from unbalanced or prejudiced data.'
                            }
                          ]
                        }
                      }]
                    }
                  }
                ]
              }
            }
          ]
        }
      }
    });

    return NextResponse.json({ success: true, message: 'Database seeded with AI WISE content successfully!' });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ success: false, error: 'Failed to seed database' }, { status: 500 });
  }
}
