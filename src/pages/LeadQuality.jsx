import React, { useState } from 'react';
import { Plus, Trash2, AlertTriangle, Sparkles, User, Briefcase, Coffee, Heart, Save, CheckCircle, LayoutTemplate } from 'lucide-react';
import './LeadQuality.css';

const LeadQuality = () => {
    const [criteria, setCriteria] = useState([
        { id: 1, type: 'must_have', text: 'Budget > $1000' },
        { id: 2, type: 'must_have', text: 'Decision Maker' },
        { id: 3, type: 'nice_to_have', text: 'Timeline < 1 month' },
        { id: 4, type: 'deal_breaker', text: 'Competitor Employee' },
    ]);

    const [persona, setPersona] = useState('professional');
    const [showToast, setShowToast] = useState(false);

    const personas = [
        { id: 'empathetic', label: 'Empathique', icon: Heart, desc: 'Chaleureux et compréhensif' },
        { id: 'direct', label: 'Direct', icon: Briefcase, desc: 'Axé sur les résultats' },
        { id: 'casual', label: 'Décontracté', icon: Coffee, desc: 'Amical et informel' },
        { id: 'professional', label: 'Professionnel', icon: User, desc: 'Poli et formel' },
    ];

    const templates = [
        {
            id: 'saas',
            label: 'SaaS B2B',
            persona: 'professional',
            criteria: [
                { id: 1, type: 'must_have', text: 'Budget approuvé' },
                { id: 2, type: 'must_have', text: 'Décideur technique' },
                { id: 3, type: 'deal_breaker', text: 'Pas de projet actif' },
                { id: 4, type: 'nice_to_have', text: 'Utilise déjà un CRM' }
            ]
        },
        {
            id: 'real_estate',
            label: 'Immobilier',
            persona: 'empathetic',
            criteria: [
                { id: 1, type: 'must_have', text: 'Recherche active' },
                { id: 2, type: 'must_have', text: 'Budget > 300k€' },
                { id: 3, type: 'deal_breaker', text: 'Curieux sans projet' },
                { id: 4, type: 'nice_to_have', text: 'Apport personnel validé' }
            ]
        },
        {
            id: 'recruitment',
            label: 'Recrutement',
            persona: 'direct',
            criteria: [
                { id: 1, type: 'must_have', text: 'Expérience > 3 ans' },
                { id: 2, type: 'must_have', text: 'Disponible immédiatement' },
                { id: 3, type: 'deal_breaker', text: 'Pas de visa de travail' },
                { id: 4, type: 'nice_to_have', text: 'Anglais courant' }
            ]
        }
    ];

    const loadTemplate = (template) => {
        setCriteria(template.criteria);
        setPersona(template.persona);
        handleSave(); // Show toast to confirm load
    };

    const addCriteria = (type) => {
        const newId = Date.now(); // Better ID generation
        setCriteria([...criteria, { id: newId, type, text: '' }]);
    };

    const removeCriteria = (id) => {
        setCriteria(criteria.filter(c => c.id !== id));
    };

    const updateCriteria = (id, text) => {
        setCriteria(criteria.map(c => c.id === id ? { ...c, text } : c));
    };

    const handleSave = () => {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const renderCriteriaList = (type, placeholder, emptyMessage) => {
        const filtered = criteria.filter(c => c.type === type);
        return (
            <div className="criteria-list">
                {filtered.length === 0 ? (
                    <div className="empty-state">
                        <span className="empty-text">{emptyMessage}</span>
                    </div>
                ) : (
                    filtered.map(c => (
                        <div key={c.id} className={`criteria-item ${type === 'deal_breaker' ? 'deal-breaker' : ''}`}>
                            <input
                                type="text"
                                value={c.text}
                                onChange={(e) => updateCriteria(c.id, e.target.value)}
                                placeholder={placeholder}
                                autoFocus={c.text === ''}
                            />
                            <button onClick={() => removeCriteria(c.id)} className="btn-icon delete">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))
                )}
                <button onClick={() => addCriteria(type)} className={`btn-dashed ${type === 'deal_breaker' ? 'danger' : ''}`}>
                    <Plus size={18} /> Ajouter
                </button>
            </div>
        );
    };

    return (
        <div className="page-container quality-page">
            <header className="page-header">
                <div>
                    <h1>Qualité des Leads</h1>
                    <p className="text-muted">Définissez comment l'IA doit qualifier vos prospects</p>
                </div>
                <div className="header-actions">
                    <div className="template-dropdown">
                        <button className="btn-secondary template-trigger">
                            <LayoutTemplate size={18} /> Modèles Rapides
                        </button>
                        <div className="template-menu">
                            {templates.map(t => (
                                <div key={t.id} className="template-item" onClick={() => loadTemplate(t)}>
                                    {t.label}
                                </div>
                            ))}
                        </div>
                    </div>
                    <button className="btn-primary" onClick={handleSave}>
                        <Save size={18} /> Sauvegarder
                    </button>
                </div>
            </header>

            <div className="quality-layout">
                <div className="criteria-column">

                    {/* Must Have Section */}
                    <section className="glass-panel criteria-section">
                        <div className="section-header">
                            <div className="indicator must-have"></div>
                            <h2>Critères Indispensables (Must Have)</h2>
                        </div>
                        {renderCriteriaList('must_have', 'Ex: Budget > 500€', 'Aucun critère indispensable défini.')}
                    </section>

                    {/* Deal Breakers Section */}
                    <section className="glass-panel criteria-section deal-breaker-section">
                        <div className="section-header">
                            <AlertTriangle className="text-danger" size={20} />
                            <h2 className="text-danger">Disqualifiants (Deal Breakers)</h2>
                        </div>
                        {renderCriteriaList('deal_breaker', 'Ex: Pas de budget', 'Aucun disqualifiant défini.')}
                    </section>

                    {/* Nice to Have Section */}
                    <section className="glass-panel criteria-section">
                        <div className="section-header">
                            <div className="indicator nice-to-have"></div>
                            <h2>Souhaitables (Nice to Have)</h2>
                        </div>
                        {renderCriteriaList('nice_to_have', 'Ex: Prêt à démarrer', 'Aucun critère souhaitable défini.')}
                    </section>
                </div>

                {/* Preview Column */}
                <div className="preview-column">
                    <div className="glass-panel preview-panel">
                        <h3>Aperçu des Instructions IA</h3>
                        <div className="preview-content">
                            <p className="system-prompt">
                                <span className="keyword">ROLE:</span> You are a <span className="variable">{personas.find(p => p.id === persona)?.label}</span> sales assistant.<br /><br />
                                <span className="keyword">GOAL:</span> Qualify leads based on the following criteria:<br /><br />
                                <span className="keyword">MUST HAVE:</span><br />
                                {criteria.filter(c => c.type === 'must_have').length > 0 ? (
                                    criteria.filter(c => c.type === 'must_have').map(c => <span key={c.id}>- {c.text}<br /></span>)
                                ) : <span className="text-muted italic">// Aucun critère<br /></span>}
                                <br />
                                <span className="keyword">DEAL BREAKERS (STOP IMMEDIATELY):</span><br />
                                {criteria.filter(c => c.type === 'deal_breaker').length > 0 ? (
                                    criteria.filter(c => c.type === 'deal_breaker').map(c => <span key={c.id}>- {c.text}<br /></span>)
                                ) : <span className="text-muted italic">// Aucun disqualifiant<br /></span>}
                                <br />
                                <span className="keyword">NICE TO HAVE:</span><br />
                                {criteria.filter(c => c.type === 'nice_to_have').length > 0 ? (
                                    criteria.filter(c => c.type === 'nice_to_have').map(c => <span key={c.id}>- {c.text}<br /></span>)
                                ) : <span className="text-muted italic">// Aucun critère<br /></span>}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Toast Notification */}
            <div className={`toast-notification ${showToast ? 'show' : ''}`}>
                <CheckCircle size={20} />
                <span>Modifications sauvegardées avec succès !</span>
            </div>
        </div>
    );
};

export default LeadQuality;
