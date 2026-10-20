#!/usr/bin/env node
import { TextTransformer } from './index.js'

async function main(): Promise<void> {
  let json = ''
  for await (const chunk of process.stdin) json += chunk
  const value: unknown = JSON.parse(json)
  if (!value || typeof value !== 'object' || !('input' in value) || typeof value.input !== 'string' ||
    !('rules' in value) || Object.keys(value).some(key => !['input', 'rules'].includes(key))) {
    throw new Error('Expected JSON { input: string, rules: TextRules } on stdin')
  }
  const result = new TextTransformer().transform(value.input, value.rules)
  process.stdout.write(`${JSON.stringify(result)}\n`)
  if (result.status === 'blocked') process.exitCode = 2
}

main().catch(error => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`)
  process.exitCode = 1
})
