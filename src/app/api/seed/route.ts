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

    // 3. Create Course 1: Grades 5-8
    await prisma.course.create({
      data: {
        title: 'AI WISE: Artificial Intelligence Course (Grades 5-8)',
        description: 'A comprehensive curriculum on responsible AI usage, understanding algorithmic bias, exploring ethics, and aligning artificial intelligence with human values. Designed specifically for Grades 5–8.',
        modules: {
          create: [
            {
              title: 'AI WISE Core Curriculum (5-8)',
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
                        title: 'Final Course Quiz (5-8)',
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

    // 4. Create Course 2: Grades 9-12
    await prisma.course.create({
      data: {
        title: 'AI WISE: Artificial Intelligence Course (Grades 9-12)',
        description: 'An advanced curriculum on responsible AI usage, understanding algorithmic bias, exploring data governance, and aligning artificial intelligence with human values. Designed specifically for Grades 9–12.',
        modules: {
          create: [
            {
              title: 'AI WISE Advanced Curriculum (9-12)',
              order: 1,
              lessons: {
                create: [
                  {
                    title: 'Submodule 1: Responsible AI Use',
                    order: 1,
                    minimumDwellTime: 60,
                    content: `# Responsible AI Use\n\n### AI Literacy and Human Judgment\nGenerative AI can produce text, images, code, summaries, explanations, and other highly complex content. These capabilities can make our work significantly faster and more efficient, but speed does not remove responsibility. There is a fundamental difference between **assistance** and **delegation**.\n\nAssistance *supports* a person's work; delegation *transfers* a task entirely to a system. Whether delegation is appropriate depends heavily on the task, its rules, and its consequences. Responsible users recognize **automation bias**—the psychological tendency to accept machine outputs too readily—and remain willing to aggressively question AI results.\n\n### Responsible AI for Research and Study\nAI can beautifully support brainstorming, complex explanations, study plans, practice questions, coding assistance, feedback, and revision (where its use is permitted). \n\nA highly responsible research workflow follows this exact sequence: \n**Question → AI-assisted exploration → Reliable sources → Verification → Independent synthesis**.\n\nAI can help generate possibilities and connections, but students should still independently understand the final reasoning and vigorously verify important claims. Institutional rules always take priority.\n\n### Hallucinations, Misinformation and Verification\nGenerative AI can produce plausible but entirely false statements, commonly referred to as a "hallucination." \n\nWarning signs of hallucinated content can include vague or missing sources, completely invented citations, unsupported certainty, inconsistent details, and claims that cannot be independently verified elsewhere.\n\nVerification effort should always match the importance of the claim. A casual creative prompt may need little verification, while a medical, academic, legal, financial, or factual claim requires careful checking against authoritative, peer-reviewed sources.\n\n### Academic Integrity and Disclosure\nAcademic integrity involves honestly representing your original work and following the specific rules of the task. AI use may be permitted in some situations and heavily restricted in others. Students should aggressively check specific requirements rather than assuming one blanket rule applies everywhere.\n\nWhere disclosure is required, clearly explain how AI contributed. For example, a student might state: *"An AI tool was used for brainstorming potential topics and for grammar feedback, while the final analysis, research, and conclusions were independently developed."*\n\n### Privacy, Security and Digital Footprints\nAI tools process vast amounts of information, so users must avoid unnecessarily entering confidential, personal, or sensitive information into prompts. \n\n**Data minimization** means providing only the bare minimum information actually needed for the task, and anonymization can dramatically reduce unnecessary exposure. Before uploading a document, ask yourself:\n- Does it contain personal information?\n- Is it confidential?\n- Am I authorized to upload it?\n- Does the task actually require the full document?\n\n### Responsible AI in Real-World Decisions\nThe consequences of AI mistakes vary wildly by context. A wrong movie recommendation on Netflix may be slightly inconvenient, while an incorrect output in healthcare diagnostics, financial loans, autonomous transport, or criminal justice can have life-altering consequences. Sometimes the most responsible choice is simply not to use AI for a particular high-stakes task.`
                  },
                  {
                    title: 'Submodule 2: AI Ethics',
                    order: 2,
                    minimumDwellTime: 60,
                    content: `# AI Ethics\n\n### Foundations of AI Ethics\nArtificial Intelligence refers to computer systems that perform tasks involving complex capabilities such as pattern recognition, predictive modeling, language processing, and content generation. **AI ethics** examines the profound social and moral questions created by designing and deploying these powerful systems.\n\nImportant foundational principles include fairness, privacy, transparency, accountability, safety, human autonomy, and human oversight. A central idea in AI Ethics is that **technical capability does not automatically justify deployment**. A system can be technically possible to build while still creating unacceptable ethical risks.\n\nAn ethical analysis rigorously asks: Who benefits? Who could be harmed? What rights are affected? What evidence is available? What safeguards are absolutely necessary?\n\n### Fairness, Discrimination and Equality\nAI systems learn exclusively from historical data and decisions produced by flawed people and institutions. If historical data contains unequal patterns or systemic prejudices, a model can easily reproduce or amplify them.\n\nIntent is not the only issue. An organization can create a system without intending to discriminate, yet still produce systematically unfair outcomes. Furthermore, "fairness" has different mathematical meanings: equal treatment, equal access, similar error rates, and similar outcomes are not always the same thing! An ethical assessment needs to rigorously define what specific form of fairness matters for the particular application and why.\n\n### Privacy, Consent and Data Governance\nAI systems process mind-boggling quantities of information. Privacy is concerned not only with secrecy, but also with appropriate collection, use, access, sharing, and retention of information.\n\nImportant data governance concepts include consent, purpose limitation, data minimization, secure retention, and strict access controls. A responsible AI system must have a clearly defined reason for collecting information and should actively avoid collecting data simply because it "might be useful later." If data is reused for a different purpose, that new use must be ethically assessed, not just assumed to be acceptable.\n\n### Transparency, Explainability and Accountability\n**Transparency** means making relevant information about an AI system and its operational use fully understandable to affected people.\n**Explainability** concerns the technical ability to provide meaningful, logical reasons for particular outputs or decisions.\n\nThese concepts are paramount when AI affects high-impact areas like education, employment, finance, or healthcare. **Accountability** means that people and organizations remain legally and morally responsible for how an AI system is designed, deployed, monitored, and acted upon. \n\n### Human Autonomy, Safety and High-Stakes AI\nHuman autonomy dictates that people should retain meaningful control over important decisions affecting their lives. The need for strict safeguards exponentially increases when an AI error could cause serious physical, financial, or emotional harm.\n\nMedical, legal, financial, and safety-related applications require much stronger human oversight than low-risk recommendation algorithms. Responsible AI design should intentionally make it possible for humans to question, override, or instantly kill an AI system when appropriate.\n\n### Ethics in Practice: AI Ethics Review\nA practical AI ethics review follows a logical sequence: **Purpose → Stakeholders → Data → Risks → Fairness → Privacy → Transparency → Safety → Accountability → Monitoring**.\n\nEthical decisions constantly involve complex trade-offs, as improving one outcome (like security) can sometimes create a different risk (like privacy loss). The ultimate goal is not simply to binary-label an AI system 'ethical' or 'unethical', but to identify concrete risks, evaluate empirical evidence, and engineer robust safeguards.`
                  },
                  {
                    title: 'Submodule 3: AI Bias',
                    order: 3,
                    minimumDwellTime: 60,
                    content: `# AI Bias\n\n### Understanding Algorithmic Bias\nAlgorithmic bias refers to systematic, repeatable patterns in an AI or algorithmic system that produce unfair, skewed, or unequal outcomes. Bias can organically arise from historical data, flawed sampling decisions, missing demographic information, inaccurate labels, poor measurement choices, model design, deployment conditions, or human interpretation.\n\nA simple difference in outcomes does not by itself mathematically prove discrimination. A responsible investigation asks: What is the system designed to do? What empirical evidence exists? What external factors could logically explain the result? What exact impact does the result have on marginalized people?\n\n### Data and Representation\nAI systems are utterly dependent on data. If a dataset does not adequately represent the diverse environment in which an AI system will actually be used, performance will differ dramatically across situations.\n\nConsider an image-recognition system trained mostly on one specific demographic; it will perform exceptionally well on similar examples and completely struggle with demographics that were rarely represented. Investigators should critically ask: Who is represented? Who is missing? How was the data collected? Does the data match real-world population distributions?\n**A large dataset is not automatically a representative dataset.**\n\n### Types and Sources of Bias\n- **Sampling bias:** Occurs when collected examples do not adequately represent the relevant population.\n- **Measurement bias:** Occurs when the variable being measured does not accurately represent what we actually want to know.\n- **Labeling bias:** Occurs when human training labels are inaccurate or reflect subjective, flawed judgments.\n- **Historical bias:** Occurs when systemic patterns from historical social conditions permanently taint the training data.\n- **Deployment/Context bias:** Occurs when a system is used in real-world conditions completely different from those in which it was safely developed and tested.\n\n### Measuring Fairness\nFairness is not represented by one universal, magical number. An AI audit may examine overall accuracy, false-positive rates, false-negative rates, or access to opportunities depending entirely on the system's core purpose.\n\nDifferent mathematical fairness measures can sometimes point in completely opposite directions! Therefore, investigators need to formally define what outcome they are attempting to protect, and justify why that measure is appropriate for the particular context.\n\n### Bias Mitigation and Auditing\nBias must be addressed at multiple stages of development:\n- **Before training:** Developers can vastly improve data quality, representation, sampling methods, and labeling accuracy.\n- **During training:** Developers can tweak the mathematical training process, loss functions, or model objectives to penalize biased outcomes.\n- **After training:** They can evaluate outcomes against hold-out sets, introduce appropriate safeguards, and mandate human review.\n- **After deployment:** Systems must continue to be actively monitored because real-world conditions constantly drift.\n\nA responsible AI lifecycle follows: **Identify → Measure → Intervene → Re-test → Monitor**.\n\n### AI Bias Audit\nIn the real world, researchers conduct end-to-end audits of AI systems. An investigation includes rigorously defining the system's decision boundaries, identifying all stakeholders, deeply examining the provenance of the training data, forming risk hypotheses, and establishing testing evidence. It requires interpreting complex statistical evidence, applying technical mitigations, planning re-testing, and establishing long-term post-deployment monitoring indicators.`,
                    assessments: {
                      create: [{
                        title: 'Final Course Quiz (9-12)',
                        questions: {
                          create: [
                            {
                              text: 'What is the fundamental difference between assistance and delegation when using AI?',
                              options: JSON.stringify([
                                'Assistance supports a person\'s work, while delegation transfers a task entirely to a system.',
                                'Assistance is faster than delegation.',
                                'Delegation is only used by programmers, assistance is used by students.',
                                'There is no difference; they mean the exact same thing.'
                              ]),
                              correctOption: 'Assistance supports a person\'s work, while delegation transfers a task entirely to a system.'
                            },
                            {
                              text: 'What does the term "automation bias" refer to?',
                              options: JSON.stringify([
                                'The tendency for robots to be biased against humans.',
                                'The psychological tendency to accept machine outputs too readily without questioning them.',
                                'The bias found exclusively in automated driving systems.',
                                'The preference for automated factories over human workers.'
                              ]),
                              correctOption: 'The psychological tendency to accept machine outputs too readily without questioning them.'
                            },
                            {
                              text: 'In the context of AI privacy, what does "data minimization" mean?',
                              options: JSON.stringify([
                                'Compressing data so it takes up less hard drive space.',
                                'Providing only the bare minimum information actually needed to complete the specific task.',
                                'Deleting all your data from the internet.',
                                'Using the smallest AI model available.'
                              ]),
                              correctOption: 'Providing only the bare minimum information actually needed to complete the specific task.'
                            },
                            {
                              text: 'Why might an AI model systematically reproduce historical discrimination?',
                              options: JSON.stringify([
                                'Because the developers intentionally programmed it to be malicious.',
                                'Because it learns from historical data that contains unequal patterns and systemic prejudices.',
                                'Because the AI model is trying to accurately predict the future.',
                                'Because all computers are inherently flawed.'
                              ]),
                              correctOption: 'Because it learns from historical data that contains unequal patterns and systemic prejudices.'
                            },
                            {
                              text: 'What is "sampling bias" in AI development?',
                              options: JSON.stringify([
                                'When collected examples in the training data do not adequately represent the relevant real-world population.',
                                'When an AI system takes too many samples to generate an image.',
                                'When human labels are inaccurate.',
                                'When an AI system is tested in a different environment than it was trained in.'
                              ]),
                              correctOption: 'When collected examples in the training data do not adequately represent the relevant real-world population.'
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
