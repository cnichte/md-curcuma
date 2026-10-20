import { useEffect, useState, type ReactNode, type ReactElement } from 'react'
import { Button, Group, Select, Stack, Table, Text, Textarea, TextInput } from '@mantine/core'
import { TextRuleContract, type TextRules, type TextCondition, type TextAction, type TextTransformationResult } from 'md-curcuma-core'

export interface CurcumaTheme {
  text: string
  secondary: string
  error: string
}

export interface MappingRow {
  id: string
  source: ReactNode
  target: ReactNode
  rules: ReactNode
  actions?: ReactNode
}

export interface SourceTargetTableProps {
  rows: MappingRow[]
  labels: { source: string; target: string; rules: string; actions: string; empty: string }
  theme: CurcumaTheme
}

export function SourceTargetTable({ rows, labels, theme }: SourceTargetTableProps): ReactElement {
  if (!rows.length) return <Text size="sm" c={theme.secondary}>{labels.empty}</Text>
  return <Table.ScrollContainer minWidth={1000}>
    <Table style={{ color: theme.text }}>
      <Table.Thead><Table.Tr>
        <Table.Th miw={260}>{labels.source}</Table.Th>
        <Table.Th miw={360}>{labels.target}</Table.Th>
        <Table.Th miw={220}>{labels.rules}</Table.Th>
        <Table.Th miw={160}>{labels.actions}</Table.Th>
      </Table.Tr></Table.Thead>
      <Table.Tbody>{rows.map(row => <Table.Tr key={row.id} data-curcuma-row={row.id}>
        {[row.source, row.target, row.rules, row.actions].map((cell, index) =>
          <Table.Td key={index} style={{ verticalAlign: 'top', whiteSpace: 'normal', overflowWrap: 'anywhere' }}>{cell}</Table.Td>)}
      </Table.Tr>)}</Table.Tbody>
    </Table>
  </Table.ScrollContainer>
}

export interface RuleEditorLabels {
  conditions: string; actions: string; match: string; all: string; any: string
  addCondition: string; addAction: string; remove: string; up: string; down: string
  value: string; find: string; replacement: string; invalid: string
  conditionNames: Record<TextCondition['kind'], string>
  actionNames: Record<TextAction['kind'], string>
}

export interface RuleEditorProps {
  value: TextRules
  onChange(value: TextRules): void
  onValidityChange?(valid: boolean): void
  labels: RuleEditorLabels
  theme: CurcumaTheme
}

export function RuleEditor({ value, onChange, onValidityChange, labels, theme }: RuleEditorProps): ReactElement {
  const [draft, setDraft] = useState(value)
  const [error, setError] = useState<string | null>(null)
  const revision = JSON.stringify(value)
  useEffect(() => {
    setDraft(value)
    setError(null)
    onValidityChange?.(true)
  }, [revision])
  const change = (next: TextRules): void => {
    setDraft(next)
    let parsed: TextRules
    try {
      parsed = TextRuleContract.parse(next)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause))
      onValidityChange?.(false)
      return
    }
    setError(null)
    onValidityChange?.(true)
    onChange(parsed)
  }
  const condition = (index: number, next: TextCondition): void =>
    change({ ...draft, conditions: draft.conditions.map((item, i) => i === index ? next : item) })
  const action = (index: number, next: TextAction): void =>
    change({ ...draft, actions: draft.actions.map((item, i) => i === index ? next : item) })
  const move = (index: number, offset: number): void => {
    const actions = [...draft.actions]
    const target = index + offset
    if (target < 0 || target >= actions.length) throw new Error('Curcuma: action move outside list')
    ;[actions[index], actions[target]] = [actions[target], actions[index]]
    change({ ...draft, actions })
  }
  return <Stack c={theme.text}>
    {error && <Text role="alert" c={theme.error}>{labels.invalid}: {error}</Text>}
    <Text fw={600}>{labels.conditions}</Text>
    <Select label={labels.match} value={draft.match}
      data={[{ value: 'all', label: labels.all }, { value: 'any', label: labels.any }]}
      onChange={match => { if (match === 'all' || match === 'any') change({ ...draft, match }) }} />
    {draft.conditions.map((item, index) => <Group key={index} align="end" wrap="wrap">
      <Select aria-label={`${labels.conditions} ${index + 1}`} value={item.kind}
        data={Object.entries(labels.conditionNames).map(([value, label]) => ({ value, label }))}
        onChange={kind => {
          if (kind === 'not-empty') condition(index, { kind })
          else if (kind === 'contains' || kind === 'equals') condition(index, { kind, value: 'value' in item ? item.value : '' })
        }} />
      {'value' in item && <TextInput label={labels.value} value={item.value}
        onChange={event => condition(index, { ...item, value: event.currentTarget.value })} />}
      <Button variant="subtle" onClick={() => change({ ...draft, conditions: draft.conditions.filter((_, i) => i !== index) })}>{labels.remove}</Button>
    </Group>)}
    <Button variant="default" onClick={() => change({ ...draft, conditions: [...draft.conditions, { kind: 'not-empty' }] })}>{labels.addCondition}</Button>
    <Text fw={600}>{labels.actions}</Text>
    {draft.actions.map((item, index) => <Stack key={index} gap="xs">
      <Group align="end" wrap="wrap">
        <Select aria-label={`${labels.actions} ${index + 1}`} value={item.kind}
          data={Object.entries(labels.actionNames).map(([value, label]) => ({ value, label }))}
          onChange={kind => {
            if (kind === 'trim' || kind === 'uppercase' || kind === 'lowercase') action(index, { kind })
            else if (kind === 'prefix' || kind === 'suffix') action(index, { kind, value: '' })
            else if (kind === 'replace') action(index, { kind, find: '', replacement: '' })
          }} />
        <Button variant="default" disabled={index === 0} onClick={() => move(index, -1)}>{labels.up}</Button>
        <Button variant="default" disabled={index === draft.actions.length - 1} onClick={() => move(index, 1)}>{labels.down}</Button>
        <Button variant="subtle" onClick={() => change({ ...draft, actions: draft.actions.filter((_, i) => i !== index) })}>{labels.remove}</Button>
      </Group>
      {'value' in item && <TextInput label={labels.value} value={item.value}
        onChange={event => action(index, { ...item, value: event.currentTarget.value })} />}
      {item.kind === 'replace' && <Group grow>
        <TextInput label={labels.find} value={item.find} error={!item.find.length}
          onChange={event => action(index, { ...item, find: event.currentTarget.value })} />
        <TextInput label={labels.replacement} value={item.replacement}
          onChange={event => action(index, { ...item, replacement: event.currentTarget.value })} />
      </Group>}
    </Stack>)}
    <Button variant="default" onClick={() => change({ ...draft, actions: [...draft.actions, { kind: 'trim' }] })}>{labels.addAction}</Button>
  </Stack>
}

export function TransformationPreview({ result, labels, theme }: {
  result: TextTransformationResult
  labels: { input: string; output: string; blocked: string }
  theme: CurcumaTheme
}): ReactElement {
  return <Stack>
    <Textarea label={labels.input} value={result.input} readOnly autosize maxRows={12} />
    {result.status === 'ready'
      ? <Textarea label={labels.output} value={result.output} readOnly autosize maxRows={12} />
      : <Text role="alert" c={theme.error}>{labels.blocked}</Text>}
  </Stack>
}
