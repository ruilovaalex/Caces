// Genera prisma/data/caces-catalog.json a partir de los datos del frontend.
// Uso: npx tsx scripts/export-catalog.ts
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { MOCK_DATA } from '../../src/data/cacesMockData';
import { PRESENTIAL_REQUIREMENT_KEYS, QUANTITATIVE_INDICATOR_CODES } from '../../src/data/cacesEvaluationRules';

const catalog = MOCK_DATA[0].criteria.map((criterion, ci) => ({
  code: criterion.id,
  name: criterion.name,
  sortOrder: ci + 1,
  subCriteria: criterion.subCriteria.map((sub, si) => ({
    code: sub.id,
    name: sub.name,
    sortOrder: si + 1,
    indicators: sub.indicators.map((indicator, ii) => ({
      code: indicator.code,
      name: indicator.name,
      description: indicator.description,
      type: QUANTITATIVE_INDICATOR_CODES.has(indicator.code) ? 'CUANTITATIVO' : 'CUALITATIVO',
      sortOrder: ii + 1,
      requirements: indicator.requirements.map(requirement => ({
        number: Number(requirement.id),
        label: requirement.label,
        description: requirement.description,
        format: requirement.format,
        mode: PRESENTIAL_REQUIREMENT_KEYS.has(`${indicator.code}#${requirement.id}`) ? 'PRESENCIAL' : 'DOCUMENTAL',
      })),
    })),
  })),
}));

writeFileSync(join(__dirname, '../prisma/data/caces-catalog.json'), JSON.stringify(catalog, null, 2) + '\n', 'utf8');
const indicators = catalog.flatMap(c => c.subCriteria.flatMap(s => s.indicators));
const reqs = indicators.flatMap(i => i.requirements);
console.log(`criterios=${catalog.length} subcriterios=${catalog.reduce((a, c) => a + c.subCriteria.length, 0)} indicadores=${indicators.length} requerimientos=${reqs.length} presenciales=${reqs.filter(r => r.mode === 'PRESENCIAL').length} cuantitativos=${indicators.filter(i => i.type === 'CUANTITATIVO').length}`);
