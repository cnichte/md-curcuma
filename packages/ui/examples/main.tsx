import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Button, MantineProvider, Modal, Stack, Text, Textarea } from '@mantine/core'
import '@mantine/core/styles.css'
import { TextTransformer, type TextRules } from 'md-curcuma-core'
import { RuleEditor, SourceTargetTable, TransformationPreview, type RuleEditorLabels } from '../dist/index.js'

const theme = { text: 'var(--mantine-color-text)', secondary: 'var(--mantine-color-dimmed)', error: 'var(--mantine-color-error)' }
const labels: RuleEditorLabels = {
  conditions: 'Conditions', actions: 'Transformations', match: 'Match', all: 'All', any: 'Any',
  addCondition: 'Add condition', addAction: 'Add transformation', remove: 'Remove', up: 'Up', down: 'Down',
  value: 'Value', find: 'Find', replacement: 'Replacement', invalid: 'Invalid input is not saved',
  conditionNames: { 'not-empty': 'Not empty', contains: 'Contains', equals: 'Equals' },
  actionNames: { trim: 'Trim', uppercase: 'Uppercase', lowercase: 'Lowercase', prefix: 'Prefix', suffix: 'Suffix', replace: 'Replace' }
}

function WebsiteHost() {
  const [input, setInput] = useState('  **Biography**  ')
  const [rules, setRules] = useState<TextRules>({ match: 'all', conditions: [{ kind: 'not-empty' }], actions: [{ kind: 'trim' }] })
  const [opened, setOpened] = useState(false)
  const [valid, setValid] = useState(true)
  const [preview, setPreview] = useState<ReturnType<TextTransformer['transform']> | null>(null)
  return <MantineProvider><Stack p="md">
    <Text fw={700}>Curcuma: isolated website host</Text>
    <Textarea label="Selected Markdown source" value={input} onChange={event => { setInput(event.currentTarget.value); setPreview(null) }} />
    <SourceTargetTable theme={theme}
      labels={{ source: 'Source', target: 'Target', rules: 'Rules', actions: 'Actions', empty: 'Empty' }}
      rows={[{ id: 'biography', source: 'Artist / Biography.md', target: 'Artist page / mainText',
        rules: <Button onClick={() => setOpened(true)}>Edit rules</Button> }]} />
    <Modal opened={opened} onClose={() => { if (valid) setOpened(false) }} title="Rules and preview" size="lg">
      <Stack>
        <RuleEditor value={rules} labels={labels} theme={theme} onValidityChange={setValid}
          onChange={rules => { setRules(rules); setPreview(null) }} />
        <Button disabled={!valid} onClick={() => setPreview(new TextTransformer().transform(input, rules))}>Preview</Button>
        {preview && valid && <TransformationPreview result={preview} theme={theme} labels={{ input: 'Input', output: 'Output', blocked: 'Publication blocked' }} />}
      </Stack>
    </Modal>
    <Text size="xs">No filesystem, Studio, Electron, autosave service or deployment target.</Text>
  </Stack></MantineProvider>
}

createRoot(document.getElementById('root')!).render(<WebsiteHost />)
