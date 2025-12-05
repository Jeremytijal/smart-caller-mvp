import React, { useState, useEffect } from 'react';
import { 
    MessageSquare, Plus, Copy, Edit2, Trash2, Check, X, Search,
    Send, Calendar, RefreshCw, HelpCircle, Target, Zap, Filter,
    ChevronDown, ChevronRight, Eye
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Templates.css';

const Templates = () => {
    const { user } = useAuth();
    const [templates, setTemplates] = useState({ default: {}, custom: [] });
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('first_contact');
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [previewTemplate, setPreviewTemplate] = useState(null);
    const [previewVariables, setPreviewVariables] = useState({});
    const [copiedId, setCopiedId] = useState(null);

    const categories = [
        { id: 'first_contact', name: 'Premier contact', icon: Send, color: '#3B82F6' },
        { id: 'follow_up', name: 'Relances', icon: RefreshCw, color: '#F59E0B' },
        { id: 'reactivation', name: 'Réactivation', icon: Zap, color: '#8B5CF6' },
        { id: 'booking', name: 'Booking RDV', icon: Calendar, color: '#10B981' },
        { id: 'objection_handling', name: 'Objections', icon: HelpCircle, color: '#EF4444' },
        { id: 'qualification', name: 'Qualification', icon: Target, color: '#EC4899' },
        { id: 'closing', name: 'Closing', icon: Check, color: '#22C55E' },
    ];

    const [newTemplate, setNewTemplate] = useState({
        name: '',
        category: 'first_contact',
        message: '',
        tone: 'friendly',
        goal: 'qualify'
    });

    useEffect(() => {
        fetchTemplates();
    }, [user]);

    const fetchTemplates = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const res = await fetch(`https://webhook.smart-caller.ai/api/templates/${user.id}`);
            const data = await res.json();
            setTemplates(data);
        } catch (error) {
            console.error('Error fetching templates:', error);
        } finally {
            setLoading(false);
        }
    };

    const copyTemplate = (template) => {
        navigator.clipboard.writeText(template.message);
        setCopiedId(template.id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const createTemplate = async () => {
        if (!newTemplate.name || !newTemplate.message) return;

        try {
            await fetch(`https://webhook.smart-caller.ai/api/templates/${user.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTemplate)
            });
            
            setShowCreateModal(false);
            setNewTemplate({ name: '', category: 'first_contact', message: '', tone: 'friendly', goal: 'qualify' });
            fetchTemplates();
        } catch (error) {
            console.error('Error creating template:', error);
        }
    };

    const deleteTemplate = async (templateId) => {
        if (!window.confirm('Supprimer ce template ?')) return;

        try {
            await fetch(`https://webhook.smart-caller.ai/api/templates/${user.id}/${templateId}`, {
                method: 'DELETE'
            });
            fetchTemplates();
        } catch (error) {
            console.error('Error deleting template:', error);
        }
    };

    const previewWithVariables = async () => {
        if (!previewTemplate) return;
        
        try {
            const res = await fetch('https://webhook.smart-caller.ai/api/templates/preview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    template: previewTemplate.message,
                    variables: previewVariables
                })
            });
            const data = await res.json();
            return data.preview;
        } catch (error) {
            console.error('Error previewing:', error);
        }
    };

    const extractVariables = (message) => {
        const matches = message.match(/{{([^}]+)}}/g) || [];
        return [...new Set(matches.map(m => m.replace(/[{}]/g, '')))];
    };

    const getCategoryTemplates = () => {
        const defaultTemplates = templates.default[activeCategory] || [];
        const customTemplates = templates.custom?.filter(t => t.category === activeCategory) || [];
        const allTemplates = [...defaultTemplates, ...customTemplates];

        if (searchQuery) {
            return allTemplates.filter(t => 
                t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.message.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        return allTemplates;
    };

    const getActiveCategoryInfo = () => {
        return categories.find(c => c.id === activeCategory) || categories[0];
    };

    if (loading) {
        return <div className="page-loading">Chargement des templates...</div>;
    }

    return (
        <div className="page-container templates-page">
            {/* Header */}
            <header className="page-header">
                <div>
                    <h1>Bibliothèque de Templates</h1>
                    <p className="text-muted">Messages pré-écrits pour gagner du temps</p>
                </div>
                <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
                    <Plus size={18} />
                    Créer un template
                </button>
            </header>

            <div className="templates-layout">
                {/* Sidebar - Categories */}
                <aside className="templates-sidebar glass-panel">
                    <div className="sidebar-header">
                        <h3>Catégories</h3>
                    </div>
                    <nav className="category-nav">
                        {categories.map(cat => {
                            const Icon = cat.icon;
                            const count = (templates.default[cat.id]?.length || 0) + 
                                         (templates.custom?.filter(t => t.category === cat.id).length || 0);
                            return (
                                <button
                                    key={cat.id}
                                    className={`category-btn ${activeCategory === cat.id ? 'active' : ''}`}
                                    onClick={() => setActiveCategory(cat.id)}
                                >
                                    <div className="category-icon" style={{ background: `${cat.color}15`, color: cat.color }}>
                                        <Icon size={18} />
                                    </div>
                                    <span className="category-name">{cat.name}</span>
                                    <span className="category-count">{count}</span>
                                </button>
                            );
                        })}
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="templates-main">
                    {/* Search */}
                    <div className="templates-toolbar">
                        <div className="search-box">
                            <Search size={18} />
                            <input
                                type="text"
                                placeholder="Rechercher un template..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="category-badge" style={{ background: `${getActiveCategoryInfo().color}15`, color: getActiveCategoryInfo().color }}>
                            {React.createElement(getActiveCategoryInfo().icon, { size: 16 })}
                            {getActiveCategoryInfo().name}
                        </div>
                    </div>

                    {/* Templates Grid */}
                    <div className="templates-grid">
                        {getCategoryTemplates().length === 0 ? (
                            <div className="empty-state">
                                <MessageSquare size={48} />
                                <h3>Aucun template</h3>
                                <p>Créez votre premier template pour cette catégorie</p>
                            </div>
                        ) : (
                            getCategoryTemplates().map(template => (
                                <div key={template.id} className="template-card glass-panel">
                                    <div className="template-header">
                                        <h4>{template.name}</h4>
                                        <div className="template-actions">
                                            <button 
                                                className="btn-icon-sm"
                                                onClick={() => {
                                                    setPreviewTemplate(template);
                                                    setPreviewVariables({});
                                                }}
                                                title="Aperçu"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button 
                                                className="btn-icon-sm"
                                                onClick={() => copyTemplate(template)}
                                                title="Copier"
                                            >
                                                {copiedId === template.id ? <Check size={16} /> : <Copy size={16} />}
                                            </button>
                                            {!template.id.startsWith('fc_') && !template.id.startsWith('fu_') && 
                                             !template.id.startsWith('re_') && !template.id.startsWith('bk_') &&
                                             !template.id.startsWith('ob_') && !template.id.startsWith('qa_') &&
                                             !template.id.startsWith('cl_') && (
                                                <button 
                                                    className="btn-icon-sm danger"
                                                    onClick={() => deleteTemplate(template.id)}
                                                    title="Supprimer"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="template-message">
                                        {template.message}
                                    </div>
                                    <div className="template-meta">
                                        {template.variables?.length > 0 && (
                                            <div className="template-variables">
                                                {template.variables.map(v => (
                                                    <span key={v} className="variable-tag">{'{{' + v + '}}'}</span>
                                                ))}
                                            </div>
                                        )}
                                        {template.tone && (
                                            <span className="tone-badge">{template.tone}</span>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </main>
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="modal glass-panel" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Nouveau Template</h2>
                            <button className="btn-icon" onClick={() => setShowCreateModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Nom du template</label>
                                <input
                                    type="text"
                                    value={newTemplate.name}
                                    onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                                    placeholder="Ex: Relance sympathique"
                                />
                            </div>
                            <div className="form-group">
                                <label>Catégorie</label>
                                <select
                                    value={newTemplate.category}
                                    onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })}
                                >
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Message</label>
                                <textarea
                                    value={newTemplate.message}
                                    onChange={(e) => setNewTemplate({ ...newTemplate, message: e.target.value })}
                                    placeholder="Bonjour {{name}} ! ..."
                                    rows={4}
                                />
                                <span className="hint">Utilisez {'{{name}}'}, {'{{company}}'}, etc. pour les variables</span>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Ton</label>
                                    <select
                                        value={newTemplate.tone}
                                        onChange={(e) => setNewTemplate({ ...newTemplate, tone: e.target.value })}
                                    >
                                        <option value="friendly">Amical</option>
                                        <option value="professional">Professionnel</option>
                                        <option value="casual">Décontracté</option>
                                        <option value="direct">Direct</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Objectif</label>
                                    <select
                                        value={newTemplate.goal}
                                        onChange={(e) => setNewTemplate({ ...newTemplate, goal: e.target.value })}
                                    >
                                        <option value="qualify">Qualifier</option>
                                        <option value="book">Prendre RDV</option>
                                        <option value="nurture">Nourrir</option>
                                        <option value="close">Closer</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                                Annuler
                            </button>
                            <button className="btn-primary" onClick={createTemplate}>
                                Créer le template
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Preview Modal */}
            {previewTemplate && (
                <div className="modal-overlay" onClick={() => setPreviewTemplate(null)}>
                    <div className="modal glass-panel" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Aperçu : {previewTemplate.name}</h2>
                            <button className="btn-icon" onClick={() => setPreviewTemplate(null)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="preview-variables">
                                {extractVariables(previewTemplate.message).map(variable => (
                                    <div key={variable} className="form-group">
                                        <label>{variable}</label>
                                        <input
                                            type="text"
                                            placeholder={`Valeur pour ${variable}`}
                                            value={previewVariables[variable] || ''}
                                            onChange={(e) => setPreviewVariables({
                                                ...previewVariables,
                                                [variable]: e.target.value
                                            })}
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className="preview-result">
                                <label>Résultat :</label>
                                <div className="preview-message">
                                    {previewTemplate.message.replace(/{{([^}]+)}}/g, (match, variable) => 
                                        previewVariables[variable] || match
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button 
                                className="btn-primary"
                                onClick={() => {
                                    const finalMessage = previewTemplate.message.replace(/{{([^}]+)}}/g, (match, variable) => 
                                        previewVariables[variable] || match
                                    );
                                    navigator.clipboard.writeText(finalMessage);
                                    setPreviewTemplate(null);
                                }}
                            >
                                <Copy size={16} />
                                Copier le message final
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Templates;

