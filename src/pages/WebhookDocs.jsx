import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
    ArrowLeft, Webhook, Copy, Check, Code, Zap, 
    FileJson, CheckCircle, AlertCircle, ExternalLink,
    ChevronDown, ChevronUp
} from 'lucide-react';
import './WebhookDocs.css';

const WebhookDocs = () => {
    const [copiedSection, setCopiedSection] = useState(null);
    const [expandedSection, setExpandedSection] = useState('payload');

    const copyToClipboard = (text, section) => {
        navigator.clipboard.writeText(text);
        setCopiedSection(section);
        setTimeout(() => setCopiedSection(null), 2000);
    };

    const examplePayload = `{
  "name": "Jean Dupont",
  "phone": "+33612345678",
  "email": "jean.dupont@example.com",
  "company": "Acme Corp",
  "source": "Site web",
  "message": "Je souhaite en savoir plus sur vos services"
}`;

    const curlExample = `curl -X POST https://webhook.smart-caller.ai/webhooks/VOTRE_ID/leads \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Jean Dupont",
    "phone": "+33612345678",
    "email": "jean.dupont@example.com"
  }'`;

    const responseSuccess = `{
  "success": true,
  "message": "Lead received and queued for processing",
  "leadId": "uuid-xxx-xxx",
  "status": "pending"
}`;

    const responseError = `{
  "success": false,
  "error": "Phone number is required",
  "code": "MISSING_PHONE"
}`;

    return (
        <div className="webhook-docs-page">
            <div className="webhook-docs-container">
                <Link to="/signup" className="back-link">
                    <ArrowLeft size={18} />
                    Retour
                </Link>

                <div className="docs-header">
                    <div className="docs-icon">
                        <Webhook size={32} />
                    </div>
                    <h1>Documentation Webhook</h1>
                    <p className="docs-subtitle">
                        Intégrez Smart Caller à vos formulaires et outils existants
                    </p>
                </div>

                <div className="docs-content">
                    {/* Quick Start */}
                    <section className="docs-section">
                        <h2><Zap size={20} /> Démarrage rapide</h2>
                        <p>
                            Envoyez vos leads à Smart Caller via une simple requête HTTP POST. 
                            Notre agent IA les contactera automatiquement par SMS.
                        </p>
                        
                        <div className="endpoint-box">
                            <span className="method">POST</span>
                            <code>https://webhook.smart-caller.ai/webhooks/<span className="highlight">VOTRE_ID</span>/leads</code>
                        </div>
                        
                        <div className="info-callout">
                            <CheckCircle size={18} />
                            <p>
                                Votre ID unique est disponible dans votre dashboard, section <strong>Intégrations</strong>.
                            </p>
                        </div>
                    </section>

                    {/* Payload */}
                    <section className="docs-section">
                        <div 
                            className="section-header clickable"
                            onClick={() => setExpandedSection(expandedSection === 'payload' ? null : 'payload')}
                        >
                            <h2><FileJson size={20} /> Format du payload</h2>
                            {expandedSection === 'payload' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </div>
                        
                        {expandedSection === 'payload' && (
                            <div className="section-content">
                                <table className="fields-table">
                                    <thead>
                                        <tr>
                                            <th>Champ</th>
                                            <th>Type</th>
                                            <th>Requis</th>
                                            <th>Description</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td><code>name</code></td>
                                            <td>string</td>
                                            <td><span className="badge required">Requis</span></td>
                                            <td>Nom complet du lead</td>
                                        </tr>
                                        <tr>
                                            <td><code>phone</code></td>
                                            <td>string</td>
                                            <td><span className="badge required">Requis</span></td>
                                            <td>Numéro de téléphone (format international recommandé)</td>
                                        </tr>
                                        <tr>
                                            <td><code>email</code></td>
                                            <td>string</td>
                                            <td><span className="badge optional">Optionnel</span></td>
                                            <td>Adresse email</td>
                                        </tr>
                                        <tr>
                                            <td><code>company</code></td>
                                            <td>string</td>
                                            <td><span className="badge optional">Optionnel</span></td>
                                            <td>Nom de l'entreprise</td>
                                        </tr>
                                        <tr>
                                            <td><code>source</code></td>
                                            <td>string</td>
                                            <td><span className="badge optional">Optionnel</span></td>
                                            <td>Source du lead (ex: "Site web", "LinkedIn")</td>
                                        </tr>
                                        <tr>
                                            <td><code>message</code></td>
                                            <td>string</td>
                                            <td><span className="badge optional">Optionnel</span></td>
                                            <td>Message ou demande du lead</td>
                                        </tr>
                                    </tbody>
                                </table>

                                <h3>Exemple de payload</h3>
                                <div className="code-block">
                                    <div className="code-header">
                                        <span>JSON</span>
                                        <button 
                                            className="copy-btn"
                                            onClick={() => copyToClipboard(examplePayload, 'payload')}
                                        >
                                            {copiedSection === 'payload' ? <Check size={14} /> : <Copy size={14} />}
                                            {copiedSection === 'payload' ? 'Copié !' : 'Copier'}
                                        </button>
                                    </div>
                                    <pre><code>{examplePayload}</code></pre>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* cURL Example */}
                    <section className="docs-section">
                        <div 
                            className="section-header clickable"
                            onClick={() => setExpandedSection(expandedSection === 'curl' ? null : 'curl')}
                        >
                            <h2><Code size={20} /> Exemple cURL</h2>
                            {expandedSection === 'curl' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </div>
                        
                        {expandedSection === 'curl' && (
                            <div className="section-content">
                                <div className="code-block">
                                    <div className="code-header">
                                        <span>Terminal</span>
                                        <button 
                                            className="copy-btn"
                                            onClick={() => copyToClipboard(curlExample, 'curl')}
                                        >
                                            {copiedSection === 'curl' ? <Check size={14} /> : <Copy size={14} />}
                                            {copiedSection === 'curl' ? 'Copié !' : 'Copier'}
                                        </button>
                                    </div>
                                    <pre><code>{curlExample}</code></pre>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Responses */}
                    <section className="docs-section">
                        <div 
                            className="section-header clickable"
                            onClick={() => setExpandedSection(expandedSection === 'responses' ? null : 'responses')}
                        >
                            <h2><CheckCircle size={20} /> Réponses</h2>
                            {expandedSection === 'responses' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </div>
                        
                        {expandedSection === 'responses' && (
                            <div className="section-content">
                                <h3>✅ Succès (200 OK)</h3>
                                <div className="code-block success">
                                    <pre><code>{responseSuccess}</code></pre>
                                </div>

                                <h3>❌ Erreur (400 Bad Request)</h3>
                                <div className="code-block error">
                                    <pre><code>{responseError}</code></pre>
                                </div>

                                <h4>Codes d'erreur</h4>
                                <table className="error-table">
                                    <tbody>
                                        <tr>
                                            <td><code>MISSING_PHONE</code></td>
                                            <td>Le numéro de téléphone est manquant</td>
                                        </tr>
                                        <tr>
                                            <td><code>MISSING_NAME</code></td>
                                            <td>Le nom est manquant</td>
                                        </tr>
                                        <tr>
                                            <td><code>INVALID_PHONE</code></td>
                                            <td>Format de numéro invalide</td>
                                        </tr>
                                        <tr>
                                            <td><code>AGENT_NOT_FOUND</code></td>
                                            <td>L'ID agent n'existe pas</td>
                                        </tr>
                                        <tr>
                                            <td><code>QUOTA_EXCEEDED</code></td>
                                            <td>Quota de leads mensuel atteint</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>

                    {/* Integrations */}
                    <section className="docs-section">
                        <h2><ExternalLink size={20} /> Intégrations populaires</h2>
                        <div className="integrations-grid">
                            <div className="integration-card">
                                <h4>Typeform</h4>
                                <p>Connectez via Webhooks dans les paramètres du formulaire</p>
                            </div>
                            <div className="integration-card">
                                <h4>Webflow</h4>
                                <p>Utilisez le Logic ou Zapier pour envoyer les soumissions</p>
                            </div>
                            <div className="integration-card">
                                <h4>WordPress</h4>
                                <p>Compatible avec Contact Form 7, Gravity Forms, WPForms</p>
                            </div>
                            <div className="integration-card">
                                <h4>Zapier</h4>
                                <p>Créez un Zap avec l'action "Webhook by Zapier"</p>
                            </div>
                            <div className="integration-card">
                                <h4>Make (Integromat)</h4>
                                <p>Utilisez le module HTTP pour envoyer les données</p>
                            </div>
                            <div className="integration-card">
                                <h4>HubSpot</h4>
                                <p>Configurez un workflow avec une action Webhook</p>
                            </div>
                        </div>
                    </section>

                    {/* Help */}
                    <section className="docs-section help-section">
                        <AlertCircle size={24} />
                        <div>
                            <h3>Besoin d'aide ?</h3>
                            <p>
                                Notre équipe peut vous aider à configurer l'intégration.
                            </p>
                            <a 
                                href="https://zcal.co/i/CkMTM7p_" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="help-link"
                            >
                                Réserver un appel →
                            </a>
                        </div>
                    </section>
                </div>

                <div className="docs-footer">
                    <p>© {new Date().getFullYear()} Smart Caller. Tous droits réservés.</p>
                </div>
            </div>
        </div>
    );
};

export default WebhookDocs;

