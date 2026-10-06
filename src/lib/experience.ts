import {z} from 'zod';
import raw from '../content/experience.json';
const text=z.string().trim().min(1).max(1500).refine(v=>!/<[^>]+>/.test(v),'Solo texto plano');
const image=z.string().regex(/^\/images\/[a-z0-9._-]+\.(webp|svg|avif|png|jpg)$/);
const block=z.object({title:text,description:text,note:text.optional()});
const photo=block.extend({image,imageAlt:text});
const journey=z.object({title:text,description:text,mode:z.literal('particles'),fallback:image,label:text,phases:z.array(text).length(3),controls:z.array(z.object({label:text,value:z.enum(['scroll','core','wave','orbit'])})).min(1).max(4)});
export const experienceSchema=z.object({kind:z.literal('agency'),manifesto:block,journey,notes:photo});
export const experience=experienceSchema.parse(raw);
