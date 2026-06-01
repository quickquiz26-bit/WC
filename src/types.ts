/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Channel {
  name: string;
  url: string;
  id: string;
}

export interface Language {
  code: string;
  name: string;
  localName: string;
}

export type ThemeType = 'crimson' | 'nebula' | 'carbon';

export interface ThemeConfig {
  id: ThemeType;
  name: string;
  bg: string;
  cardBg: string;
  accent: string;
  accentHover: string;
  text: string;
  borderColor: string;
  glowColor: string;
  bannerBg: string;
  bannerText: string;
}

export interface TranslationResponse {
  translatedText: string;
  language: string;
  source: 'gemini' | 'dictionary';
}
