import { expect, it } from 'vitest'
import { formatearPrecioCOP } from './formatos'

it('formatea 250000 como pesos colombianos sin decimales', () => {
  expect(formatearPrecioCOP(250000)).toMatch(/^\$\s*250\.000$/)
})
