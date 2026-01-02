# Smart Caller - Documentation Architecture

> Ce fichier documente la structure complète du SaaS Smart Caller pour faciliter le développement et la maintenance.

## 🎯 Vue d'ensemble

**Smart Caller** est un SaaS de qualification automatique de leads par SMS/WhatsApp grâce à l'IA (GPT-4o-mini). L'agent IA engage des conversations naturelles avec les prospects pour les qualifier selon la méthode BANT (Budget, Authority, Need, Timing).

### Stack Technique

| Composant | Technologie |
|-----------|-------------|
| Frontend | React 18 + Vite |
| Backend | Node.js + Express |
| Base de données | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| IA | OpenAI GPT-4o-mini |
| SMS | Twilio |
| WhatsApp | Twilio + Meta API |
| Paiements | Stripe |
| Hébergement | Netlify (frontend) + Railway/Render (backend) |

---

## 📁 Structure du Projet

```
smart-caller-mvp/
├── app-smart-caller-backend/     # API Node.js/Express
│   ├── server.js                 # Point d'entrée principal
│   ├── services/                 # Services métier
│   │   ├── openaiService.js      # Génération IA (prompts, réponses)
│   │   ├── widgetService.js      # Widget chat embeddable
│   │   ├── blacklistService.js   # Gestion liste noire
│   │   ├── contactService.js     # Gestion contacts
│   │   ├── emailService.js       # Envoi emails
│   │   ├── followUpService.js    # Relances automatiques
│   │   ├── historyService.js     # Historique conversations
│   │   ├── intelligenceService.js # Analyse IA des leads
│   │   ├── outboundService.js    # SMS sortants
│   │   ├── scheduleService.js    # Planification campagnes
│   │   ├── tagService.js         # Tags contacts
│   │   ├── templateService.js    # Templates de messages
│   │   ├── webhookService.js     # Webhooks entrants
│   │   ├── whatsappService.js    # WhatsApp Twilio
│   │   └── whatsappMetaService.js # WhatsApp Meta API
│   └── sql/                      # Scripts SQL Supabase
│
└── smart-caller-frontend/        # App React
    ├── public/
    │   └── widget/
    │       └── widget-loader.js  # Script embed widget
    └── src/
        ├── components/
        │   ├── ChatWidget/       # Widget React (usage interne)
        │   ├── Layout/           # Layout + Sidebar
        │   └── OnboardingTour/   # Tour d'onboarding
        ├── context/
        │   └── AuthContext.jsx   # Auth + Impersonation
        ├── pages/                # Pages de l'app
        └── config.js             # Configuration centralisée
```

---

## 🗄️ Base de Données Supabase

### Tables Principales

| Table | Description |
|-------|-------------|
| `profiles` | Profils utilisateurs (lié à auth.users) |
| `contacts` | Leads/contacts des utilisateurs |
| `messages` | Historique des messages SMS/WhatsApp |
| `campaigns` | Campagnes de prospection |
| `notifications` | Notifications in-app |
| `blacklist` | Numéros en liste noire |
| `tags` | Tags pour catégoriser les contacts |
| `templates` | Templates de messages |
| `sandbox_conversations` | Conversations de démo |
| `widget_sessions` | Sessions du widget chat |
| `widget_messages` | Messages du widget chat |

### Schéma `profiles`

```sql
profiles (
    id UUID PRIMARY KEY,           -- Lié à auth.users.id
    email TEXT,
    full_name TEXT,
    company_name TEXT,
    agent_name TEXT,               -- Nom de l'agent IA
    agent_role TEXT,
    agent_tone INTEGER,            -- 0-100 (doux → agressif)
    agent_politeness TEXT,         -- 'tu' ou 'vous'
    agent_context TEXT,            -- Contexte business
    agent_goal TEXT,               -- 'qualify', 'book', 'support', etc.
    calendar_url TEXT,             -- URL Calendly/Zcal
    behavior_mode TEXT,            -- 'human' ou 'assistant'
    subscription_plan TEXT,        -- 'starter', 'growth', 'scale'
    subscription_status TEXT,      -- 'active', 'trial', 'canceled'
    trial_ends_at TIMESTAMP,
    stripe_customer_id TEXT,
    twilio_phone_number TEXT,
    whatsapp_enabled BOOLEAN,
    widget_color TEXT,
    widget_greeting TEXT,
    widget_position TEXT,
    created_at TIMESTAMP
)
```

### Schéma `contacts`

```sql
contacts (
    id UUID PRIMARY KEY,
    agent_id UUID,                 -- FK vers profiles.id
    name TEXT,
    phone TEXT,
    email TEXT,
    company_name TEXT,
    job_title TEXT,
    source TEXT,                   -- 'demo_request', 'pricing', etc.
    status TEXT,                   -- 'new', 'contacted', 'qualified', 'lost'
    score INTEGER,                 -- 0-100
    is_qualified BOOLEAN,
    tags TEXT[],
    notes TEXT,
    last_contacted_at TIMESTAMP,
    created_at TIMESTAMP
)
```

### Schéma `messages`

```sql
messages (
    id UUID PRIMARY KEY,
    contact_id UUID,               -- FK vers contacts.id
    agent_id UUID,
    direction TEXT,                -- 'inbound' ou 'outbound'
    channel TEXT,                  -- 'sms', 'whatsapp'
    content TEXT,
    status TEXT,                   -- 'sent', 'delivered', 'read', 'failed'
    twilio_sid TEXT,
    created_at TIMESTAMP
)
```

---

## 🔌 API Endpoints

### Webhooks Twilio

| Endpoint | Description |
|----------|-------------|
| `POST /incoming-sms` | Réception SMS entrants |
| `POST /incoming-whatsapp` | Réception WhatsApp entrants |
| `POST /webhooks/:agentId/leads` | Webhook pour import leads externes |

### Messages & Contacts

| Endpoint | Description |
|----------|-------------|
| `POST /api/messages/send` | Envoi manuel d'un message |
| `POST /import-leads` | Import CSV de contacts |
| `GET /api/notifications/:userId` | Notifications utilisateur |

### Campagnes

| Endpoint | Description |
|----------|-------------|
| `POST /api/campaigns/launch` | Lancer une campagne |

### Agent & Onboarding

| Endpoint | Description |
|----------|-------------|
| `POST /api/agents/create` | Créer/mettre à jour agent |
| `GET /api/agents/:userId` | Récupérer config agent |
| `POST /api/onboarding/analyze` | Analyser site web |
| `POST /api/onboarding/generate-persona` | Générer persona |
| `POST /api/onboarding/simulate` | Simuler conversation |

### Stripe

| Endpoint | Description |
|----------|-------------|
| `POST /api/stripe/webhook` | Webhook Stripe |
| `POST /api/stripe/create-checkout-session` | Créer session paiement |
| `POST /api/stripe/create-portal-session` | Portail client |

### WhatsApp

| Endpoint | Description |
|----------|-------------|
| `GET /api/whatsapp/connect/:userId` | Générer QR code |
| `GET /api/whatsapp/status/:userId` | Statut connexion |
| `POST /api/whatsapp/send` | Envoyer message |
| `POST /api/whatsapp-meta/send` | Envoyer via Meta API |
| `POST /api/whatsapp-meta/send-template` | Envoyer template |

### Tags & Templates

| Endpoint | Description |
|----------|-------------|
| `GET /api/tags/:userId` | Liste des tags |
| `POST /api/tags/:userId` | Créer tag |
| `GET /api/templates/:userId` | Liste templates |
| `POST /api/templates/:userId` | Créer template |

### Blacklist

| Endpoint | Description |
|----------|-------------|
| `GET /api/blacklist/:userId` | Liste noire |
| `POST /api/blacklist/:userId` | Ajouter numéro |
| `POST /api/blacklist/:userId/import` | Import CSV |

### Widget Chat

| Endpoint | Description |
|----------|-------------|
| `POST /api/widget/chat` | Traiter message widget |
| `GET /api/widget/config/:agentId` | Config widget |
| `POST /api/widget/config/:agentId` | Mettre à jour config |
| `GET /api/widget/analytics/:agentId` | Analytics widget |
| `GET /api/widget/sessions/:agentId` | Sessions récentes |

### Admin

| Endpoint | Description |
|----------|-------------|
| `GET /api/admin/profiles` | Liste utilisateurs |
| `GET /api/admin/stats` | Statistiques globales |
| `PUT /api/admin/profiles/:userId` | Modifier profil |

### Sandbox / Funnel

| Endpoint | Description |
|----------|-------------|
| `POST /api/funnel/chat-v2` | Chat démo sandbox |
| `POST /api/sandbox/conversation` | Sauvegarder conversation |
| `GET /api/sandbox/conversations` | Liste conversations |
| `GET /api/sandbox/stats` | Stats sandbox |

---

## 🎨 Pages Frontend

### Pages Publiques

| Route | Composant | Description |
|-------|-----------|-------------|
| `/landing` | LandingPage | Page d'accueil marketing |
| `/seo` | LandingSEO | Landing SEO |
| `/demo` | FunnelV2 | Démo interactive |
| `/pricing` | Pricing | Tarifs |
| `/login` | Login | Connexion |
| `/signup` | SignUp | Inscription |
| `/terms` | Terms | CGU |
| `/privacy` | Privacy | Politique confidentialité |

### Pages Protégées (auth requise)

| Route | Composant | Description |
|-------|-----------|-------------|
| `/` | Dashboard | Tableau de bord |
| `/conversations` | Conversations | Liste conversations |
| `/contacts` | Contacts | Gestion contacts |
| `/campaigns` | Campaigns | Liste campagnes |
| `/campaigns/new` | CreateCampaign | Créer campagne |
| `/blacklist` | Blacklist | Liste noire |
| `/integrations` | Integrations | Intégrations (Twilio, etc.) |
| `/widget` | WidgetIntegration | Config widget chat |
| `/settings` | AgentSettings | Config agent IA |
| `/subscription` | Subscription | Abonnement |
| `/onboarding` | Onboarding | Onboarding utilisateur |

### Pages Admin

| Route | Composant | Description |
|-------|-----------|-------------|
| `/admin` | AdminDashboard | Dashboard admin |

---

## 🤖 Agent IA - Configuration

L'agent IA est configuré via le profil utilisateur. Paramètres clés :

| Paramètre | Description |
|-----------|-------------|
| `agent_name` | Prénom de l'agent (Julie, Marc, etc.) |
| `agent_role` | Rôle (Conseillère Commerciale, etc.) |
| `agent_tone` | 0-100 (0=empathique, 100=direct/agressif) |
| `agent_politeness` | 'tu' ou 'vous' |
| `agent_goal` | 'qualify', 'book', 'support', 'nurture', 'reactivate' |
| `behavior_mode` | 'human' (cache qu'il est IA) ou 'assistant' |
| `agent_context` | Description du business |
| `calendar_url` | URL pour prise de RDV |

### Méthode BANT

L'agent qualifie selon :
- **B**udget : Le prospect a-t-il un budget ?
- **A**uthority : Est-il décideur ?
- **N**eed : A-t-il un besoin identifié ?
- **T**iming : Urgence/délai du projet ?

Score :
- ⭐ = Intérêt vague
- ⭐⭐ = Besoin identifié, pas de budget/timing
- ⭐⭐⭐ = Besoin + 1 critère BANT
- ⭐⭐⭐⭐ = Besoin + Budget + Timing
- ⭐⭐⭐⭐⭐ = BANT complet → `<QUALIFIED>`

---

## 💳 Plans & Limites

| Plan | Prix | Leads/mois | Features |
|------|------|------------|----------|
| Essai | Gratuit | 10 | Test limité |
| Starter | 49€/mois | 150 | SMS + WhatsApp |
| Growth | 99€/mois | 500 | + Campagnes |
| Scale | 199€/mois | Illimité | + API + Support |

---

## 🔑 Variables d'Environnement

### Backend

```env
# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...

# OpenAI
OPENAI_API_KEY=sk-...

# Twilio
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+33...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App
PORT=3001
FRONTEND_URL=https://app.smart-caller.ai
```

### Frontend

```env
VITE_API_URL=https://webhook.smart-caller.ai
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_STRIPE_PUBLIC_KEY=pk_live_...
```

---

## 🚀 URLs de Production

| Service | URL |
|---------|-----|
| Frontend App | https://app.smart-caller.ai |
| Landing Page | https://smart-caller.ai |
| API Backend | https://webhook.smart-caller.ai |
| Widget Script | https://app.smart-caller.ai/widget/widget-loader.js |

---

## 📝 Notes Importantes

1. **La table principale pour les utilisateurs est `profiles`** (pas `agents`)
2. **L'agent_id dans les contacts = le user_id du profil**
3. **L'authentification utilise Supabase Auth**
4. **Les admins sont identifiés par email** (jeremy.music44@gmail.com)
5. **Le widget chat fonctionne sans auth** (sessions anonymes)
6. **Les numéros de téléphone sont normalisés** au format international (+33...)

---

*Dernière mise à jour : Janvier 2026*

