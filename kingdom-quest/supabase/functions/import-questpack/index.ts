import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'false'
};

interface ImportQuestpackRequest {
  questpackData: string; // Base64 encoded questpack file
  fileName: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  questpack?: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    // Get authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const { questpackData, fileName }: ImportQuestpackRequest = await req.json();

    if (!questpackData || !fileName) {
      throw new Error('Missing required fields: questpackData and fileName');
    }

    // Get user info
    const userResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/get_user_subscription`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'apikey': supabaseKey
      },
      body: JSON.stringify({})
    });

    const userData = await userResponse.json();
    if (!userData) {
      throw new Error('Failed to get user data');
    }

    const userId = userData.user_id;

    // Verify user has premium/church subscription
    if (!['premium', 'church'].includes(userData.plan_id)) {
      return new Response(
        JSON.stringify({ error: 'Premium or Church subscription required for questpack import' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Decode and parse questpack
    const questpack = await parseQuestpack(questpackData);
    
    // Validate questpack
    const validation = await validateQuestpack(questpack);
    
    if (!validation.isValid) {
      // Log import attempt with validation errors
      await logImportAttempt(
        supabaseUrl,
        supabaseKey,
        userId,
        fileName,
        questpackData.length,
        'invalid',
        validation.errors
      );
      
      return new Response(
        JSON.stringify({
          error: 'Invalid questpack',
          validationErrors: validation.errors,
          warnings: validation.warnings
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Security scan
    const securityScan = await performSecurityScan(questpack);
    if (!securityScan.isSafe) {
      await logImportAttempt(
        supabaseUrl,
        supabaseKey,
        userId,
        fileName,
        questpackData.length,
        'unsafe',
        securityScan.risks
      );
      
      return new Response(
        JSON.stringify({
          error: 'Security scan failed',
          securityRisks: securityScan.risks
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Import questpack
    const importResult = await importQuestpack(
      supabaseUrl,
      supabaseKey,
      userId,
      questpack,
      validation.warnings
    );

    // Log successful import
    await logImportAttempt(
      supabaseUrl,
      supabaseKey,
      userId,
      fileName,
      questpackData.length,
      'valid',
      [],
      importResult.remixQuestId
    );

    return new Response(
      JSON.stringify({
        success: true,
        importedQuest: importResult,
        warnings: validation.warnings
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Import Questpack Error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to import questpack', 
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function parseQuestpack(questpackData: string): Promise<any> {
  try {
    // Decode from Base64
    const decodedData = atob(questpackData);
    
    // Parse as JSON
    const questpack = JSON.parse(decodedData);
    
    return questpack;
  } catch (error) {
    throw new Error(`Failed to parse questpack: ${error.message}`);
  }
}

async function validateQuestpack(questpack: any): Promise<ValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check required structure
  if (!questpack.version) {
    errors.push('Missing questpack version');
  } else if (!questpack.version.match(/^\d+\.\d+\.\d+$/)) {
    errors.push('Invalid version format');
  }
  
  if (!questpack.metadata) {
    errors.push('Missing questpack metadata');
  } else {
    if (!questpack.metadata.name) {
      errors.push('Missing questpack name in metadata');
    }
    if (!questpack.metadata.creator) {
      errors.push('Missing creator in metadata');
    }
    if (!questpack.metadata.createdAt) {
      errors.push('Missing creation date in metadata');
    }
  }
  
  if (!questpack.quests) {
    errors.push('Missing quests data');
  } else {
    if (!questpack.quests.original) {
      errors.push('Missing original quest data');
    }
    if (!questpack.quests.remix) {
      errors.push('Missing remix quest data');
    }
    if (!questpack.quests.attribution) {
      errors.push('Missing attribution data');
    }
  }
  
  if (!questpack.checksum) {
    warnings.push('Missing checksum - unable to verify integrity');
  }
  
  // Validate quest content structure
  if (questpack.quests && questpack.quests.remix) {
    const remixQuest = questpack.quests.remix;
    
    if (!remixQuest.title) {
      errors.push('Remix quest missing title');
    }
    
    if (!remixQuest.remixed_content) {
      errors.push('Remix quest missing content');
    } else {
      const content = remixQuest.remixed_content;
      
      if (!content.scenes || !Array.isArray(content.scenes)) {
        errors.push('Remix quest content missing scenes array');
      }
      
      if (!content.lesson) {
        warnings.push('Remix quest content missing lesson');
      }
      
      if (!content.memory_verse) {
        warnings.push('Remix quest content missing memory verse');
      }
    }
    
    if (!remixQuest.target_age_tier) {
      warnings.push('Remix quest missing target age tier');
    } else {
      const validAgeTiers = ['early_childhood', 'elementary', 'middle_school', 'high_school'];
      if (!validAgeTiers.includes(remixQuest.target_age_tier)) {
        errors.push(`Invalid target age tier: ${remixQuest.target_age_tier}`);
      }
    }
  }
  
  // Validate original quest reference
  if (questpack.quests && questpack.quests.original) {
    const originalQuest = questpack.quests.original;
    
    if (!originalQuest.title) {
      errors.push('Original quest missing title');
    }
    
    if (!originalQuest.scripture_reference) {
      errors.push('Original quest missing scripture reference');
    }
  }
  
  // Validate attribution chain
  if (questpack.quests && questpack.quests.attribution) {
    const attribution = questpack.quests.attribution;
    
    if (!Array.isArray(attribution)) {
      errors.push('Attribution must be an array');
    } else if (attribution.length === 0) {
      errors.push('Attribution chain is empty');
    } else {
      attribution.forEach((attr, index) => {
        if (!attr.original_quest_id) {
          errors.push(`Attribution ${index} missing original_quest_id`);
        }
        if (!attr.creator_name) {
          warnings.push(`Attribution ${index} missing creator_name`);
        }
        if (!attr.scripture_attribution) {
          warnings.push(`Attribution ${index} missing scripture_attribution`);
        }
      });
    }
  }
  
  // Check file size constraints
  const questpackSize = JSON.stringify(questpack).length;
  const maxSize = 50 * 1024 * 1024; // 50MB limit
  
  if (questpackSize > maxSize) {
    errors.push(`Questpack too large: ${(questpackSize / 1024 / 1024).toFixed(2)}MB (limit: 50MB)`);
  }
  
  // Verify checksum if present
  if (questpack.checksum) {
    try {
      const calculatedChecksum = await calculateChecksum(questpack);
      if (calculatedChecksum !== questpack.checksum) {
        errors.push('Checksum verification failed - questpack may be corrupted');
      }
    } catch (error) {
      warnings.push('Unable to verify checksum');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    questpack: errors.length === 0 ? questpack : undefined
  };
}

async function calculateChecksum(questpack: any): Promise<string> {
  // Create a copy without the checksum field
  const questpackCopy = { ...questpack };
  delete questpackCopy.checksum;
  
  const questpackString = JSON.stringify(questpackCopy);
  const encoder = new TextEncoder();
  const data = encoder.encode(questpackString);
  
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
}

async function performSecurityScan(questpack: any): Promise<{ isSafe: boolean; risks: string[] }> {
  const risks: string[] = [];
  
  // Convert questpack to string for pattern matching
  const questpackString = JSON.stringify(questpack).toLowerCase();
  
  // Check for malicious patterns
  const maliciousPatterns = [
    { pattern: /<script/gi, risk: 'Script injection detected' },
    { pattern: /javascript:/gi, risk: 'JavaScript protocol detected' },
    { pattern: /eval\(/gi, risk: 'Eval function detected' },
    { pattern: /document\./gi, risk: 'DOM manipulation detected' },
    { pattern: /window\./gi, risk: 'Window object access detected' },
    { pattern: /\$\{.*\}/gi, risk: 'Template literal injection detected' },
    { pattern: /\bon\w+\s*=/gi, risk: 'Event handler detected' },
    { pattern: /data:text\/html/gi, risk: 'Data URL with HTML detected' },
    { pattern: /vbscript:/gi, risk: 'VBScript protocol detected' },
    { pattern: /file:\/\//gi, risk: 'File protocol detected' }
  ];
  
  maliciousPatterns.forEach(({ pattern, risk }) => {
    if (pattern.test(questpackString)) {
      risks.push(risk);
    }
  });
  
  // Check for suspicious URLs
  const urlPattern = /https?:\/\/[^\s"'<>]+/gi;
  const urls = questpackString.match(urlPattern) || [];
  
  urls.forEach(url => {
    // Check for known malicious domains or suspicious patterns
    if (url.includes('localhost') || url.includes('127.0.0.1') || url.includes('0.0.0.0')) {
      risks.push(`Suspicious localhost URL detected: ${url}`);
    }
    
    if (url.includes('data:') || url.includes('blob:')) {
      risks.push(`Suspicious data/blob URL detected: ${url}`);
    }
  });
  
  // Check for excessive nesting (potential DoS)
  const maxNestingLevel = 10;
  const nestingLevel = calculateNestingLevel(questpack);
  if (nestingLevel > maxNestingLevel) {
    risks.push(`Excessive nesting detected (${nestingLevel} levels, max: ${maxNestingLevel})`);
  }
  
  // Check for excessively long strings (potential DoS)
  const maxStringLength = 100000; // 100KB per string
  const longStrings = findLongStrings(questpack, maxStringLength);
  if (longStrings.length > 0) {
    risks.push(`Excessively long strings detected (${longStrings.length} strings over ${maxStringLength} characters)`);
  }
  
  // Check for suspicious content in quest data
  if (questpack.quests && questpack.quests.remix && questpack.quests.remix.remixed_content) {
    const content = questpack.quests.remix.remixed_content;
    const contentString = JSON.stringify(content).toLowerCase();
    
    // Check for inappropriate content
    const inappropriatePatterns = [
      'password', 'credit card', 'social security', 'ssn', 'personal information',
      'download', 'install', 'executable', '.exe', '.bat', '.cmd', '.scr'
    ];
    
    inappropriatePatterns.forEach(pattern => {
      if (contentString.includes(pattern)) {
        risks.push(`Potentially inappropriate content detected: ${pattern}`);
      }
    });
  }
  
  return {
    isSafe: risks.length === 0,
    risks
  };
}

function calculateNestingLevel(obj: any, level = 0): number {
  if (typeof obj !== 'object' || obj === null) {
    return level;
  }
  
  let maxLevel = level;
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const nestedLevel = calculateNestingLevel(obj[key], level + 1);
      maxLevel = Math.max(maxLevel, nestedLevel);
    }
  }
  
  return maxLevel;
}

function findLongStrings(obj: any, maxLength: number, longStrings: string[] = []): string[] {
  if (typeof obj === 'string' && obj.length > maxLength) {
    longStrings.push(obj.substring(0, 100) + '...');
  } else if (typeof obj === 'object' && obj !== null) {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        findLongStrings(obj[key], maxLength, longStrings);
      }
    }
  }
  
  return longStrings;
}

async function importQuestpack(
  supabaseUrl: string,
  supabaseKey: string,
  userId: string,
  questpack: any,
  warnings: string[]
): Promise<{ remixQuestId: string; title: string; status: string }> {
  const { quests } = questpack;
  
  // Check if original quest exists, if not create it
  let originalQuestId = quests.original.id;
  
  const existingOriginalResponse = await fetch(
    `${supabaseUrl}/rest/v1/original_quests?id=eq.${originalQuestId}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey
      }
    }
  );
  
  const existingOriginal = await existingOriginalResponse.json();
  
  if (!existingOriginal || existingOriginal.length === 0) {
    // Create original quest
    const createOriginalResponse = await fetch(`${supabaseUrl}/rest/v1/original_quests`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'apikey': supabaseKey
      },
      body: JSON.stringify({
        ...quests.original,
        created_by: userId,
        is_official: false // Imported quests are not official
      })
    });
    
    if (!createOriginalResponse.ok) {
      throw new Error('Failed to create original quest');
    }
    
    const createdOriginal = await createOriginalResponse.json();
    originalQuestId = createdOriginal[0].id;
  }
  
  // Create remix quest
  const createRemixResponse = await fetch(`${supabaseUrl}/rest/v1/remix_quests`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'apikey': supabaseKey
    },
    body: JSON.stringify({
      ...quests.remix,
      id: undefined, // Let database generate new ID
      original_quest_id: originalQuestId,
      creator_id: userId,
      moderation_status: 'pending' // All imported quests need review
    })
  });
  
  if (!createRemixResponse.ok) {
    throw new Error('Failed to create remix quest');
  }
  
  const createdRemix = await createRemixResponse.json();
  const remixQuestId = createdRemix[0].id;
  
  // Import version history
  if (quests.versions && Array.isArray(quests.versions)) {
    for (const version of quests.versions) {
      await fetch(`${supabaseUrl}/rest/v1/quest_versions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'apikey': supabaseKey
        },
        body: JSON.stringify({
          remix_quest_id: remixQuestId,
          version_number: version.version_number,
          content: version.content,
          change_summary: version.change_summary || 'Imported version',
          created_by: userId
        })
      });
    }
  }
  
  // Import attribution chain
  if (quests.attribution && Array.isArray(quests.attribution)) {
    for (const attr of quests.attribution) {
      await fetch(`${supabaseUrl}/rest/v1/remix_attributions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'apikey': supabaseKey
        },
        body: JSON.stringify({
          remix_quest_id: remixQuestId,
          original_quest_id: attr.original_quest_id,
          parent_remix_id: attr.parent_remix_id,
          attribution_level: attr.attribution_level,
          creator_name: attr.creator_name,
          creator_id: attr.creator_id,
          scripture_attribution: attr.scripture_attribution
        })
      });
    }
  }
  
  return {
    remixQuestId,
    title: quests.remix.title,
    status: 'imported_pending_review'
  };
}

async function logImportAttempt(
  supabaseUrl: string,
  supabaseKey: string,
  userId: string,
  fileName: string,
  fileSizeBytes: number,
  validationStatus: string,
  validationErrors: string[],
  importedQuestId?: string
) {
  try {
    await fetch(`${supabaseUrl}/rest/v1/questpack_imports`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'apikey': supabaseKey
      },
      body: JSON.stringify({
        user_id: userId,
        questpack_name: fileName.replace('.questpack', ''),
        original_file_name: fileName,
        file_size_bytes: fileSizeBytes,
        validation_status: validationStatus,
        validation_errors: validationErrors,
        imported_quest_id: importedQuestId
      })
    });
  } catch (error) {
    console.error('Failed to log import attempt:', error);
  }
}