// src/utils/colors.test.js
import { getColorClasses, escapeRegExp } from './colors';

describe('getColorClasses', () => {
  test('should return correct classes for blue color', () => {
    const result = getColorClasses('blue');
    expect(result).toEqual({
      bg: "bg-blue-100",
      hoverBg: "hover:bg-blue-200",
      border: "border-blue-300",
      text: "text-blue-800",
      badge: "bg-blue-200 text-blue-800",
      accent: "bg-blue-600"
    });
  });

  test('should return correct classes for green color', () => {
    const result = getColorClasses('green');
    expect(result).toEqual({
      bg: "bg-green-100",
      hoverBg: "hover:bg-green-200",
      border: "border-green-300",
      text: "text-green-800",
      badge: "bg-green-200 text-green-800",
      accent: "bg-green-600"
    });
  });

  test('should return correct classes for red color', () => {
    const result = getColorClasses('red');
    expect(result).toEqual({
      bg: "bg-red-100",
      hoverBg: "hover:bg-red-200",
      border: "border-red-300",
      text: "text-red-800",
      badge: "bg-red-200 text-red-800",
      accent: "bg-red-600"
    });
  });

  test('should return correct classes for purple color', () => {
    const result = getColorClasses('purple');
    expect(result).toEqual({
      bg: "bg-purple-100",
      hoverBg: "hover:bg-purple-200",
      border: "border-purple-300",
      text: "text-purple-800",
      badge: "bg-purple-200 text-purple-800",
      accent: "bg-purple-600"
    });
  });

  test('should return correct classes for amber color', () => {
    const result = getColorClasses('amber');
    expect(result).toEqual({
      bg: "bg-amber-100",
      hoverBg: "hover:bg-amber-200",
      border: "border-amber-300",
      text: "text-amber-800",
      badge: "bg-amber-200 text-amber-800",
      accent: "bg-amber-600"
    });
  });

  test('should return correct classes for teal color', () => {
    const result = getColorClasses('teal');
    expect(result).toEqual({
      bg: "bg-teal-100",
      hoverBg: "hover:bg-teal-200",
      border: "border-teal-300",
      text: "text-teal-800",
      badge: "bg-teal-200 text-teal-800",
      accent: "bg-teal-600"
    });
  });

  test('should return blue color classes for unknown color', () => {
    const result = getColorClasses('nonexistent');
    expect(result).toEqual({
      bg: "bg-blue-100",
      hoverBg: "hover:bg-blue-200",
      border: "border-blue-300",
      text: "text-blue-800",
      badge: "bg-blue-200 text-blue-800",
      accent: "bg-blue-600"
    });
  });

  test('should return blue color classes for undefined color', () => {
    const result = getColorClasses(undefined);
    expect(result).toEqual({
      bg: "bg-blue-100",
      hoverBg: "hover:bg-blue-200",
      border: "border-blue-300",
      text: "text-blue-800",
      badge: "bg-blue-200 text-blue-800",
      accent: "bg-blue-600"
    });
  });
});

describe('escapeRegExp', () => {
  test('should escape special characters in a string', () => {
    const input = 'some.string*with+special?(characters)|[here]^${}\\';
    const expected = 'some\\.string\\*with\\+special\\?\\(characters\\)\\|\\[here\\]\\^\\$\\{\\}\\\\';
    expect(escapeRegExp(input)).toBe(expected);
  });

  test('should return the same string if no special characters exist', () => {
    const input = 'normalstring';
    expect(escapeRegExp(input)).toBe(input);
  });

  test('should handle empty string', () => {
    expect(escapeRegExp('')).toBe('');
  });
});