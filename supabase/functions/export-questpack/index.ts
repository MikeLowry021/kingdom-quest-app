import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'false'
};

interface ExportQuestpackRequest {
  remixQuestId: string;
  questpackName: string;
  description?: string;
}

interface QuestpackBundle {
  version: string;
  metadata: {
    name: string;
    description: string;
    creator: string;
    createdAt: string;
    questCount: number;
    totalSize: number;
  };
  quests: {
    original: any;
    remix: any;
    attribution: any[];
    versions: any[];
  };
  assets: {
    images: Array<{ filename: string; data: string; mimeType: string }>;
    audio: Array<{ filename: string; data: string; mimeType: string }>;
    other: Array<{ filename: string; data: string; mimeType: string }>;
  };
  checksum: string;
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

    const { remixQuestId, questpackName, description }: ExportQuestpackRequest = await req.json();

    if (!remixQuestId || !questpackName) {
      throw new Error('Missing required fields: remixQuestId and questpackName');
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

    // Fetch remix quest with all related data
    const remixQuestData = await fetchRemixQuestData(supabaseUrl, supabaseKey, remixQuestId, userId);
    
    if (!remixQuestData.remix) {
      throw new Error('Remix quest not found or not accessible');
    }

    // Verify quest is approved or user is creator
    if (remixQuestData.remix.creator_id !== userId && remixQuestData.remix.moderation_status !== 'approved') {
      throw new Error('Quest not approved for export');
    }

    // Create questpack bundle
    const questpackBundle = await createQuestpackBundle(
      remixQuestData,
      questpackName,
      description,
      userData
    );

    // Compress bundle
    const compressedBundle = await compressBundle(questpackBundle);
    
    // Calculate file hash for integrity
    const fileHash = await calculateSHA256(compressedBundle);
    
    // Upload to Supabase Storage
    const fileName = `${questpackName.replace(/[^a-zA-Z0-9-_]/g, '_')}_${Date.now()}.questpack`;
    const uploadResult = await uploadQuestpack(supabaseUrl, supabaseKey, fileName, compressedBundle);
    
    if (!uploadResult.success) {
      throw new Error('Failed to upload questpack');
    }

    // Create export record
    const exportRecord = await createExportRecord(
      supabaseUrl,
      supabaseKey,
      {
        remixQuestId,
        creatorId: userId,
        questpackName,
        description,
        fileSizeBytes: compressedBundle.length,
        fileHash,
        downloadUrl: uploadResult.downloadUrl,
        metadata: questpackBundle.metadata
      }
    );

    return new Response(
      JSON.stringify({
        success: true,
        questpack: {
          id: exportRecord.id,
          name: questpackName,
          downloadUrl: uploadResult.downloadUrl,
          fileSize: compressedBundle.length,
          expiryDate: exportRecord.expiry_date,
          metadata: questpackBundle.metadata
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Export Questpack Error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to export questpack', 
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function fetchRemixQuestData(supabaseUrl: string, supabaseKey: string, remixQuestId: string, userId: string) {
  // Fetch remix quest
  const remixResponse = await fetch(
    `${supabaseUrl}/rest/v1/remix_quests?id=eq.${remixQuestId}&select=*`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey
      }
    }
  );
  
  const remixQuests = await remixResponse.json();
  const remix = remixQuests[0];
  
  if (!remix) {
    return { remix: null, original: null, attribution: [], versions: [] };
  }

  // Fetch original quest
  const originalResponse = await fetch(
    `${supabaseUrl}/rest/v1/original_quests?id=eq.${remix.original_quest_id}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey
      }
    }
  );
  
  const originalQuests = await originalResponse.json();
  const original = originalQuests[0];

  // Fetch attribution chain
  const attributionResponse = await fetch(
    `${supabaseUrl}/rest/v1/remix_attributions?remix_quest_id=eq.${remixQuestId}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey
      }
    }
  );
  
  const attribution = await attributionResponse.json();

  // Fetch version history
  const versionsResponse = await fetch(
    `${supabaseUrl}/rest/v1/quest_versions?remix_quest_id=eq.${remixQuestId}&order=version_number.asc`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey
      }
    }
  );
  
  const versions = await versionsResponse.json();

  return { remix, original, attribution, versions };
}

async function createQuestpackBundle(
  questData: any,
  questpackName: string,
  description: string,
  userData: any
): Promise<QuestpackBundle> {
  const { remix, original, attribution, versions } = questData;
  
  // Create metadata
  const metadata = {
    name: questpackName,
    description: description || '',
    creator: userData.email || 'Anonymous Creator',
    createdAt: new Date().toISOString(),
    questCount: 1,
    totalSize: 0 // Will be calculated later
  };

  // Extract and process assets
  const assets = {
    images: [] as Array<{ filename: string; data: string; mimeType: string }>,
    audio: [] as Array<{ filename: string; data: string; mimeType: string }>,
    other: [] as Array<{ filename: string; data: string; mimeType: string }>
  };

  // Process quest content for embedded assets
  await extractAssetsFromContent(remix.remixed_content, assets);
  
  const bundle: QuestpackBundle = {
    version: '1.0.0',
    metadata,
    quests: {
      original,
      remix,
      attribution,
      versions
    },
    assets,
    checksum: '' // Will be calculated later
  };

  // Calculate total size
  const bundleString = JSON.stringify(bundle);
  bundle.metadata.totalSize = new TextEncoder().encode(bundleString).length;
  
  // Calculate checksum
  bundle.checksum = await calculateSHA256(bundleString);
  
  return bundle;
}

async function extractAssetsFromContent(content: any, assets: any) {
  // This would extract embedded images, audio, and other media from the quest content
  // For now, we'll implement a basic version that looks for asset references
  const contentString = JSON.stringify(content);
  
  // Look for image URLs or references
  const imageMatches = contentString.match(/\.(jpg|jpeg|png|gif|webp)/gi);
  if (imageMatches) {
    // In a real implementation, we would fetch these images and embed them
    console.log('Found image references:', imageMatches);
  }
  
  // Look for audio URLs or references
  const audioMatches = contentString.match(/\.(mp3|wav|ogg|m4a)/gi);
  if (audioMatches) {
    // In a real implementation, we would fetch these audio files and embed them
    console.log('Found audio references:', audioMatches);
  }
}

async function compressBundle(bundle: QuestpackBundle): Promise<Uint8Array> {
  // Convert bundle to JSON string
  const bundleString = JSON.stringify(bundle, null, 2);
  
  // For now, we'll just return the UTF-8 encoded string
  // In a production system, we would use compression like gzip
  return new TextEncoder().encode(bundleString);
}

async function calculateSHA256(data: string | Uint8Array): Promise<string> {
  const encoder = new TextEncoder();
  const dataArray = typeof data === 'string' ? encoder.encode(data) : data;
  
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataArray);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
}

async function uploadQuestpack(
  supabaseUrl: string,
  supabaseKey: string,
  fileName: string,
  fileData: Uint8Array
): Promise<{ success: boolean; downloadUrl?: string; error?: string }> {
  try {
    // Upload to Supabase Storage
    const uploadResponse = await fetch(
      `${supabaseUrl}/storage/v1/object/questpacks/${fileName}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/octet-stream'
        },
        body: fileData
      }
    );

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      return { success: false, error: `Upload failed: ${errorText}` };
    }

    // Generate signed URL for download
    const signedUrlResponse = await fetch(
      `${supabaseUrl}/storage/v1/object/sign/questpacks/${fileName}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ expiresIn: 86400 * 7 }) // 7 days
      }
    );

    if (!signedUrlResponse.ok) {
      return { success: false, error: 'Failed to generate download URL' };
    }

    const signedUrlData = await signedUrlResponse.json();
    const downloadUrl = `${supabaseUrl}/storage/v1${signedUrlData.signedURL}`;

    return { success: true, downloadUrl };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function createExportRecord(
  supabaseUrl: string,
  supabaseKey: string,
  data: {
    remixQuestId: string;
    creatorId: string;
    questpackName: string;
    description?: string;
    fileSizeBytes: number;
    fileHash: string;
    downloadUrl: string;
    metadata: any;
  }
): Promise<any> {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 7); // 7 days from now

  const response = await fetch(`${supabaseUrl}/rest/v1/questpack_exports`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'apikey': supabaseKey
    },
    body: JSON.stringify({
      remix_quest_id: data.remixQuestId,
      creator_id: data.creatorId,
      questpack_name: data.questpackName,
      description: data.description,
      file_size_bytes: data.fileSizeBytes,
      file_hash: data.fileHash,
      download_url: data.downloadUrl,
      expiry_date: expiryDate.toISOString(),
      metadata: data.metadata
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to create export record: ${await response.text()}`);
  }

  const result = await response.json();
  return result[0];
}