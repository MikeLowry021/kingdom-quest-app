/**
 * Translation checking script for KingdomQuest
 * Validates translation files for completeness and consistency
 */

import fs from 'fs';
import path from 'path';
import { locales, defaultLocale } from '../middleware';
import { loadMessages, validateTranslation } from '../i18n';
import type { Locale } from '../i18n';

// Configuration
const TRANSLATION_DIR = 'i18n';
const REPORT_FILE = 'i18n/validation-report.json';

interface ValidationReport {
  timestamp: string;
  summary: {
    totalLocales: number;
    validLocales: number;
    invalidLocales: number;
    totalIssues: number;
  };
  locales: LocaleValidationResult[];
  recommendations: string[];
}

interface LocaleValidationResult {
  locale: Locale;
  isValid: boolean;
  completeness: number;
  issues: ValidationIssue[];
  statistics: {
    totalKeys: number;
    missingKeys: number;
    extraKeys: number;
    emptyValues: number;
  };
}

interface ValidationIssue {
  type: 'missing_key' | 'extra_key' | 'empty_value' | 'invalid_format' | 'encoding_issue';
  key?: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

class TranslationChecker {
  private report: ValidationReport;
  
  constructor() {
    this.report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalLocales: 0,
        validLocales: 0,
        invalidLocales: 0,
        totalIssues: 0
      },
      locales: [],
      recommendations: []
    };
  }
  
  /**
   * Check all translation files
   */
  async check(): Promise<ValidationReport> {
    console.log('🔍 Starting translation validation...');
    
    this.report.summary.totalLocales = locales.length;
    
    for (const locale of locales) {
      console.log(`\n📝 Checking locale: ${locale}`);
      const result = await this.checkLocale(locale);
      this.report.locales.push(result);
      
      if (result.isValid) {
        this.report.summary.validLocales++;
      } else {
        this.report.summary.invalidLocales++;
      }
      
      this.report.summary.totalIssues += result.issues.length;
    }
    
    this.generateRecommendations();
    await this.saveReport();
    this.printSummary();
    
    return this.report;
  }
  
  /**
   * Check a specific locale
   */
  private async checkLocale(locale: Locale): Promise<LocaleValidationResult> {
    const result: LocaleValidationResult = {
      locale,
      isValid: true,
      completeness: 0,
      issues: [],
      statistics: {
        totalKeys: 0,
        missingKeys: 0,
        extraKeys: 0,
        emptyValues: 0
      }
    };
    
    try {
      // Check if translation file exists
      const translationFile = path.join(TRANSLATION_DIR, `${locale}.json`);
      if (!await this.fileExists(translationFile)) {
        result.issues.push({
          type: 'missing_key',
          message: `Translation file not found: ${translationFile}`,
          severity: 'error'
        });
        result.isValid = false;
        return result;
      }
      
      // Load and validate messages
      const messages = await loadMessages(locale);
      const validation = await validateTranslation(locale, defaultLocale);
      
      // Update statistics
      result.statistics.totalKeys = this.countKeys(messages);
      result.statistics.missingKeys = validation.missingKeys.length;
      result.statistics.extraKeys = validation.extraKeys.length;
      result.statistics.emptyValues = validation.emptyValues.length;
      
      // Calculate completeness
      if (locale === defaultLocale) {
        result.completeness = 100; // Base locale is always 100% complete
      } else {
        const baseMessages = await loadMessages(defaultLocale);
        const totalBaseKeys = this.countKeys(baseMessages);
        const completedKeys = totalBaseKeys - result.statistics.missingKeys;
        result.completeness = Math.round((completedKeys / totalBaseKeys) * 100);
      }
      
      // Add validation issues
      validation.missingKeys.forEach(key => {
        result.issues.push({
          type: 'missing_key',
          key,
          message: `Missing translation for key: ${key}`,
          severity: 'error'
        });
      });
      
      validation.extraKeys.forEach(key => {
        result.issues.push({
          type: 'extra_key',
          key,
          message: `Extra key not found in base locale: ${key}`,
          severity: 'warning'
        });
      });
      
      validation.emptyValues.forEach(key => {
        result.issues.push({
          type: 'empty_value',
          key,
          message: `Empty value for key: ${key}`,
          severity: 'error'
        });
      });
      
      // Check for format issues
      await this.checkFormatIssues(messages, result);
      
      // Check for encoding issues
      await this.checkEncodingIssues(translationFile, result);
      
      // Determine if locale is valid
      const errorCount = result.issues.filter(issue => issue.severity === 'error').length;
      result.isValid = errorCount === 0;
      
    } catch (error) {
      result.issues.push({
        type: 'invalid_format',
        message: `Failed to validate locale ${locale}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error'
      });
      result.isValid = false;
    }
    
    return result;
  }
  
  /**
   * Check for format issues in translations
   */
  private async checkFormatIssues(messages: any, result: LocaleValidationResult): Promise<void> {
    this.checkObject(messages, result, '');
  }
  
  /**
   * Recursively check translation object for format issues
   */
  private checkObject(obj: any, result: LocaleValidationResult, prefix: string): void {
    for (const [key, value] of Object.entries(obj)) {
      if (key.startsWith('_')) continue; // Skip metadata
      
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        this.checkObject(value, result, fullKey);
      } else if (typeof value === 'string') {
        // Check for interpolation consistency
        if (this.hasInterpolation(value)) {
          const variables = this.extractInterpolationVariables(value);
          
          // Check for common interpolation issues
          variables.forEach(variable => {
            if (!this.isValidInterpolationVariable(variable)) {
              result.issues.push({
                type: 'invalid_format',
                key: fullKey,
                message: `Invalid interpolation variable '{${variable}}' in key: ${fullKey}`,
                severity: 'warning'
              });
            }
          });
        }
        
        // Check for HTML tags (potential security issue)
        if (this.containsHtmlTags(value)) {
          result.issues.push({
            type: 'invalid_format',
            key: fullKey,
            message: `HTML tags found in translation: ${fullKey}`,
            severity: 'warning'
          });
        }
      } else if (value === null || value === undefined) {
        result.issues.push({
          type: 'empty_value',
          key: fullKey,
          message: `Null or undefined value for key: ${fullKey}`,
          severity: 'error'
        });
      }
    }
  }
  
  /**
   * Check for encoding issues
   */
  private async checkEncodingIssues(filePath: string, result: LocaleValidationResult): Promise<void> {
    try {
      const content = await fs.promises.readFile(filePath, 'utf-8');
      
      // Check for BOM (Byte Order Mark)
      if (content.charCodeAt(0) === 0xFEFF) {
        result.issues.push({
          type: 'encoding_issue',
          message: 'File contains BOM (Byte Order Mark) which may cause issues',
          severity: 'warning'
        });
      }
      
      // Check for common encoding issues
      const encodingProblems = [
        { pattern: /\u00c2\u00a0/g, name: 'Non-breaking space encoding issue' },
        { pattern: /\u00e2\u0080\u0099/g, name: 'Smart quote encoding issue' },
        { pattern: /\u00e2\u0080\u009c/g, name: 'Smart quote encoding issue' },
        { pattern: /\u00e2\u0080\u009d/g, name: 'Smart quote encoding issue' },
      ];
      
      encodingProblems.forEach(({ pattern, name }) => {
        if (pattern.test(content)) {
          result.issues.push({
            type: 'encoding_issue',
            message: name,
            severity: 'warning'
          });
        }
      });
      
    } catch (error) {
      result.issues.push({
        type: 'encoding_issue',
        message: `Could not check encoding: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'warning'
      });
    }
  }
  
  /**
   * Count total number of translation keys
   */
  private countKeys(obj: any, prefix = ''): number {
    let count = 0;
    
    for (const [key, value] of Object.entries(obj)) {
      if (key.startsWith('_')) continue; // Skip metadata
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        count += this.countKeys(value, prefix ? `${prefix}.${key}` : key);
      } else {
        count++;
      }
    }
    
    return count;
  }
  
  /**
   * Check if a string has interpolation variables
   */
  private hasInterpolation(str: string): boolean {
    return /{\w+}/.test(str);
  }
  
  /**
   * Extract interpolation variables from a string
   */
  private extractInterpolationVariables(str: string): string[] {
    const matches = str.match(/{(\w+)}/g);
    return matches ? matches.map(match => match.slice(1, -1)) : [];
  }
  
  /**
   * Check if an interpolation variable is valid
   */
  private isValidInterpolationVariable(variable: string): boolean {
    // Variable should be camelCase or snake_case
    return /^[a-zA-Z][a-zA-Z0-9_]*$/.test(variable);
  }
  
  /**
   * Check if a string contains HTML tags
   */
  private containsHtmlTags(str: string): boolean {
    return /<\/?[a-z][\s\S]*>/i.test(str);
  }
  
  /**
   * Check if file exists
   */
  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.promises.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
  
  /**
   * Generate recommendations based on validation results
   */
  private generateRecommendations(): void {
    const recommendations: string[] = [];
    
    // Check overall completion status
    const avgCompleteness = this.report.locales.reduce((sum, locale) => sum + locale.completeness, 0) / this.report.locales.length;
    
    if (avgCompleteness < 90) {
      recommendations.push('Consider completing translations for all locales to improve user experience');
    }
    
    // Check for locales with many missing keys
    const incompleteLocales = this.report.locales.filter(locale => locale.completeness < 80);
    if (incompleteLocales.length > 0) {
      recommendations.push(`Focus on completing translations for: ${incompleteLocales.map(l => l.locale).join(', ')}`);
    }
    
    // Check for format issues
    const formatIssues = this.report.locales.reduce((sum, locale) => 
      sum + locale.issues.filter(issue => issue.type === 'invalid_format').length, 0
    );
    
    if (formatIssues > 0) {
      recommendations.push('Review and fix format issues in translation files');
    }
    
    // Check for encoding issues
    const encodingIssues = this.report.locales.reduce((sum, locale) => 
      sum + locale.issues.filter(issue => issue.type === 'encoding_issue').length, 0
    );
    
    if (encodingIssues > 0) {
      recommendations.push('Fix encoding issues to prevent display problems');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('All translations look good! Consider adding more locales to support more users.');
    }
    
    this.report.recommendations = recommendations;
  }
  
  /**
   * Save validation report
   */
  private async saveReport(): Promise<void> {
    try {
      await fs.promises.writeFile(
        REPORT_FILE,
        JSON.stringify(this.report, null, 2),
        'utf-8'
      );
      console.log(`\n📊 Validation report saved to ${REPORT_FILE}`);
    } catch (error) {
      console.error('Error saving report:', error);
    }
  }
  
  /**
   * Print validation summary
   */
  private printSummary(): void {
    console.log('\n📊 Translation Validation Summary');
    console.log('==================================');
    console.log(`Total locales: ${this.report.summary.totalLocales}`);
    console.log(`Valid locales: ${this.report.summary.validLocales}`);
    console.log(`Invalid locales: ${this.report.summary.invalidLocales}`);
    console.log(`Total issues: ${this.report.summary.totalIssues}`);
    
    console.log('\n📈 Completeness by Locale:');
    this.report.locales.forEach(locale => {
      const status = locale.isValid ? '✅' : '❌';
      console.log(`  ${status} ${locale.locale}: ${locale.completeness}% complete (${locale.issues.length} issues)`);
    });
    
    if (this.report.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      this.report.recommendations.forEach(rec => {
        console.log(`  • ${rec}`);
      });
    }
    
    console.log(`\n${this.report.summary.invalidLocales === 0 ? '🎉' : '⚠️'} Validation ${this.report.summary.invalidLocales === 0 ? 'passed' : 'failed'}!`);
  }
}

// Main execution
async function main() {
  const checker = new TranslationChecker();
  
  try {
    const report = await checker.check();
    
    // Exit with error code if validation failed
    if (report.summary.invalidLocales > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Validation failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { TranslationChecker, type ValidationReport, type LocaleValidationResult };