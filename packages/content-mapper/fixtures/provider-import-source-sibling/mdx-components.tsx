import type { ComponentProps, ReactNode } from 'react'

function Heading(props: ComponentProps<'h1'>): ReactNode {
  return <h1 {...props} />
}

const components = {
  h1: Heading
} as const

export function useMDXComponents() {
  return components
}
