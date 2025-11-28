import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, MessageSquare, Settings, Target } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import './AgentSettings.css';

const AgentSettings = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [config, setConfig] = useState({
        first_message_template: '',
        source_templates: {},
        enable_template_webhook: true,
        enable_template_csv: true,
        scoring_criteria: ''
    });

    const [newSource, setNewSource] = useState('');

    useEffect(() => {
        if (user) fetchConfig();
    }, [user]);

    const fetchConfig = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('first_message_template, source_templates, enable_template_webhook, enable_template_csv, scoring_criteria')
                .eq('id', user.id)
                .single();

            if (error) throw error;
            if (data) {
                setConfig({
                    ...data,
                    source_templates: data.source_templates || {}
                });
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update(config)
                .eq('id', user.id);

            if (error) throw error;
            alert('Paramètres sauvegardés !');
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Erreur lors de la sauvegarde.');
        } finally {
            setSaving(false);
        }
    };

    const addSourceTemplate = () => {
        if (!newSource) return;
        setConfig(prev => ({
            ...prev,
            source_templates: {
                ...prev.source_templates,
                [newSource]: ''
            }
        }));
        setNewSource('');
    };

    const removeSourceTemplate = (source) => {
        const newTemplates = { ...config.source_templates };
        delete newTemplates[source];
        setConfig(prev => ({ ...prev, source_templates: newTemplates }));
    };

    const updateSourceTemplate = (source, text) => {
        setConfig(prev => ({
            ...prev,
            source_templates: {
                ...prev.source_templates,
                [source]: text
            }
        }));
    };

    if (loading) return <div className="p-8 text-center">Chargement...</div>;

    return (
        <div className="page-container settings-page">
            <header className="page-header">
                <div>
                    <h1>Configuration de l'Agent</h1>
                    <p className="text-muted">Personnalisez les messages et les critères de qualification.</p>
                </div>
                <button
                    className="btn-primary flex items-center gap-2"
                    onClick={handleSave}
                    disabled={saving}
                >
                    <Save size={18} />
                    {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
            </header>

            <div className="settings-grid">
                {/* Message Configuration */}
                <section className="settings-card">
                    <div className="card-header">
                        <MessageSquare className="text-primary" size={24} />
                        <h2>Premier Message</h2>
                    </div>

                    <div className="form-group">
                        <label>Message par défaut</label>
                        <textarea
                            value={config.first_message_template}
                            onChange={(e) => setConfig({ ...config, first_message_template: e.target.value })}
                            placeholder="Bonjour {{name}}, ..."
                            rows={3}
                        />
                        <small className="text-muted">Variables disponibles : <code>{'{{name}}'}</code>, <code>{'{{company}}'}</code>, <code>{'{{job}}'}</code></small>
                    </div>

                    <div className="toggles">
                        <label className="toggle-label">
                            <input
                                type="checkbox"
                                checked={config.enable_template_webhook}
                                onChange={(e) => setConfig({ ...config, enable_template_webhook: e.target.checked })}
                            />
                            Activer pour Webhook
                        </label>
                        <label className="toggle-label">
                            <input
                                type="checkbox"
                                checked={config.enable_template_csv}
                                onChange={(e) => setConfig({ ...config, enable_template_csv: e.target.checked })}
                            />
                            Activer pour Import CSV
                        </label>
                    </div>

                    <div className="divider"></div>

                    <h3>Messages par Source</h3>
                    <div className="source-list">
                        {Object.entries(config.source_templates).map(([source, template]) => (
                            <div key={source} className="source-item">
                                <div className="source-header">
                                    <span className="badge">{source}</span>
                                    <button onClick={() => removeSourceTemplate(source)} className="btn-icon-danger">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <textarea
                                    value={template}
                                    onChange={(e) => updateSourceTemplate(source, e.target.value)}
                                    placeholder={`Message spécifique pour ${source}...`}
                                    rows={2}
                                />
                            </div>
                        ))}
                    </div>

                    <div className="add-source">
                        <input
                            type="text"
                            value={newSource}
                            onChange={(e) => setNewSource(e.target.value)}
                            placeholder="Nouvelle source (ex: linkedin, ebook)"
                        />
                        <button onClick={addSourceTemplate} className="btn-secondary">
                            <Plus size={18} /> Ajouter
                        </button>
                    </div>
                </section>

                {/* Scoring Configuration */}
                <section className="settings-card">
                    <div className="card-header">
                        <Target className="text-accent" size={24} />
                        <h2>Critères de Scoring</h2>
                    </div>

                    <div className="form-group">
                        <label>Instructions pour l'IA</label>
                        <p className="text-sm text-muted mb-2">Définissez ce qui fait un "bon" lead. L'IA notera chaque conversation de 0 à 100.</p>
                        <textarea
                            value={config.scoring_criteria}
                            onChange={(e) => setConfig({ ...config, scoring_criteria: e.target.value })}
                            placeholder="Ex: Budget > 1000€, Décideur identifié, Projet urgent (moins de 3 mois)..."
                            rows={10}
                            className="h-full"
                        />
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AgentSettings;
