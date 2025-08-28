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
        const { action, userId, consentType, consentData, childId, parentId } = await req.json();

        if (!action || !userId) {
            throw new Error('Action and userId are required');
        }

        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        // Get user IP and user agent from request headers (fix IP parsing)
        const forwardedFor = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
        // Take only the first IP address if multiple are present
        const clientIP = forwardedFor.split(',')[0].trim();
        const userAgent = req.headers.get('user-agent') || 'unknown';

        let result;

        switch (action) {
            case 'grant_consent':
                result = await grantConsent({
                    userId,
                    consentType,
                    consentData,
                    clientIP,
                    userAgent,
                    supabaseUrl,
                    serviceRoleKey
                });
                break;

            case 'withdraw_consent':
                result = await withdrawConsent({
                    userId,
                    consentType,
                    supabaseUrl,
                    serviceRoleKey
                });
                break;

            case 'get_consent_status':
                result = await getConsentStatus({
                    userId,
                    supabaseUrl,
                    serviceRoleKey
                });
                break;

            case 'setup_parental_consent':
                if (!childId || !parentId) {
                    throw new Error('childId and parentId are required for parental consent setup');
                }
                result = await setupParentalConsent({
                    childId,
                    parentId,
                    consentData,
                    clientIP,
                    userAgent,
                    supabaseUrl,
                    serviceRoleKey
                });
                break;

            case 'verify_parental_authority':
                result = await verifyParentalAuthority({
                    parentId: userId,
                    childId,
                    supabaseUrl,
                    serviceRoleKey
                });
                break;

            default:
                throw new Error(`Unknown action: ${action}`);
        }

        return new Response(JSON.stringify({ data: result }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Consent manager error:', error);

        const errorResponse = {
            error: {
                code: 'CONSENT_MANAGER_ERROR',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

// Grant consent for a user
async function grantConsent({ userId, consentType, consentData, clientIP, userAgent, supabaseUrl, serviceRoleKey }) {
    const now = new Date().toISOString();
    
    // Validate and clean IP address for PostgreSQL INET type
    let cleanIP = 'unknown';
    if (clientIP && clientIP !== 'unknown') {
        // Remove any extra whitespace and validate IP format
        const ipPattern = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
        if (ipPattern.test(clientIP)) {
            cleanIP = clientIP;
        }
    }
    
    // First, check if there's an active consent record to withdraw
    const existingConsentResponse = await fetch(
        `${supabaseUrl}/rest/v1/consent_records?user_id=eq.${userId}&consent_type=eq.${consentType}&withdrawn_at=is.null`, 
        {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        }
    );

    if (existingConsentResponse.ok) {
        const existingConsents = await existingConsentResponse.json();
        if (existingConsents.length > 0) {
            // Withdraw existing consent first
            await fetch(`${supabaseUrl}/rest/v1/consent_records`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    withdrawn_at: now,
                    updated_at: now
                })
            });
        }
    }

    // Create new consent record
    const consentRecord = {
        user_id: userId,
        consent_type: consentType,
        granted_at: now,
        ip_address: cleanIP === 'unknown' ? null : cleanIP,
        user_agent: userAgent,
        legal_basis: consentData?.legalBasis || 'consent',
        consent_method: consentData?.method || 'web_form',
        metadata: {
            version: consentData?.version || '1.0',
            channel: consentData?.channel || 'web',
            additional_data: consentData?.additionalData || {}
        },
        created_at: now,
        updated_at: now
    };

    const insertResponse = await fetch(`${supabaseUrl}/rest/v1/consent_records`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        },
        body: JSON.stringify(consentRecord)
    });

    if (!insertResponse.ok) {
        const errorText = await insertResponse.text();
        throw new Error(`Failed to record consent: ${errorText}`);
    }

    const savedConsent = await insertResponse.json();

    // Update consent preferences
    await updateConsentPreferences(userId, consentType, true, supabaseUrl, serviceRoleKey);

    return {
        consentId: savedConsent[0].id,
        consentType,
        grantedAt: now,
        status: 'granted',
        message: `Consent for ${consentType} has been successfully recorded`
    };
}

// Withdraw consent for a user
async function withdrawConsent({ userId, consentType, supabaseUrl, serviceRoleKey }) {
    const now = new Date().toISOString();

    // Update existing consent records to mark as withdrawn
    const updateResponse = await fetch(
        `${supabaseUrl}/rest/v1/consent_records?user_id=eq.${userId}&consent_type=eq.${consentType}&withdrawn_at=is.null`,
        {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                withdrawn_at: now,
                updated_at: now
            })
        }
    );

    if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        throw new Error(`Failed to withdraw consent: ${errorText}`);
    }

    // Update consent preferences
    await updateConsentPreferences(userId, consentType, false, supabaseUrl, serviceRoleKey);

    return {
        consentType,
        withdrawnAt: now,
        status: 'withdrawn',
        message: `Consent for ${consentType} has been successfully withdrawn`
    };
}

// Get consent status for a user
async function getConsentStatus({ userId, supabaseUrl, serviceRoleKey }) {
    // Get current consent preferences
    const preferencesResponse = await fetch(
        `${supabaseUrl}/rest/v1/consent_preferences?user_id=eq.${userId}`,
        {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        }
    );

    let preferences = {};
    if (preferencesResponse.ok) {
        const preferencesData = await preferencesResponse.json();
        if (preferencesData.length > 0) {
            preferences = preferencesData[0];
        }
    }

    // Get consent history
    const historyResponse = await fetch(
        `${supabaseUrl}/rest/v1/consent_records?user_id=eq.${userId}&order=created_at.desc`,
        {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        }
    );

    let consentHistory = [];
    if (historyResponse.ok) {
        consentHistory = await historyResponse.json();
    }

    return {
        userId,
        currentPreferences: {
            data_processing: preferences.data_processing || false,
            marketing: preferences.marketing || false,
            analytics: preferences.analytics || false,
            cookies: preferences.cookies || false,
            cross_border_transfers: preferences.cross_border_transfers || false,
            communication_channels: preferences.communication_channels || {},
            last_updated: preferences.preferences_updated_at
        },
        consentHistory: consentHistory.map(record => ({
            id: record.id,
            consentType: record.consent_type,
            grantedAt: record.granted_at,
            withdrawnAt: record.withdrawn_at,
            method: record.consent_method,
            status: record.withdrawn_at ? 'withdrawn' : 'active'
        })),
        retrievedAt: new Date().toISOString()
    };
}

// Setup parental consent for child accounts
async function setupParentalConsent({ childId, parentId, consentData, clientIP, userAgent, supabaseUrl, serviceRoleKey }) {
    const now = new Date().toISOString();

    // Verify parent authority
    const parentVerification = await verifyParentalAuthority({ parentId, childId, supabaseUrl, serviceRoleKey });
    if (!parentVerification.isAuthorized) {
        throw new Error('Parental authority could not be verified');
    }

    // Create or update child account record
    const childAccountData = {
        child_id: childId,
        parent_id: parentId,
        birth_year: consentData?.birthYear,
        parental_consent_date: now,
        verification_method: consentData?.verificationMethod || 'email_verification',
        consent_scope: {
            data_processing: consentData?.dataProcessing !== false,
            educational_content: consentData?.educationalContent !== false,
            progress_tracking: consentData?.progressTracking !== false,
            parental_oversight: consentData?.parentalOversight !== false
        },
        oversight_settings: {
            content_approval: consentData?.contentApproval || 'recommended',
            communication_restrictions: consentData?.communicationRestrictions !== false,
            time_limits: consentData?.timeLimits || {},
            reporting_frequency: consentData?.reportingFrequency || 'weekly'
        },
        created_at: now,
        updated_at: now
    };

    // Check if child account already exists
    const existingAccountResponse = await fetch(
        `${supabaseUrl}/rest/v1/child_accounts?child_id=eq.${childId}`,
        {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        }
    );

    let childAccountResponse;
    if (existingAccountResponse.ok) {
        const existingAccounts = await existingAccountResponse.json();
        if (existingAccounts.length > 0) {
            // Update existing record
            childAccountResponse = await fetch(
                `${supabaseUrl}/rest/v1/child_accounts?child_id=eq.${childId}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify(childAccountData)
                }
            );
        } else {
            // Create new record
            childAccountResponse = await fetch(`${supabaseUrl}/rest/v1/child_accounts`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(childAccountData)
            });
        }
    }

    if (!childAccountResponse || !childAccountResponse.ok) {
        const errorText = await childAccountResponse?.text();
        throw new Error(`Failed to setup child account: ${errorText}`);
    }

    // Record parental consent as a consent record
    await grantConsent({
        userId: childId,
        consentType: 'parental_consent',
        consentData: {
            legalBasis: 'consent',
            method: 'parental_authorization',
            version: '1.0',
            parentId: parentId,
            verificationMethod: consentData?.verificationMethod || 'email_verification'
        },
        clientIP,
        userAgent,
        supabaseUrl,
        serviceRoleKey
    });

    const savedAccount = await childAccountResponse.json();

    return {
        childAccountId: savedAccount[0].id,
        childId,
        parentId,
        consentGranted: true,
        consentDate: now,
        verificationMethod: childAccountData.verification_method,
        message: 'Parental consent has been successfully recorded for child account'
    };
}

// Verify parental authority for a child account
async function verifyParentalAuthority({ parentId, childId, supabaseUrl, serviceRoleKey }) {
    // Check family accounts relationship
    const familyResponse = await fetch(
        `${supabaseUrl}/rest/v1/family_accounts?parent_id=eq.${parentId}&child_id=eq.${childId}`,
        {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        }
    );

    let familyRelationship = null;
    if (familyResponse.ok) {
        const familyData = await familyResponse.json();
        if (familyData.length > 0) {
            familyRelationship = familyData[0];
        }
    }

    // Check profile relationship
    const profileResponse = await fetch(
        `${supabaseUrl}/rest/v1/profiles?id=eq.${childId}&parent_id=eq.${parentId}`,
        {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        }
    );

    let profileRelationship = null;
    if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        if (profileData.length > 0) {
            profileRelationship = profileData[0];
        }
    }

    // Check parental verification status
    const verificationResponse = await fetch(
        `${supabaseUrl}/rest/v1/parental_verifications?parent_id=eq.${parentId}&status=eq.active`,
        {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        }
    );

    let verificationStatus = null;
    if (verificationResponse.ok) {
        const verificationData = await verificationResponse.json();
        if (verificationData.length > 0) {
            verificationStatus = verificationData[0];
        }
    }

    const isAuthorized = !!(familyRelationship || profileRelationship);
    const isVerified = !!verificationStatus;

    return {
        isAuthorized,
        isVerified,
        parentId,
        childId,
        familyRelationship: familyRelationship ? {
            id: familyRelationship.id,
            relationshipType: familyRelationship.relationship_type,
            oversightLevel: familyRelationship.oversight_level
        } : null,
        verificationStatus: verificationStatus ? {
            method: verificationStatus.verification_method,
            verifiedAt: verificationStatus.verified_at,
            expiresAt: verificationStatus.expires_at
        } : null,
        verifiedAt: new Date().toISOString()
    };
}

// Update consent preferences
async function updateConsentPreferences(userId, consentType, granted, supabaseUrl, serviceRoleKey) {
    const now = new Date().toISOString();
    
    // Check if preferences record exists
    const existingResponse = await fetch(
        `${supabaseUrl}/rest/v1/consent_preferences?user_id=eq.${userId}`,
        {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        }
    );

    const updateData = {
        [consentType]: granted,
        preferences_updated_at: now,
        updated_at: now
    };

    if (existingResponse.ok) {
        const existingData = await existingResponse.json();
        if (existingData.length > 0) {
            // Update existing record
            await fetch(
                `${supabaseUrl}/rest/v1/consent_preferences?user_id=eq.${userId}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updateData)
                }
            );
        } else {
            // Create new record
            await fetch(`${supabaseUrl}/rest/v1/consent_preferences`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: userId,
                    ...updateData,
                    created_at: now
                })
            });
        }
    }
}