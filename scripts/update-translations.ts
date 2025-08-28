/**
 * Translation update script for KingdomQuest
 * Updates translation files with new keys and maintains consistency
 */

import fs from 'fs';
import path from 'path';
import { locales, defaultLocale } from '../middleware';
import { loadMessages } from '../i18n';
import type { Locale } from '../i18n';

// Configuration
const TRANSLATION_DIR = 'i18n';
const BACKUP_DIR = 'i18n/backups';

interface UpdateOptions {
  addMissingKeys?: boolean;
  removeExtraKeys?: boolean;
  sortKeys?: boolean;
  updateMetadata?: boolean;
  createBackup?: boolean;
}

interface UpdateResult {
  locale: Locale;
  keysAdded: number;
  keysRemoved: number;
  keysUpdated: number;
  success: boolean;
  error?: string;
}

class TranslationUpdater {
  private options: UpdateOptions;
  
  constructor(options: UpdateOptions = {}) {
    this.options = {
      addMissingKeys: true,
      removeExtraKeys: false, // Conservative default
      sortKeys: true,
      updateMetadata: true,
      createBackup: true,
      ...options
    };
  }
  
  /**
   * Update all translation files
   */
  async updateAll(): Promise<UpdateResult[]> {
    console.log('🔄 Starting translation updates...');
    
    const results: UpdateResult[] = [];
    
    // Create backup if requested
    if (this.options.createBackup) {
      await this.createBackup();
    }
    
    // Load base locale for reference
    const baseMessages = await loadMessages(defaultLocale);
    
    for (const locale of locales) {
      if (locale === defaultLocale) continue; // Skip base locale
      
      console.log(`\n📝 Updating locale: ${locale}`);
      const result = await this.updateLocale(locale, baseMessages);
      results.push(result);
    }
    
    this.printSummary(results);
    return results;
  }
  
  /**
   * Update a specific locale
   */
  async updateLocale(locale: Locale, baseMessages?: any): Promise<UpdateResult> {
    const result: UpdateResult = {
      locale,
      keysAdded: 0,
      keysRemoved: 0,
      keysUpdated: 0,
      success: false
    };
    
    try {
      // Load base messages if not provided
      if (!baseMessages) {
        baseMessages = await loadMessages(defaultLocale);
      }
      
      // Load current locale messages
      let currentMessages: any = {};
      const localeFile = path.join(TRANSLATION_DIR, `${locale}.json`);
      
      try {
        currentMessages = await loadMessages(locale);
      } catch (error) {
        console.log(`Creating new translation file for ${locale}`);
      }
      
      // Update messages
      const updatedMessages = await this.processMessages(
        baseMessages,
        currentMessages,
        result
      );
      
      // Update metadata
      if (this.options.updateMetadata) {
        updatedMessages._metadata = {
          ...currentMessages._metadata,
          locale,
          lastUpdated: new Date().toISOString().split('T')[0],
          completeness: this.calculateCompleteness(baseMessages, updatedMessages)
        };
        result.keysUpdated++;
      }
      
      // Sort keys if requested
      if (this.options.sortKeys) {
        this.sortObjectKeys(updatedMessages);
      }
      
      // Save updated messages
      await fs.promises.writeFile(
        localeFile,
        JSON.stringify(updatedMessages, null, 2) + '\n',
        'utf-8'
      );
      
      result.success = true;
      console.log(`✅ Updated ${locale}: +${result.keysAdded} keys, -${result.keysRemoved} keys`);
      
    } catch (error) {
      result.error = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ Failed to update ${locale}:`, result.error);
    }
    
    return result;
  }
  
  /**
   * Process messages and apply updates
   */
  private async processMessages(
    baseMessages: any,
    currentMessages: any,
    result: UpdateResult
  ): Promise<any> {
    const updatedMessages = { ...currentMessages };
    
    // Add missing keys
    if (this.options.addMissingKeys) {
      const added = this.addMissingKeys(baseMessages, updatedMessages, result);
      result.keysAdded += added;
    }
    
    // Remove extra keys
    if (this.options.removeExtraKeys) {
      const removed = this.removeExtraKeys(baseMessages, updatedMessages, result);
      result.keysRemoved += removed;
    }
    
    return updatedMessages;
  }
  
  /**
   * Add missing keys from base locale
   */
  private addMissingKeys(
    baseMessages: any,
    targetMessages: any,
    result: UpdateResult,
    prefix = ''
  ): number {
    let added = 0;
    
    for (const [key, value] of Object.entries(baseMessages)) {
      if (key.startsWith('_')) continue; // Skip metadata
      
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (!(key in targetMessages)) {
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          targetMessages[key] = {};
          added += this.addMissingKeys(value, targetMessages[key], result, fullKey);
        } else {
          // Add placeholder for translation
          targetMessages[key] = `[TODO: Translate '${fullKey}']`;
          added++;
        }
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        if (typeof targetMessages[key] !== 'object') {
          targetMessages[key] = {};
        }
        added += this.addMissingKeys(value, targetMessages[key], result, fullKey);
      }
    }
    
    return added;
  }
  
  /**
   * Remove extra keys not present in base locale
   */
  private removeExtraKeys(
    baseMessages: any,
    targetMessages: any,
    result: UpdateResult,
    prefix = ''
  ): number {
    let removed = 0;
    
    for (const key in targetMessages) {
      if (key.startsWith('_')) continue; // Skip metadata
      
      if (!(key in baseMessages)) {
        delete targetMessages[key];
        removed++;
      } else if (
        typeof baseMessages[key] === 'object' &&
        baseMessages[key] !== null &&
        !Array.isArray(baseMessages[key]) &&
        typeof targetMessages[key] === 'object' &&
        targetMessages[key] !== null
      ) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        removed += this.removeExtraKeys(
          baseMessages[key],
          targetMessages[key],
          result,
          fullKey
        );
      }
    }
    
    return removed;
  }
  
  /**
   * Calculate translation completeness
   */
  private calculateCompleteness(baseMessages: any, targetMessages: any): number {
    const baseKeys = this.countKeys(baseMessages);
    const translatedKeys = this.countTranslatedKeys(targetMessages);
    
    return Math.round((translatedKeys / baseKeys) * 100);
  }
  
  /**
   * Count total number of keys
   */
  private countKeys(obj: any): number {
    let count = 0;
    
    for (const [key, value] of Object.entries(obj)) {
      if (key.startsWith('_')) continue;
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        count += this.countKeys(value);
      } else {
        count++;
      }
    }
    
    return count;
  }
  
  /**
   * Count translated keys (non-TODO values)
   */
  private countTranslatedKeys(obj: any): number {
    let count = 0;
    
    for (const [key, value] of Object.entries(obj)) {
      if (key.startsWith('_')) continue;
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        count += this.countTranslatedKeys(value);
      } else if (typeof value === 'string' && !value.startsWith('[TODO:')) {
        count++;
      }
    }
    
    return count;
  }
  
  /**
   * Sort object keys recursively
   */
  private sortObjectKeys(obj: any): void {
    const keys = Object.keys(obj).sort();
    const sortedObj: any = {};
    
    // Move metadata to the top
    if ('_metadata' in obj) {
      sortedObj._metadata = obj._metadata;
    }
    
    // Add other keys in sorted order
    for (const key of keys) {
      if (key === '_metadata') continue;
      
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        sortedObj[key] = { ...obj[key] };
        this.sortObjectKeys(sortedObj[key]);
      } else {
        sortedObj[key] = obj[key];
      }
    }
    
    // Replace original object properties
    Object.keys(obj).forEach(key => delete obj[key]);
    Object.assign(obj, sortedObj);
  }
  
  /**
   * Create backup of current translation files
   */
  private async createBackup(): Promise<void> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(BACKUP_DIR, timestamp);
      
      // Ensure backup directory exists
      await fs.promises.mkdir(backupPath, { recursive: true });
      
      // Copy all translation files
      for (const locale of locales) {
        const sourceFile = path.join(TRANSLATION_DIR, `${locale}.json`);
        const backupFile = path.join(backupPath, `${locale}.json`);
        
        try {
          await fs.promises.copyFile(sourceFile, backupFile);
        } catch (error) {
          // File might not exist yet, which is okay
          console.log(`Note: Could not backup ${locale}.json (file may not exist)`);
        }
      }
      
      console.log(`📦 Backup created: ${backupPath}`);
    } catch (error) {
      console.warn('Warning: Could not create backup:', error);
    }
  }
  
  /**
   * Print update summary
   */
  private printSummary(results: UpdateResult[]): void {
    console.log('\n📊 Translation Update Summary');
    console.log('==============================');
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    const totalAdded = results.reduce((sum, r) => sum + r.keysAdded, 0);
    const totalRemoved = results.reduce((sum, r) => sum + r.keysRemoved, 0);
    
    console.log(`Successful updates: ${successful}`);
    console.log(`Failed updates: ${failed}`);
    console.log(`Total keys added: ${totalAdded}`);
    console.log(`Total keys removed: ${totalRemoved}`);
    
    if (failed > 0) {
      console.log('\n❌ Failed updates:');
      results.filter(r => !r.success).forEach(result => {
        console.log(`  ${result.locale}: ${result.error}`);
      });
    }
    
    console.log(`\n${failed === 0 ? '🎉' : '⚠️'} Update ${failed === 0 ? 'completed successfully' : 'completed with errors'}!`);
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const options: UpdateOptions = {};
  
  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--no-add':
        options.addMissingKeys = false;
        break;
      case '--remove-extra':
        options.removeExtraKeys = true;
        break;
      case '--no-sort':
        options.sortKeys = false;
        break;
      case '--no-metadata':
        options.updateMetadata = false;
        break;
      case '--no-backup':
        options.createBackup = false;
        break;
      case '--help':
        console.log('Translation Update Script');
        console.log('Usage: npm run i18n:update [options]');
        console.log('');
        console.log('Options:');
        console.log('  --no-add         Do not add missing keys');
        console.log('  --remove-extra   Remove keys not in base locale');
        console.log('  --no-sort        Do not sort keys alphabetically');
        console.log('  --no-metadata    Do not update metadata');
        console.log('  --no-backup      Do not create backup');
        console.log('  --help           Show this help message');
        return;
    }
  }
  
  const updater = new TranslationUpdater(options);
  
  try {
    const results = await updater.updateAll();
    
    // Exit with error code if any updates failed
    if (results.some(r => !r.success)) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Update failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { TranslationUpdater, type UpdateOptions, type UpdateResult };