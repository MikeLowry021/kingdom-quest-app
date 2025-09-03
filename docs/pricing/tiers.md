# KingdomQuest Pricing Tiers

This document outlines the three subscription tiers available in the KingdomQuest application, designed to serve different user needs from individual spiritual growth to comprehensive church management.

## Overview

KingdomQuest operates on a freemium model with three distinct tiers:
- **Free**: Core spiritual content for individuals
- **Premium**: Enhanced features for dedicated users
- **Church**: Comprehensive church management and community tools

## Tier Details

### Free Tier - R0/month

**Target Audience**: Individuals starting their faith journey, casual users, trial users

**Core Features**:
- ✅ Core Biblical Stories
- ✅ Basic Quizzes
- ✅ Family Altar devotions
- ✅ Community Support
- ✅ Multi-language support (English, Afrikaans, Spanish)
- ✅ Age-appropriate content filtering

**Limitations**:
- Limited story selection (core stories only)
- Basic quiz difficulty levels
- Standard UI without premium visual enhancements
- Community support only (no priority support)

**Value Proposition**: "Start your spiritual journey with essential biblical content, completely free."

---

### Premium Tier - R49/month or R490/year

**Target Audience**: Individuals and families committed to spiritual growth, homeschooling families, active church members

**All Free Features PLUS**:
- ✅ **Deluxe Quest Packs**: Premium biblical adventures with enhanced storytelling
- ✅ **Extra Media Content**: High-quality videos, audio narrations, interactive visuals
- ✅ **Offline Access**: Download content for use without internet connection
- ✅ **Priority Support**: Faster response times and dedicated assistance
- ✅ **Advanced Analytics**: Personal spiritual growth tracking and insights
- ✅ **Enhanced Visual Experience**: Premium UI themes and animations
- ✅ **Extended Story Library**: Access to advanced biblical narratives

**Annual Savings**: Save R98 (2 months free) with annual billing

**Value Proposition**: "Accelerate your spiritual growth with premium content, offline access, and personalized insights."

---

### Church Tier - R149/month or R1490/year

**Target Audience**: Churches, religious organizations, Christian schools, ministry leaders

**All Premium Features PLUS**:
- ✅ **Admin Dashboard**: Comprehensive church management interface
- ✅ **Custom Branding**: Church logo, colors, and custom messaging
- ✅ **User Analytics**: Detailed insights into member engagement and progress
- ✅ **Privacy SLA**: Enhanced privacy agreements and data management
- ✅ **User Management**: Invite, manage, and organize church members
- ✅ **Bulk Enrollment**: Easy setup for multiple church members
- ✅ **Dedicated Support**: Direct access to dedicated account manager
- ✅ **Progress Reporting**: Track spiritual growth across congregation
- ✅ **Content Moderation**: Church-specific content filtering and approval

**Annual Savings**: Save R298 (2 months free) with annual billing

**Value Proposition**: "Strengthen your church community with powerful management tools, custom branding, and comprehensive analytics."

## Pricing Strategy

### Currency & Market
- All pricing in South African Rand (ZAR)
- Targeted at South African market with Yoco payment integration
- VAT (15%) added at checkout as required by South African law

### Billing Cycles
- **Monthly**: Full flexibility, cancel anytime
- **Annual**: 2 months free (equivalent to ~17% discount)
- **Free Trial**: No trial period needed as free tier provides substantial value

### Payment Processing
- **Primary**: Yoco (South African payment processor)
- **Methods**: Credit cards, debit cards, instant EFT
- **Security**: PCI-compliant payment processing

## Upgrade Paths

### Free → Premium
**Common Triggers**:
- User completes core stories and wants more content
- Family wants offline access for travel
- User desires progress tracking and analytics

### Premium → Church
**Common Triggers**:
- Church leader wants to manage congregation
- Need for custom branding and church identity
- Requirement for member analytics and reporting

### Downgrade Policy
**Free & Premium**:
- Cancel anytime
- Access continues until end of billing period
- Automatic downgrade to free tier

**Church Plan**:
- 30-day notice recommended for data export
- Admin tools remain active until period end
- Member accounts continue on free tier

## Feature Gating Implementation

### Technical Implementation
- Feature gates implemented throughout application
- Elegant upgrade prompts instead of hard blocks
- Progressive disclosure of premium features
- Clear value communication at every gate

### User Experience
- **Soft Gates**: Show preview of premium content with upgrade prompt
- **Educational Gates**: Explain premium feature benefits
- **Contextual Gates**: Upgrade prompts relevant to current user action

## Success Metrics

### Key Performance Indicators
- **Free-to-Premium Conversion**: Target 8-12%
- **Premium-to-Church Conversion**: Target 15-20% (among church leaders)
- **Churn Rate**: Target <5% monthly for Premium, <3% for Church
- **ARPU (Average Revenue Per User)**: Target R65/month overall

### Engagement Metrics
- **Premium Feature Usage**: >70% of premium users accessing offline content
- **Church Dashboard Usage**: >80% of church users using admin features monthly
- **Content Completion**: >60% story completion rate for premium users

## Future Tier Considerations

### Potential Additional Tiers
- **Family Plan**: Multi-account management for large families
- **Ministry Plan**: Between Premium and Church for small ministries
- **Enterprise**: For large organizations and denominations

### Feature Expansion
- Live streaming integration for church services
- Advanced lesson planning for Sunday schools
- Multi-campus management for large churches
- API access for custom integrations

## Implementation Notes

### Database Schema
- `subscription_plans` table with dynamic plan configuration
- `user_subscriptions` table tracking active subscriptions
- `church_profiles` table for church-specific data
- Robust analytics tracking for usage insights

### Payment Integration
- Yoco checkout flow with secure tokenization
- Webhook handling for subscription lifecycle events
- Automated billing and renewal processing
- Grace periods and retry logic for failed payments

### Support Structure
- **Free**: Community forums and knowledge base
- **Premium**: Email support with 24-hour response SLA
- **Church**: Dedicated account manager with phone support

---

*Last Updated: August 2025*
*Version: 1.0*