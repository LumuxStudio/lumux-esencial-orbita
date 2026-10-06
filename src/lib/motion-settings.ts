import {z} from 'zod';
export const motionSchema=z.object({lerp:z.number().min(.04).max(.2),wheelMultiplier:z.number().min(.5).max(1.5),heroScroll:z.number().min(.2).max(1.5),featureScroll:z.number().min(.2).max(1.5),parallax:z.number().min(0).max(.2)});
