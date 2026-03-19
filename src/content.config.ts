import { z, defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

const projectsCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    techStack: z.array(z.string()),
    status: z.string(),
    bootLog: z.string(),
    order: z.number(),
    link: z.string().optional(),
  }),
});

export const collections = {
  projects: projectsCollection,
};
