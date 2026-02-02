import { describe, it, expect } from 'vitest'
import { deepMerge,isObject } from './index'

describe('deepMerge', () => {
  it('should merge two objects', () => {
    const obj1 = { a: 1, b: 2 }
    const obj2 = { c: 3, d: 4 }
    const result = deepMerge(obj1, obj2)
    expect(result).toEqual({ a: 1, b: 2, c: 3, d: 4 })
  })
})

describe('isObject', () => {
  it('should return true for objects', () => {
    expect(isObject({})).toBe(true)
    expect(isObject({ a: 1 })).toBe(true)
  })
  
  it('should return false for non-objects', () => {
    expect(isObject(null)).toBe(false)
    expect(isObject(undefined)).toBe(false)
    expect(isObject('string')).toBe(false)
    expect(isObject(123)).toBe(false)
    expect(isObject([])).toBe(false)
  })
})
