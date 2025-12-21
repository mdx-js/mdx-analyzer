// @ts-check

/**
 * Astro Language Plugin for Volar/MDX Analyzer
 *
 * This plugin simply re-exports the getLanguagePlugin function from @astrojs/ts-plugin.
 * Astro's plugin already provides the necessary functionality for MDX interoperability.
 */

const {getLanguagePlugin} = require('@astrojs/ts-plugin/dist/language')

module.exports = {getLanguagePlugin}
