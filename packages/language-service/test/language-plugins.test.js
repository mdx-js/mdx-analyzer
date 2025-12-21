/**
 * @import {LanguagePlugin} from '@volar/language-core'
 */

import {describe, it} from 'node:test'
import assert from 'node:assert/strict'
import {resolveLanguagePlugins} from '../lib/tsconfig.js'

describe('Language Plugins', () => {
  it('should resolve vue framework shorthand', () => {
    /** @type {LanguagePlugin} */
    const mockPlugin = {
      getLanguageId() {
        return 'vue'
      }
    }

    /** @param {string} name */
    const mockResolver = (name) => {
      if (name === './plugins/vue') {
        return {getLanguagePlugin: () => mockPlugin}
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
    assert.strictEqual(typeof result.plugins[0].getLanguageId, 'function')
  })

  it('should resolve multiple framework plugins', () => {
    /** @type {LanguagePlugin} */
    const vuePlugin = {getLanguageId: () => 'vue'}
    /** @type {LanguagePlugin} */
    const sveltePlugin = {getLanguageId: () => 'svelte'}

    /** @param {string} name */
    const mockResolver = (name) => {
      if (name === './plugins/vue') {
        return {getLanguagePlugin: () => vuePlugin}
      }

      if (name === './plugins/svelte') {
        return {getLanguagePlugin: () => sveltePlugin}
      }

      if (name === '@vue/language-core' || name === 'svelte2tsx') {
        return {}
      }

      throw new Error(`Module not found: ${name}`)
    }

    const result = resolveLanguagePlugins(
      {languagePlugins: ['vue', 'svelte']},
      mockResolver
    )

    assert.strictEqual(result.plugins.length, 2)
    assert.strictEqual(result.errors.length, 0)
    assert.strictEqual(typeof result.plugins[0].getLanguageId, 'function')
    assert.strictEqual(typeof result.plugins[1].getLanguageId, 'function')
  })

  it('should handle unknown custom module', () => {
    const result = resolveLanguagePlugins(
      {languagePlugins: ['@unknown/package']},
      (name) => {
        throw new Error(`Module not found: ${name}`)
      }
    )

    assert.strictEqual(result.plugins.length, 0)
    assert.strictEqual(result.errors.length, 1)
    assert.strictEqual(result.errors[0].type, 'import')
    assert.match(result.errors[0].message, /Module not found/)
  })

  it('should handle missing peer dependencies', () => {
    /** @param {string} name */
    const mockResolver = (name) => {
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

  it('should load built-in plugins when module resolution fails', () => {
    /** @param {string} name */
    const mockResolver = (name) => {
      if (name === '@vue/language-core') {
        return {}
      }

      if (name === './plugins/vue') {
        // Simulate module not being found in node_modules
        throw new Error(`Cannot find module '${name}'`)
      }

      throw new Error(`Module not found: ${name}`)
    }

    const result = resolveLanguagePlugins(
      {languagePlugins: ['vue']},
      mockResolver
    )

    // Should successfully load the built-in plugin from filesystem
    assert.strictEqual(result.plugins.length, 1)
    assert.strictEqual(result.errors.length, 0)
    assert.strictEqual(result.plugins[0].getLanguageId('test.vue'), 'vue')
  })

  it('should handle when built-in plugin file is missing', () => {
    // Test with a framework that we haven't copied the plugin for
    const result = resolveLanguagePlugins(
      {languagePlugins: ['nonexistent-framework']},
      (name) => {
        if (name === './plugins/nonexistent-framework') {
          throw new Error(`Cannot find module '${name}'`)
        }

        throw new Error(`Module not found: ${name}`)
      }
    )

    // Should fail since the built-in plugin doesn't exist
    assert.strictEqual(result.plugins.length, 0)
    assert.strictEqual(result.errors.length, 1)
    assert.strictEqual(result.errors[0].type, 'import')
    assert.match(result.errors[0].message, /Module not found/)
  })

  it('should skip non-string plugin items', () => {
    const result = resolveLanguagePlugins(
      {languagePlugins: [null, undefined, 123, {}, 'vue']},
      () => ({getLanguagePlugin: () => ({getLanguageId: () => 'vue'})})
    )

    assert.strictEqual(result.plugins.length, 1)
    assert.strictEqual(result.errors.length, 0)
  })

  it('should handle custom module specifiers', () => {
    /** @type {LanguagePlugin} */
    const customPlugin = {getLanguageId: () => 'custom'}

    /** @param {string} name */
    const mockResolver = (name) => {
      if (name === '@my-org/custom-plugin') {
        return {getLanguagePlugin: () => customPlugin}
      }

      throw new Error(`Module not found: ${name}`)
    }

    const result = resolveLanguagePlugins(
      {languagePlugins: ['@my-org/custom-plugin']},
      mockResolver
    )

    assert.strictEqual(result.plugins.length, 1)
    assert.strictEqual(result.errors.length, 0)
    assert.strictEqual(result.plugins[0], customPlugin)
  })

  it('should return empty result for invalid config', () => {
    const configs = [
      null,
      undefined,
      'string',
      123,
      {},
      {languagePlugins: null},
      {languagePlugins: 'not-array'}
    ]

    for (const config of configs) {
      const result = resolveLanguagePlugins(config, () => {})
      assert.strictEqual(result.plugins.length, 0)
      assert.strictEqual(result.errors.length, 0)
    }
  })

  it('should handle framework that does not exist in registry', () => {
    // This tests a framework name that looks like a shorthand but isn\'t registered
    const result = resolveLanguagePlugins(
      {languagePlugins: ['react']}, // Not in FRAMEWORK_PLUGINS
      () => {
        throw new Error('Should not be called')
      }
    )

    assert.strictEqual(result.plugins.length, 0)
    assert.strictEqual(result.errors.length, 1)
    // Since 'react' is not in registry, it will be treated as custom module
    assert.strictEqual(result.errors[0].type, 'import')
  })
})
