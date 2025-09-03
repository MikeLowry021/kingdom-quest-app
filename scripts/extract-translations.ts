/**
 * Translation extraction script for KingdomQuest
 * Extracts translatable strings from the codebase
 */

import fs from 'fs';
import path from 'path';
import { loadMessages } from '../i18n';
import type { Locale } from '../i18n';

// Configuration
const SOURCE_DIRS = ['app', 'components', 'lib'];
const TRANSLATION_KEYS_FILE = 'i18n/extracted-keys.json';
const IGNORED_PATTERNS = [
  /node_modules/,
  /\.next/,
  /\.git/,
  /dist/,
  /build/,
];

// Translation key patterns to extract
const TRANSLATION_PATTERNS = [
  // useTranslations patterns
  /useTranslations\(['"](.*?)['"]\)/g,
  /t\(['"](.*?)['"]\)/g,
  
  // getTranslations patterns
  /getTranslations\(['"](.*?)['"]\)/g,
  
  // Direct translation keys
  /['"]([a-z][a-zA-Z0-9._-]*)['"](?=\s*[),])/g,
];

interface ExtractedKey {
  key: string;
  namespace: string;
  fullKey: string;
  files: string[];
  contexts: string[];
}

interface ExtractionResult {
  keys: ExtractedKey[];
  totalKeys: number;
  filesScanned: number;
  timestamp: string;
}

class TranslationExtractor {
  private extractedKeys: Map<string, ExtractedKey> = new Map();
  private filesScanned = 0;
  
  /**
   * Extract translation keys from the codebase
   */
  async extract(): Promise<ExtractionResult> {
    console.log('🔍 Starting translation key extraction...');
    
    for (const dir of SOURCE_DIRS) {
      await this.scanDirectory(path.join(process.cwd(), dir));
    }
    
    const keys = Array.from(this.extractedKeys.values());
    
    const result: ExtractionResult = {
      keys,
      totalKeys: keys.length,
      filesScanned: this.filesScanned,
      timestamp: new Date().toISOString()
    };
    
    // Save results
    await this.saveResults(result);
    
    console.log(`✅ Extraction complete!`);
    console.log(`   Files scanned: ${result.filesScanned}`);
    console.log(`   Translation keys found: ${result.totalKeys}`);
    
    return result;
  }
  
  /**
   * Scan a directory for translation keys
   */
  private async scanDirectory(dirPath: string): Promise<void> {
    try {
      const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        
        // Skip ignored patterns
        if (this.shouldIgnore(fullPath)) {
          continue;
        }
        
        if (entry.isDirectory()) {
          await this.scanDirectory(fullPath);
        } else if (this.isSourceFile(entry.name)) {
          await this.scanFile(fullPath);
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not scan directory ${dirPath}:`, error);
    }
  }
  
  /**
   * Scan a file for translation keys
   */
  private async scanFile(filePath: string): Promise<void> {
    try {
      const content = await fs.promises.readFile(filePath, 'utf-8');
      this.filesScanned++;
      
      const relativePath = path.relative(process.cwd(), filePath);
      const keys = this.extractKeysFromContent(content, relativePath);
      
      // Add extracted keys to the collection
      for (const key of keys) {
        if (this.extractedKeys.has(key.fullKey)) {
          const existing = this.extractedKeys.get(key.fullKey)!;
          if (!existing.files.includes(relativePath)) {
            existing.files.push(relativePath);
          }
          existing.contexts.push(...key.contexts);
        } else {
          this.extractedKeys.set(key.fullKey, key);
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not scan file ${filePath}:`, error);
    }
  }
  
  /**
   * Extract translation keys from file content
   */
  private extractKeysFromContent(content: string, filePath: string): ExtractedKey[] {
    const keys: ExtractedKey[] = [];
    const lines = content.split('\n');
    
    lines.forEach((line, lineNumber) => {
      for (const pattern of TRANSLATION_PATTERNS) {
        let match;
        const regex = new RegExp(pattern.source, pattern.flags);
        
        while ((match = regex.exec(line)) !== null) {
          const fullKey = match[1];
          if (this.isValidTranslationKey(fullKey)) {
            const { namespace, key } = this.parseTranslationKey(fullKey);
            
            keys.push({
              key,
              namespace,
              fullKey,
              files: [filePath],
              contexts: [`${filePath}:${lineNumber + 1}`]
            });
          }
        }
      }
    });
    
    return keys;
  }
  
  /**
   * Parse a translation key into namespace and key
   */
  private parseTranslationKey(fullKey: string): { namespace: string; key: string } {
    const parts = fullKey.split('.');
    if (parts.length === 1) {
      return { namespace: 'common', key: fullKey };
    }
    
    const namespace = parts[0];
    const key = parts.slice(1).join('.');
    
    return { namespace, key };
  }
  
  /**
   * Check if a string is a valid translation key
   */
  private isValidTranslationKey(key: string): boolean {
    // Must start with a letter and contain only letters, numbers, dots, underscores, hyphens
    const validPattern = /^[a-zA-Z][a-zA-Z0-9._-]*$/;
    
    // Must not be too short or too long
    if (key.length < 2 || key.length > 100) {
      return false;
    }
    
    // Must match the valid pattern
    if (!validPattern.test(key)) {
      return false;
    }
    
    // Exclude common false positives
    const falsePositives = [
      'use', 'get', 'set', 'id', 'src', 'alt', 'href', 'type', 'name', 'value',
      'className', 'onClick', 'onChange', 'onSubmit', 'style', 'data', 'props',
      'children', 'key', 'ref', 'index', 'item', 'list', 'array', 'object',
      'string', 'number', 'boolean', 'function', 'undefined', 'null'
    ];
    
    if (falsePositives.includes(key.toLowerCase())) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Check if file should be ignored
   */
  private shouldIgnore(filePath: string): boolean {
    return IGNORED_PATTERNS.some(pattern => pattern.test(filePath));
  }
  
  /**
   * Check if file is a source file that should be scanned
   */
  private isSourceFile(fileName: string): boolean {
    const sourceExtensions = ['.ts', '.tsx', '.js', '.jsx'];
    return sourceExtensions.some(ext => fileName.endsWith(ext));
  }
  
  /**
   * Save extraction results to file
   */
  private async saveResults(result: ExtractionResult): Promise<void> {
    try {
      // Ensure directory exists
      const dir = path.dirname(TRANSLATION_KEYS_FILE);
      await fs.promises.mkdir(dir, { recursive: true });
      
      // Save results
      await fs.promises.writeFile(
        TRANSLATION_KEYS_FILE,
        JSON.stringify(result, null, 2),
        'utf-8'
      );
      
      console.log(`📝 Results saved to ${TRANSLATION_KEYS_FILE}`);
    } catch (error) {
      console.error('Error saving results:', error);
    }
  }
}

/**
 * Generate missing keys report
 */
async function generateMissingKeysReport(): Promise<void> {
  try {
    const extractionData = JSON.parse(
      await fs.promises.readFile(TRANSLATION_KEYS_FILE, 'utf-8')
    ) as ExtractionResult;
    
    console.log('\n📊 Missing Keys Report');
    console.log('========================');
    
    // Load existing translations
    const enMessages = await loadMessages('en');
    const existingKeys = extractKeys(enMessages);
    
    // Find missing keys
    const missingKeys = extractionData.keys.filter(key => 
      !existingKeys.includes(key.fullKey)
    );
    
    if (missingKeys.length === 0) {
      console.log('✅ All extracted keys are present in translation files!');
      return;
    }
    
    console.log(`❌ Found ${missingKeys.length} missing keys:\n`);
    
    missingKeys.forEach(key => {
      console.log(`  - ${key.fullKey}`);
      console.log(`    Namespace: ${key.namespace}`);
      console.log(`    Found in: ${key.files.join(', ')}`);
      console.log('');
    });
    
    // Generate template for missing keys
    const template = generateTranslationTemplate(missingKeys);
    await fs.promises.writeFile(
      'i18n/missing-keys-template.json',
      JSON.stringify(template, null, 2),
      'utf-8'
    );
    
    console.log('📝 Missing keys template saved to i18n/missing-keys-template.json');
    
  } catch (error) {
    console.error('Error generating missing keys report:', error);
  }
}

/**
 * Extract all keys from a translation object
 */
function extractKeys(obj: any, prefix = ''): string[] {
  const keys: string[] = [];
  
  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith('_')) continue; // Skip metadata
    
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys.push(...extractKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  
  return keys;
}

/**
 * Generate translation template for missing keys
 */
function generateTranslationTemplate(missingKeys: ExtractedKey[]): any {
  const template: any = {};
  
  for (const { namespace, key, fullKey } of missingKeys) {
    const parts = fullKey.split('.');
    let current = template;
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      
      if (i === parts.length - 1) {
        // Last part - set the value
        current[part] = `[TODO: Translate '${fullKey}']`;
      } else {
        // Intermediate part - create object if doesn't exist
        if (!current[part]) {
          current[part] = {};
        }
        current = current[part];
      }
    }
  }
  
  return template;
}

// Main execution
async function main() {
  const extractor = new TranslationExtractor();
  
  try {
    await extractor.extract();
    await generateMissingKeysReport();
  } catch (error) {
    console.error('Extraction failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { TranslationExtractor, type ExtractionResult, type ExtractedKey };