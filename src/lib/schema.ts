import {z} from 'zod';
const text=z.string().trim().min(1).max(1500).refine(v=>!/<[^>]+>/.test(v),'Usa texto plano sin HTML');
const link=z.string().refine(v=>/^(#[a-z][a-z0-9-]*|https:\/\/[^\s]+|mailto:[^\s@]+@[^\s@]+)$/.test(v),'Enlace inválido');
const image=z.string().regex(/^\/images\/[a-z0-9._-]+\.(webp|avif|svg|jpg|png)$/);
const action=z.object({label:text,href:link});
const block=z.object({title:text,description:text});
const projects=z.object({title:text,description:text,items:z.array(z.object({title:text,description:text,category:text,image,imageAlt:text})).min(1).max(6)});
export const siteSchema=z.object({kind:z.literal('agency'),version:z.literal('2.0.0'),seo:z.object({title:text,description:text}),brand:z.object({name:text,descriptor:text}),nav:z.array(action).min(1).max(5),hero:z.object({lines:z.array(text).min(1).max(3),description:text,image,imageAlt:text,caption:text,cta:action}),sections:z.array(z.enum(["inicio", "manifiesto", "trabajo", "laboratorio", "servicios", "notas", "contacto"] as const)).min(3).max(9),ui:z.record(text),contact:z.object({title:text,description:text,email:action}),story:z.object({title:text,description:text,note:text,image:image.optional(),imageAlt:text.optional()}),projects:projects.optional(),services:z.object({title:text,items:z.array(block).min(1).max(6)}).optional(),process:z.object({title:text,items:z.array(block).min(1).max(4)}).optional(),menu:projects.optional(),visit:z.object({title:text,description:text,address:text,hours:text,map:action,cta:action}).optional(),scene:z.object({title:text,description:text,mode:z.enum(['house','sculpture']),label:text,fallback:image,controls:z.array(z.object({label:text,value:z.enum(['solid','exploded','knot','wave','core'])})).min(1)}).optional()}).superRefine((s,c)=>{
if(s.sections[0]!=='inicio'||s.sections.at(-1)!=='contacto'||new Set(s.sections).size!==s.sections.length)c.addIssue({code:'custom',path:['sections'],message:'Inicio primero, contacto al final, sin duplicados.'});
for(const n of [...s.nav,s.hero.cta])if(n.href.startsWith('#')&&!s.sections.includes(n.href.slice(1) as typeof s.sections[number]))c.addIssue({code:'custom',path:['nav'],message:`Ancla sin sección: ${n.href}`});
if(!s.projects||!s.services||!s.scene)c.addIssue({code:'custom',message:'Agencia requiere proyectos, servicios y escena'});
for(const key of ['skip','menu','demo','name','email','message','submit','formNote','valid','error','loading','required','emailError','minimum','noJs','footer','pause','resume','sceneFallback','sceneLabel','copyright'])if(!s.ui[key])c.addIssue({code:'custom',path:['ui',key],message:'Texto de interfaz obligatorio'});
});
const color=z.string().regex(/^oklch\(\d+(?:\.\d+)?% 0(?:\.\d+)? \d+(?:\.\d+)?\)$/);
const font=z.enum(['Syne Variable','Fraunces Variable','Manrope Variable']);
export const themeSchema=z.object({paper:color,surface:color,ink:color,muted:color,rule:color,accent:color,accentInk:color,inverse:color,inverseInk:color,white:color,shadow:color,scenePrimary:color,sceneSecondary:color,display:font,body:font});
export type Site=z.infer<typeof siteSchema>;
