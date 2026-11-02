import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/vue'
import { afterEach, beforeEach, vi } from 'vitest'

afterEach(() => {
  cleanup()
})
beforeEach(() => {
  vi.clearAllMocks()
})
afterEach(() => {
  vi.restoreAllMocks()
})

import.meta.env.BASE_URL = 'http://test.base.url/'
