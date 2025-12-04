// Demo data for Smart Caller dashboard

export const DEMO_USER_ID = 'demo-user-12345';

export const demoContacts = [
    {
        id: '1',
        name: 'Jean Dupont',
        phone: '+33612345678',
        email: 'jean.dupont@techcorp.fr',
        company: 'TechCorp',
        status: 'qualified',
        score: 87,
        source: 'Google Ads',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        last_contact: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        notes: 'Intéressé par la solution entreprise. Budget confirmé.',
        tags: ['hot', 'enterprise']
    },
    {
        id: '2',
        name: 'Marie Martin',
        phone: '+33623456789',
        email: 'marie.martin@innovtech.com',
        company: 'InnovTech',
        status: 'qualified',
        score: 92,
        source: 'LinkedIn',
        created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        last_contact: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        notes: 'CEO, besoin urgent de qualification de leads.',
        tags: ['hot', 'decision-maker']
    },
    {
        id: '3',
        name: 'Pierre Bernard',
        phone: '+33634567890',
        email: 'p.bernard@startuplab.io',
        company: 'StartupLab',
        status: 'pending',
        score: 65,
        source: 'Facebook',
        created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        last_contact: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        notes: 'En phase de recherche, revenir dans 2 semaines.',
        tags: ['warm']
    },
    {
        id: '4',
        name: 'Sophie Leroy',
        phone: '+33645678901',
        email: 'sophie.leroy@digitalfirst.fr',
        company: 'Digital First',
        status: 'qualified',
        score: 78,
        source: 'Google Ads',
        created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        last_contact: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        notes: 'RDV confirmé pour vendredi 14h.',
        tags: ['meeting-booked']
    },
    {
        id: '5',
        name: 'Thomas Moreau',
        phone: '+33656789012',
        email: 't.moreau@growthco.com',
        company: 'GrowthCo',
        status: 'contacted',
        score: 71,
        source: 'Organic',
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        last_contact: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        notes: 'A demandé plus d\'infos sur les tarifs.',
        tags: ['warm']
    },
    {
        id: '6',
        name: 'Camille Petit',
        phone: '+33667890123',
        email: 'camille@agenceweb.fr',
        company: 'Agence Web Pro',
        status: 'qualified',
        score: 85,
        source: 'Referral',
        created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        last_contact: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        notes: 'Recommandé par InnovTech. Très intéressée.',
        tags: ['hot', 'referral']
    },
    {
        id: '7',
        name: 'Antoine Roux',
        phone: '+33678901234',
        email: 'antoine.roux@salesforce.fr',
        company: 'SalesForce FR',
        status: 'disqualified',
        score: 32,
        source: 'LinkedIn',
        created_at: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
        last_contact: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        notes: 'Budget insuffisant, pas le bon timing.',
        tags: ['cold']
    },
    {
        id: '8',
        name: 'Julie Mercier',
        phone: '+33689012345',
        email: 'j.mercier@retailplus.com',
        company: 'Retail Plus',
        status: 'pending',
        score: 58,
        source: 'Google Ads',
        created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        last_contact: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        notes: 'Premier contact, attente de réponse.',
        tags: ['new']
    },
    {
        id: '9',
        name: 'Nicolas Blanc',
        phone: '+33690123456',
        email: 'nicolas@fintech.io',
        company: 'FinTech Solutions',
        status: 'qualified',
        score: 94,
        source: 'LinkedIn',
        created_at: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
        last_contact: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
        notes: 'Deal en cours, proposition envoyée.',
        tags: ['hot', 'proposal-sent']
    },
    {
        id: '10',
        name: 'Laura Simon',
        phone: '+33601234567',
        email: 'laura.simon@mediagroup.fr',
        company: 'Media Group',
        status: 'contacted',
        score: 68,
        source: 'Facebook',
        created_at: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
        last_contact: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        notes: 'Responsable Marketing, à recontacter lundi.',
        tags: ['warm', 'marketing']
    }
];

export const demoConversations = [
    {
        phone: '+33612345678',
        contact: demoContacts[0],
        messages: [
            { role: 'user', content: 'Bonjour, je suis intéressé par votre solution de qualification de leads.', created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
            { role: 'assistant', content: 'Bonjour Jean ! Merci pour votre intérêt 🙂 Je suis Sophie, assistante IA chez Smart Caller. Pour mieux comprendre vos besoins, combien de leads recevez-vous par mois actuellement ?', created_at: new Date(Date.now() - 2 * 60 * 60 * 1000 + 30000).toISOString() },
            { role: 'user', content: 'On reçoit environ 500 leads par mois via nos campagnes Google Ads.', created_at: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString() },
            { role: 'assistant', content: 'C\'est un volume intéressant ! Et actuellement, quel est votre temps de réponse moyen à ces leads ?', created_at: new Date(Date.now() - 1.5 * 60 * 60 * 1000 + 25000).toISOString() },
            { role: 'user', content: 'Honnêtement, parfois plusieurs heures... On a du mal à suivre.', created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() },
            { role: 'assistant', content: 'Je comprends, c\'est un défi courant. Avec Smart Caller, on peut répondre en moins de 5 minutes 24/7. Êtes-vous le décideur pour ce type de solution ?', created_at: new Date(Date.now() - 1 * 60 * 60 * 1000 + 20000).toISOString() },
            { role: 'user', content: 'Oui, je suis Directeur Commercial. C\'est moi qui gère les outils de vente.', created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString() },
            { role: 'assistant', content: 'Parfait Jean ! Votre profil correspond exactement à nos clients. Seriez-vous disponible pour une démo de 15 minutes cette semaine ? Je peux vous proposer jeudi à 14h ou vendredi à 10h.', created_at: new Date(Date.now() - 45 * 60 * 1000 + 18000).toISOString() },
            { role: 'user', content: 'Vendredi 10h ça me va !', created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
            { role: 'assistant', content: 'Excellent ! 🎉 C\'est noté pour vendredi 10h. Vous recevrez une invitation par email. À vendredi Jean !', created_at: new Date(Date.now() - 30 * 60 * 1000 + 15000).toISOString() }
        ],
        lastMessage: 'Excellent ! 🎉 C\'est noté pour vendredi 10h.',
        unread: 0
    },
    {
        phone: '+33623456789',
        contact: demoContacts[1],
        messages: [
            { role: 'user', content: 'J\'ai vu votre pub sur LinkedIn. Comment ça marche exactement ?', created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() },
            { role: 'assistant', content: 'Bonjour Marie ! Smart Caller est un agent IA qui répond automatiquement à vos leads par SMS. On qualifie, on prend des RDV et on synchronise avec votre CRM. Quel est votre secteur d\'activité ?', created_at: new Date(Date.now() - 5 * 60 * 60 * 1000 + 28000).toISOString() },
            { role: 'user', content: 'Je suis CEO d\'une startup SaaS B2B. On a un gros problème de qualification.', created_at: new Date(Date.now() - 4.5 * 60 * 60 * 1000).toISOString() },
            { role: 'assistant', content: 'Le SaaS B2B c\'est notre spécialité ! En moyenne, nos clients voient +21x de conversions grâce à la rapidité de réponse. Combien de leads non traités avez-vous par semaine ?', created_at: new Date(Date.now() - 4.5 * 60 * 60 * 1000 + 22000).toISOString() },
            { role: 'user', content: 'Facilement 30-40% qui restent sans réponse. C\'est de l\'argent jeté.', created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() },
            { role: 'assistant', content: 'C\'est énorme ! 😱 Avec Smart Caller, 100% de vos leads reçoivent une réponse en moins de 5 min. On peut faire une démo ?', created_at: new Date(Date.now() - 4 * 60 * 60 * 1000 + 20000).toISOString() },
            { role: 'user', content: 'Oui carrément. Dispo demain matin ?', created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() },
            { role: 'assistant', content: 'Super ! Je vous propose 9h30 ou 11h demain matin. Qu\'est-ce qui vous arrange le mieux ?', created_at: new Date(Date.now() - 3 * 60 * 60 * 1000 + 18000).toISOString() },
            { role: 'user', content: '11h parfait', created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
            { role: 'assistant', content: 'RDV confirmé pour demain 11h ! ✅ Vous allez recevoir le lien Zoom. À demain Marie !', created_at: new Date(Date.now() - 2 * 60 * 60 * 1000 + 15000).toISOString() },
            { role: 'user', content: 'Merci beaucoup !', created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString() }
        ],
        lastMessage: 'Merci beaucoup !',
        unread: 1
    },
    {
        phone: '+33634567890',
        contact: demoContacts[2],
        messages: [
            { role: 'user', content: 'Bonjour, vous faites quoi exactement ?', created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString() },
            { role: 'assistant', content: 'Bonjour Pierre ! Smart Caller est une solution IA qui qualifie automatiquement vos leads par SMS, 24h/24. On répond en moins de 5 minutes et on peut prendre des RDV. Vous avez un site web ou des formulaires qui génèrent des leads ?', created_at: new Date(Date.now() - 8 * 60 * 60 * 1000 + 25000).toISOString() },
            { role: 'user', content: 'Oui on a un site mais pas beaucoup de volume pour l\'instant.', created_at: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString() },
            { role: 'assistant', content: 'Je comprends ! Quel est votre volume actuel approximativement ?', created_at: new Date(Date.now() - 7 * 60 * 60 * 1000 + 20000).toISOString() },
            { role: 'user', content: 'Environ 20-30 leads par mois', created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() },
            { role: 'assistant', content: 'C\'est un début ! Notre offre Starter commence à 50 leads/mois. Prévoyez-vous d\'augmenter votre acquisition prochainement ?', created_at: new Date(Date.now() - 6 * 60 * 60 * 1000 + 22000).toISOString() },
            { role: 'user', content: 'On lance une grosse campagne dans 2-3 semaines normalement', created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() },
            { role: 'assistant', content: 'Super timing ! On peut vous configurer avant votre campagne pour être prêts. Voulez-vous qu\'on en reparle dans 2 semaines ?', created_at: new Date(Date.now() - 5 * 60 * 60 * 1000 + 18000).toISOString() },
            { role: 'user', content: 'Oui recontactez-moi mi-janvier svp', created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() },
            { role: 'assistant', content: 'Noté Pierre ! Je vous recontacte mi-janvier. Bonne préparation de campagne ! 🚀', created_at: new Date(Date.now() - 4 * 60 * 60 * 1000 + 15000).toISOString() }
        ],
        lastMessage: 'Noté Pierre ! Je vous recontacte mi-janvier.',
        unread: 0
    },
    {
        phone: '+33690123456',
        contact: demoContacts[8],
        messages: [
            { role: 'user', content: 'Hello, on m\'a recommandé votre solution. On cherche à automatiser notre qualification.', created_at: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString() },
            { role: 'assistant', content: 'Bonjour Nicolas ! Merci pour votre message. C\'est exactement ce qu\'on fait ! Pouvez-vous me dire d\'où vient la recommandation ?', created_at: new Date(Date.now() - 36 * 60 * 60 * 1000 + 30000).toISOString() },
            { role: 'user', content: 'Un ami CEO d\'une fintech qui utilise Smart Caller depuis 3 mois.', created_at: new Date(Date.now() - 35 * 60 * 60 * 1000).toISOString() },
            { role: 'assistant', content: 'Ah super ! On a plusieurs clients dans la fintech. Quel type de leads traitez-vous ? B2B, B2C ?', created_at: new Date(Date.now() - 35 * 60 * 60 * 1000 + 25000).toISOString() },
            { role: 'user', content: 'B2B principalement. On cible les directeurs financiers.', created_at: new Date(Date.now() - 34 * 60 * 60 * 1000).toISOString() },
            { role: 'assistant', content: 'Parfait ! On peut configurer des critères de qualification spécifiques : taille entreprise, budget, urgence du besoin... Vous avez déjà ces critères définis ?', created_at: new Date(Date.now() - 34 * 60 * 60 * 1000 + 22000).toISOString() },
            { role: 'user', content: 'Oui on a un scoring assez précis. Il faudrait le reproduire.', created_at: new Date(Date.now() - 33 * 60 * 60 * 1000).toISOString() },
            { role: 'assistant', content: 'On peut totalement reproduire votre scoring ! On l\'intègre dans l\'IA. Pouvez-vous m\'envoyer vos critères par email ?', created_at: new Date(Date.now() - 33 * 60 * 60 * 1000 + 20000).toISOString() },
            { role: 'user', content: 'Je vous envoie ça demain. On peut planifier une démo aussi ?', created_at: new Date(Date.now() - 32 * 60 * 60 * 1000).toISOString() },
            { role: 'assistant', content: 'Avec plaisir ! Quand seriez-vous disponible cette semaine ?', created_at: new Date(Date.now() - 32 * 60 * 60 * 1000 + 18000).toISOString() },
            { role: 'user', content: 'Jeudi 15h ?', created_at: new Date(Date.now() - 31 * 60 * 60 * 1000).toISOString() },
            { role: 'assistant', content: 'Parfait Nicolas ! RDV jeudi 15h. Je vous envoie l\'invitation. À jeudi ! 🎯', created_at: new Date(Date.now() - 31 * 60 * 60 * 1000 + 15000).toISOString() },
            { role: 'user', content: 'Top merci !', created_at: new Date(Date.now() - 20 * 60 * 1000).toISOString() }
        ],
        lastMessage: 'Top merci !',
        unread: 1
    },
    {
        phone: '+33667890123',
        contact: demoContacts[5],
        messages: [
            { role: 'user', content: 'Salut ! Marie de InnovTech m\'a parlé de vous. Ça a l\'air top.', created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString() },
            { role: 'assistant', content: 'Bonjour Camille ! Marie est une super cliente 😊 Qu\'est-ce qu\'elle vous a dit exactement ?', created_at: new Date(Date.now() - 48 * 60 * 60 * 1000 + 28000).toISOString() },
            { role: 'user', content: 'Qu\'elle avait doublé ses RDV qualifiés en 2 mois. Je veux la même chose !', created_at: new Date(Date.now() - 47 * 60 * 60 * 1000).toISOString() },
            { role: 'assistant', content: 'Haha j\'adore l\'enthousiasme ! C\'est vrai que Marie a eu de super résultats. Vous êtes dans quel secteur ?', created_at: new Date(Date.now() - 47 * 60 * 60 * 1000 + 22000).toISOString() },
            { role: 'user', content: 'Agence web, on fait du dev et du marketing digital.', created_at: new Date(Date.now() - 46 * 60 * 60 * 1000).toISOString() },
            { role: 'assistant', content: 'Super ! Les agences web sont un de nos segments où on performe le mieux. Vous recevez des demandes de devis via formulaire ?', created_at: new Date(Date.now() - 46 * 60 * 60 * 1000 + 20000).toISOString() },
            { role: 'user', content: 'Oui environ 100 par mois mais on en perd beaucoup', created_at: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString() },
            { role: 'assistant', content: 'Je comprends ! Avec 100 leads/mois, on peut vraiment faire la différence. Notre offre Growth serait parfaite. Voulez-vous une démo ?', created_at: new Date(Date.now() - 10 * 60 * 60 * 1000 + 18000).toISOString() },
            { role: 'user', content: 'Yes ! Dispo la semaine prochaine', created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() },
            { role: 'assistant', content: 'Super Camille ! Je vous propose mardi 10h ou mercredi 14h ?', created_at: new Date(Date.now() - 5 * 60 * 60 * 1000 + 15000).toISOString() }
        ],
        lastMessage: 'Super Camille ! Je vous propose mardi 10h ou mercredi 14h ?',
        unread: 0
    }
];

export const demoStats = {
    totalLeads: 342,
    qualifiedLeads: 127,
    averageScore: 74,
    qualificationRate: 68,
    meetingsBooked: 89,
    responseTime: '< 3 min',
    conversionRate: 24,
    activeConversations: 23,
    
    // Weekly data for charts
    weeklyData: [
        { day: 'Lun', leads: 45, qualified: 32, meetings: 12 },
        { day: 'Mar', leads: 52, qualified: 38, meetings: 15 },
        { day: 'Mer', leads: 48, qualified: 35, meetings: 11 },
        { day: 'Jeu', leads: 61, qualified: 42, meetings: 18 },
        { day: 'Ven', leads: 55, qualified: 40, meetings: 14 },
        { day: 'Sam', leads: 28, qualified: 18, meetings: 8 },
        { day: 'Dim', leads: 22, qualified: 15, meetings: 6 }
    ],
    
    // Source breakdown
    sourceData: [
        { source: 'Google Ads', leads: 127, qualified: 89, rate: 70 },
        { source: 'Facebook', leads: 93, qualified: 58, rate: 62 },
        { source: 'LinkedIn', leads: 67, qualified: 51, rate: 76 },
        { source: 'Organic', leads: 45, qualified: 29, rate: 64 },
        { source: 'Referral', leads: 10, qualified: 8, rate: 80 }
    ],
    
    // Recent activity
    recentActivity: [
        { type: 'qualified', contact: 'Jean Dupont', time: 'il y a 30 min', score: 87 },
        { type: 'meeting', contact: 'Marie Martin', time: 'il y a 45 min', details: 'RDV demain 11h' },
        { type: 'new', contact: 'Julie Mercier', time: 'il y a 1h', source: 'Google Ads' },
        { type: 'qualified', contact: 'Nicolas Blanc', time: 'il y a 2h', score: 94 },
        { type: 'reply', contact: 'Camille Petit', time: 'il y a 3h', message: 'Yes ! Dispo la semaine prochaine' },
        { type: 'new', contact: 'Laura Simon', time: 'il y a 4h', source: 'Facebook' },
        { type: 'meeting', contact: 'Sophie Leroy', time: 'il y a 5h', details: 'RDV vendredi 14h' }
    ]
};

export const demoCampaigns = [
    {
        id: '1',
        name: 'Réactivation Q4',
        status: 'active',
        type: 'reactivation',
        leads: 245,
        sent: 189,
        replied: 67,
        qualified: 42,
        meetings: 18,
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        channel: 'sms'
    },
    {
        id: '2',
        name: 'Nurturing SaaS',
        status: 'active',
        type: 'nurturing',
        leads: 156,
        sent: 156,
        replied: 48,
        qualified: 31,
        meetings: 12,
        startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        channel: 'sms'
    },
    {
        id: '3',
        name: 'Promo Black Friday',
        status: 'completed',
        type: 'promotion',
        leads: 520,
        sent: 520,
        replied: 187,
        qualified: 98,
        meetings: 45,
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        channel: 'sms'
    }
];

export const demoAgentConfig = {
    name: 'Sophie',
    role: 'Assistante Commerciale IA',
    company: 'Smart Caller Demo',
    tone: 65,
    politeness: 'vous',
    context: 'Qualifier les leads entrants et prendre des RDV pour les commerciaux.',
    goal: 'qualify',
    behaviorMode: 'human',
    responseDelay: 2,
    schedule: {
        startTime: '09:00',
        endTime: '18:00',
        days: ['L', 'M', 'Me', 'J', 'V']
    },
    icp: {
        sector: 'SaaS B2B, E-commerce, Agences',
        size: '10-500 employés',
        decider: 'CEO, Directeur Commercial, Head of Marketing',
        budget: '500€ - 5 000€ / mois'
    },
    quality_criteria: [
        { id: 1, text: 'Budget > 500€/mois', type: 'must_have' },
        { id: 2, text: 'Décideur identifié', type: 'must_have' },
        { id: 3, text: 'Besoin urgent (< 3 mois)', type: 'nice_to_have' },
        { id: 4, text: 'Volume leads > 100/mois', type: 'nice_to_have' }
    ],
    channels: { sms: true, whatsapp: false, email: false },
    language: 'Français',
    agentPersona: {
        firstMessage: 'Bonjour {{name}} ! Merci pour votre intérêt 🙂 Je suis Sophie, assistante IA chez Smart Caller. Comment puis-je vous aider ?'
    }
};

// Helper to check if current user is demo
export const isDemoMode = (userId) => {
    return userId === DEMO_USER_ID || localStorage.getItem('demoMode') === 'true';
};

// Enable demo mode
export const enableDemoMode = () => {
    localStorage.setItem('demoMode', 'true');
};

// Disable demo mode
export const disableDemoMode = () => {
    localStorage.removeItem('demoMode');
};

