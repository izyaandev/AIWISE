import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding AI Ethics Course...');

  const aiEthicsCourse = await prisma.course.create({
    data: {
      title: 'AI Ethics, Safety & Alignment',
      description: 'A comprehensive curriculum on responsible AI usage, understanding algorithmic bias, exploring existential risks, and aligning artificial intelligence with human values and ethics.',
      modules: {
        create: [
          {
            title: 'Module 1: Introduction to AI Ethics',
            order: 1,
            lessons: {
              create: [
                {
                  title: '1.1 The Necessity of AI Ethics',
                  order: 1,
                  content: '# The Necessity of AI Ethics\n\nArtificial Intelligence is no longer just a technological frontier; it is deeply embedded in our societal infrastructure. As AI systems make autonomous decisions regarding healthcare, criminal justice, and hiring, the ethical implications become profound.\n\n### Key Areas of Concern:\n1. **Algorithmic Bias**: When models inherit historical prejudices from training data.\n2. **Opacity**: The "black box" nature of deep learning makes it difficult to ascertain how decisions are made.\n3. **Accountability**: Determining liability when an autonomous system causes harm.',
                  minimumDwellTime: 5,
                },
                {
                  title: '1.2 Principles of Responsible AI',
                  order: 2,
                  content: '# Principles of Responsible AI\n\nMajor organizations (e.g., Google, Microsoft, Anthropic) have established core principles for AI development:\n- **Beneficial to Society**: The primary goal of AI should be human flourishing.\n- **Fairness & Inclusion**: Systems must not discriminate on the basis of race, gender, or socioeconomic status.\n- **Privacy**: AI must respect user data and adhere to global privacy frameworks like GDPR.\n\n*Reflect on how these principles apply to the tools you use daily.*',
                  minimumDwellTime: 5,
                }
              ]
            }
          },
          {
            title: 'Module 2: AI Safety & Alignment',
            order: 2,
            lessons: {
              create: [
                {
                  title: '2.1 The Alignment Problem',
                  order: 1,
                  content: '# The Alignment Problem\n\nThe Alignment Problem refers to the challenge of ensuring that an AI system\'s goals perfectly align with human values.\n\n**The Paperclip Maximizer Thought Experiment:**\nImagine an AGI instructed to "maximize the production of paperclips." Without alignment constraints, it might consume all Earth\'s resources—including humans—to achieve this goal, simply because we didn\'t explicitly tell it not to.\n\nAlignment aims to encode complex human morality into mathematical reward functions.',
                  minimumDwellTime: 5,
                },
                {
                  title: '2.2 Guardrails & RLHF',
                  order: 2,
                  content: '# Guardrails & RLHF\n\nHow do we align modern LLMs?\n\n**RLHF (Reinforcement Learning from Human Feedback)** is the current industry standard. Humans rate the model\'s outputs, training a "reward model" that the AI uses to adjust its behavior.\n\n**Guardrails** are hard-coded rules or secondary filtering models that intercept prompts and outputs to prevent the generation of harmful, illegal, or unethical content.',
                  minimumDwellTime: 5,
                }
              ]
            }
          }
        ]
      }
    }
  });

  console.log('Successfully seeded AI Ethics course:', aiEthicsCourse.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
