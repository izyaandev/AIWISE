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

    // 3. Create Course with proper content, 30s dwell time, and questions
    const course = await prisma.course.create({
      data: {
        title: 'AI WISE: Artificial Intelligence Course',
        description: 'A comprehensive curriculum on responsible AI usage, understanding algorithmic bias, exploring ethics, and aligning artificial intelligence with human values. Designed specifically for Grades 5–8.',
        modules: {
          create: [
            // MODULE 1
            {
              title: 'Module 1: Responsible AI Use',
              order: 1,
              lessons: {
                create: [
                  {
                    title: '1. AI as a Tool',
                    order: 1,
                    minimumDwellTime: 30,
                    content: `# AI as a Tool\n\nArtificial Intelligence is a powerful tool that can help you find information, generate creative ideas, explain difficult concepts, organize your thoughts, and practice new skills. However, it is essential to remember that **AI is just a tool, not an automatic expert**.\n\nWhile AI can be incredibly useful, it can also make mistakes. There is a very important difference between using AI to *support* your thinking and using AI *instead* of thinking.\n\n### Supporting vs. Replacing\nIf AI helps explain a difficult math concept to you, and you then use that understanding to solve the problem yourself, AI is supporting your learning! \n\nHowever, if you just copy and paste an answer from the AI without understanding it, you might have completed the homework, but you haven't actually learned the skill. Always aim to use AI as a supportive assistant, not a replacement for your own brain!`,
                    assessments: {
                      create: [{
                        title: 'Knowledge Check: AI as a Tool',
                        questions: {
                          create: [{
                            text: 'What is the main difference between using AI to support your thinking vs. replacing it?',
                            options: JSON.stringify([
                              'Using AI to solve everything instantly is supporting your thinking.',
                              'Using AI to help explain concepts so you can solve problems yourself is supporting your thinking.',
                              'AI cannot be used to support thinking.',
                              'Copying answers is the best way to support your thinking.'
                            ]),
                            correctOption: 'Using AI to help explain concepts so you can solve problems yourself is supporting your thinking.'
                          }]
                        }
                      }]
                    }
                  },
                  {
                    title: '2. Using AI for Learning',
                    order: 2,
                    minimumDwellTime: 30,
                    content: `# Using AI for Learning\n\nDid you know AI can be your personal learning assistant? Instead of asking an AI tool to simply give you an answer to a question, you can ask it to help you learn!\n\n### How to interact with AI:\n- **Ask for Explanations:** "Can you explain photosynthesis like I am a 5th grader?"\n- **Ask for Hints:** Instead of saying 'Solve this entire problem,' you could ask, 'Give me one small hint that will help me start this problem.'\n- **Ask for Practice:** "Can you create 3 practice questions about fractions for me?"\n- **Ask for Feedback:** "Here is a paragraph I wrote. Can you give me one tip to make it better?"\n\nThe ultimate goal is to use AI to make your learning stronger and more engaging, not to remove the learning process completely.`,
                    assessments: {
                      create: [{
                        title: 'Knowledge Check: Using AI for Learning',
                        questions: {
                          create: [{
                            text: 'Which of the following is the best way to use AI for learning?',
                            options: JSON.stringify([
                              'Ask it to write your entire essay.',
                              'Ask it to give you a hint on how to start a math problem.',
                              'Tell it to complete your reading assignment.',
                              'Ignore AI completely.'
                            ]),
                            correctOption: 'Ask it to give you a hint on how to start a math problem.'
                          }]
                        }
                      }]
                    }
                  },
                  {
                    title: '3. Checking AI Answers',
                    order: 3,
                    minimumDwellTime: 30,
                    content: `# Checking AI Answers\n\nAI is smart, but it's not perfect. Sometimes, AI can produce information that sounds incredibly confident and correct, but is actually completely wrong! This is sometimes called an "AI hallucination."\n\nJust because an AI gives a confident answer does not mean the information is accurate. AI may give incorrect facts, misunderstand your question, invent fake information, or use outdated material.\n\n### The Golden Rule: Stop → Check → Confirm\nFor important information, always check the AI's answer using reliable sources. You can use:\n- Your school textbook\n- Your teacher\n- Official, trusted websites\n- Verified reference materials\n\nNever blindly trust a machine with important facts!`,
                    assessments: {
                      create: [{
                        title: 'Knowledge Check: Checking AI Answers',
                        questions: {
                          create: [{
                            text: 'What should you do if an AI gives you a very confident answer about a historical event?',
                            options: JSON.stringify([
                              'Assume it is 100% correct because AI knows everything.',
                              'Stop, Check, and Confirm the information using a reliable source like a textbook.',
                              'Argue with the AI.',
                              'Share it immediately with all your friends.'
                            ]),
                            correctOption: 'Stop, Check, and Confirm the information using a reliable source like a textbook.'
                          }]
                        }
                      }]
                    }
                  },
                  {
                    title: '4. Academic Honesty',
                    order: 4,
                    minimumDwellTime: 30,
                    content: `# Academic Honesty\n\nAcademic honesty means being truthful about the work you submit. It means that when you hand in an assignment, your teacher knows it represents your own brainpower and effort.\n\nDifferent schools, teachers, and competitions may have very different rules about using AI. You should always follow the rules that apply to your specific task.\n\nUsing AI to practice vocabulary might be perfectly fine, but submitting an AI-generated essay as your own work is usually a violation of academic honesty.\n\n### When in doubt, ask!\nIf you are ever unsure whether using AI is permitted for a specific assignment, the best thing you can do is **ask your teacher before using it**. Being honest and asking for permission is always the right path.`,
                    assessments: {
                      create: [{
                        title: 'Knowledge Check: Academic Honesty',
                        questions: {
                          create: [{
                            text: 'If you are unsure if you are allowed to use AI for a homework assignment, what should you do?',
                            options: JSON.stringify([
                              'Use it anyway and hope you don\'t get caught.',
                              'Don\'t do the homework at all.',
                              'Ask your teacher for permission before using it.',
                              'Ask a classmate what they are doing.'
                            ]),
                            correctOption: 'Ask your teacher for permission before using it.'
                          }]
                        }
                      }]
                    }
                  },
                  {
                    title: '5. Privacy and Safe Use',
                    order: 5,
                    minimumDwellTime: 30,
                    content: `# Privacy and Safe Use\n\nYou should think carefully before sharing any information with an AI system. The things you type into an AI chatbot are often saved and could be reviewed by the companies that built the AI.\n\n**NEVER share:**\n- Passwords or account logins\n- Private conversations\n- Personal identification information (like your address or phone number)\n- Someone else's private information\n- Confidential school documents\n\n### The Rule of Data Minimization\nA useful rule is: only provide the information that is strictly necessary for the task. If you want AI to check your spelling on a story, you don't need to include your real name or where you live in the prompt!\n\nIf you are unsure whether something is safe to share online, stop and ask a trusted adult or teacher.`,
                    assessments: {
                      create: [{
                        title: 'Knowledge Check: Privacy and Safe Use',
                        questions: {
                          create: [{
                            text: 'Which of the following is safe to share with an AI chatbot?',
                            options: JSON.stringify([
                              'Your home address.',
                              'A fictional story you wrote about a space alien.',
                              'Your best friend\'s secret phone number.',
                              'Your school email password.'
                            ]),
                            correctOption: 'A fictional story you wrote about a space alien.'
                          }]
                        }
                      }]
                    }
                  },
                  {
                    title: '6. My Responsible AI Toolkit',
                    order: 6,
                    minimumDwellTime: 30,
                    content: `# My Responsible AI Toolkit\n\nResponsible AI use means making good, thoughtful decisions before, during, and after using an AI tool. Let's recap your new toolkit!\n\n**Before using AI:**\n- Understand the task and check whether AI is allowed by your teacher.\n\n**During AI use:**\n- Always use AI to *support* your thinking rather than *replace* it.\n- Protect your private information.\n\n**After using AI:**\n- Check important information and facts for accuracy.\n- Be completely honest about your work and acknowledge if you used AI for help.\n\nRemember, AI is a powerful assistant, but **human judgment must remain in charge at all times!**`,
                    assessments: {
                      create: [{
                        title: 'Knowledge Check: Toolkit',
                        questions: {
                          create: [{
                            text: 'What is the most important rule to remember when using AI?',
                            options: JSON.stringify([
                              'Human judgment must remain in charge at all times.',
                              'AI is always right.',
                              'You should share all your private details to get better answers.',
                              'Never tell anyone if you used AI to help you study.'
                            ]),
                            correctOption: 'Human judgment must remain in charge at all times.'
                          }]
                        }
                      }]
                    }
                  }
                ]
              }
            },
            
            // MODULE 2
            {
              title: 'Module 2: AI Ethics',
              order: 2,
              lessons: {
                create: [
                  {
                    title: '1. What Is AI Ethics?',
                    order: 1,
                    minimumDwellTime: 30,
                    content: `# What Is AI Ethics?\n\nArtificial Intelligence is a technology that allows computers to perform tasks that usually require human intelligence—like recognizing patterns, understanding language, identifying objects, and answering questions.\n\n**Ethics** is the practice of thinking carefully about what is right, wrong, fair, safe, and responsible.\n\nTherefore, **AI Ethics** means thinking about how AI should be created and used so that it benefits people and avoids causing unnecessary harm.\n\n### Just because we *can*, doesn't mean we *should*\nA computer might be able to do something, but that does not automatically mean it should be allowed to do it! For example, imagine a school building an AI system that watches students through cameras to detect if they are "distracted." While the technology exists to do this, ethically we must ask: Is this necessary? Do students know about it? Who can see the video? What happens if the AI makes a mistake and punishes an innocent student?`,
                    assessments: {
                      create: [{
                        title: 'Knowledge Check: AI Ethics',
                        questions: {
                          create: [{
                            text: 'What does "AI Ethics" primarily focus on?',
                            options: JSON.stringify([
                              'Making AI run faster on computers.',
                              'Thinking about how AI should be used so it benefits people and avoids harm.',
                              'Teaching AI how to build other AI systems.',
                              'Making sure AI is as expensive as possible.'
                            ]),
                            correctOption: 'Thinking about how AI should be used so it benefits people and avoids harm.'
                          }]
                        }
                      }]
                    }
                  },
                  {
                    title: '2. Fairness and Equality',
                    order: 2,
                    minimumDwellTime: 30,
                    content: `# Fairness and Equality\n\nFairness means treating people appropriately and avoiding unjust discrimination. You might think computers are always perfectly fair because they just follow math, but that's not true!\n\nAI systems learn from massive amounts of information created by humans. If the information used to train an AI contains unfair patterns or historical prejudices, the AI will likely reproduce those exact same unfair patterns.\n\nImagine an AI system used to select students for a special science program. If the historical data it learned from mostly included boys, the AI might start unfairly rejecting girls, even if nobody explicitly programmed it to be sexist!\n\nA computer following a rule does not automatically make the rule fair. AI systems must be carefully tested to see how they affect different groups of people.`,
                    assessments: {
                      create: [{
                        title: 'Knowledge Check: Fairness',
                        questions: {
                          create: [{
                            text: 'Why might an AI system make an unfair decision?',
                            options: JSON.stringify([
                              'Because computers hate humans.',
                              'Because it learned from historical data that contained unfair patterns.',
                              'Because math is always unfair.',
                              'Because the AI is trying to be funny.'
                            ]),
                            correctOption: 'Because it learned from historical data that contained unfair patterns.'
                          }]
                        }
                      }]
                    }
                  },
                  {
                    title: '3. Privacy and Personal Information',
                    order: 3,
                    minimumDwellTime: 30,
                    content: `# Privacy and Personal Information\n\nPersonal information is any data that tells us something about a specific person. Examples include your name, photograph, voice recording, physical location, school records, or online activity.\n\nAI systems often need large amounts of information to work, but collecting this information creates serious responsibilities.\n\nBefore information is collected by an AI, we must ethically ask:\n- Why is this needed?\n- Who will be able to see it?\n- How long will it be kept on their servers?\n- Did the person actually understand and agree to let their data be used?\n\nA core ethical principle is **data minimization**: AI companies should collect and share only the absolute minimum amount of information actually needed to complete the task.`,
                    assessments: {
                      create: [{
                        title: 'Knowledge Check: Privacy',
                        questions: {
                          create: [{
                            text: 'What does the principle of "data minimization" mean?',
                            options: JSON.stringify([
                              'Making data files smaller so they fit on a USB drive.',
                              'Collecting and sharing only the minimum amount of information actually needed.',
                              'Hiding data from users.',
                              'Deleting all AI systems.'
                            ]),
                            correctOption: 'Collecting and sharing only the minimum amount of information actually needed.'
                          }]
                        }
                      }]
                    }
                  },
                  {
                    title: '4. AI Can Make Mistakes',
                    order: 4,
                    minimumDwellTime: 30,
                    content: `# AI Can Make Mistakes\n\nIt is critical to remember that AI systems are not perfect. An AI may give an incorrect answer, completely misunderstand a question, identify an object incorrectly in a photo, or make a terrible recommendation.\n\nThis becomes extremely important when AI is used to make **important decisions** that affect human lives.\n\nImagine an AI system incorrectly identifies a student as cheating during a digital examination. Ethically, the school should never automatically punish the student simply because a computer said so! A responsible approach requires that a human being reviews the evidence before any final decision is made.\n\nHumans must always remain responsible for important decisions, using AI only as a tool, not a judge.`,
                    assessments: {
                      create: [{
                        title: 'Knowledge Check: AI Mistakes',
                        questions: {
                          create: [{
                            text: 'If an AI system flags a student for cheating, what is the most ethical next step?',
                            options: JSON.stringify([
                              'Automatically punish the student.',
                              'Have a human teacher review the evidence before making a decision.',
                              'Ignore the AI completely forever.',
                              'Let the AI decide the punishment.'
                            ]),
                            correctOption: 'Have a human teacher review the evidence before making a decision.'
                          }]
                        }
                      }]
                    }
                  },
                  {
                    title: '5. Transparency and Trust',
                    order: 5,
                    minimumDwellTime: 30,
                    content: `# Transparency and Trust\n\nTransparency means being completely open and honest about how and when AI is being used.\n\nImagine a school uses a new AI program to help select students for a prestigious leadership camp. For this to be ethical, the students should reasonably be able to know:\n- That AI is being used in the process.\n- What specific information the AI is looking at.\n- What role the AI plays (does it make the final choice, or just a recommendation?).\n- Whether a human teacher reviews the AI's results.\n- How a student can question or appeal a decision if they feel it was unfair.\n\nPeople are much better able to trust and evaluate a system when the important details about how it works are made clear to everyone.`,
                    assessments: {
                      create: [{
                        title: 'Knowledge Check: Transparency',
                        questions: {
                          create: [{
                            text: 'What does "transparency" mean in the context of AI?',
                            options: JSON.stringify([
                              'Making computers out of clear glass.',
                              'Being open and honest about how and when AI is being used.',
                              'Hiding the AI code from hackers.',
                              'Using AI to solve invisible problems.'
                            ]),
                            correctOption: 'Being open and honest about how and when AI is being used.'
                          }]
                        }
                      }]
                    }
                  },
                  {
                    title: '6. Building Ethical AI',
                    order: 6,
                    minimumDwellTime: 30,
                    content: `# Building Ethical AI\n\nCreating an ethical AI system doesn't happen by accident; it requires careful planning! An ethical AI should have a clear purpose and be designed with people’s rights, safety, privacy, and best interests in mind.\n\nWhen developers design an AI system, they should ask:\n- What specific problem is this solving?\n- Who will use it, and who could be negatively affected by it?\n- What personal information does it actually need?\n- Could it treat some groups of people unfairly?\n- What is the worst-case scenario if something goes wrong?\n\nFinally, developers must determine when a human must step in to check the AI, and how users will be informed that AI is being used in the first place.`,
                    assessments: {
                      create: [{
                        title: 'Knowledge Check: Building AI',
                        questions: {
                          create: [{
                            text: 'Which of these is an important question developers should ask when building an ethical AI?',
                            options: JSON.stringify([
                              'How can we make the most money instantly?',
                              'Could this AI treat some groups of people unfairly?',
                              'How can we hide what the AI is doing?',
                              'What color should the robot be?'
                            ]),
                            correctOption: 'Could this AI treat some groups of people unfairly?'
                          }]
                        }
                      }]
                    }
                  }
                ]
              }
            },

            // MODULE 3
            {
              title: 'Module 3: AI Bias',
              order: 3,
              lessons: {
                create: [
                  {
                    title: '1. What Is Bias?',
                    order: 1,
                    minimumDwellTime: 30,
                    content: `# What Is Bias?\n\nBias means that a decision, a rule, or a system consistently favors or disadvantages a specific thing or a specific group of people.\n\nWe know that humans can have biases, but did you know that AI systems can also produce biased results? AI learns how to behave by looking at patterns in massive amounts of information. \n\nIf the information used to teach an AI system is incomplete, unbalanced, or reflects human prejudices, the AI will likely perform much better for some groups while being unfair to others. An AI system does not need to "intend" to be unfair for its results to be incredibly unfair. This is why we must carefully examine both the data it learns from and the results it produces.`,
                    assessments: {
                      create: [{
                        title: 'Knowledge Check: Bias',
                        questions: {
                          create: [{
                            text: 'Can an AI system be biased even if the programmer didn\'t intend for it to be?',
                            options: JSON.stringify([
                              'Yes, because it learns from unbalanced or prejudiced data.',
                              'No, AI is a machine and is always perfectly neutral.',
                              'Yes, but only if it gains consciousness.',
                              'No, math cannot be biased.'
                            ]),
                            correctOption: 'Yes, because it learns from unbalanced or prejudiced data.'
                          }]
                        }
                      }]
                    }
                  },
                  {
                    title: '2. Where Can Bias Enter AI?',
                    order: 2,
                    minimumDwellTime: 30,
                    content: `# Where Can Bias Enter AI?\n\nBias doesn't just magically appear; it can enter an AI system at several specific stages of its creation!\n\n1. **The Data:** This is the most common source. The training information may simply not represent everyone equally.\n2. **The Design:** Developers choose what information the system cares about and what goals it tries to achieve. If a developer forgets to consider a certain demographic, the design is biased.\n3. **The Model:** The math itself might find and amplify weird patterns that aren't actually true.\n4. **The Output:** The final result produced by the AI might be skewed.\n5. **Human Decisions:** Sometimes the AI is fine, but the human using the AI's result acts in a biased way.\n\nA simple way to investigate a problem is to trace it through the sequence: **Data → AI system → Result → Human decision**.`,
                    assessments: {
                      create: [{
                        title: 'Knowledge Check: Bias Stages',
                        questions: {
                          create: [{
                            text: 'Which of the following is a stage where bias can enter an AI system?',
                            options: JSON.stringify([
                              'The training data.',
                              'The design choices made by developers.',
                              'The human decisions made using the AI\'s output.',
                              'All of the above.'
                            ]),
                            correctOption: 'All of the above.'
                          }]
                        }
                      }]
                    }
                  },
                  {
                    title: '3. Examples of AI Bias',
                    order: 3,
                    minimumDwellTime: 30,
                    content: `# Examples of AI Bias\n\nAn AI system may work beautifully in some situations and terribly in others. Let's look at some real-world examples of AI bias.\n\n- **Voice Recognition:** A smart speaker may understand certain accents perfectly, but completely fail to understand other accents. Why? Because its training examples did not include enough variety of human voices!\n- **Facial Recognition:** Some camera systems have struggled to detect faces with darker skin tones because the images used to train the AI were mostly of people with lighter skin.\n- **Language Translation:** AI translation tools have sometimes assumed certain jobs are strictly for men (like "doctor") and others for women (like "nurse") based on outdated societal patterns in text data.\n\nFinding a difference in performance does not automatically prove *why* it happened, which is why rigorous testing is required to understand the root cause.`,
                    assessments: {
                      create: [{
                        title: 'Knowledge Check: Examples of Bias',
                        questions: {
                          create: [{
                            text: 'Why might a voice-recognition AI struggle to understand certain accents?',
                            options: JSON.stringify([
                              'Because the AI is broken.',
                              'Because its training data did not include enough variety of accents.',
                              'Because those accents are mathematically impossible to understand.',
                              'Because the microphone is turned off.'
                            ]),
                            correctOption: 'Because its training data did not include enough variety of accents.'
                          }]
                        }
                      }]
                    }
                  },
                  {
                    title: '4. Testing for Fairness',
                    order: 4,
                    minimumDwellTime: 30,
                    content: `# Testing for Fairness\n\nWe cannot understand every AI problem just by looking at its design blueprint; we actually need to rigorously test how the system performs in the real world!\n\nTesting means giving the AI system hundreds of appropriate examples and comparing its results with the correct answers. Investigators act like scientists, asking:\n- How accurate is the system overall?\n- Does the accuracy change when testing different groups of people (e.g., different ages, genders, or locations)?\n- What specific types of mistakes does it make?\n- Are some people or situations completely missing from the test data?\n\nTesting is the only way to turn a "suspicion" of bias into hard "evidence" of bias.`,
                    assessments: {
                      create: [{
                        title: 'Knowledge Check: Testing Fairness',
                        questions: {
                          create: [{
                            text: 'What is the purpose of testing an AI system for fairness?',
                            options: JSON.stringify([
                              'To turn suspicions of bias into hard evidence by seeing how it performs across different groups.',
                              'To make the AI run faster.',
                              'To teach the AI how to code.',
                              'To prove that computers are smarter than humans.'
                            ]),
                            correctOption: 'To turn suspicions of bias into hard evidence by seeing how it performs across different groups.'
                          }]
                        }
                      }]
                    }
                  },
                  {
                    title: '5. Fixing Bias',
                    order: 5,
                    minimumDwellTime: 30,
                    content: `# Fixing Bias\n\nIf testing discovers a bias problem, what can we do? There are several ways developers can try to fix it:\n\n- **Improve Training Information:** Add more diverse and representative examples to the dataset so the AI learns about everyone.\n- **Improve Labels:** Make sure the human labels on the data are accurate and unbiased.\n- **Change the Design:** Tweak the mathematical model to penalize unfair outcomes.\n- **Add Human Review:** Require a human to double-check the AI's work before a final decision is made.\n- **Continuous Monitoring:** Keep testing the system even after it is released to make sure new biases don't emerge.\n\nThere is no single "magic button" solution that works for every type of bias. A good fix follows the scientific process: find the problem, propose a fix, test the fix, and monitor the result.`,
                    assessments: {
                      create: [{
                        title: 'Knowledge Check: Fixing Bias',
                        questions: {
                          create: [{
                            text: 'Is there a single, simple solution that fixes all types of AI bias?',
                            options: JSON.stringify([
                              'Yes, just hit the "remove bias" button.',
                              'No, fixing bias requires a combination of improving data, changing designs, and continuous monitoring.',
                              'Yes, you just have to reboot the computer.',
                              'No, bias is completely impossible to fix.'
                            ]),
                            correctOption: 'No, fixing bias requires a combination of improving data, changing designs, and continuous monitoring.'
                          }]
                        }
                      }]
                    }
                  },
                  {
                    title: '6. Become an AI Bias Detective',
                    order: 6,
                    minimumDwellTime: 30,
                    content: `# Become an AI Bias Detective\n\nNow it's your turn to think like an investigator! Imagine a fictional AI system used by a library to recommend books to students. \n\nAs a Bias Detective, you should ask these questions to audit the system:\n1. **What does the AI do?** (Recommends books).\n2. **Who uses it?** (Students of all ages).\n3. **Who could be negatively affected?** (Students who are recommended books that are way too hard or inappropriate for their age).\n4. **What evidence suggests a problem?** (Maybe 5th graders are only being recommended picture books!).\n5. **Where did the problem come from?** (Maybe the training data only looked at what kindergarteners checked out).\n6. **How can it be fixed?** (Include checkout data from older students!).\n\nBy asking these questions, you can help ensure that the AI tools of the future are fair, safe, and beneficial for everyone!`,
                    assessments: {
                      create: [{
                        title: 'Knowledge Check: Bias Detective',
                        questions: {
                          create: [{
                            text: 'What is a good question for a Bias Detective to ask about a new AI system?',
                            options: JSON.stringify([
                              'Who could be negatively affected by this system?',
                              'What is the Wi-Fi password?',
                              'How much electricity does the server use?',
                              'Can this AI do my chores?'
                            ]),
                            correctOption: 'Who could be negatively affected by this system?'
                          }]
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
