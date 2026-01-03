import React, { useState } from 'react';
import { 
    Search, 
    Rocket, 
    Bot, 
    MessageCircle, 
    Megaphone, 
    Users, 
    Upload, 
    Download, 
    Calendar, 
    Code, 
    Link2, 
    BarChart3, 
    Ban, 
    CreditCard,
    Instagram,
    Facebook,
    Phone,
    Settings,
    ChevronRight,
    ChevronDown,
    ExternalLink,
    Play,
    BookOpen,
    Zap,
    ArrowLeft
} from 'lucide-react';
import './FAQ.css';

const FAQ = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState(null);
    const [expandedArticles, setExpandedArticles] = useState({});

    const categories = [
        {
            id: 'getting-started',
            icon: <Rocket size={24} />,
            title: 'Démarrage',
            emoji: '🚀',
            description: 'Premiers pas avec Smart Caller',
            articles: [
                {
                    id: 'welcome',
                    title: 'Bienvenue sur Smart Caller',
                    content: `
                        <h3>Qu'est-ce que Smart Caller ?</h3>
                        <p>Smart Caller est une plateforme d'IA conversationnelle qui automatise vos interactions avec vos prospects via SMS, WhatsApp, et Widget Chat.</p>
                        
                        <h3>Fonctionnalités principales</h3>
                        <ul>
                            <li><strong>Agent IA personnalisé</strong> - Configurez votre assistant virtuel avec votre ton et vos objectifs</li>
                            <li><strong>Campagnes automatisées</strong> - Inbound et Outbound sur tous les canaux</li>
                            <li><strong>Gestion des contacts</strong> - Importez, organisez et suivez vos prospects</li>
                            <li><strong>Intégrations</strong> - Connectez Meta Ads, WhatsApp, et votre calendrier</li>
                        </ul>

                        <h3>Premiers pas recommandés</h3>
                        <ol>
                            <li>Complétez l'onboarding pour configurer votre agent IA</li>
                            <li>Connectez votre WhatsApp dans Intégrations</li>
                            <li>Importez vos premiers contacts</li>
                            <li>Créez votre première campagne</li>
                        </ol>
                    `
                },
                {
                    id: 'dashboard-overview',
                    title: 'Vue d\'ensemble du tableau de bord',
                    content: `
                        <h3>Comprendre votre tableau de bord</h3>
                        <p>Le tableau de bord vous donne une vue d'ensemble de vos performances :</p>
                        
                        <ul>
                            <li><strong>Messages envoyés</strong> - Nombre total de messages</li>
                            <li><strong>Taux de réponse</strong> - Pourcentage de prospects qui répondent</li>
                            <li><strong>RDV bookés</strong> - Rendez-vous pris par l'IA</li>
                            <li><strong>Qualification</strong> - Score moyen de vos leads</li>
                        </ul>

                        <h3>Graphiques et statistiques</h3>
                        <p>Suivez l'évolution de vos performances sur 7 jours, 30 jours ou une période personnalisée.</p>
                    `
                }
            ]
        },
        {
            id: 'ai-agent',
            icon: <Bot size={24} />,
            title: 'Configuration Agent IA',
            emoji: '🤖',
            description: 'Personnalisez votre assistant virtuel',
            articles: [
                {
                    id: 'agent-setup',
                    title: 'Configurer votre agent IA',
                    content: `
                        <h3>Accéder à la configuration</h3>
                        <p>Allez dans <strong>Configuration</strong> dans le menu latéral.</p>

                        <h3>Informations de base</h3>
                        <ul>
                            <li><strong>Nom de l'agent</strong> - Comment votre IA se présente (ex: "Sophie")</li>
                            <li><strong>Rôle</strong> - Sa fonction (ex: "Assistante commerciale")</li>
                            <li><strong>Entreprise</strong> - Le nom de votre société</li>
                        </ul>

                        <h3>Personnalité et ton</h3>
                        <p>Choisissez le ton de votre agent :</p>
                        <ul>
                            <li><strong>Professionnel</strong> - Formel et courtois</li>
                            <li><strong>Amical</strong> - Chaleureux et accessible</li>
                            <li><strong>Décontracté</strong> - Informel avec des emojis</li>
                        </ul>

                        <h3>Objectifs de l'agent</h3>
                        <ul>
                            <li><strong>Qualifier</strong> - Identifier les prospects qualifiés</li>
                            <li><strong>Book</strong> - Prendre des rendez-vous</li>
                            <li><strong>Inform</strong> - Répondre aux questions</li>
                        </ul>

                        <div class="tip-box">
                            <strong>💡 Conseil :</strong> Testez votre agent dans le Sandbox avant de lancer une campagne !
                        </div>
                    `
                },
                {
                    id: 'agent-sandbox',
                    title: 'Utiliser le Sandbox',
                    content: `
                        <h3>Qu'est-ce que le Sandbox ?</h3>
                        <p>Le Sandbox est un environnement de test pour simuler des conversations avec votre agent IA.</p>

                        <h3>Comment l'utiliser</h3>
                        <ol>
                            <li>Allez dans <strong>Configuration</strong></li>
                            <li>Cliquez sur <strong>Tester dans le Sandbox</strong></li>
                            <li>Simulez un prospect et envoyez des messages</li>
                            <li>Observez comment l'IA répond</li>
                        </ol>

                        <h3>Bonnes pratiques</h3>
                        <ul>
                            <li>Testez différents scénarios (intéressé, pas intéressé, questions)</li>
                            <li>Vérifiez que l'IA reste dans son rôle</li>
                            <li>Ajustez les paramètres si nécessaire</li>
                        </ul>
                    `
                }
            ]
        },
        {
            id: 'whatsapp',
            icon: <MessageCircle size={24} />,
            title: 'Connexion WhatsApp',
            emoji: '📱',
            description: 'Connectez votre numéro WhatsApp',
            articles: [
                {
                    id: 'whatsapp-web',
                    title: 'Connexion via WhatsApp Web',
                    content: `
                        <h3>Prérequis</h3>
                        <ul>
                            <li>Un smartphone avec WhatsApp installé</li>
                            <li>Une connexion internet stable</li>
                        </ul>

                        <h3>Étapes de connexion</h3>
                        <ol>
                            <li>Allez dans <strong>Intégrations</strong></li>
                            <li>Cliquez sur <strong>Connecter WhatsApp</strong></li>
                            <li>Choisissez <strong>WhatsApp Web</strong></li>
                            <li>Scannez le QR code avec votre téléphone</li>
                        </ol>

                        <h3>Sur votre téléphone</h3>
                        <ol>
                            <li>Ouvrez WhatsApp</li>
                            <li>Allez dans Paramètres → Appareils liés</li>
                            <li>Appuyez sur "Lier un appareil"</li>
                            <li>Scannez le QR code</li>
                        </ol>

                        <div class="warning-box">
                            <strong>⚠️ Important :</strong> WhatsApp Web est limité à 25 nouveaux contacts/jour pour éviter les restrictions.
                        </div>
                    `
                },
                {
                    id: 'whatsapp-business',
                    title: 'Connexion via Business API',
                    content: `
                        <h3>Avantages de la Business API</h3>
                        <ul>
                            <li>Messages illimités</li>
                            <li>100% fiable, pas de risque de ban</li>
                            <li>Vérification Meta officielle</li>
                        </ul>

                        <h3>Prérequis</h3>
                        <ul>
                            <li>Un compte Meta Business vérifié</li>
                            <li>Un numéro de téléphone dédié</li>
                            <li>Accès au Meta Business Manager</li>
                        </ul>

                        <h3>Configuration</h3>
                        <ol>
                            <li>Créez une app sur developers.facebook.com</li>
                            <li>Activez l'API WhatsApp Business</li>
                            <li>Récupérez votre Phone Number ID et Access Token</li>
                            <li>Entrez ces informations dans Smart Caller</li>
                        </ol>
                    `
                }
            ]
        },
        {
            id: 'campaigns',
            icon: <Megaphone size={24} />,
            title: 'Création de Campagnes',
            emoji: '📝',
            description: 'Lancez des campagnes inbound et outbound',
            articles: [
                {
                    id: 'campaign-types',
                    title: 'Types de campagnes',
                    content: `
                        <h3>Campagnes Outbound (Proactives)</h3>
                        <p>Vous initiez le contact avec vos prospects.</p>
                        <ul>
                            <li><strong>Canaux :</strong> SMS, WhatsApp</li>
                            <li><strong>Usage :</strong> Relances, prospection, follow-ups</li>
                            <li><strong>Fonctionnement :</strong> Vous sélectionnez une liste de contacts et l'IA envoie le premier message</li>
                        </ul>

                        <h3>Campagnes Inbound (Réactives)</h3>
                        <p>Vos prospects vous contactent en premier.</p>
                        <ul>
                            <li><strong>Canaux :</strong> Widget Chat, Instagram DM, Messenger</li>
                            <li><strong>Usage :</strong> Support, qualification de leads entrants</li>
                            <li><strong>Fonctionnement :</strong> L'IA répond automatiquement aux messages reçus</li>
                        </ul>
                    `
                },
                {
                    id: 'create-outbound',
                    title: 'Créer une campagne Outbound',
                    content: `
                        <h3>Étape 1 : Type de campagne</h3>
                        <p>Sélectionnez <strong>Outbound</strong> pour contacter vos prospects en premier.</p>

                        <h3>Étape 2 : Canal</h3>
                        <p>Choisissez SMS ou WhatsApp selon votre stratégie.</p>

                        <h3>Étape 3 : Objectif</h3>
                        <ul>
                            <li><strong>Qualifier des leads</strong> - Identifier les prospects chauds</li>
                            <li><strong>Prendre des RDV</strong> - Booker des appels/démos</li>
                            <li><strong>Réengager</strong> - Relancer d'anciens contacts</li>
                        </ul>

                        <h3>Étape 4 : Contacts</h3>
                        <p>Sélectionnez les contacts à contacter depuis votre liste.</p>

                        <h3>Étape 5 : Message</h3>
                        <p>Personnalisez le premier message avec des variables :</p>
                        <ul>
                            <li><code>{prénom}</code> - Prénom du contact</li>
                            <li><code>{entreprise}</code> - Nom de votre entreprise</li>
                        </ul>

                        <h3>Étape 6 : Planification</h3>
                        <p>Définissez les horaires d'envoi pour de meilleurs taux de réponse.</p>
                    `
                },
                {
                    id: 'create-inbound',
                    title: 'Créer une campagne Inbound',
                    content: `
                        <h3>Étape 1 : Type de campagne</h3>
                        <p>Sélectionnez <strong>Inbound</strong> pour répondre aux messages entrants.</p>

                        <h3>Étape 2 : Canal</h3>
                        <ul>
                            <li><strong>Widget Chat</strong> - Sur votre site web</li>
                            <li><strong>Instagram DM</strong> - Messages Instagram</li>
                            <li><strong>Messenger</strong> - Messages Facebook</li>
                        </ul>

                        <h3>Étape 3 : Configuration du canal</h3>
                        <p>Selon le canal choisi :</p>
                        <ul>
                            <li><strong>Widget :</strong> Copiez le code d'intégration</li>
                            <li><strong>Instagram/Messenger :</strong> Connectez votre compte</li>
                        </ul>

                        <h3>Étape 4 : Routage</h3>
                        <p>Configurez le transfert vers un humain si le lead est très qualifié.</p>

                        <div class="tip-box">
                            <strong>💡 Conseil :</strong> Les campagnes Inbound sont toujours actives une fois lancées.
                        </div>
                    `
                }
            ]
        },
        {
            id: 'contacts',
            icon: <Users size={24} />,
            title: 'Gestion des Contacts',
            emoji: '👤',
            description: 'Importez et gérez vos prospects',
            articles: [
                {
                    id: 'contact-list',
                    title: 'Vue d\'ensemble des contacts',
                    content: `
                        <h3>Accéder aux contacts</h3>
                        <p>Cliquez sur <strong>Contacts</strong> dans le menu latéral.</p>

                        <h3>Informations affichées</h3>
                        <ul>
                            <li><strong>Nom</strong> - Prénom et nom du contact</li>
                            <li><strong>Téléphone</strong> - Numéro au format international</li>
                            <li><strong>Score</strong> - Niveau de qualification (1-10)</li>
                            <li><strong>Statut</strong> - Nouveau, Contacté, Qualifié, RDV...</li>
                            <li><strong>Date</strong> - Dernière interaction</li>
                        </ul>

                        <h3>Filtres disponibles</h3>
                        <p>Filtrez par statut, score, date ou canal pour trouver rapidement vos contacts.</p>
                    `
                },
                {
                    id: 'import-contacts',
                    title: 'Importer des contacts',
                    content: `
                        <h3>Format du fichier</h3>
                        <p>Smart Caller accepte les fichiers CSV avec les colonnes suivantes :</p>
                        <ul>
                            <li><code>phone</code> - Numéro de téléphone (obligatoire)</li>
                            <li><code>first_name</code> - Prénom</li>
                            <li><code>last_name</code> - Nom</li>
                            <li><code>email</code> - Adresse email</li>
                        </ul>

                        <h3>Étapes d'import</h3>
                        <ol>
                            <li>Allez dans <strong>Contacts</strong></li>
                            <li>Cliquez sur <strong>Importer CSV</strong></li>
                            <li>Sélectionnez votre fichier</li>
                            <li>Mappez les colonnes si nécessaire</li>
                            <li>Validez l'import</li>
                        </ol>

                        <div class="tip-box">
                            <strong>💡 Conseil :</strong> Les numéros de téléphone doivent être au format international (+33612345678).
                        </div>
                    `
                },
                {
                    id: 'export-contacts',
                    title: 'Exporter des contacts',
                    content: `
                        <h3>Exporter tous les contacts</h3>
                        <ol>
                            <li>Allez dans <strong>Contacts</strong></li>
                            <li>Cliquez sur <strong>Exporter CSV</strong></li>
                            <li>Le téléchargement démarre automatiquement</li>
                        </ol>

                        <h3>Données exportées</h3>
                        <p>Le fichier CSV contient toutes les informations de vos contacts, y compris :</p>
                        <ul>
                            <li>Coordonnées complètes</li>
                            <li>Score de qualification</li>
                            <li>Historique de statut</li>
                            <li>Dates de création et mise à jour</li>
                        </ul>
                    `
                }
            ]
        },
        {
            id: 'calendar',
            icon: <Calendar size={24} />,
            title: 'Connexion Agenda',
            emoji: '📅',
            description: 'Synchronisez votre calendrier',
            articles: [
                {
                    id: 'google-calendar',
                    title: 'Connecter Google Calendar',
                    content: `
                        <h3>Avantages</h3>
                        <ul>
                            <li>L'IA connaît vos disponibilités en temps réel</li>
                            <li>Les RDV sont créés automatiquement</li>
                            <li>Synchronisation bidirectionnelle</li>
                        </ul>

                        <h3>Configuration</h3>
                        <ol>
                            <li>Allez dans <strong>Intégrations → Agenda</strong></li>
                            <li>Sélectionnez <strong>Google Calendar</strong></li>
                            <li>Cliquez sur <strong>Continuer avec Google</strong></li>
                            <li>Autorisez l'accès à votre calendrier</li>
                        </ol>
                    `
                },
                {
                    id: 'calendly-url',
                    title: 'Utiliser Calendly ou Cal.com',
                    content: `
                        <h3>Configuration</h3>
                        <ol>
                            <li>Allez dans <strong>Intégrations → Agenda</strong></li>
                            <li>Sélectionnez <strong>Calendly / Cal.com</strong></li>
                            <li>Collez l'URL de votre calendrier de réservation</li>
                            <li>Sauvegardez</li>
                        </ol>

                        <h3>Comment ça marche</h3>
                        <p>L'IA partagera votre lien de réservation aux prospects qualifiés pour qu'ils puissent prendre RDV directement.</p>
                    `
                }
            ]
        },
        {
            id: 'widget',
            icon: <Code size={24} />,
            title: 'Widget Chat',
            emoji: '💬',
            description: 'Installez le chat sur votre site',
            articles: [
                {
                    id: 'widget-install',
                    title: 'Installer le Widget',
                    content: `
                        <h3>Obtenir le code</h3>
                        <ol>
                            <li>Allez dans <strong>Intégrations → Widget Chat</strong></li>
                            <li>Personnalisez la couleur et la position</li>
                            <li>Copiez le code d'intégration</li>
                        </ol>

                        <h3>Ajouter à votre site</h3>
                        <p>Collez le code juste avant la balise <code>&lt;/body&gt;</code> de votre site web.</p>

                        <div class="code-example">
&lt;!-- Smart Caller Chat Widget --&gt;
&lt;script 
    src="https://agent.smart-caller.ai/widget/widget-loader.js"
    data-agent-id="votre-agent-id"
    data-color="#FF470F"
    data-position="right"&gt;
&lt;/script&gt;
                        </div>

                        <h3>Plateformes supportées</h3>
                        <ul>
                            <li>WordPress, Wix, Squarespace</li>
                            <li>Shopify, Webflow</li>
                            <li>Tout site HTML/JavaScript</li>
                        </ul>
                    `
                },
                {
                    id: 'widget-customize',
                    title: 'Personnaliser le Widget',
                    content: `
                        <h3>Options de personnalisation</h3>
                        <ul>
                            <li><strong>Couleur</strong> - Choisissez une couleur qui correspond à votre marque</li>
                            <li><strong>Position</strong> - Gauche ou droite de l'écran</li>
                            <li><strong>Message d'accueil</strong> - Personnalisez le premier message</li>
                        </ul>

                        <h3>Prévisualisation</h3>
                        <p>Utilisez l'aperçu en temps réel pour voir le rendu avant de copier le code.</p>
                    `
                }
            ]
        },
        {
            id: 'meta-ads',
            icon: <Facebook size={24} />,
            title: 'Intégration Meta Ads',
            emoji: '📣',
            description: 'Connectez vos formulaires Facebook/Instagram',
            articles: [
                {
                    id: 'meta-lead-ads',
                    title: 'Connecter Facebook Lead Ads',
                    content: `
                        <h3>Qu'est-ce que Lead Ads ?</h3>
                        <p>Les Lead Ads sont des publicités Facebook/Instagram avec un formulaire intégré. Les prospects remplissent leurs coordonnées directement dans la pub.</p>

                        <h3>Avantages de l'intégration</h3>
                        <ul>
                            <li>Les leads arrivent instantanément dans Smart Caller</li>
                            <li>L'IA les contacte automatiquement</li>
                            <li>Réduction du temps de réponse = meilleur taux de conversion</li>
                        </ul>

                        <h3>Configuration via Webhook</h3>
                        <ol>
                            <li>Allez dans <strong>Intégrations → Webhooks</strong></li>
                            <li>Copiez l'URL du webhook entrant</li>
                            <li>Dans Meta Business Manager, configurez un webhook pour votre formulaire</li>
                            <li>Collez l'URL Smart Caller</li>
                        </ol>

                        <h3>Configuration via Zapier</h3>
                        <ol>
                            <li>Créez un Zap : Facebook Lead Ads → Webhook</li>
                            <li>Utilisez l'URL webhook de Smart Caller</li>
                            <li>Mappez les champs (phone, first_name, etc.)</li>
                        </ol>
                    `
                },
                {
                    id: 'instagram-connect',
                    title: 'Connecter Instagram DM',
                    content: `
                        <h3>Prérequis</h3>
                        <ul>
                            <li>Compte Instagram Business ou Creator</li>
                            <li>Page Facebook liée au compte Instagram</li>
                        </ul>

                        <h3>Étapes de connexion</h3>
                        <ol>
                            <li>Allez dans <strong>Intégrations</strong></li>
                            <li>Trouvez <strong>Instagram DM</strong></li>
                            <li>Cliquez sur <strong>Connecter avec Facebook</strong></li>
                            <li>Autorisez l'accès à votre compte Instagram</li>
                        </ol>

                        <h3>Utilisation</h3>
                        <p>Une fois connecté, créez une campagne Inbound sur Instagram pour que l'IA réponde automatiquement aux DM.</p>
                    `
                },
                {
                    id: 'messenger-connect',
                    title: 'Connecter Facebook Messenger',
                    content: `
                        <h3>Configuration</h3>
                        <ol>
                            <li>Allez dans <strong>Intégrations</strong></li>
                            <li>Trouvez <strong>Facebook Messenger</strong></li>
                            <li>Cliquez sur <strong>Connecter</strong></li>
                            <li>Sélectionnez votre Page Facebook</li>
                            <li>Autorisez les permissions de messagerie</li>
                        </ol>

                        <h3>Fonctionnalités</h3>
                        <ul>
                            <li>Réponses automatiques aux messages</li>
                            <li>Qualification des leads</li>
                            <li>Transfert vers humain si nécessaire</li>
                        </ul>
                    `
                }
            ]
        },
        {
            id: 'webhooks',
            icon: <Link2 size={24} />,
            title: 'Configuration Webhooks',
            emoji: '🪝',
            description: 'Intégrez avec vos outils externes',
            articles: [
                {
                    id: 'webhook-inbound',
                    title: 'Webhook Entrant (recevoir des leads)',
                    content: `
                        <h3>Qu'est-ce qu'un webhook entrant ?</h3>
                        <p>Un webhook entrant permet à d'autres outils d'envoyer des leads à Smart Caller.</p>

                        <h3>URL du webhook</h3>
                        <p>Trouvez votre URL unique dans <strong>Intégrations → Webhooks</strong>.</p>

                        <h3>Format des données</h3>
                        <div class="code-example">
{
    "phone": "+33612345678",
    "first_name": "Jean",
    "last_name": "Dupont",
    "email": "jean@example.com",
    "source": "facebook_ads"
}
                        </div>

                        <h3>Outils compatibles</h3>
                        <ul>
                            <li>Zapier, Make (Integromat)</li>
                            <li>n8n, Pabbly Connect</li>
                            <li>Facebook Lead Ads</li>
                            <li>Votre CRM ou formulaire personnalisé</li>
                        </ul>
                    `
                },
                {
                    id: 'webhook-outbound',
                    title: 'Webhook Sortant (envoyer des événements)',
                    content: `
                        <h3>Événements disponibles</h3>
                        <ul>
                            <li><strong>contact.created</strong> - Nouveau contact ajouté</li>
                            <li><strong>message.received</strong> - Message reçu</li>
                            <li><strong>lead.qualified</strong> - Lead qualifié par l'IA</li>
                            <li><strong>appointment.booked</strong> - RDV pris</li>
                        </ul>

                        <h3>Configuration</h3>
                        <ol>
                            <li>Allez dans <strong>Intégrations → Webhooks</strong></li>
                            <li>Entrez l'URL de destination</li>
                            <li>Sélectionnez les événements à envoyer</li>
                            <li>Sauvegardez</li>
                        </ol>
                    `
                }
            ]
        },
        {
            id: 'conversations',
            icon: <MessageCircle size={24} />,
            title: 'Conversations',
            emoji: '💬',
            description: 'Suivez vos échanges avec les prospects',
            articles: [
                {
                    id: 'view-conversations',
                    title: 'Voir les conversations',
                    content: `
                        <h3>Interface des conversations</h3>
                        <p>La page Conversations affiche tous vos échanges avec vos prospects.</p>

                        <h3>Fonctionnalités</h3>
                        <ul>
                            <li><strong>Liste des conversations</strong> - Triées par date de dernier message</li>
                            <li><strong>Fil de discussion</strong> - Voir l'historique complet</li>
                            <li><strong>Infos contact</strong> - Score, statut, coordonnées</li>
                            <li><strong>Canal</strong> - SMS, WhatsApp, Widget, etc.</li>
                        </ul>

                        <h3>Reprendre la main</h3>
                        <p>Vous pouvez à tout moment envoyer un message manuellement pour reprendre la conversation.</p>
                    `
                }
            ]
        },
        {
            id: 'dashboard',
            icon: <BarChart3 size={24} />,
            title: 'Tableau de Bord',
            emoji: '📊',
            description: 'Analysez vos performances',
            articles: [
                {
                    id: 'metrics',
                    title: 'Comprendre les métriques',
                    content: `
                        <h3>Métriques principales</h3>
                        <ul>
                            <li><strong>Messages envoyés</strong> - Volume total de messages</li>
                            <li><strong>Taux de réponse</strong> - % de prospects qui répondent</li>
                            <li><strong>Leads qualifiés</strong> - Contacts avec score élevé</li>
                            <li><strong>RDV bookés</strong> - Rendez-vous pris par l'IA</li>
                        </ul>

                        <h3>Benchmark</h3>
                        <ul>
                            <li>Taux de réponse SMS : 15-30%</li>
                            <li>Taux de réponse WhatsApp : 30-50%</li>
                            <li>Taux de qualification : 10-25%</li>
                        </ul>
                    `
                }
            ]
        },
        {
            id: 'blacklist',
            icon: <Ban size={24} />,
            title: 'Liste Noire',
            emoji: '🚫',
            description: 'Gérez les numéros bloqués',
            articles: [
                {
                    id: 'manage-blacklist',
                    title: 'Gérer la liste noire',
                    content: `
                        <h3>Qu'est-ce que la liste noire ?</h3>
                        <p>La liste noire contient les numéros qui ne doivent plus être contactés.</p>

                        <h3>Ajout automatique</h3>
                        <p>Les contacts sont automatiquement ajoutés à la liste noire quand ils :</p>
                        <ul>
                            <li>Répondent "STOP"</li>
                            <li>Demandent à ne plus être contactés</li>
                        </ul>

                        <h3>Ajout manuel</h3>
                        <ol>
                            <li>Allez dans <strong>Liste noire</strong></li>
                            <li>Cliquez sur <strong>Ajouter un numéro</strong></li>
                            <li>Entrez le numéro au format international</li>
                        </ol>

                        <div class="warning-box">
                            <strong>⚠️ Conformité :</strong> Respecter la liste noire est obligatoire pour la conformité RGPD.
                        </div>
                    `
                }
            ]
        },
        {
            id: 'billing',
            icon: <CreditCard size={24} />,
            title: 'Facturation',
            emoji: '💳',
            description: 'Gérez votre abonnement',
            articles: [
                {
                    id: 'subscription',
                    title: 'Gérer votre abonnement',
                    content: `
                        <h3>Plans disponibles</h3>
                        <ul>
                            <li><strong>Essai gratuit</strong> - 10 leads gratuits pour tester</li>
                            <li><strong>Starter</strong> - Pour les petites équipes</li>
                            <li><strong>Pro</strong> - Pour les équipes commerciales</li>
                            <li><strong>Enterprise</strong> - Solutions sur mesure</li>
                        </ul>

                        <h3>Modifier votre plan</h3>
                        <ol>
                            <li>Cliquez sur <strong>Mon compte</strong></li>
                            <li>Allez dans <strong>Facturation</strong></li>
                            <li>Sélectionnez le nouveau plan</li>
                        </ol>

                        <h3>Méthodes de paiement</h3>
                        <p>Carte bancaire via Stripe (Visa, Mastercard, AMEX).</p>
                    `
                }
            ]
        }
    ];

    const filteredCategories = categories.filter(category => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            category.title.toLowerCase().includes(query) ||
            category.description.toLowerCase().includes(query) ||
            category.articles.some(article => 
                article.title.toLowerCase().includes(query) ||
                article.content.toLowerCase().includes(query)
            )
        );
    });

    const toggleArticle = (categoryId, articleId) => {
        const key = `${categoryId}-${articleId}`;
        setExpandedArticles(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    return (
        <div className="faq-page">
            {/* Header */}
            <header className="faq-header">
                <div className="faq-header-content">
                    <div className="faq-icon">
                        <BookOpen size={32} />
                    </div>
                    <div>
                        <h1>Centre d'aide</h1>
                        <p>Tout ce que vous devez savoir pour maîtriser Smart Caller</p>
                    </div>
                </div>

                <div className="faq-search">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Rechercher un article..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </header>

            {/* Quick Start */}
            <section className="quick-start">
                <h2><Zap size={20} /> Démarrage rapide</h2>
                <div className="quick-start-cards">
                    <div className="quick-card" onClick={() => setActiveCategory('ai-agent')}>
                        <div className="quick-icon"><Bot size={24} /></div>
                        <h3>Configurer l'agent IA</h3>
                        <p>Personnalisez votre assistant</p>
                    </div>
                    <div className="quick-card" onClick={() => setActiveCategory('whatsapp')}>
                        <div className="quick-icon whatsapp"><MessageCircle size={24} /></div>
                        <h3>Connecter WhatsApp</h3>
                        <p>Liez votre numéro</p>
                    </div>
                    <div className="quick-card" onClick={() => setActiveCategory('campaigns')}>
                        <div className="quick-icon campaigns"><Megaphone size={24} /></div>
                        <h3>Créer une campagne</h3>
                        <p>Lancez votre première campagne</p>
                    </div>
                    <div className="quick-card" onClick={() => setActiveCategory('meta-ads')}>
                        <div className="quick-icon meta"><Facebook size={24} /></div>
                        <h3>Intégrer Meta Ads</h3>
                        <p>Connectez vos formulaires</p>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <div className="faq-content">
                {/* Categories Sidebar */}
                <aside className="faq-sidebar">
                    <nav className="categories-nav">
                        {filteredCategories.map(category => (
                            <button
                                key={category.id}
                                className={`category-btn ${activeCategory === category.id ? 'active' : ''}`}
                                onClick={() => setActiveCategory(category.id)}
                            >
                                <span className="category-emoji">{category.emoji}</span>
                                <span className="category-title">{category.title}</span>
                                <ChevronRight size={16} className="category-arrow" />
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Articles */}
                <main className="faq-main">
                    {activeCategory ? (
                        <>
                            {(() => {
                                const category = categories.find(c => c.id === activeCategory);
                                if (!category) return null;
                                return (
                                    <div className="category-content">
                                        <button className="back-btn" onClick={() => setActiveCategory(null)}>
                                            <ArrowLeft size={16} /> Retour aux catégories
                                        </button>
                                        
                                        <div className="category-header">
                                            <span className="cat-emoji">{category.emoji}</span>
                                            <div>
                                                <h2>{category.title}</h2>
                                                <p>{category.description}</p>
                                            </div>
                                        </div>

                                        <div className="articles-list">
                                            {category.articles.map(article => {
                                                const isExpanded = expandedArticles[`${category.id}-${article.id}`];
                                                return (
                                                    <div key={article.id} className={`article-card ${isExpanded ? 'expanded' : ''}`}>
                                                        <button 
                                                            className="article-header"
                                                            onClick={() => toggleArticle(category.id, article.id)}
                                                        >
                                                            <h3>{article.title}</h3>
                                                            <ChevronDown size={20} className={`article-chevron ${isExpanded ? 'rotated' : ''}`} />
                                                        </button>
                                                        {isExpanded && (
                                                            <div 
                                                                className="article-content"
                                                                dangerouslySetInnerHTML={{ __html: article.content }}
                                                            />
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })()}
                        </>
                    ) : (
                        <div className="all-categories">
                            <h2>Toutes les catégories</h2>
                            <div className="categories-grid">
                                {filteredCategories.map(category => (
                                    <div 
                                        key={category.id} 
                                        className="category-card"
                                        onClick={() => setActiveCategory(category.id)}
                                    >
                                        <span className="cat-emoji">{category.emoji}</span>
                                        <h3>{category.title}</h3>
                                        <p>{category.description}</p>
                                        <span className="article-count">{category.articles.length} article{category.articles.length > 1 ? 's' : ''}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Need Help */}
            <section className="need-help">
                <div className="need-help-content">
                    <h2>Vous n'avez pas trouvé votre réponse ?</h2>
                    <p>Notre équipe est là pour vous aider</p>
                    <div className="help-actions">
                        <a href="mailto:support@smart-caller.ai" className="help-btn email">
                            <span>📧</span> Contacter le support
                        </a>
                        <a href="https://calendly.com/smart-caller" target="_blank" rel="noopener noreferrer" className="help-btn call">
                            <span>📞</span> Réserver un appel
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default FAQ;

