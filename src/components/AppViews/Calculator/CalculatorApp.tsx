"use client"

import React, { useMemo, useState } from 'react'
import { CalculatorHeader } from './CalculatorHeader'

// Core calculator operations
type Operator = '+' | '-' | '×' | '÷'

type LastInputType =
  | 'digit'
  | 'dot'
  | 'op'
  | 'equals'
  | 'percent'
  | 'sign'
  | 'clear'

function applyOperation(a: number, b: number, op: Operator): number {
  switch (op) {
    case '+':
      return a + b
    case '-':
      return a - b
    case '×':
      return a * b
    case '÷':
      return a / b
  }
}

function formatDisplay(value: number | string): string {
  if (typeof value === 'string') return value
  if (!isFinite(value)) return 'Error'
  // Match macOS Calculator formatting (grouping, up to 9 fractional digits)
  const abs = Math.abs(value)
  if (abs >= 1e12) {
    // Prevent overly long numbers; show in scientific
    return value.toExponential(6).replace(/\+?0*(?=\d)/, '')
  }
  const [intPart, fracPart = ''] = Math.abs(value).toString().split('.')
  const grouped = Number(intPart).toLocaleString('en-US')
  const sign = value < 0 ? '-' : ''
  if (!fracPart) return sign + grouped
  // Trim trailing zeros, but preserve up to 9 fractional digits
  const trimmed = fracPart.slice(0, 9).replace(/0+$/, '')
  return sign + grouped + (trimmed ? `.${trimmed}` : '')
}

interface CalculatorAppProps {
  onClose?: () => void
  onMinimize?: () => void
  onMaximize?: () => void
  title?: string
}

export function CalculatorApp({ onClose, onMinimize, onMaximize, title = 'Calculator' }: CalculatorAppProps) {
  const [display, setDisplay] = useState<string>('0')
  const [accumulator, setAccumulator] = useState<number | null>(null)
  const [pendingOp, setPendingOp] = useState<Operator | null>(null)
  const [lastInputType, setLastInputType] = useState<LastInputType>('clear')
  const [repeatOperand, setRepeatOperand] = useState<number | null>(null)
  const [error, setError] = useState<boolean>(false)
  const [lastExpression, setLastExpression] = useState<string>('')
  const [leftSnapshot, setLeftSnapshot] = useState<number | null>(null)

  // Keep top-line in sync when we also update the main display
  const updateDisplayAndTop = (nextDisplay: string, nextTop?: string) => {
    setDisplay(nextDisplay)
    if (typeof nextTop === 'string') setLastExpression(nextTop)
  }

  // Display logic: when an operator is pending, show a live expression like "1 + 2"
  const visualDisplay = useMemo(() => {
    // Only show live expression before equals; after equals, show the result alone
    if (pendingOp && lastInputType !== 'equals') {
      const leftValue = leftSnapshot !== null
        ? leftSnapshot
        : (accumulator !== null ? accumulator : null)
      const left = leftValue !== null ? formatDisplay(leftValue) : ''
      const right = lastInputType === 'op' ? '' : formatDisplay(display)
      return `${left}${pendingOp}${right}`
    }
    return formatDisplay(display)
  }, [pendingOp, accumulator, display, lastInputType, leftSnapshot])

  const showClearAsC = useMemo(() => display !== '0' || lastInputType === 'digit' || lastInputType === 'dot', [display, lastInputType])

  const inputDigit = (d: string) => {
    if (error) {
      // Reset from error on next input
      setError(false)
      setAccumulator(null)
      setPendingOp(null)
      setRepeatOperand(null)
      setDisplay(d)
      setLastInputType('digit')
      return
    }

    // Start a fresh calculation after an equals by clearing the previous expression
    if (lastInputType === 'equals' && pendingOp === null) {
      setLastExpression('')
    }

    if (lastInputType === 'op' || lastInputType === 'equals') {
      setDisplay(d)
    } else if (display === '0') {
      setDisplay(d)
    } else {
      setDisplay(prev => (prev + d).slice(0, 16))
    }
    setLastInputType('digit')
  }

  const inputDot = () => {
    if (error) {
      setError(false)
      setDisplay('0.')
      setAccumulator(null)
      setPendingOp(null)
      setRepeatOperand(null)
      setLastInputType('dot')
      return
    }

    if (lastInputType === 'op' || lastInputType === 'equals') {
      setDisplay('0.')
      setLastInputType('dot')
      return
    }
    if (display.includes('.')) return
    setDisplay(prev => prev + '.')
    setLastInputType('dot')
  }

  const clearEntry = () => {
    if (showClearAsC) {
      setDisplay('0')
      setLastInputType('clear')
      return
    }
    // AC behavior
    setDisplay('0')
    setAccumulator(null)
    setPendingOp(null)
    setRepeatOperand(null)
    setError(false)
    setLastExpression('')
    setLeftSnapshot(null)
    setLastInputType('clear')
  }

  const toggleSign = () => {
    if (error) return
    if (display === '0') return
    if (display.startsWith('-')) setDisplay(display.slice(1))
    else setDisplay('-' + display)
    setLastInputType('sign')
  }

  const percent = () => {
    if (error) return
    const current = parseFloat(display)
    if (!isFinite(current)) return
    let result: number
    if (accumulator !== null && pendingOp) {
      result = (accumulator * current) / 100
    } else {
      result = current / 100
    }
    setDisplay(String(result))
    setLastInputType('percent')
  }

  const setOperator = (op: Operator) => {
    if (error) return
    const current = parseFloat(display)
    if (pendingOp !== null && lastInputType !== 'op' && lastInputType !== 'equals' && accumulator !== null) {
      const intermediate = applyOperation(accumulator, current, pendingOp)
      if (!isFinite(intermediate)) {
        setDisplay('Error')
        setError(true)
        setAccumulator(null)
        setPendingOp(null)
        setRepeatOperand(null)
        return
      }
      setAccumulator(intermediate)
      setLeftSnapshot(intermediate)
      // Show intermediate result and append the newly selected operator in the main display, but do not change the top line yet
      setDisplay(String(intermediate))
    } else {
      setAccumulator(current)
      setLeftSnapshot(current)
      // Show the left operand with the operator in the main display, but do not change the top line yet
      setDisplay(String(current))
    }
    setPendingOp(op)
    setLastInputType('op')
  }

  const equals = () => {
    if (error) return
    if (!pendingOp) return

    const current = parseFloat(display)

    // If equals pressed after a digit/op, set repeat operand
    if (lastInputType !== 'equals') {
      if (accumulator === null) return
      const result = applyOperation(accumulator, current, pendingOp)
      if (!isFinite(result)) {
        setDisplay('Error')
        setError(true)
        setAccumulator(null)
        setPendingOp(null)
        setRepeatOperand(null)
        setLeftSnapshot(null)
        setLastInputType('equals')
        return
      }
      // Update the previous expression shown at the top
      const expr = `${formatDisplay(accumulator)}${pendingOp}${formatDisplay(current)}`
      updateDisplayAndTop(formatDisplay(result), expr)
      setAccumulator(result)
      setRepeatOperand(current)
      setLeftSnapshot(null)
      setLastInputType('equals')
      return
    }

    // Repeated equals: use last displayed as left operand
    if (repeatOperand === null) return
    const left = parseFloat(display)
    const result = applyOperation(left, repeatOperand, pendingOp)
    if (!isFinite(result)) {
      setDisplay('Error')
      setError(true)
      setAccumulator(null)
      setPendingOp(null)
      setRepeatOperand(null)
      setLeftSnapshot(null)
      setLastInputType('equals')
      return
    }
    // Update the previous expression for repeated equals as well
    const expr = `${formatDisplay(left)}${pendingOp}${formatDisplay(repeatOperand)}`
    updateDisplayAndTop(formatDisplay(result), expr)
    setAccumulator(result)
    setLeftSnapshot(null)
    setLastInputType('equals')
  }

  const handleKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const key = e.key
    if (/^[0-9]$/.test(key)) {
      e.preventDefault()
      inputDigit(key)
      return
    }
    if (key === '.') {
      e.preventDefault()
      inputDot()
      return
    }
    if (key === 'Enter' || key === '=') {
      e.preventDefault()
      equals()
      return
    }
    if (key === '+') { e.preventDefault(); setOperator('+'); return }
    if (key === '-') { e.preventDefault(); setOperator('-'); return }
    if (key === '*') { e.preventDefault(); setOperator('×'); return }
    if (key === '/') { e.preventDefault(); setOperator('÷'); return }
    if (key.toLowerCase() === 'c') { e.preventDefault(); clearEntry(); return }
    if (key === '%') { e.preventDefault(); percent(); return }
  }

  const Button: React.FC<{
    label: React.ReactNode
    variant?: 'fn' | 'num' | 'op'
    onClick: () => void
    span?: number
    testId?: string
    active?: boolean
  }> = ({ label, variant = 'num', onClick, span = 1, testId, active = false }) => {
    const base: React.CSSProperties = {
      height: 56,
      borderRadius: 28,
      fontSize: 22,
      lineHeight: '22px',
    }

    const classes =
      variant === 'op'
        ? `${active ? 'bg-[#f59e0b] brightness-110' : 'bg-[#f59e0b]'} text-white hover:brightness-110 active:brightness-95`
        : variant === 'fn'
        ? 'bg-[#505050] text-white hover:brightness-110 active:brightness-95'
        : 'bg-[#6b7280] text-white hover:brightness-110 active:brightness-95'

    return (
      <button
        type="button"
        data-testid={testId}
        onClick={onClick}
        className={`flex items-center justify-center ${classes} transition-all select-none`}
        style={{ ...base, gridColumn: `span ${span} / span ${span}` }}
        aria-pressed={active}
      >
        {label}
      </button>
    )
  }

  return (
    <div
      className="h-full w-full flex flex-col rounded-xl"
      tabIndex={0}
      onKeyDown={handleKey}
      style={{
      }}
    >
      <CalculatorHeader title={title} onClose={onClose} onMinimize={onMinimize} onMaximize={onMaximize} />

      {/* Display */}
      <div className="flex-1 flex items-end justify-end px-6 pb-4 select-none">
        <div className="text-right w-full">
          {/* Previous expression (small, lighter) */}
          <div className="text-black/60 text-3xl font-light tracking-tight tabular-nums h-[32px]">
            {lastExpression}
          </div>
          {/* Current display (large) */}
          <div className="text-black/80 text-6xl font-light tracking-tight tabular-nums">
            {visualDisplay}
          </div>
        </div>
      </div>

      {/* Keypad */}
      <div className="p-4 pb-5 grid gap-3"
           style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
        {/* Row 1 */}
        <Button label={showClearAsC ? 'C' : 'AC'} variant="fn" onClick={clearEntry} />
        <Button label={'+/-'} variant="fn" onClick={toggleSign} />
        <Button label={'%'} variant="fn" onClick={percent} />
        <Button label={'÷'} variant="op" onClick={() => setOperator('÷')} active={pendingOp === '÷'} />

        {/* Row 2 */}
        <Button label={'7'} onClick={() => inputDigit('7')} />
        <Button label={'8'} onClick={() => inputDigit('8')} />
        <Button label={'9'} onClick={() => inputDigit('9')} />
        <Button label={'×'} variant="op" onClick={() => setOperator('×')} active={pendingOp === '×'} />

        {/* Row 3 */}
        <Button label={'4'} onClick={() => inputDigit('4')} />
        <Button label={'5'} onClick={() => inputDigit('5')} />
        <Button label={'6'} onClick={() => inputDigit('6')} />
        <Button label={'-'} variant="op" onClick={() => setOperator('-')} active={pendingOp === '-'} />

        {/* Row 4 */}
        <Button label={'1'} onClick={() => inputDigit('1')} />
        <Button label={'2'} onClick={() => inputDigit('2')} />
        <Button label={'3'} onClick={() => inputDigit('3')} />
        <Button label={'+'} variant="op" onClick={() => setOperator('+')} active={pendingOp === '+'} />

        {/* Row 5 */}
        <Button label={'0'} span={2} onClick={() => inputDigit('0')} />
        <Button label={'.'} onClick={inputDot} />
        <Button label={'='} variant="op" onClick={equals} />
      </div>
    </div>
  )
} 