export type TextCondition =
  | { kind: 'not-empty' }
  | { kind: 'contains' | 'equals'; value: string }

export type TextAction =
  | { kind: 'trim' | 'uppercase' | 'lowercase' }
  | { kind: 'prefix' | 'suffix'; value: string }
  | { kind: 'replace'; find: string; replacement: string }

export interface TextRules {
  match: 'all' | 'any'
  conditions: TextCondition[]
  actions: TextAction[]
}

export interface TextProfile {
  id: string
  name: string
  rules: TextRules
}

export interface TransformationDiagnostic {
  code: 'condition-unmatched'
  message: string
}

export type TextTransformationResult =
  | { status: 'ready'; input: string; output: string; diagnostics: [] }
  | { status: 'blocked'; input: string; diagnostics: TransformationDiagnostic[] }

export class CurcumaContractError extends Error {
  constructor(public readonly field: string, message: string) {
    super(`Curcuma ${field}: ${message}`)
    this.name = 'CurcumaContractError'
  }
}

export class TextRuleContract {
  static parse(value: unknown): TextRules {
    this.assert(value)
    return structuredClone(value)
  }

  static assert(value: unknown): asserts value is TextRules {
    const rules = this.record(value, 'rules', ['match', 'conditions', 'actions'])
    if (rules.match !== 'all' && rules.match !== 'any') this.fail('rules.match', 'Expected all or any')
    if (!Array.isArray(rules.conditions) || !Array.isArray(rules.actions)) this.fail('rules', 'Expected condition and action arrays')
    rules.conditions.forEach((value, index) => {
      const field = `rules.conditions[${index}]`
      const condition = this.kind(value, field)
      switch (condition.kind) {
        case 'not-empty': this.record(value, field, ['kind']); break
        case 'contains':
        case 'equals':
          this.record(value, field, ['kind', 'value'])
          this.text(condition.value, `${field}.value`)
          break
        default: this.fail(`${field}.kind`, 'Unknown condition')
      }
    })
    rules.actions.forEach((value, index) => {
      const field = `rules.actions[${index}]`
      const action = this.kind(value, field)
      switch (action.kind) {
        case 'trim':
        case 'uppercase':
        case 'lowercase': this.record(value, field, ['kind']); break
        case 'prefix':
        case 'suffix':
          this.record(value, field, ['kind', 'value'])
          this.text(action.value, `${field}.value`)
          break
        case 'replace':
          this.record(value, field, ['kind', 'find', 'replacement'])
          this.text(action.find, `${field}.find`)
          if (!action.find.length) this.fail(`${field}.find`, 'Search text must not be empty')
          this.text(action.replacement, `${field}.replacement`)
          break
        default: this.fail(`${field}.kind`, 'Unknown transformation')
      }
    })
  }

  static profiles(value: unknown): TextProfile[] {
    if (!Array.isArray(value)) this.fail('profiles', 'Expected array')
    const ids = new Set<string>()
    value.forEach((entry, index) => {
      const field = `profiles[${index}]`
      const profile = this.record(entry, field, ['id', 'name', 'rules'])
      this.text(profile.id, `${field}.id`)
      this.text(profile.name, `${field}.name`)
      if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(profile.id) || ids.has(profile.id)) this.fail(`${field}.id`, 'Expected unique identifier')
      if (!profile.name.trim()) this.fail(`${field}.name`, 'Name must not be empty')
      ids.add(profile.id)
      this.assert(profile.rules)
    })
    return structuredClone(value)
  }

  private static kind(value: unknown, field: string): Record<string, unknown> {
    if (!value || typeof value !== 'object' || Array.isArray(value) || !('kind' in value)) this.fail(field, 'Expected operation')
    return value as Record<string, unknown>
  }

  private static record(value: unknown, field: string, keys: string[]): Record<string, unknown> {
    if (!value || typeof value !== 'object' || Array.isArray(value) ||
      ![Object.prototype, null].includes(Object.getPrototypeOf(value))) this.fail(field, 'Expected plain object')
    const record = value as Record<string, unknown>
    if (Object.keys(record).length !== keys.length || keys.some(key => !Object.hasOwn(record, key))) this.fail(field, `Expected only ${keys.join(', ')}`)
    return record
  }

  private static text(value: unknown, field: string): asserts value is string {
    if (typeof value !== 'string') this.fail(field, 'Expected text')
  }

  private static fail(field: string, message: string): never {
    throw new CurcumaContractError(field, message)
  }
}

/** Pure content transformation: no IO, implicit exclusion or clock-dependent values. */
export class TextTransformer {
  transform(input: string, value: unknown, signal?: AbortSignal): TextTransformationResult {
    signal?.throwIfAborted()
    if (typeof input !== 'string') throw new CurcumaContractError('input', 'Expected text')
    const rules = TextRuleContract.parse(value)
    const matches = rules.conditions.map(condition => {
      switch (condition.kind) {
        case 'not-empty': return input.trim().length > 0
        case 'contains': return input.includes(condition.value)
        case 'equals': return input === condition.value
      }
    })
    const matched = !matches.length || (rules.match === 'all' ? matches.every(Boolean) : matches.some(Boolean))
    if (!matched) return {
      status: 'blocked', input,
      diagnostics: [{ code: 'condition-unmatched', message: 'Conditions did not match; publication requires resolution.' }]
    }
    let output = input
    for (const action of rules.actions) {
      signal?.throwIfAborted()
      switch (action.kind) {
        case 'trim': output = output.trim(); break
        case 'uppercase': output = output.toUpperCase(); break
        case 'lowercase': output = output.toLowerCase(); break
        case 'prefix': output = action.value + output; break
        case 'suffix': output += action.value; break
        case 'replace': output = output.split(action.find).join(action.replacement); break
      }
    }
    return { status: 'ready', input, output, diagnostics: [] }
  }
}
