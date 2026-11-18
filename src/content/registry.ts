import type * as React from 'react'
import { notFound } from 'next/navigation'
import type { ArticleMeta } from '@/lib/content-types'
import { default as LearnJson, meta as LearnJsonMeta } from './learn/json'
import { default as LearnCsv, meta as LearnCsvMeta } from './learn/csv'
import { default as LearnYaml, meta as LearnYamlMeta } from './learn/yaml'
import { default as LearnXml, meta as LearnXmlMeta } from './learn/xml'
import { default as LearnBase64, meta as LearnBase64Meta } from './learn/base64'
import { default as UseApi, meta as UseApiMeta } from './use-cases/api-debugging'
import { default as UseMigration, meta as UseMigrationMeta } from './use-cases/data-migration'
import { default as UseConfig, meta as UseConfigMeta } from './use-cases/config-conversion'
import { default as UseLog, meta as UseLogMeta } from './use-cases/log-analysis'
import { default as UseTest, meta as UseTestMeta } from './use-cases/test-data'
import { default as UseEncoding, meta as UseEncodingMeta } from './use-cases/encoding'
import { default as CmpJsonCsv, meta as CmpJsonCsvMeta } from './compare/json-vs-csv'
import { default as CmpYamlJson, meta as CmpYamlJsonMeta } from './compare/yaml-vs-json'
import { default as CmpXmlJson, meta as CmpXmlJsonMeta } from './compare/xml-vs-json'
import { default as CmpCsvTsv, meta as CmpCsvTsvMeta } from './compare/csv-vs-tsv'
import { default as CmpYamlToml, meta as CmpYamlTomlMeta } from './compare/yaml-vs-toml'
import { default as CmpCsvExcel, meta as CmpCsvExcelMeta } from './compare/csv-vs-excel'
import { default as CmpYamlXml, meta as CmpYamlXmlMeta } from './compare/yaml-vs-xml'

export type ArticleGroup = 'learn' | 'use-cases' | 'compare'
export type LoadedArticle = { meta: ArticleMeta; Body: () => React.JSX.Element }

const LEARN: Record<string, LoadedArticle> = {
  json: { meta: LearnJsonMeta, Body: LearnJson },
  csv: { meta: LearnCsvMeta, Body: LearnCsv },
  yaml: { meta: LearnYamlMeta, Body: LearnYaml },
  xml: { meta: LearnXmlMeta, Body: LearnXml },
  base64: { meta: LearnBase64Meta, Body: LearnBase64 },
}

const USE_CASES: Record<string, LoadedArticle> = {
  'api-debugging': { meta: UseApiMeta, Body: UseApi },
  'data-migration': { meta: UseMigrationMeta, Body: UseMigration },
  'config-conversion': { meta: UseConfigMeta, Body: UseConfig },
  'log-analysis': { meta: UseLogMeta, Body: UseLog },
  'test-data': { meta: UseTestMeta, Body: UseTest },
  encoding: { meta: UseEncodingMeta, Body: UseEncoding },
}

const COMPARES: Record<string, LoadedArticle> = {
  'json-vs-csv': { meta: CmpJsonCsvMeta, Body: CmpJsonCsv },
  'yaml-vs-json': { meta: CmpYamlJsonMeta, Body: CmpYamlJson },
  'xml-vs-json': { meta: CmpXmlJsonMeta, Body: CmpXmlJson },
  'csv-vs-tsv': { meta: CmpCsvTsvMeta, Body: CmpCsvTsv },
  'yaml-vs-toml': { meta: CmpYamlTomlMeta, Body: CmpYamlToml },
  'csv-vs-excel': { meta: CmpCsvExcelMeta, Body: CmpCsvExcel },
  'yaml-vs-xml': { meta: CmpYamlXmlMeta, Body: CmpYamlXml },
}

export const GROUPS: Record<ArticleGroup, Record<string, LoadedArticle>> = {
  learn: LEARN,
  'use-cases': USE_CASES,
  compare: COMPARES,
}

export function loadArticle(group: ArticleGroup, slug: string): LoadedArticle {
  const found = GROUPS[group][slug]
  if (!found) notFound()
  return found
}

export function slugs(group: ArticleGroup) {
  return Object.keys(GROUPS[group])
}

export const GROUP_LABELS: Record<ArticleGroup, { indexTitle: string; indexDescription: string; crumb: string; path: string }> = {
  learn: {
    indexTitle: 'Data Format Guides: JSON, CSV, YAML, XML, Base64 | FmtTools',
    indexDescription:
      'Complete technical references for the formats developers convert every day: specification rules, failure modes, worked examples and the tooling for each.',
    crumb: 'Format Guides',
    path: '/learn/',
  },
  'use-cases': {
    indexTitle: 'Use Case Toolkits: API, Migration, Config, Logs | FmtTools',
    indexDescription:
      'Task-centred toolkits that group our converters and validators by job: debugging APIs, migrating data, converting config, reading logs and building fixtures.',
    crumb: 'Use Cases',
    path: '/use-cases/',
  },
  compare: {
    indexTitle: 'Format Comparisons: JSON vs CSV vs YAML vs XML | FmtTools',
    indexDescription:
      'Side-by-side comparisons of data formats on size, typing, nesting, tooling and failure modes, with the conversion path between each pair.',
    crumb: 'Comparisons',
    path: '/compare/',
  },
}
