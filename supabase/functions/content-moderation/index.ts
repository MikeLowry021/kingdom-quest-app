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
        const { action, reportData, reportId, moderatorId, appealData, appealId } = await req.json();

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
            case 'submit_report':
                if (!reportData) {
                    throw new Error('reportData is required for submitting reports');
                }
                result = await submitContentReport({
                    reportData,
                    supabaseUrl,
                    serviceRoleKey
                });
                break;

            case 'get_reports':
                result = await getContentReports({
                    status: reportData?.status,
                    priority: reportData?.priority,
                    reportType: reportData?.reportType,
                    moderatorId,
                    supabaseUrl,
                    serviceRoleKey
                });
                break;

            case 'moderate_report':
                if (!reportId || !moderatorId) {
                    throw new Error('reportId and moderatorId are required for moderation');
                }
                result = await moderateContent({
                    reportId,
                    moderatorId,
                    moderationData: reportData,
                    supabaseUrl,
                    serviceRoleKey
                });
                break;

            case 'submit_appeal':
                if (!appealData) {
                    throw new Error('appealData is required for appeals');
                }
                result = await submitModerationAppeal({
                    appealData,
                    supabaseUrl,
                    serviceRoleKey
                });
                break;

            case 'process_appeal':
                if (!appealId || !moderatorId) {
                    throw new Error('appealId and moderatorId are required for processing appeals');
                }
                result = await processModerationAppeal({
                    appealId,
                    moderatorId,
                    appealDecision: appealData,
                    supabaseUrl,
                    serviceRoleKey
                });
                break;

            case 'get_user_reports':
                if (!reportData?.reporterId) {
                    throw new Error('reporterId is required to get user reports');
                }
                result = await getUserReports({
                    reporterId: reportData.reporterId,
                    supabaseUrl,
                    serviceRoleKey
                });
                break;

            case 'get_user_appeals':
                if (!appealData?.userId) {
                    throw new Error('userId is required to get user appeals');
                }
                result = await getUserAppeals({
                    userId: appealData.userId,
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
        console.error('Content moderation error:', error);

        const errorResponse = {
            error: {
                code: 'CONTENT_MODERATION_ERROR',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

// Submit a content report
async function submitContentReport({ reportData, supabaseUrl, serviceRoleKey }) {
    const {
        reporterId,
        reportedContentId,
        reportedUserId,
        reportType,
        reportReason,
        reportDetails,
        anonymous
    } = reportData;

    // Validate required fields
    if (!reportType || !reportReason) {
        throw new Error('reportType and reportReason are required');
    }

    if (!reportedContentId && !reportedUserId) {
        throw new Error('Either reportedContentId or reportedUserId must be provided');
    }

    const validReportTypes = ['inappropriate_content', 'harassment', 'spam', 'safety_concern', 'child_safety', 'other'];
    if (!validReportTypes.includes(reportType)) {
        throw new Error(`Invalid report type. Must be one of: ${validReportTypes.join(', ')}`);
    }

    const now = new Date().toISOString();
    
    // Determine priority based on report type
    let priority = 'normal';
    if (reportType === 'child_safety' || reportType === 'safety_concern') {
        priority = 'critical';
    } else if (reportType === 'harassment') {
        priority = 'high';
    }

    const reportRecord = {
        reporter_id: anonymous ? null : reporterId,
        reported_content_id: reportedContentId || null,
        reported_user_id: reportedUserId || null,
        report_type: reportType,
        report_reason: reportReason,
        report_details: {
            description: reportDetails?.description || '',
            context: reportDetails?.context || '',
            evidence_urls: reportDetails?.evidenceUrls || [],
            anonymous_report: !!anonymous,
            additional_info: reportDetails?.additionalInfo || {}
        },
        status: 'pending',
        priority: priority,
        submitted_at: now,
        created_at: now,
        updated_at: now
    };

    const insertResponse = await fetch(`${supabaseUrl}/rest/v1/content_reports`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        },
        body: JSON.stringify(reportRecord)
    });

    if (!insertResponse.ok) {
        const errorText = await insertResponse.text();
        throw new Error(`Failed to submit report: ${errorText}`);
    }

    const savedReport = await insertResponse.json();
    const report = savedReport[0];

    // For critical reports, send immediate notifications
    if (priority === 'critical') {
        try {
            await sendEmergencyNotification({
                reportId: report.id,
                reportType,
                reportReason,
                supabaseUrl,
                serviceRoleKey
            });
        } catch (error) {
            console.warn('Failed to send emergency notification:', error.message);
        }
    }

    return {
        reportId: report.id,
        reportType: report.report_type,
        priority: report.priority,
        status: report.status,
        submittedAt: report.submitted_at,
        anonymous: !!anonymous,
        estimatedReviewTime: calculateEstimatedReviewTime(priority),
        message: `Report submitted successfully. Priority: ${priority}. Reference ID: ${report.id}`
    };
}

// Get content reports for moderation dashboard
async function getContentReports({ status, priority, reportType, moderatorId, supabaseUrl, serviceRoleKey }) {
    let queryUrl = `${supabaseUrl}/rest/v1/content_reports?order=submitted_at.desc`;
    
    // Add filters
    const filters = [];
    if (status) filters.push(`status=eq.${status}`);
    if (priority) filters.push(`priority=eq.${priority}`);
    if (reportType) filters.push(`report_type=eq.${reportType}`);
    
    if (filters.length > 0) {
        queryUrl += '&' + filters.join('&');
    }

    const reportsResponse = await fetch(queryUrl, {
        headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey
        }
    });

    if (!reportsResponse.ok) {
        throw new Error('Failed to retrieve content reports');
    }

    const reports = await reportsResponse.json();

    // Get moderation actions for these reports
    const reportIds = reports.map(r => r.id);
    let moderationActions = [];
    
    if (reportIds.length > 0) {
        const actionsResponse = await fetch(
            `${supabaseUrl}/rest/v1/moderation_actions?report_id=in.(${reportIds.join(',')})`,
            {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey
                }
            }
        );
        
        if (actionsResponse.ok) {
            moderationActions = await actionsResponse.json();
        }
    }

    // Combine reports with their actions
    const reportsWithActions = reports.map(report => {
        const actions = moderationActions.filter(action => action.report_id === report.id);
        return {
            ...report,
            moderationActions: actions,
            hasBeenModerated: actions.length > 0,
            lastModerated: actions.length > 0 ? actions[actions.length - 1].reviewed_at : null
        };
    });

    return {
        reports: reportsWithActions,
        totalReports: reports.length,
        pendingReports: reports.filter(r => r.status === 'pending').length,
        criticalReports: reports.filter(r => r.priority === 'critical').length,
        retrievedAt: new Date().toISOString(),
        retrievedBy: moderatorId
    };
}

// Moderate content based on a report
async function moderateContent({ reportId, moderatorId, moderationData, supabaseUrl, serviceRoleKey }) {
    const {
        actionTaken,
        actionReason,
        moderationNotes,
        notifyUser
    } = moderationData;

    // Validate action taken
    const validActions = ['no_action', 'content_removed', 'content_edited', 'user_warned', 'user_suspended', 'user_banned', 'escalated'];
    if (!validActions.includes(actionTaken)) {
        throw new Error(`Invalid action. Must be one of: ${validActions.join(', ')}`);
    }

    const now = new Date().toISOString();

    // Create moderation action record
    const moderationRecord = {
        report_id: reportId,
        moderator_id: moderatorId,
        action_taken: actionTaken,
        action_reason: actionReason || '',
        moderation_notes: moderationNotes || '',
        reviewed_at: now,
        created_at: now,
        updated_at: now
    };

    const insertResponse = await fetch(`${supabaseUrl}/rest/v1/moderation_actions`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        },
        body: JSON.stringify(moderationRecord)
    });

    if (!insertResponse.ok) {
        const errorText = await insertResponse.text();
        throw new Error(`Failed to record moderation action: ${errorText}`);
    }

    const savedAction = await insertResponse.json();
    const action = savedAction[0];

    // Update report status
    let newReportStatus = 'resolved';
    if (actionTaken === 'escalated') {
        newReportStatus = 'escalated';
    } else if (actionTaken === 'no_action') {
        newReportStatus = 'dismissed';
    }

    await fetch(`${supabaseUrl}/rest/v1/content_reports?id=eq.${reportId}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            status: newReportStatus,
            updated_at: now
        })
    });

    // Send notification to affected users if requested
    if (notifyUser && actionTaken !== 'no_action') {
        try {
            await sendModerationNotification({
                reportId,
                actionTaken,
                actionReason,
                supabaseUrl,
                serviceRoleKey
            });
        } catch (error) {
            console.warn('Failed to send moderation notification:', error.message);
        }
    }

    return {
        reportId,
        moderationActionId: action.id,
        actionTaken: action.action_taken,
        moderatedBy: action.moderator_id,
        moderatedAt: action.reviewed_at,
        reportStatus: newReportStatus,
        message: `Moderation action completed: ${actionTaken}`
    };
}

// Submit a moderation appeal
async function submitModerationAppeal({ appealData, supabaseUrl, serviceRoleKey }) {
    const {
        userId,
        moderationActionId,
        appealReason,
        appealDetails
    } = appealData;

    if (!userId || !moderationActionId || !appealReason) {
        throw new Error('userId, moderationActionId, and appealReason are required');
    }

    // Verify that the moderation action exists and affects this user
    const actionResponse = await fetch(
        `${supabaseUrl}/rest/v1/moderation_actions?id=eq.${moderationActionId}`,
        {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        }
    );

    if (!actionResponse.ok) {
        throw new Error('Moderation action not found');
    }

    const actions = await actionResponse.json();
    if (actions.length === 0) {
        throw new Error('Moderation action not found');
    }

    const now = new Date().toISOString();

    const appealRecord = {
        user_id: userId,
        moderation_action_id: moderationActionId,
        appeal_reason: appealReason,
        appeal_details: {
            description: appealDetails?.description || '',
            evidence: appealDetails?.evidence || [],
            context: appealDetails?.context || '',
            request_type: appealDetails?.requestType || 'review',
            additional_info: appealDetails?.additionalInfo || {}
        },
        status: 'submitted',
        submitted_at: now,
        created_at: now,
        updated_at: now
    };

    const insertResponse = await fetch(`${supabaseUrl}/rest/v1/moderation_appeals`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        },
        body: JSON.stringify(appealRecord)
    });

    if (!insertResponse.ok) {
        const errorText = await insertResponse.text();
        throw new Error(`Failed to submit appeal: ${errorText}`);
    }

    const savedAppeal = await insertResponse.json();
    const appeal = savedAppeal[0];

    return {
        appealId: appeal.id,
        moderationActionId: appeal.moderation_action_id,
        status: appeal.status,
        submittedAt: appeal.submitted_at,
        estimatedReviewTime: '14 days',
        message: 'Appeal submitted successfully. You will be notified of the outcome.'
    };
}

// Process a moderation appeal
async function processModerationAppeal({ appealId, moderatorId, appealDecision, supabaseUrl, serviceRoleKey }) {
    const {
        decision, // 'approved', 'denied', 'escalated'
        resolutionNotes
    } = appealDecision;

    const validDecisions = ['approved', 'denied', 'escalated'];
    if (!validDecisions.includes(decision)) {
        throw new Error(`Invalid decision. Must be one of: ${validDecisions.join(', ')}`);
    }

    const now = new Date().toISOString();

    // Update appeal with decision
    const updateResponse = await fetch(
        `${supabaseUrl}/rest/v1/moderation_appeals?id=eq.${appealId}`,
        {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                status: decision,
                reviewed_by: moderatorId,
                resolution_notes: resolutionNotes || '',
                resolved_at: now,
                updated_at: now
            })
        }
    );

    if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        throw new Error(`Failed to process appeal: ${errorText}`);
    }

    const updatedAppeal = await updateResponse.json();
    const appeal = updatedAppeal[0];

    // If appeal is approved, reverse the original moderation action
    if (decision === 'approved') {
        try {
            await reverseModerationAction({
                moderationActionId: appeal.moderation_action_id,
                reverseReason: 'Appeal approved',
                supabaseUrl,
                serviceRoleKey
            });
        } catch (error) {
            console.warn('Failed to reverse moderation action:', error.message);
        }
    }

    return {
        appealId: appeal.id,
        decision: appeal.status,
        processedBy: appeal.reviewed_by,
        processedAt: appeal.resolved_at,
        resolutionNotes: appeal.resolution_notes,
        message: `Appeal has been ${decision}. ${decision === 'approved' ? 'Original action has been reversed.' : ''}`
    };
}

// Get user's submitted reports
async function getUserReports({ reporterId, supabaseUrl, serviceRoleKey }) {
    const reportsResponse = await fetch(
        `${supabaseUrl}/rest/v1/content_reports?reporter_id=eq.${reporterId}&order=submitted_at.desc`,
        {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        }
    );

    if (!reportsResponse.ok) {
        throw new Error('Failed to retrieve user reports');
    }

    const reports = await reportsResponse.json();

    return {
        reporterId,
        reports: reports.map(report => ({
            id: report.id,
            reportType: report.report_type,
            reportReason: report.report_reason,
            status: report.status,
            priority: report.priority,
            submittedAt: report.submitted_at
        })),
        totalReports: reports.length,
        retrievedAt: new Date().toISOString()
    };
}

// Get user's submitted appeals
async function getUserAppeals({ userId, supabaseUrl, serviceRoleKey }) {
    const appealsResponse = await fetch(
        `${supabaseUrl}/rest/v1/moderation_appeals?user_id=eq.${userId}&order=submitted_at.desc`,
        {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        }
    );

    if (!appealsResponse.ok) {
        throw new Error('Failed to retrieve user appeals');
    }

    const appeals = await appealsResponse.json();

    return {
        userId,
        appeals: appeals.map(appeal => ({
            id: appeal.id,
            appealReason: appeal.appeal_reason,
            status: appeal.status,
            submittedAt: appeal.submitted_at,
            resolvedAt: appeal.resolved_at
        })),
        totalAppeals: appeals.length,
        retrievedAt: new Date().toISOString()
    };
}

// Helper functions
async function sendEmergencyNotification({ reportId, reportType, reportReason, supabaseUrl, serviceRoleKey }) {
    // This would integrate with notification system
    console.log(`EMERGENCY NOTIFICATION: Critical report ${reportId} - ${reportType}: ${reportReason}`);
    // In production, this would send emails, SMS, etc. to moderators
}

async function sendModerationNotification({ reportId, actionTaken, actionReason, supabaseUrl, serviceRoleKey }) {
    // This would integrate with notification system
    console.log(`MODERATION NOTIFICATION: Report ${reportId} - Action: ${actionTaken}, Reason: ${actionReason}`);
    // In production, this would notify affected users
}

async function reverseModerationAction({ moderationActionId, reverseReason, supabaseUrl, serviceRoleKey }) {
    // This would implement logic to reverse the effects of a moderation action
    console.log(`REVERSING MODERATION ACTION: ${moderationActionId} - Reason: ${reverseReason}`);
    // In production, this would restore content, lift bans, etc.
}

function calculateEstimatedReviewTime(priority) {
    const reviewTimes = {
        'critical': '2 hours',
        'high': '24 hours',
        'normal': '3 days',
        'low': '7 days'
    };
    
    return reviewTimes[priority] || '3 days';
}