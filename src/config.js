/**
 * Configuration centralisée de l'application
 * Toutes les URLs et clés sont définies ici
 */

// API Backend URL
export const API_URL = import.meta.env.VITE_API_URL || 'https://webhook.smart-caller.ai';

// Webhook URL for integrations
export const WEBHOOK_BASE_URL = import.meta.env.VITE_WEBHOOK_URL || 'https://webhook.smart-caller.ai/webhooks';

// Stripe Public Key
export const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_live_51SajoIG7TquWCqOJqL2M7q6Qz6h7TLDLiOu0j2gS6cSe3rp4L8m7dZkIoXf9U7RlMKu3K0T3K3';

// App URLs
export const APP_URL = import.meta.env.VITE_APP_URL || 'https://app.smart-caller.ai';
export const LANDING_URL = import.meta.env.VITE_LANDING_URL || 'https://smart-caller.ai';
export const DOCS_URL = import.meta.env.VITE_DOCS_URL || 'https://docs.smart-caller.ai';

// External Links
export const CALENDLY_URL = import.meta.env.VITE_CALENDLY_URL || 'https://zcal.co/i/CkMTM7p_';
export const CONTACT_URL = `${LANDING_URL}/contact`;
export const SALES_CALL_URL = 'https://zcal.co/i/CkMTM7p_';

// API Endpoints helper
export const endpoints = {
    // Auth & Agents
    createAgent: `${API_URL}/api/agents/create`,
    getAgent: (userId) => `${API_URL}/api/agents/${userId}`,
    
    // Onboarding
    analyzeWebsite: `${API_URL}/api/onboarding/analyze`,
    generatePersona: `${API_URL}/api/onboarding/generate-persona`,
    simulateConversation: `${API_URL}/api/onboarding/simulate`,
    playgroundTest: `${API_URL}/api/playground/test`,
    
    // Leads & Contacts
    importLeads: `${API_URL}/import-leads`,
    webhook: (agentId) => `${WEBHOOK_BASE_URL}/${agentId}/leads`,
    
    // Campaigns
    launchCampaign: `${API_URL}/api/campaigns/launch`,
    
    // Notifications & Analytics
    notifications: (userId) => `${API_URL}/api/notifications/${userId}`,
    analytics: (userId) => `${API_URL}/api/analytics/${userId}`,
    
    // Blacklist
    blacklist: (userId) => `${API_URL}/api/blacklist/${userId}`,
    blacklistImport: (userId) => `${API_URL}/api/blacklist/${userId}/import`,
    blacklistExport: (userId) => `${API_URL}/api/blacklist/${userId}/export`,
    blacklistCheck: (userId, phone) => `${API_URL}/api/blacklist/${userId}/check/${phone}`,
    blacklistDelete: (userId, phone) => `${API_URL}/api/blacklist/${userId}/${encodeURIComponent(phone)}`,
    
    // Stripe
    createCheckoutSession: `${API_URL}/api/stripe/create-checkout-session`,
    createPortalSession: `${API_URL}/api/stripe/create-portal-session`,
    
    // Templates
    templates: (userId) => `${API_URL}/api/templates/${userId}`,
    
    // Tags
    tags: (userId) => `${API_URL}/api/tags/${userId}`,
    
    // Follow-ups
    followUps: (userId) => `${API_URL}/api/follow-ups/${userId}`,
};

// Feature flags
export const features = {
    demoMode: true,
    abTesting: true,
    emailNotifications: true,
    onboardingTour: true,
};

export default {
    API_URL,
    WEBHOOK_BASE_URL,
    STRIPE_PUBLIC_KEY,
    APP_URL,
    LANDING_URL,
    DOCS_URL,
    CALENDLY_URL,
    CONTACT_URL,
    SALES_CALL_URL,
    endpoints,
    features,
};

