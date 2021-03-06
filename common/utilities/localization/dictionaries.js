/* eslint-disable */
// TODO: reconfigure eslint rules w team

/**
 * dictionaries.js
 * desc: dictionary management for all supported locales
 * notes: uses app-settings.json as the source of truth
 */
'use strict';

import * as settings from '../../settings/app-settings.json';


/**
 * createDictionaries
 * desc: builds a dictionary for every supported locale
 * notes: uses app-settings.json as the source of truth
 * @return {object}  dictionaries
 */
export function createDictionaries() {
  const dictionaries = {};

  // check if supported locales exist
  if (settings.locales && settings.locales.SUPPORTED) {
    // iterate over supported locales
    settings.locales.SUPPORTED.forEach(locale => {
      const localeSplit = locale.split('-');

      // determine locale files
      const languageFile = localeSplit[0];
      const countryFile = `${localeSplit[0]}-${localeSplit[1]}`;
      const dialectFile = (localeSplit.length === 3) ? locale : null;

      // require locale files
      let language = {};
      let country = {};
      let dialect = {};
      try { language = require(`../../locales/${languageFile}.json`); } catch (err) {}
      try { country = require(`../../locales/${countryFile}.json`); } catch (err) {}
      if (dialectFile) {
        try { dialect = require(`../../locales/${dialectFile}.json`); } catch (err) {}
      }

      // create locale dictionary
      dictionaries[locale] = Object.assign({}, language, country, dialect);
    });
  }

  return dictionaries;
}
