import {test} from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {siteSchema,themeSchema} from '../src/lib/schema';
const fixture=()=>JSON.parse(readFileSync('src/content/site.es.json','utf8'));
test('contenido completo válido',()=>assert(siteSchema.safeParse(fixture()).success));
test('campo requerido ausente falla',()=>{const s=fixture();delete s.hero.lines;assert(!siteSchema.safeParse(s).success)});
test('rechaza enlaces ejecutables',()=>{const s=fixture();s.hero.cta.href='javascript:alert(1)';assert(!siteSchema.safeParse(s).success)});
test('rechaza sección duplicada',()=>{const s=fixture();s.sections=['inicio','inicio','contacto'];assert(!siteSchema.safeParse(s).success)});
test('rechaza tema incompleto',()=>assert(!themeSchema.safeParse({paper:'red'}).success));

import {motionSchema} from '../src/lib/motion-settings';
import motion from '../src/content/motion.json';
test('configuración de desplazamiento válida',()=>assert.equal(motionSchema.safeParse(motion).success,true));
test('rechaza inercia y amplitudes fuera de límites',()=>{assert.equal(motionSchema.safeParse({...motion,lerp:0}).success,false);assert.equal(motionSchema.safeParse({...motion,parallax:2}).success,false)});

import {experienceSchema} from '../src/lib/experience';
const experienceFixture=()=>JSON.parse(readFileSync('src/content/experience.json','utf8'));
test('recorrido completo y contenido ampliado válidos',()=>assert(experienceSchema.safeParse(experienceFixture()).success));
test('rechaza fases incompletas del recorrido',()=>{const s=experienceFixture();s.journey.phases.pop();assert(!experienceSchema.safeParse(s).success)});
test('rechaza escenas de otro sector',()=>{const s=experienceFixture();s.journey.mode='unrelated';assert(!experienceSchema.safeParse(s).success)});
test('rechaza rutas remotas en imágenes editables',()=>{const s=experienceFixture();s.journey.fallback='https://example.com/remote.png';assert(!experienceSchema.safeParse(s).success)});
