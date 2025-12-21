/**
 * @import {LanguagePlugin} from '@volar/language-core'
 */

import {describe, it} from 'node:test'
import assert from 'node:assert/strict'
import {resolveLanguagePlugins} from '../lib/language-plugins/resolver.js'

describe('resolveLanguagePlugins', () => {
  it('should resolve framework shorthands', () => {
    /** @type {LanguagePlugin} */
    const mockPlugin = {
      getLanguageId(_scriptId) {
        return 'vue'
      }
    }

    /** @param {string} name */
    const mockResolver = (name) => {
      if (name === './plugins/vue.cjs') {
        return {
          getLanguagePlugin: () => mockPlugin
        }
      }

      if (name === '@vue/language-core') {
        return {}
      }

      throw new Error(`Module not found: ${name}`)
    }

    const result = resolveLanguagePlugins(
      {languagePlugins: ['vue']},
      mockResolver
    )

    assert.strictEqual(result.plugins.length, 1)
    assert.strictEqual(result.errors.length, 0)
    assert.strictEqual(result.plugins[0].getLanguageId('test.vue'), 'vue')
  })

  it('should resolve custom module specifiers', () => {
    /** @type {LanguagePlugin} */
    const mockPlugin = {
      getLanguageId(_scriptId) {
        return 'custom'
      }
    }

    /** @param {string} name */
    const mockResolver = (name) => {
      if (name === '@my-org/my-plugin') {
        return {
          getLanguagePlugin: () => mockPlugin
        }
      }

      throw new Error(`Module not found: ${name}`)
    }

    const result = resolveLanguagePlugins(
      {languagePlugins: ['@my-org/my-plugin']},
      mockResolver
    )

    assert.strictEqual(result.plugins.length, 1)
    assert.strictEqual(result.errors.length, 0)
    assert.strictEqual(result.plugins[0].getLanguageId('test.custom'), 'custom')
  })

  it('should report missing peer dependencies for framework shorthands', () => {
    /** @param {string} name */
    const mockResolver = (name) => {
      // Simulate @vue/language-core not being installed
      throw new Error(`Module not found: ${name}`)
    }

    const result = resolveLanguagePlugins(
      {languagePlugins: ['vue']},
      mockResolver
    )

    assert.strictEqual(result.plugins.length, 0)
    assert.strictEqual(result.errors.length, 1)
    assert.strictEqual(result.errors[0].type, 'peer-dependency')
    assert.match(result.errors[0].message, /@vue\/language-core/)
  })
})
