import React, { useState } from 'react';
import { User, MessageSquare, Zap, Save, Sliders, CheckCircle, Bot } from 'lucide-react';
import './AgentSetup.css';

const AgentSetup = () => {
    const [config, setConfig] = useState({
        name: 'Julie',
        role: 'Commerciale SDR',
        company: 'Antigravity',
        tone: 50,
        politeness: 'vous',
        context: '',
    });

    const getToneLabel = (value) => {
        if (value < 30) return "Empathique & Conseiller";
        if (value < 70) return "Professionnel & Équilibré";
        return "Offensif & Persuasif";
    };

    return (
        <div className="page-container agent-setup-page">
            <div className="setup-header">
                <h1>Configuration de l'Agent</h1>
                <p className="text-muted">Donnez une identité et une mission à votre IA pour qu'elle vende comme vous.</p>
            </div>

            <div className="setup-layout">
                {/* COLONNE GAUCHE : FORMULAIRE */}
                <div className="setup-form">

                    {/* Section 1: Identité */}
                    <div className="glass-panel setup-card">
                        <div className="card-header">
                            <User size={20} className="card-icon" />
                            <h2>Identité de l'Agent</h2>
                        </div>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Nom de l'agent</label>
                                <input
                                    type="text"
                                    value={config.name}
                                    onChange={(e) => setConfig({ ...config, name: e.target.value })}
                                    placeholder="Ex: Thomas"
                                />
                            </div>
                            <div className="form-group">
                                <label>Rôle / Poste</label>
                                <input
                                    type="text"
                                    value={config.role}
                                    onChange={(e) => setConfig({ ...config, role: e.target.value })}
                                    placeholder="Ex: Expert Produit"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Comportement */}
                    <div className="glass-panel setup-card">
                        <div className="card-header">
                            <Sliders size={20} className="card-icon" />
                            <h2>Style de communication</h2>
                        </div>
                        <div className="tone-control">
                            <div className="tone-header">
                                <label>Agressivité Commerciale</label>
                                <span className="tone-value">{getToneLabel(config.tone)}</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={config.tone}
                                onChange={(e) => setConfig({ ...config, tone: parseInt(e.target.value) })}
                                className="range-slider"
                            />
                            <div className="tone-labels">
                                <span>Douceur</span>
                                <span>Vente Hard</span>
                            </div>
                        </div>
                        <div className="politeness-control">
                            <label>Niveau de familiarité :</label>
                            <div className="toggle-group">
                                <button
                                    onClick={() => setConfig({ ...config, politeness: 'vous' })}
                                    className={`toggle-btn ${config.politeness === 'vous' ? 'active' : ''}`}
                                >
                                    Vouvoiement
                                </button>
                                <button
                                    onClick={() => setConfig({ ...config, politeness: 'tu' })}
                                    className={`toggle-btn ${config.politeness === 'tu' ? 'active' : ''}`}
                                >
                                    Tutoiement
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Context */}
                    <div className="glass-panel setup-card">
                        <div className="card-header">
                            <Zap size={20} className="card-icon" />
                            <h2>Contexte & Mission</h2>
                        </div>
                        <div className="form-group">
                            <label>Pitch du produit</label>
                            <textarea
                                rows={4}
                                value={config.context}
                                onChange={(e) => setConfig({ ...config, context: e.target.value })}
                                placeholder="Ex: Antigravity aide les freelances..."
                            />
                        </div>
                    </div>

                    {/* Bouton Save */}
                    <div className="form-actions">
                        <button className="btn-primary save-btn">
                            <Save size={18} />
                            <span>Sauvegarder & Activer l'Agent</span>
                        </button>
                    </div>
                </div>

                {/* COLONNE DROITE : PREVIEW */}
                <div className="setup-preview">
                    <div className="preview-sticky">
                        <h3 className="preview-title">Aperçu en direct</h3>
                        <div className="preview-device">
                            <div className="preview-header">
                                <div className="preview-avatar">
                                    {config.name.charAt(0)}
                                </div>
                                <div className="preview-info">
                                    <div className="preview-name">{config.name}</div>
                                    <div className="preview-role">{config.role} • {config.company}</div>
                                </div>
                                <div className="preview-status"></div>
                            </div>
                            <div className="preview-body">
                                <div className="preview-message ai">
                                    Bonjour ! Je suis {config.name}. <br />
                                    {config.context ? "Je vois que vous vous intéressez à nos solutions." : "Comment puis-je vous aider aujourd'hui ?"}
                                </div>
                                <div className="preview-timestamp">À l'instant</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AgentSetup;
