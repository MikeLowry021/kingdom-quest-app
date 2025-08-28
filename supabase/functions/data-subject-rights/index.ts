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
        const { action, userId, requestType, requestDetails, requestId, childId, parentId } = await req.json();

        if (!action) {
            throw new Error('Action is required');
        }

        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        let result;

        switch (action) {
            case 'submit_request':
                if (!userId || !requestType) {
                    throw new Error('userId and requestType are required');
                }
                result = await submitDataSubjectRequest({
                    userId,
                    requestType,
                    requestDetails,
                    childId,
                    parentId,
                    supabaseUrl,
                    serviceRoleKey
                });
                break;

            case 'process_request':
                if (!requestId) {
                    throw new Error('requestId is required for processing');
                }
                result = await processDataSubjectRequest({
                    requestId,
                    supabaseUrl,
                    serviceRoleKey
                });
                break;

            case 'get_user_requests':
                if (!userId) {
                    throw new Error('userId is required');
                }
                result = await getUserRequests({
                    userId,
                    supabaseUrl,
                    serviceRoleKey
                });
                break;

            case 'export_user_data':
                if (!userId) {
                    throw new Error('userId is required for data export');
                }
                result = await exportUserData({
                    userId,
                    requestId,
                    supabaseUrl,
                    serviceRoleKey
                });
                break;

            case 'delete_user_data':
                if (!userId) {
                    throw new Error('userId is required for data deletion');
                }
                result = await deleteUserData({
                    userId,
                    requestId,
                    childId,
                    parentId,
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
        console.error('Data subject rights error:', error);

        const errorResponse = {
            error: {
                code: 'DATA_SUBJECT_RIGHTS_ERROR',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

// Submit a new data subject request
async function submitDataSubjectRequest({ userId, requestType, requestDetails, childId, parentId, supabaseUrl, serviceRoleKey }) {
    const now = new Date().toISOString();

    // If this is a child account request, verify parental authority
    if (childId && parentId) {
        const parentalAuth = await verifyParentalAuthority({ parentId, childId, supabaseUrl, serviceRoleKey });
        if (!parentalAuth.isAuthorized) {
            throw new Error('Parental authority could not be verified for child account request');
        }
    }

    // Validate request type
    const validRequestTypes = ['access', 'correction', 'deletion', 'portability', 'restriction', 'objection'];
    if (!validRequestTypes.includes(requestType)) {
        throw new Error(`Invalid request type. Must be one of: ${validRequestTypes.join(', ')}`);
    }

    // Create the request record
    const requestRecord = {
        user_id: userId,
        request_type: requestType,
        status: 'pending',
        request_details: {
            description: requestDetails?.description || '',
            priority: requestDetails?.priority || 'normal',
            specific_data: requestDetails?.specificData || [],
            reason: requestDetails?.reason || '',
            child_id: childId,
            parent_id: parentId,
            contact_method: requestDetails?.contactMethod || 'email',
            additional_info: requestDetails?.additionalInfo || {}
        },
        submitted_at: now,
        created_at: now,
        updated_at: now
    };

    const insertResponse = await fetch(`${supabaseUrl}/rest/v1/data_subject_requests`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        },
        body: JSON.stringify(requestRecord)
    });

    if (!insertResponse.ok) {
        const errorText = await insertResponse.text();
        throw new Error(`Failed to submit data subject request: ${errorText}`);
    }

    const savedRequest = await insertResponse.json();
    const request = savedRequest[0];

    // For immediate processing requests (like access or export), process automatically
    if (requestType === 'access' || requestType === 'portability') {
        try {
            await processDataSubjectRequest({
                requestId: request.id,
                supabaseUrl,
                serviceRoleKey
            });
        } catch (error) {
            console.warn(`Auto-processing failed for request ${request.id}: ${error.message}`);
        }
    }

    return {
        requestId: request.id,
        requestType: request.request_type,
        status: request.status,
        submittedAt: request.submitted_at,
        estimatedCompletionTime: calculateEstimatedCompletion(requestType),
        nextSteps: getNextSteps(requestType),
        message: `Data subject rights request for ${requestType} has been submitted successfully`
    };
}

// Process a data subject request
async function processDataSubjectRequest({ requestId, supabaseUrl, serviceRoleKey }) {
    // Get the request details
    const requestResponse = await fetch(
        `${supabaseUrl}/rest/v1/data_subject_requests?id=eq.${requestId}`,
        {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        }
    );

    if (!requestResponse.ok) {
        throw new Error('Request not found');
    }

    const requests = await requestResponse.json();
    if (requests.length === 0) {
        throw new Error('Request not found');
    }

    const request = requests[0];
    const now = new Date().toISOString();

    // Update request status to processing
    await updateRequestStatus(requestId, 'processing', supabaseUrl, serviceRoleKey);

    let result = null;
    try {
        switch (request.request_type) {
            case 'access':
            case 'portability':
                result = await exportUserData({
                    userId: request.user_id,
                    requestId,
                    supabaseUrl,
                    serviceRoleKey
                });
                break;

            case 'deletion':
                result = await deleteUserData({
                    userId: request.user_id,
                    requestId,
                    childId: request.request_details?.child_id,
                    parentId: request.request_details?.parent_id,
                    supabaseUrl,
                    serviceRoleKey
                });
                break;

            case 'correction':
                result = {
                    message: 'Correction request received. Please contact support with specific details.',
                    requiresManualReview: true
                };
                await updateRequestStatus(requestId, 'pending', supabaseUrl, serviceRoleKey);
                break;

            case 'restriction':
            case 'objection':
                result = {
                    message: 'Request received and will be reviewed manually.',
                    requiresManualReview: true
                };
                await updateRequestStatus(requestId, 'pending', supabaseUrl, serviceRoleKey);
                break;

            default:
                throw new Error(`Unsupported request type: ${request.request_type}`);
        }

        // Update request with response data if automatically processed
        if (result && !result.requiresManualReview) {
            await fetch(
                `${supabaseUrl}/rest/v1/data_subject_requests?id=eq.${requestId}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        status: 'completed',
                        completed_at: now,
                        response_data: result,
                        updated_at: now
                    })
                }
            );
        }

    } catch (error) {
        console.error(`Error processing request ${requestId}:`, error);
        await updateRequestStatus(requestId, 'pending', supabaseUrl, serviceRoleKey);
        throw error;
    }

    return {
        requestId,
        status: result?.requiresManualReview ? 'pending' : 'completed',
        processedAt: now,
        result
    };
}

// Export user data for access/portability requests
async function exportUserData({ userId, requestId, supabaseUrl, serviceRoleKey }) {
    const exportData = {
        userId,
        exportedAt: new Date().toISOString(),
        dataCategories: {}
    };

    // Export profile data
    const profileResponse = await fetch(
        `${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`,
        {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        }
    );
    if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        exportData.dataCategories.profile = profileData;
    }

    // Export consent records
    const consentResponse = await fetch(
        `${supabaseUrl}/rest/v1/consent_records?user_id=eq.${userId}`,
        {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        }
    );
    if (consentResponse.ok) {
        const consentData = await consentResponse.json();
        exportData.dataCategories.consent_records = consentData;
    }

    // Export consent preferences
    const preferencesResponse = await fetch(
        `${supabaseUrl}/rest/v1/consent_preferences?user_id=eq.${userId}`,
        {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        }
    );
    if (preferencesResponse.ok) {
        const preferencesData = await preferencesResponse.json();
        exportData.dataCategories.consent_preferences = preferencesData;
    }

    // Export story progress and activities
    const storyProgressResponse = await fetch(
        `${supabaseUrl}/rest/v1/story_progress?user_id=eq.${userId}`,
        {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        }
    );
    if (storyProgressResponse.ok) {
        const storyData = await storyProgressResponse.json();
        exportData.dataCategories.story_progress = storyData;
    }

    // Export quiz attempts
    const quizResponse = await fetch(
        `${supabaseUrl}/rest/v1/quiz_attempts?user_id=eq.${userId}`,
        {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        }
    );
    if (quizResponse.ok) {
        const quizData = await quizResponse.json();
        exportData.dataCategories.quiz_attempts = quizData;
    }

    // Export family altar data
    const altarResponse = await fetch(
        `${supabaseUrl}/rest/v1/family_altars?user_id=eq.${userId}`,
        {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        }
    );
    if (altarResponse.ok) {
        const altarData = await altarResponse.json();
        exportData.dataCategories.family_altars = altarData;
    }

    // Export analytics events (anonymized)
    const analyticsResponse = await fetch(
        `${supabaseUrl}/rest/v1/user_analytics_events?user_id=eq.${userId}`,
        {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        }
    );
    if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        // Remove IP addresses and sensitive data
        const anonymizedAnalytics = analyticsData.map(event => ({
            id: event.id,
            event_type: event.event_type,
            event_data: event.event_data,
            created_at: event.created_at
        }));
        exportData.dataCategories.analytics_events = anonymizedAnalytics;
    }

    return {
        requestId,
        exportData,
        format: 'JSON',
        totalRecords: Object.values(exportData.dataCategories).reduce(
            (total, category) => total + (Array.isArray(category) ? category.length : 1), 0
        ),
        exportedAt: exportData.exportedAt,
        message: 'User data has been successfully exported'
    };
}

// Delete user data for deletion requests
async function deleteUserData({ userId, requestId, childId, parentId, supabaseUrl, serviceRoleKey }) {
    const deletionResults = {
        userId,
        requestId,
        deletedAt: new Date().toISOString(),
        deletedCategories: [],
        retainedCategories: [],
        errors: []
    };

    // Special handling for child accounts - immediate deletion with parental request
    const isChildAccount = !!(childId && parentId);
    
    // Tables to delete from (order matters for dependencies)
    const deletionOrder = [
        'user_analytics_events',
        'story_progress',
        'quiz_attempts',
        'family_altars',
        'consent_records',
        'consent_preferences',
        'data_subject_requests',
        'content_reports',
        'child_accounts',
        'family_accounts',
        'parental_controls'
    ];

    // Delete user data from each table
    for (const table of deletionOrder) {
        try {
            let deleteUrl;
            if (table === 'family_accounts') {
                // Delete both parent and child relationships
                deleteUrl = `${supabaseUrl}/rest/v1/${table}?or=(parent_id.eq.${userId},child_id.eq.${userId})`;
            } else if (table === 'data_subject_requests' && requestId) {
                // Don't delete the current request record
                deleteUrl = `${supabaseUrl}/rest/v1/${table}?user_id=eq.${userId}&id=neq.${requestId}`;
            } else {
                deleteUrl = `${supabaseUrl}/rest/v1/${table}?user_id=eq.${userId}`;
            }

            const deleteResponse = await fetch(deleteUrl, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey
                }
            });

            if (deleteResponse.ok) {
                deletionResults.deletedCategories.push(table);
            } else {
                const errorText = await deleteResponse.text();
                deletionResults.errors.push(`Failed to delete from ${table}: ${errorText}`);
            }

        } catch (error) {
            deletionResults.errors.push(`Error deleting from ${table}: ${error.message}`);
        }
    }

    // Delete from profiles table (this will cascade auth deletion)
    try {
        const profileDeleteResponse = await fetch(
            `${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`,
            {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey
                }
            }
        );

        if (profileDeleteResponse.ok) {
            deletionResults.deletedCategories.push('profiles');
        } else {
            const errorText = await profileDeleteResponse.text();
            deletionResults.errors.push(`Failed to delete profile: ${errorText}`);
        }
    } catch (error) {
        deletionResults.errors.push(`Error deleting profile: ${error.message}`);
    }

    // Delete auth user (this should be done last)
    try {
        const authDeleteResponse = await fetch(
            `${supabaseUrl}/auth/v1/admin/users/${userId}`,
            {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey
                }
            }
        );

        if (authDeleteResponse.ok) {
            deletionResults.deletedCategories.push('auth_users');
        } else {
            const errorText = await authDeleteResponse.text();
            deletionResults.errors.push(`Failed to delete auth user: ${errorText}`);
        }
    } catch (error) {
        deletionResults.errors.push(`Error deleting auth user: ${error.message}`);
    }

    return {
        requestId,
        deletionResults,
        isChildAccount,
        success: deletionResults.errors.length === 0,
        message: deletionResults.errors.length === 0 
            ? 'User data has been successfully deleted'
            : 'User data deletion completed with some errors. Please contact support for assistance.'
    };
}

// Get user's data subject requests
async function getUserRequests({ userId, supabaseUrl, serviceRoleKey }) {
    const requestsResponse = await fetch(
        `${supabaseUrl}/rest/v1/data_subject_requests?user_id=eq.${userId}&order=submitted_at.desc`,
        {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        }
    );

    if (!requestsResponse.ok) {
        throw new Error('Failed to retrieve user requests');
    }

    const requests = await requestsResponse.json();

    return {
        userId,
        requests: requests.map(request => ({
            id: request.id,
            requestType: request.request_type,
            status: request.status,
            submittedAt: request.submitted_at,
            completedAt: request.completed_at,
            description: request.request_details?.description || '',
            priority: request.request_details?.priority || 'normal'
        })),
        totalRequests: requests.length,
        retrievedAt: new Date().toISOString()
    };
}

// Helper functions
async function updateRequestStatus(requestId, status, supabaseUrl, serviceRoleKey) {
    const updateResponse = await fetch(
        `${supabaseUrl}/rest/v1/data_subject_requests?id=eq.${requestId}`,
        {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                status,
                updated_at: new Date().toISOString()
            })
        }
    );

    if (!updateResponse.ok) {
        throw new Error('Failed to update request status');
    }
}

async function verifyParentalAuthority({ parentId, childId, supabaseUrl, serviceRoleKey }) {
    const familyResponse = await fetch(
        `${supabaseUrl}/rest/v1/family_accounts?parent_id=eq.${parentId}&child_id=eq.${childId}`,
        {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        }
    );

    let isAuthorized = false;
    if (familyResponse.ok) {
        const familyData = await familyResponse.json();
        isAuthorized = familyData.length > 0;
    }

    return { isAuthorized, parentId, childId };
}

function calculateEstimatedCompletion(requestType) {
    const now = new Date();
    const estimatedDays = {
        'access': 7,
        'correction': 14,
        'deletion': 7,
        'portability': 7,
        'restriction': 14,
        'objection': 14
    };
    
    const daysToAdd = estimatedDays[requestType] || 14;
    const estimatedDate = new Date(now);
    estimatedDate.setDate(now.getDate() + daysToAdd);
    
    return estimatedDate.toISOString();
}

function getNextSteps(requestType) {
    const steps = {
        'access': [
            'Your data export will be processed automatically',
            'You will receive an email with download instructions',
            'Data will be available for 30 days'
        ],
        'correction': [
            'Your request will be reviewed by our team',
            'We will contact you if additional information is needed',
            'You will be notified once corrections are made'
        ],
        'deletion': [
            'Your deletion request will be processed',
            'Some data may be retained for legal compliance',
            'You will receive confirmation once deletion is complete'
        ],
        'portability': [
            'Your data will be prepared in a structured format',
            'You will receive download instructions via email',
            'Data will be available for 30 days'
        ],
        'restriction': [
            'Your request will be reviewed by our privacy team',
            'Processing restrictions will be implemented as appropriate',
            'You will be notified of the outcome'
        ],
        'objection': [
            'Your objection will be reviewed by our privacy team',
            'Processing will be stopped unless compelling legitimate grounds exist',
            'You will be notified of our decision'
        ]
    };
    
    return steps[requestType] || ['Your request will be reviewed and processed accordingly'];
}