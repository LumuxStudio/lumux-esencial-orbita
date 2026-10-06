import raw from '../content/site.es.json';
import colors from '../content/theme.json';
import {siteSchema,themeSchema} from './schema';
export const site=siteSchema.parse(raw);
export const theme=themeSchema.parse(colors);
