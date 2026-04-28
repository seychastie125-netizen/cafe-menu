'use client'

type Props = { msg: string; type?: string }

export default function Toast({ msg, type }: Props) {
  return (
    <div className={`toast show${type ? ` ${type}` : ''}`}>{msg}</div>
  )
}
