import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createElement as h } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MantineProvider } from '@mantine/core'
import { SourceTargetTable, RuleEditor, TransformationPreview } from '../dist/index.js'
import { TextTransformer } from 'md-curcuma-core'

const theme = { text: 'var(--text)', secondary: 'var(--secondary)', error: 'var(--error)' }
const render = component => renderToStaticMarkup(h(MantineProvider, null, component))
test('an isolated host supplies source/target cells without Studio or Electron', () => {
  const html = render(h(SourceTargetTable, {
    theme, labels: { source: 'Source', target: 'Target', rules: 'Rules', actions: 'Actions', empty: 'Empty' },
    rows: [{ id: 'a', source: 'Biography.md', target: 'Artist / mainText', rules: 'Trim' }]
  }))
  assert.match(html, /data-curcuma-row="a"/)
  for (const text of ['Biography.md', 'Artist / mainText', 'Rules']) assert.ok(html.includes(text))
})
test('preview shows exactly the shared core result, never HTML execution', () => {
  const result = new TextTransformer().transform(' <script> ', { match: 'all', conditions: [], actions: [{ kind: 'trim' }] })
  const html = render(h(TransformationPreview, { result, theme, labels: { input: 'Input', output: 'Output', blocked: 'Blocked' } }))
  assert.match(html, /&lt;script&gt;/)
  assert.ok(!html.includes('<script>'))
})
test('blocked preview has no output field', () => {
  const result = new TextTransformer().transform('', { match: 'all', conditions: [{ kind: 'not-empty' }], actions: [] })
  const html = render(h(TransformationPreview, { result, theme, labels: { input: 'Input', output: 'Output', blocked: 'Blocked' } }))
  assert.match(html, /role="alert"/)
  assert.ok(!html.includes('Output'))
})
test('rule editor renders host labels, conditions and ordered transformations', () => {
  const labels = {
    conditions: 'Conditions', actions: 'Transformations', match: 'Match', all: 'All', any: 'Any',
    addCondition: 'Add condition', addAction: 'Add action', remove: 'Remove', up: 'Up', down: 'Down',
    value: 'Value', find: 'Find', replacement: 'Replacement', invalid: 'Invalid',
    conditionNames: { 'not-empty': 'Not empty', contains: 'Contains', equals: 'Equals' },
    actionNames: { trim: 'Trim', uppercase: 'Uppercase', lowercase: 'Lowercase', prefix: 'Prefix', suffix: 'Suffix', replace: 'Replace' }
  }
  const html = render(h(RuleEditor, { theme, labels, value: { match: 'all', conditions: [{ kind: 'not-empty' }],
    actions: [{ kind: 'prefix', value: 'Header' }, { kind: 'trim' }] }, onChange: () => {} }))
  assert.ok(html.includes('Header'))
  assert.ok(html.indexOf('Prefix') < html.lastIndexOf('Trim'))
})
