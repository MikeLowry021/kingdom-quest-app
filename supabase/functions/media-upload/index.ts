Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const { fileData, fileName, fileType, title, caption } = await req.json();

        if (!fileData || !fileName) {
            throw new Error('File data and filename are required');
        }

        // Get environment variables
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        // Extract base64 data from data URL
        const base64Data = fileData.split(',')[1];
        const mimeType = fileData.split(';')[0].split(':')[1];

        // Convert base64 to binary
        const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

        // Generate unique filename
        const uniqueFileName = `${Date.now()}-${fileName}`;

        // Upload to Supabase Storage
        const uploadResponse = await fetch(`${supabaseUrl}/storage/v1/object/kingdom-quest-media/${uniqueFileName}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'Content-Type': mimeType,
                'x-upsert': 'true'
            },
            body: binaryData
        });

        if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            throw new Error(`Upload failed: ${errorText}`);
        }

        // Get public URL
        const publicUrl = `${supabaseUrl}/storage/v1/object/public/kingdom-quest-media/${uniqueFileName}`;

        // Determine media type
        let mediaType = 'document';
        if (mimeType.startsWith('image/')) mediaType = 'image';
        else if (mimeType.startsWith('audio/')) mediaType = 'audio';
        else if (mimeType.startsWith('video/')) mediaType = 'video';

        // Save media metadata to database
        const mediaData = {
            title: title || fileName,
            type: mediaType,
            url: publicUrl,
            content_type: mimeType,
            filename: fileName,
            file_size: binaryData.length,
            caption: caption || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        const insertResponse = await fetch(`${supabaseUrl}/rest/v1/media`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(mediaData)
        });

        if (!insertResponse.ok) {
            const errorText = await insertResponse.text();
            throw new Error(`Database insert failed: ${errorText}`);
        }

        const mediaRecord = await insertResponse.json();

        return new Response(JSON.stringify({
            data: {
                publicUrl,
                media: mediaRecord[0]
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Media upload error:', error);

        const errorResponse = {
            error: {
                code: 'MEDIA_UPLOAD_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});