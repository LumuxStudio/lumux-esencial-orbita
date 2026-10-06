import {experience} from '../src/lib/experience';
import {motionSchema} from '../src/lib/motion-settings';
import {readFileSync,existsSync} from 'node:fs';
import {siteSchema,themeSchema} from '../src/lib/schema';
motionSchema.parse(JSON.parse(readFileSync('src/content/motion.json','utf8')));
const site=siteSchema.parse(JSON.parse(readFileSync('src/content/site.es.json','utf8')));
themeSchema.parse(JSON.parse(readFileSync('src/content/theme.json','utf8')));
function check(value:unknown){if(typeof value==='string'&&value.startsWith('/images/')&&!existsSync('public'+value))throw new Error('Imagen ausente: '+value);if(value&&typeof value==='object')Object.values(value).forEach(check);}
check(site);check(experience);console.log('Contenido, identidad y recursos válidos.');
