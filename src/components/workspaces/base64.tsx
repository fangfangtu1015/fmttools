'use client'

import * as React from 'react'
import { Segmented, SelectField, ToggleField } from '@/components/tool/controls'
import { HighlightedText, InputPane, OptionsBar, OutputPane, ResultBanner, StatGrid, bytesOf } from '@/components/tool/panes'
import { DataTable } from '@/components/content'
import { Tabs, TabPanel, useHashTab } from '@/components/ui/tabs'
import {
  bytesToHexDump,
  decodeBase64,
  encodeBase64,
  base64LengthOf,
  type DecodeIssue,
  type DecodedResult,
} from '@/lib/tools/base64'

const TEXT_SAMPLE = 'FmtTools — encode €37.50 or 日本語 in one click.'
const B64_SAMPLE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0Iiwicm9sZSI6ImFkbWluIn0.dbWVfX2V4YW1wbGVfc2lnbmF0dXJl'

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
            <span className={cnRounded(SEVERITY_CLASS[issue.severity])}>{issue.severity}</span>
            <span className="font-mono text-xs text-slate-500">{issue.code}</span>
            <span className="text-[0.8125rem] font-semibold text-slate-900">{issue.message}</span>
          </p>
          {issue.hint ? <p className="mt-1 text-[0.8125rem] leading-relaxed text-slate-600">{issue.hint}</p> : null}
          {typeof issue.position === 'number' && issue.position >= 0 ? (
            <p className="mt-1 text-xs text-slate-500">Character offset {issue.position} in the stripped payload.</p>
          ) : null}
        </li>
      ))}
    </ul>
  )
}

function cnRounded(extra: string) {
  return `rounded px-1.5 py-0.5 text-[0.625rem] font-bold uppercase ${extra}`
}

function DownloadBytesButton({ bytes, filename, label }: { bytes: Uint8Array; filename: string; label: string }) {
  const save = () => {
    const blob = new Blob([bytes.slice().buffer], { type: 'application/octet-stream' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = filename
    anchor.click()
    URL.revokeObjectURL(url)
  }
  return (
    <button
      type="button"
      onClick={save}
      className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
    >
      {label}
    </button>
  )
}

function JwtPanel({ jwt }: { jwt: NonNullable<DecodedResult['jwt']> }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-3.5">
      <h2 className="text-[0.8125rem] font-bold uppercase tracking-wider text-slate-600">JSON Web Token segments</h2>
      <p className="mt-1 text-[0.8125rem] leading-relaxed text-slate-600">
        Decoded from base64url per RFC 7515 §2 and RFC 7519 §2. {jwt.signatureBytes} bytes of signature were present but are not verified here —
        an HMAC or RSA check needs the key, so treat these claims as untrusted until your own verifier accepts them.
      </p>
      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <div>
          <p className="text-[0.6875rem] font-bold uppercase tracking-wider text-slate-500">Header</p>
          <pre className="mt-1.5 overflow-auto rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-800">
            <HighlightedText text={jwt.headerText} />
          </pre>
        </div>
        <div>
          <p className="text-[0.6875rem] font-bold uppercase tracking-wider text-slate-500">Payload</p>
          <pre className="mt-1.5 max-h-48 overflow-auto rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-800">
            <HighlightedText text={jwt.payloadText} />
          </pre>
        </div>
      </div>
      {jwt.claims.length > 0 ? (
        <DataTable
          compact
          head={['Claim', 'Meaning', 'Value', 'Reading']}
          rows={jwt.claims.map((claim) => [claim.name, claim.label, claim.value, claim.note ?? 'No automatic reading.'])}
          foot="Epoch numbers above 4102444800 are read as milliseconds, because that is the usual cause of an expiry that looks like it is in 52,000 AD."
        />
      ) : null}
      {jwt.warnings.length > 0 ? (
        <ul className="mt-3 space-y-1.5">
          {jwt.warnings.map((warning) => (
            <li key={warning} className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[0.8125rem] leading-relaxed text-amber-900">
              {warning}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}

function EncodeTab() {
  const [input, setInput] = React.useState(TEXT_SAMPLE)
  const [variant, setVariant] = React.useState('standard')
  const [padding, setPadding] = React.useState(true)
  const [lineLength, setLineLength] = React.useState('0')
  const [inputMode, setInputMode] = React.useState('utf8')
  const [fileName, setFileName] = React.useState<string | null>(null)
  const fileRef = React.useRef<HTMLInputElement>(null)

  const result = React.useMemo(
    () => (input ? encodeBase64(input, { variant: variant as 'standard' | 'url', padding, lineLength: Number(lineLength), input: inputMode as 'utf8' | 'latin1' | 'hex' }) : null),
    [input, variant, padding, lineLength, inputMode],
  )

  const readFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      const bytes = new Uint8Array(reader.result as ArrayBuffer)
      const cap = 262144
      if (bytes.length > cap) {
        setInput('')
        setFileName(`${file.name} is ${bytes.length.toLocaleString()} bytes — the in-browser hex view is capped at ${cap.toLocaleString()} bytes so the tab stays responsive.`)
        return
      }
      const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
      setInputMode('hex')
      setInput(hex)
      setFileName(`${file.name} · ${bytes.length.toLocaleString()} bytes · ${file.type || 'no MIME type reported'}`)
    }
    reader.readAsArrayBuffer(file)
  }

  const expected = inputMode === 'hex' ? Math.floor((input.replace(/[\s:]/g, '').length || 0) / 2) : bytesOf(input)
  const declared = result ? result.characters + (Number(lineLength) > 0 ? Math.max(0, Math.ceil(result.characters / Number(lineLength)) - 1) : 0) : 0

  return (
    <div className="space-y-4">
      <OptionsBar className="lg:grid-cols-4">
        <div className="min-w-0">
          <p className="mb-1.5 text-[0.6875rem] font-bold uppercase tracking-wider text-slate-500">Alphabet</p>
          <Segmented
            legend="Alphabet"
            value={variant}
            onChange={setVariant}
            options={[
              { value: 'standard', label: 'Standard', title: 'RFC 4648 §4 — uses + and /' },
              { value: 'url', label: 'base64url', title: 'RFC 4648 §5 — uses - and _' },
            ]}
          />
        </div>
        <div className="min-w-0">
          <p className="mb-1.5 text-[0.6875rem] font-bold uppercase tracking-wider text-slate-500">Read input as</p>
          <SelectField
            ariaLabel="Input interpretation"
            value={inputMode}
            onChange={setInputMode}
            options={[
              { value: 'utf8', label: 'UTF-8 text' },
              { value: 'latin1', label: 'Raw bytes (latin-1)' },
              { value: 'hex', label: 'Hex dump (AA 3F …)' },
            ]}
          />
        </div>
        <div className="min-w-0">
          <p className="mb-1.5 text-[0.6875rem] font-bold uppercase tracking-wider text-slate-500">Line wrapping</p>
          <SelectField
            ariaLabel="Line wrapping"
            value={lineLength}
            onChange={setLineLength}
            options={[
              { value: '0', label: 'None (single line)' },
              { value: '76', label: '76 characters (MIME)' },
              { value: '64', label: '64 characters (PEM)' },
              { value: '100', label: '100 characters' },
            ]}
          />
        </div>
        <div className="flex flex-col gap-2">
          <ToggleField label="Padding “=”" hint="RFC 4648 §3.2 says padding is what lets a reader count the octets; base64url (§5) and JWTs drop it" checked={padding} onChange={setPadding} />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="self-start rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
          >
            Encode a file
          </button>
          <input
            ref={fileRef}
            type="file"
            className="sr-only"
            aria-label="Choose a file to encode as base64"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) readFile(file)
              event.target.value = ''
            }}
          />
        </div>
      </OptionsBar>

      {fileName ? (
        <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
          Loaded file: <span className="font-semibold text-slate-800">{fileName}</span> — the bytes stay in this tab and the hex view is what gets encoded.
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <InputPane
          label={inputMode === 'hex' ? 'Hex bytes' : inputMode === 'latin1' ? 'Raw-byte text' : 'Plain text'}
          ariaLabel="Text to encode"
          value={input}
          onChange={(value) => {
            setInput(value)
            setFileName(null)
          }}
          onSample={() => {
            setInputMode('utf8')
            setInput(TEXT_SAMPLE)
            setFileName(null)
          }}
          placeholder={inputMode === 'hex' ? '48 65 6c 6c 6f' : 'Text, or a hex dump when “Read input as” is set to hex…'}
          stats={[
            { label: 'Input bytes', value: String(expected) },
            { label: 'Expected output', value: String(base64LengthOf(expected, padding)) },
          ]}
        />
        <OutputPane
          label={variant === 'url' ? 'base64url' : 'Base64'}
          value={result?.output ?? ''}
          filename="encoded-base64.txt"
          mime="text/plain;charset=utf-8"
          error={result && !result.ok ? <p>{result.warnings.join(' ')}</p> : undefined}
          stats={[
            { label: 'Characters', value: String(result?.characters ?? 0) },
            { label: 'Overhead', value: `${result?.overheadPercent ?? 0}%` },
            { label: 'Groups of 3 bytes', value: String(result?.groups ?? 0) },
          ]}
        />
      </div>

      {result && result.warnings.length > 0 ? (
        <section className="rounded-xl border border-amber-200 bg-white p-3.5">
          <h2 className="text-[0.8125rem] font-bold uppercase tracking-wider text-amber-800">Encoding notes</h2>
          <ul className="mt-2 space-y-1.5">
            {result.warnings.map((warning) => (
              <li key={warning} className="text-[0.8125rem] leading-relaxed text-slate-700">
                {warning}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {result?.ok ? (
        <StatGrid
          items={[
            { label: 'Source bytes', value: String(result.bytes), note: inputMode === 'utf8' ? 'UTF-8 encoding length' : 'Taken literally' },
            { label: 'Output characters', value: String(result.characters), note: 'Excludes line breaks' },
            { label: 'Including line breaks', value: String(declared) },
            { label: 'Size overhead', value: `+${result.overheadPercent}%`, note: '4 characters per 3 bytes is +33.3%' },
            { label: 'Full 3-byte groups', value: String(result.groups) },
            { label: 'Padding characters', value: String(result.paddedChars), note: padding ? (result.paddedChars ? 'Last group was short' : 'No padding needed') : 'Padding disabled' },
          ]}
        />
      ) : null}
    </div>
  )
}

function DecodeTab() {
  const [input, setInput] = React.useState(B64_SAMPLE)
  const [variant, setVariant] = React.useState('auto')
  const [strict, setStrict] = React.useState(false)
  const [allowNewlines, setAllowNewlines] = React.useState(true)

  const result = React.useMemo(
    () => (input.trim() ? decodeBase64(input, { variant: variant as 'auto' | 'standard' | 'url', strict, allowNewlines }) : null),
    [input, variant, strict, allowNewlines],
  )

  const errors = (result?.issues ?? []).filter((issue) => issue.severity === 'error')
  const filename = React.useMemo(() => {
    const extension = result?.mime?.extension ?? 'bin'
    return `decoded.${extension}`
  }, [result])

  return (
    <div className="space-y-4">
      <OptionsBar className="lg:grid-cols-3">
        <div className="min-w-0">
          <p className="mb-1.5 text-[0.6875rem] font-bold uppercase tracking-wider text-slate-500">Alphabet</p>
          <SelectField
            ariaLabel="Alphabet to decode with"
            value={variant}
            onChange={setVariant}
            options={[
              { value: 'auto', label: 'Detect from characters' },
              { value: 'standard', label: 'Standard (§4): + and /' },
              { value: 'url', label: 'base64url (§5): - and _' },
            ]}
          />
        </div>
        <ToggleField label="Strict mode" hint="Reject whitespace instead of ignoring it" checked={strict} onChange={setStrict} />
        <ToggleField label="Ignore line breaks" hint="MIME and PEM wrap at 76 or 64 characters" checked={allowNewlines} onChange={setAllowNewlines} />
      </OptionsBar>

      <div className="grid gap-4 lg:grid-cols-2">
        <InputPane
          label="Base64 input"
          ariaLabel="Base64 to decode"
          value={input}
          onChange={setInput}
          error={Boolean(result) && errors.length > 0}
          onSample={() => setInput(B64_SAMPLE)}
          onFile={(content) => setInput(content)}
          placeholder="Paste base64, a data: URL, a PEM block or a JWT…"
          stats={[
            { label: 'Characters', value: String(input.replace(/\s/g, '').length) },
            { label: 'Decodes to about', value: `${Math.floor((input.replace(/\s/g, '').length * 6) / 8)} bytes` },
          ]}
        />
        <OutputPane
          label={result?.isText ? 'Decoded text' : 'Decoded bytes (hex dump)'}
          value={result?.isText ? (result.text ?? '') : (result?.hexPreview ?? '')}
          filename={result?.isText ? 'decoded.txt' : undefined}
          mime="text/plain;charset=utf-8"
          actions={result && !result.isText && result.bytes ? <DownloadBytesButton bytes={result.bytes} filename={filename} label="Save binary" /> : undefined}
          stats={
            result
              ? [
                  { label: 'Bytes', value: String(result.decodedSize) },
                  { label: 'Content', value: result.isText ? 'Valid UTF-8 text' : 'Binary' },
                ]
              : undefined
          }
        />
      </div>

      {result ? (
        <ResultBanner
          tone={errors.length ? 'bad' : result.isText ? 'good' : 'info'}
          title={
            errors.length
              ? `${errors.length} ${errors.length === 1 ? 'problem' : 'problems'} stop this from decoding cleanly`
              : result.isText
                ? `Decoded ${result.decodedSize} bytes of UTF-8 text`
                : `Decoded ${result.decodedSize} bytes — not valid UTF-8, so this is binary data`
          }
          detail={
            <div className="space-y-1">
              {result.variant === 'url' ? <p>The value used the URL- and filename-safe alphabet (RFC 4648 §5).</p> : null}
              <p>
                {result.roundTrips
                  ? 'Re-encoding these bytes reproduces your input exactly, so the value is in canonical form.'
                  : 'Re-encoding these bytes does not reproduce your input — the padding or the trailing bits differ from what a canonical encoder would write.'}
              </p>
              {result.mime ? <p>Leading bytes match a known format: {result.mime.label}.</p> : null}
            </div>
          }
        />
      ) : null}

      {result?.dataUri ? (
        <section className="rounded-xl border border-slate-200 bg-white p-3.5">
          <h2 className="text-[0.8125rem] font-bold uppercase tracking-wider text-slate-600">data: URL</h2>
          <DataTable
            compact
            head={['Field', 'Value']}
            rows={[
              ['Declared media type', result.dataUri.mime],
              ['Form', result.dataUri.base64 ? 'base64 (RFC 2397 §3 with the ;base64 token)' : 'percent-encoded ASCII'],
              ['Charset parameter', result.dataUri.charset ?? 'Absent, so browsers default to US-ASCII for text'],
              ['Payload after the comma', `${result.dataUri.payload.length.toLocaleString()} characters`],
              ['Decoded size', `${(result.decodedSize).toLocaleString()} bytes`],
              ['In an <img>', result.dataUri.isImage ? 'Rendered, but SVG in an <img> runs without scripts while the same SVG opened as a document can execute.' : 'Not an image media type.'],
            ]}
            foot="Inline assets cost about 33% more bytes than the file itself and cannot be cached separately — that is the trade against one fewer request."
          />
        </section>
      ) : null}

      {result?.pem ? (
        <section className="rounded-xl border border-slate-200 bg-white p-3.5">
          <h2 className="text-[0.8125rem] font-bold uppercase tracking-wider text-slate-600">PEM block</h2>
          <p className="mt-1 text-[0.8125rem] leading-relaxed text-slate-700">
            Label <span className="font-mono text-xs">{result.pem.label}</span>, wrapping {result.pem.derBytes.toLocaleString()} bytes of DER-encoded
            ASN.1 (RFC 7468). The header and footer lines and the line breaks are transport formatting, not key material, which is why two PEM files can
            differ textually while holding the same key.
          </p>
        </section>
      ) : null}

      {result?.jwt ? <JwtPanel jwt={result.jwt} /> : null}

      {result && result.issues.length > 0 ? (
        <section className="rounded-xl border border-slate-200 bg-white p-3.5">
          <h2 className="text-[0.8125rem] font-bold uppercase tracking-wider text-slate-600">
            Diagnostics ({result.issues.length})
          </h2>
          <IssueList issues={result.issues} />
        </section>
      ) : null}

      {result?.bytes && result.bytes.length > 0 ? (
        <details className="rounded-xl border border-slate-200 bg-white p-3.5">
          <summary className="cursor-pointer text-[0.8125rem] font-bold uppercase tracking-wider text-slate-600">
            First bytes as a hex dump
          </summary>
          <pre className="mt-2 overflow-auto rounded-lg bg-slate-900 px-3 py-2 text-xs leading-5 text-slate-100">{bytesToHexDump(result.bytes, 128)}</pre>
        </details>
      ) : null}

      {result ? (
        <StatGrid
          items={[
            { label: 'Encoded characters', value: String(result.encodedSize), note: 'Whitespace removed' },
            { label: 'Decoded bytes', value: String(result.decodedSize) },
            { label: 'Size saving', value: `${result.encodedSize ? Math.round((1 - result.decodedSize / result.encodedSize) * 1000) / 10 : 0}%`, note: 'base64 is ~25% smaller as bytes than as text' },
            { label: 'Alphabet detected', value: result.variant },
            { label: 'Canonical round trip', value: result.roundTrips ? 'Yes' : 'No' },
            { label: 'Magic bytes', value: result.mime?.extension ?? 'Unrecognised' },
          ]}
        />
      ) : null}
    </div>
  )
}

export function Base64Workspace() {
  const [tab, setTab] = useHashTab(['encode', 'decode'], 'encode')
  return (
    <div className="space-y-4">
      <Tabs
        idPrefix="base64"
        value={tab}
        onValueChange={setTab}
        items={[
          { value: 'encode', label: 'Encode', hint: 'text → base64' },
          { value: 'decode', label: 'Decode', hint: 'base64 → bytes' },
        ]}
      />
      <TabPanel value="encode" active={tab === 'encode'} idPrefix="base64">
        <EncodeTab />
      </TabPanel>
      <TabPanel value="decode" active={tab === 'decode'} idPrefix="base64">
        <DecodeTab />
      </TabPanel>
    </div>
  )
}
