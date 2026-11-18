'use client'

import * as React from 'react'
import { Segmented, ToggleField } from '@/components/tool/controls'
import { InputPane, OptionsBar, OutputPane, ResultBanner, StatGrid, bytesOf } from '@/components/tool/panes'
import { DataTable } from '@/components/content'
import { Tabs, TabPanel, useHashTab } from '@/components/ui/tabs'
import {
  analyseUrl,
  buildQuery,
  normalisePercentEncoding,
  percentDecode,
  percentEncode,
  type DecodeIssue,
  type EncodeMode,
} from '@/lib/tools/url'

const ENCODE_SAMPLE = 'https://example.com/search?q=C++ & "quotes"/€#tag'
const DECODE_SAMPLE = '%7B%22q%22%3A%22C%2B%2B%22%2C%22lang%22%3A%22zh-CN%22%7D'
const URL_SAMPLE = 'https://user:pass@api.example.com:8443/v1/orders//list?ids%5B%5D=7&ids%5B%5D=8&q=C%2B%2B&redirect=/home#section-2'

const MODE_LABELS: Record<EncodeMode, { label: string; note: string }> = {
  component: { label: 'encodeURIComponent', note: 'JS component encoder — keeps - _ . ! ~ * \' ( ) and escapes /, so paths break.' },
  path: { label: 'Path segment', note: 'RFC 3986 §3.3 — sub-delims and ":" "@" may stay, "?" "#" must go.' },
  'query-value': { label: 'Query value', note: 'Escapes the delimiters "&", "=", "+" and "#" so a value cannot inject parameters.' },
  uri: { label: 'Whole URI', note: 'Only escapes characters RFC 3986 §2.4 excludes, plus invalid % pairs — safe on a complete URL.' },
  form: { label: 'Form (x-www-form-urlencoded)', note: 'HTML form serialisation: space becomes "+", only - . _ * and alphanumerics stay.' },
}

const SEVERITY_CLASS = {
  error: 'bg-rose-600 text-white',
  warning: 'bg-amber-500 text-white',
  info: 'bg-sky-600 text-white',
} as const

function IssueList({ issues }: { issues: DecodeIssue[] }) {
  if (issues.length === 0) return null
  return (
    <ul className="mt-3 space-y-2.5">
      {issues.map((issue, index) => (
        <li key={`${issue.code}-${index}`} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <p className="flex flex-wrap items-baseline gap-2">
            <span className={`rounded px-1.5 py-0.5 text-[0.625rem] font-bold uppercase ${SEVERITY_CLASS[issue.severity]}`}>{issue.severity}</span>
            <span className="font-mono text-xs text-slate-500">{issue.code}</span>
            <span className="text-[0.8125rem] font-semibold text-slate-900">{issue.message}</span>
          </p>
          {issue.hint ? <p className="mt-1 text-[0.8125rem] leading-relaxed text-slate-600">{issue.hint}</p> : null}
        </li>
      ))}
    </ul>
  )
}

function EncodeTab() {
  const [input, setInput] = React.useState(ENCODE_SAMPLE)
  const [mode, setMode] = React.useState<EncodeMode>('component')
  const [uppercase, setUppercase] = React.useState(true)

  const result = React.useMemo(() => (input ? percentEncode(input, mode, uppercase) : null), [input, mode, uppercase])
  const canonical = React.useMemo(() => (result ? normalisePercentEncoding(result.output) : null), [result])

  return (
    <div className="space-y-4">
      <OptionsBar className="lg:grid-cols-2">
        <div className="min-w-0">
          <p className="mb-1.5 text-[0.6875rem] font-bold uppercase tracking-wider text-slate-500">Context</p>
          <Segmented
            legend="Encoding context"
            value={mode}
            onChange={(value) => setMode(value as EncodeMode)}
            options={(Object.keys(MODE_LABELS) as EncodeMode[]).map((value) => ({
              value,
              label: MODE_LABELS[value].label,
              title: MODE_LABELS[value].note,
            }))}
          />
        </div>
        <ToggleField label="Uppercase hex digits" hint="RFC 3986 §6.2.2.1 recommends %2F over %2f so identical URLs compare equal" checked={uppercase} onChange={setUppercase} />
      </OptionsBar>

      <p className="rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-[0.8125rem] leading-relaxed text-slate-600">
        <span className="font-semibold text-slate-800">{MODE_LABELS[mode].label}:</span> {MODE_LABELS[mode].note} Percent-encoding is context dependent —
        the same string needs a different escape set in a path, a query value and a form body, which is why “URL encode” boxes produce wrong output so often.
      </p>

      <div className="grid gap-4 lg:grid-cols-2">
        <InputPane
          label="Text to encode"
          ariaLabel="Text to percent-encode"
          value={input}
          onChange={setInput}
          onSample={() => setInput(ENCODE_SAMPLE)}
          placeholder="Type the value that has to survive transport inside a URL…"
          stats={[
            { label: 'Characters', value: String(input.length) },
            { label: 'UTF-8 bytes', value: String(bytesOf(input)) },
          ]}
        />
        <OutputPane
          label="Percent-encoded"
          value={result?.output ?? ''}
          filename="encoded-url.txt"
          mime="text/plain;charset=utf-8"
          stats={
            result
              ? [
                  { label: 'Escapes', value: String(result.escapes) },
                  { label: 'Length', value: `${result.originalLength} → ${result.encodedLength}` },
                ]
              : undefined
          }
        />
      </div>

      {result && canonical && canonical.changed > 0 ? (
        <ResultBanner
          tone="info"
          title={`${canonical.changed} ${canonical.changed === 1 ? 'character' : 'characters'} in that output can be written more canonically`}
          detail={<p className="font-mono text-xs">{canonical.output}</p>}
        />
      ) : null}

      {result && result.issues.length > 0 ? (
        <section className="rounded-xl border border-slate-200 bg-white p-3.5">
          <h2 className="text-[0.8125rem] font-bold uppercase tracking-wider text-slate-600">What changed and why</h2>
          <IssueList issues={result.issues} />
        </section>
      ) : null}

      {result ? (
        <StatGrid
          items={[
            { label: 'Input characters', value: String(result.originalLength) },
            { label: 'Input UTF-8 bytes', value: String(bytesOf(input)) },
            { label: 'Output characters', value: String(result.encodedLength) },
            { label: 'Escapes written', value: String(result.escapes), note: 'Each escape is 3 characters' },
            { label: 'Bytes behind escapes', value: String(result.bytesEncoded) },
            { label: 'Characters kept literal', value: String(Math.max(0, result.encodedLength - result.bytesEncoded * 3)) },
            { label: 'Growth', value: `+${result.originalLength ? Math.round((result.encodedLength / result.originalLength - 1) * 1000) / 10 : 0}%` },
          ]}
        />
      ) : null}
    </div>
  )
}

function DecodeTab() {
  const [input, setInput] = React.useState(DECODE_SAMPLE)
  const [plusAsSpace, setPlusAsSpace] = React.useState(false)
  const [strict, setStrict] = React.useState(false)

  const result = React.useMemo(() => (input ? percentDecode(input, { plusAsSpace, strict }) : null), [input, plusAsSpace, strict])
  const canonical = React.useMemo(() => (result ? normalisePercentEncoding(input) : null), [result, input])
  const twice = React.useMemo(() => {
    if (!result) return null
    const again = percentDecode(result.output, { plusAsSpace, strict })
    return again.output !== result.output ? again : null
  }, [result, plusAsSpace, strict])

  return (
    <div className="space-y-4">
      <OptionsBar className="lg:grid-cols-2">
        <ToggleField label="Treat “+” as a space" hint="Correct for form bodies and query strings, wrong for a path" checked={plusAsSpace} onChange={setPlusAsSpace} />
        <ToggleField label="Strict mode" hint="Error on % followed by non-hex instead of passing it through" checked={strict} onChange={setStrict} />
      </OptionsBar>

      <div className="grid gap-4 lg:grid-cols-2">
        <InputPane
          label="Encoded value"
          ariaLabel="Percent-encoded value"
          value={input}
          onChange={setInput}
          error={Boolean(result) && !result?.ok}
          onSample={() => setInput(DECODE_SAMPLE)}
          onFile={(content) => setInput(content)}
          placeholder="%C3%A9%20%C2%A5…"
          stats={[
            { label: 'Characters', value: String(input.length) },
            { label: '“%” signs', value: String((input.match(/%/g) ?? []).length) },
          ]}
        />
        <OutputPane
          label="Decoded"
          value={result?.output ?? ''}
          filename="decoded-url.txt"
          mime="text/plain;charset=utf-8"
          stats={result ? [{ label: 'Escapes resolved', value: String(result.escapes) }, { label: 'Characters', value: String(result.output.length) }] : undefined}
        />
      </div>

      {result && !result.ok ? (
        <ResultBanner tone="bad" title="This cannot be decoded as written" detail={<p>Strict mode rejected an escape that is not "%" plus two hex digits (RFC 3986 §2.1).</p>} />
      ) : null}

      {result?.doubleEncoded ? (
        <ResultBanner
          tone="warn"
          title="Probably encoded twice"
          detail={
            <p>
              An escape decoded to a literal "%". {twice ? 'Decoding the whole value a second time yields:' : 'A second pass is not needed here.'}
              {twice ? <span className="mt-1 block break-all font-mono text-xs">{twice.output}</span> : null}
            </p>
          }
        />
      ) : null}

      {result && result.canBeNormalised && canonical ? (
        <section className="rounded-xl border border-slate-200 bg-white p-3.5">
          <h2 className="text-[0.8125rem] font-bold uppercase tracking-wider text-slate-600">Canonical form (RFC 3986 §6.2.2.1)</h2>
          <p className="mt-1 text-[0.8125rem] leading-relaxed text-slate-600">
            Uppercased {canonical.changed} byte{canonical.changed === 1 ? '' : 's'} of the escapes and wrote unreserved characters (A–Z a–z 0–9 - . _ ~)
            literally, because §2.3 says they MUST NOT be encoded. Two URIs that differ only in those respects are the same resource but compare unequal as
            strings — which breaks caches, deduplication and signature base strings.
          </p>
          <p className="mt-2 break-all rounded-lg bg-slate-50 px-3 py-2 font-mono text-xs text-slate-800">{canonical.output}</p>
        </section>
      ) : null}

      {result && result.issues.length > 0 ? (
        <section className="rounded-xl border border-slate-200 bg-white p-3.5">
          <h2 className="text-[0.8125rem] font-bold uppercase tracking-wider text-slate-600">Diagnostics ({result.issues.length})</h2>
          <IssueList issues={result.issues} />
        </section>
      ) : null}
    </div>
  )
}

function InspectTab() {
  const [input, setInput] = React.useState(URL_SAMPLE)
  const [rows, setRows] = React.useState<[string, string][]>([
    ['page', '2'],
    ['sort', 'total desc'],
    ['tags', 'a,b'],
  ])
  const [plusForSpace, setPlusForSpace] = React.useState(false)
  const [uppercaseHex, setUppercaseHex] = React.useState(true)

  const analysis = React.useMemo(() => (input.trim() ? analyseUrl(input) : null), [input])
  const query = React.useMemo(() => buildQuery(rows.filter(([key]) => key !== ''), { plusForSpace, uppercaseHex }), [rows, plusForSpace, uppercaseHex])

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <InputPane
          label="URL to inspect"
          ariaLabel="URL to inspect"
          value={input}
          onChange={setInput}
          onSample={() => setInput(URL_SAMPLE)}
          placeholder="https://example.com/path?a=1#frag"
          stats={[
            { label: 'Characters', value: String(input.length) },
            { label: 'Query bytes', value: String(input.split('?')[1]?.split('#')[0]?.length ?? 0) },
          ]}
        />
        <section className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <header className="border-b border-slate-100 px-3.5 py-2.5">
            <h2 className="text-[0.8125rem] font-bold uppercase tracking-wider text-slate-500">Parsed components</h2>
          </header>
          <div className="min-h-[13rem] flex-1 overflow-auto px-3.5 py-2">
            {analysis?.ok ? (
              <table className="w-full border-collapse text-[0.8125rem]">
                <tbody>
                  {analysis.parts.map((part) => (
                    <tr key={`${part.name}-${part.value}`} className="border-b border-slate-100 last:border-0">
                      <th scope="row" className="w-32 py-2 pr-3 text-left align-top font-semibold text-slate-500">
                        {part.name}
                      </th>
                      <td className="py-2 align-top">
                        <span className="break-all font-mono text-xs text-slate-900">{part.value || '(empty)'}</span>
                        {part.note ? <p className="mt-1 leading-relaxed text-slate-600">{part.note}</p> : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-slate-500">Paste a URL — anything that parses as a URI reference (RFC 3986 §4.1) will decompose here.</p>
            )}
          </div>
        </section>
      </div>

      {analysis?.ok && analysis.params.length > 0 ? (
        <DataTable
          compact
          caption="Query parameters, raw and decoded"
          head={['#', 'Key (raw)', 'Value (raw)', 'Key decoded', 'Value decoded', 'Notes']}
          rows={analysis.params.map((param, index) => [
            String(index + 1),
            <span className="font-mono text-xs">{param.key}</span>,
            <span className="font-mono text-xs">{param.value}</span>,
            <span className="font-mono text-xs">{param.decodedKey}</span>,
            <span className="break-all font-mono text-xs">{param.decodedValue}</span>,
            [param.repeated ? 'Repeated key — frameworks disagree on which one wins. ' : '', /%2F|%3D|%26/i.test(param.raw) ? 'Contains an escaped delimiter — check it was escaped by the sender, not by an attacker. ' : '', param.value.includes('+') ? 'Literal "+" — a form decodes it as a space. ' : '', /\[\]?$|\[\d+\]$/.test(param.decodedKey) ? 'Array-style key, only a convention of the framework on the other end.' : ''].filter(Boolean).join(' ') || '—',
          ])}
          foot="Keys are matched after decoding, so “q” and “%71” count as the same parameter — the reason naive filters see two keys where the server sees one."
        />
      ) : null}

      {analysis && analysis.issues.length > 0 ? (
        <section className="rounded-xl border border-slate-200 bg-white p-3.5">
          <h2 className="text-[0.8125rem] font-bold uppercase tracking-wider text-slate-600">Findings</h2>
          <IssueList issues={analysis.issues} />
        </section>
      ) : null}

      {analysis?.ok ? (
        <StatGrid
          items={[
            { label: 'Components', value: String(analysis.parts.length) },
            { label: 'Parameters', value: String(analysis.params.length), note: analysis.arrayKeys.length ? `${analysis.arrayKeys.length} array-style` : 'No array-style keys' },
            { label: 'Encoding layers', value: String(analysis.longestChain), note: analysis.longestChain > 1 ? 'Nested — normalise before validating' : 'Single layer' },
            { label: 'Host resolves', value: analysis.browserResolved ? 'yes' : 'no', note: 'Parsed by the WHATWG URL parser in this browser' },
          ]}
        />
      ) : null}

      <section className="rounded-xl border border-slate-200 bg-white p-3.5">
        <h2 className="text-[0.8125rem] font-bold uppercase tracking-wider text-slate-600">Query string builder</h2>
        <p className="mt-1 text-[0.8125rem] leading-relaxed text-slate-600">
          Hand-assembling <span className="font-mono text-xs">?a=1&amp;b=</span> plus a user value is where injection bugs come from. Each key and value
          below is escaped as a query value, so a value containing <span className="font-mono text-xs">&amp;</span> or <span className="font-mono text-xs">=</span> cannot add a parameter.
        </p>
        <div className="mt-3 space-y-2">
          {rows.map((row, index) => (
            <div key={index} className="flex flex-wrap items-center gap-2">
              <input
                aria-label={`Parameter ${index + 1} key`}
                value={row[0]}
                placeholder="key"
                onChange={(event) =>
                  setRows((current) => current.map((item, position) => (position === index ? [event.target.value, item[1]] : item)))
                }
                className="w-40 rounded-lg border border-slate-300 px-2.5 py-1.5 font-mono text-xs shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/25"
              />
              <input
                aria-label={`Parameter ${index + 1} value`}
                value={row[1]}
                placeholder="value"
                onChange={(event) =>
                  setRows((current) => current.map((item, position) => (position === index ? [item[0], event.target.value] : item)))
                }
                className="min-w-0 flex-1 rounded-lg border border-slate-300 px-2.5 py-1.5 font-mono text-xs shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/25"
              />
              <button
                type="button"
                onClick={() => setRows((current) => current.filter((_, position) => position !== index))}
                className="rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => setRows((current) => [...current, ['', '']])}
            className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
          >
            Add parameter
          </button>
          <ToggleField label="Space as “+”" checked={plusForSpace} onChange={setPlusForSpace} />
          <ToggleField label="Uppercase hex" checked={uppercaseHex} onChange={setUppercaseHex} />
        </div>
        <p className="mt-3 break-all rounded-lg bg-slate-900 px-3 py-2 font-mono text-xs text-slate-100">{query ? `?${query}` : 'No parameters yet.'}</p>
      </section>
    </div>
  )
}

export function UrlEncoderWorkspace() {
  const [tab, setTab] = useHashTab(['encode', 'decode', 'inspect'], 'encode')
  return (
    <div className="space-y-4">
      <Tabs
        idPrefix="url"
        value={tab}
        onValueChange={setTab}
        items={[
          { value: 'encode', label: 'Encode', hint: 'text → %XX' },
          { value: 'decode', label: 'Decode', hint: '%XX → text' },
          { value: 'inspect', label: 'Inspect URL', hint: 'components & parameters' },
        ]}
      />
      <TabPanel value="encode" active={tab === 'encode'} idPrefix="url">
        <EncodeTab />
      </TabPanel>
      <TabPanel value="decode" active={tab === 'decode'} idPrefix="url">
        <DecodeTab />
      </TabPanel>
      <TabPanel value="inspect" active={tab === 'inspect'} idPrefix="url">
        <InspectTab />
      </TabPanel>
    </div>
  )
}
