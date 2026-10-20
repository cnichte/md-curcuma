import assert from 'node:assert/strict'
import { test } from 'node:test'
import { spawnSync } from 'node:child_process'
import { TextTransformer, TextRuleContract } from '../dist/index.js'

const rules = { match: 'all', conditions: [{ kind: 'not-empty' }], actions: [
  { kind: 'trim' }, { kind: 'replace', find: 'Draft', replacement: 'Published' }, { kind: 'prefix', value: '# ' }
] }

test('preserves input/configuration and transforms in explicit order', () => {
  const original = structuredClone(rules)
  assert.deepEqual(new TextTransformer().transform('  Draft  ', rules), {
    status: 'ready', input: '  Draft  ', output: '# Published', diagnostics: []
  })
  assert.deepEqual(rules, original)
})
test('conditions use the original input; no match blocks without success-shaped output', () => {
  const result = new TextTransformer().transform(' ', rules)
  assert.equal(result.status, 'blocked')
  assert.equal('output' in result, false)
  assert.equal(result.diagnostics[0].code, 'condition-unmatched')
})
test('all/any are explicit, empty condition lists are unconditional', () => {
  const base = { match: 'any', conditions: [{ kind: 'equals', value: 'no' }, { kind: 'contains', value: 'yes' }], actions: [] }
  assert.equal(new TextTransformer().transform('yes!', base).status, 'ready')
  assert.equal(new TextTransformer().transform('yes!', { ...base, match: 'all' }).status, 'blocked')
  assert.equal(new TextTransformer().transform('', { ...base, conditions: [] }).status, 'ready')
})
test('rejects unknown code, instances, extra parameters and empty search', () => {
  for (const action of [{ kind: 'execute', code: 'x' }, { kind: 'trim', extra: true },
    { kind: 'replace', find: '', replacement: 'x' }, { kind: 'suffix', value: 12 }]) {
    assert.throws(() => TextRuleContract.parse({ ...rules, actions: [action] }), /Curcuma/)
  }
  assert.throws(() => TextRuleContract.parse(new class { match = 'all'; conditions = []; actions = [] }()), /plain object/)
  assert.throws(() => TextRuleContract.profiles([{ id: 'a', name: 'A', rules }, { id: 'a', name: 'B', rules }]), /unique/)
})
test('aborted calls never transform', () => {
  assert.throws(() => new TextTransformer().transform('text', rules, AbortSignal.abort()))
})
test('CLI and library return identical JSON for ready and blocked inputs', () => {
  for (const input of ['  Draft  ', ' ']) {
    const cli = spawnSync(process.execPath, [new URL('../dist/cli.js', import.meta.url).pathname], {
      input: JSON.stringify({ input, rules }), encoding: 'utf8'
    })
    const result = new TextTransformer().transform(input, rules)
    assert.equal(cli.status, result.status === 'ready' ? 0 : 2)
    assert.deepEqual(JSON.parse(cli.stdout), result)
  }
})
test('CLI invalid JSON fails explicitly without a successful result', () => {
  const cli = spawnSync(process.execPath, [new URL('../dist/cli.js', import.meta.url).pathname], { input: '{', encoding: 'utf8' })
  assert.equal(cli.status, 1)
  assert.equal(cli.stdout, '')
  assert.ok(cli.stderr.length)
})
