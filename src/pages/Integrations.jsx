import React, { useState, useEffect } from 'react';
import { Webhook, Calendar, CheckCircle, Copy, Check, Save, ExternalLink, Link2 } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { WEBHOOK_BASE_URL } from '../config';
import './Integrations.css';

const Integrations = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(null); // 'crm' or 'calendar'
    const [copied, setCopied] = useState(false);
    const [showJson, setShowJson] = useState(false);

    // Config states
    const [crmWebhookUrl, setCrmWebhookUrl] = useState('');
    const [calendarUrl, setCalendarUrl] = useState('');

    // Inbound webhook URL (read-only, based on user ID)
    const inboundWebhookUrl = `${WEBHOOK_BASE_URL}/${user?.id}/leads`;

    useEffect(() => {
        if (user) {
            fetchConfig();
        }
    }, [user]);

    const fetchConfig = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('webhook_url, agent_config')
                .eq('id', user.id)
                .single();

            if (error) throw error;

            if (data) {
                setCrmWebhookUrl(data.webhook_url || '');
                setCalendarUrl(data.agent_config?.calendarUrl || '');
            }
        } catch (error) {
            console.error('Error fetching config:', error);
        } finally {
            setLoading(false);
        }
    };

    const saveCrmWebhook = async () => {
        setSaving('crm');
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ webhook_url: crmWebhookUrl })
                .eq('id', user.id);

            if (error) throw error;
            alert('Webhook CRM sauvegardé !');
        } catch (error) {
            console.error('Error saving CRM webhook:', error);
            alert('Erreur lors de la sauvegarde.');
        } finally {
            setSaving(null);
        }
    };

    const saveCalendarUrl = async () => {
        setSaving('calendar');
        try {
            // Fetch current agent_config first
            const { data: currentData } = await supabase
                .from('profiles')
                .select('agent_config')
                .eq('id', user.id)
                .single();

            const updatedConfig = {
                ...(currentData?.agent_config || {}),
                calendarUrl: calendarUrl
            };

            const { error } = await supabase
                .from('profiles')
                .update({ agent_config: updatedConfig })
                .eq('id', user.id);

            if (error) throw error;
            alert('URL de l\'agenda sauvegardée !');
        } catch (error) {
            console.error('Error saving calendar URL:', error);
            alert('Erreur lors de la sauvegarde.');
        } finally {
            setSaving(null);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return <div className="page-container integrations-page"><div className="loading">Chargement...</div></div>;
    }

    return (
        <div className="page-container integrations-page">
            <header className="page-header">
                <div>
                    <h1>Intégrations</h1>
                    <p className="text-muted">Connectez vos outils préférés</p>
                </div>
            </header>

            <div className="integrations-grid three-columns">
                {/* 1. Webhook Entrant */}
                <div className="integration-card">
                    <div className="card-icon-wrapper blue">
                        <Link2 size={24} />
                    </div>
                    <h3>Webhook Entrant</h3>
                    <p className="card-description">
                        Recevez des leads depuis Zapier, votre site web, ou tout autre outil.
                    </p>

                    <div className="card-content">
                        <label>URL DE VOTRE WEBHOOK</label>
                        <div className="url-display-box">
                            <code className="url-text" title={inboundWebhookUrl}>
                                {`${WEBHOOK_BASE_URL}/${user?.id?.slice(0, 8)}••••/leads`}
                            </code>
                            <button 
                                className="btn-copy"
                                onClick={() => copyToClipboard(inboundWebhookUrl)}
                            >
                                {copied ? <Check size={16} /> : <Copy size={16} />}
                                {copied ? 'Copié !' : 'Copier'}
                            </button>
                        </div>

                        <button
                            className="btn-secondary btn-json"
                            onClick={() => setShowJson(!showJson)}
                        >
                            {showJson ? 'Masquer le format JSON' : 'Voir le format JSON attendu'}
                        </button>

                        {showJson && (
                            <pre className="json-preview">
{`{
  "name": "Jean Dupont",
  "phone": "+33612345678",
  "email": "jean@example.com",
  "company_name": "Tech Corp",
  "source": "Website"
}`}
                            </pre>
                        )}
                    </div>
                </div>

                {/* 2. CRM Webhook */}
                <div className="integration-card">
                    <div className="card-icon-wrapper orange">
                        <Webhook size={24} />
                    </div>
                    <div className="card-status-row">
                        <h3>CRM Webhook</h3>
                        {crmWebhookUrl && (
                            <span className="status-badge connected">
                                <CheckCircle size={12} /> Actif
                            </span>
                        )}
                    </div>
                    <p className="card-description">
                        Envoyez automatiquement les leads qualifiés vers votre CRM via webhook.
                    </p>

                    <div className="card-content">
                        <label>URL DU WEBHOOK (SORTANT)</label>
                        <input
                            type="url"
                            placeholder="https://hooks.zapier.com/..."
                            value={crmWebhookUrl}
                            onChange={(e) => setCrmWebhookUrl(e.target.value)}
                            className="input-field"
                        />

                        <button
                            className="btn-primary btn-save"
                            onClick={saveCrmWebhook}
                            disabled={saving === 'crm'}
                        >
                            {saving === 'crm' ? 'Sauvegarde...' : <><Save size={16} /> Sauvegarder</>}
                        </button>
                    </div>
                </div>

                {/* 3. Agenda */}
                <div className="integration-card">
                    <div className="card-icon-wrapper green">
                        <Calendar size={24} />
                    </div>
                    <div className="card-status-row">
                        <h3>Agenda</h3>
                        {calendarUrl && (
                            <span className="status-badge connected">
                                <CheckCircle size={12} /> Actif
                            </span>
                        )}
                    </div>
                    <p className="card-description">
                        Permettez à l'IA de proposer des créneaux et planifier des rendez-vous.
                    </p>

                    <div className="card-content">
                        <label>URL DE VOTRE AGENDA (CALENDLY, CAL.COM...)</label>
                        <input
                            type="url"
                            placeholder="https://calendly.com/votre-nom"
                            value={calendarUrl}
                            onChange={(e) => setCalendarUrl(e.target.value)}
                            className="input-field"
                        />

                        <button
                            className="btn-primary btn-save"
                            onClick={saveCalendarUrl}
                            disabled={saving === 'calendar'}
                        >
                            {saving === 'calendar' ? 'Sauvegarde...' : <><Save size={16} /> Sauvegarder</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Integrations;
