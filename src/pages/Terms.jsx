import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import './Legal.css';

const Terms = () => {
    return (
        <div className="legal-page">
            <div className="legal-container">
                <Link to="/signup" className="back-link">
                    <ArrowLeft size={18} />
                    Retour
                </Link>

                <div className="legal-header">
                    <div className="legal-icon">
                        <FileText size={32} />
                    </div>
                    <h1>Conditions Générales d'Utilisation</h1>
                    <p className="legal-subtitle">Dernière mise à jour : 6 décembre 2024</p>
                </div>

                <div className="legal-content">
                    <section>
                        <h2>1. Objet</h2>
                        <p>
                            Les présentes Conditions Générales d'Utilisation (ci-après "CGU") régissent l'accès et l'utilisation 
                            de la plateforme Smart Caller (ci-après "le Service"), éditée par Smart Caller SAS.
                        </p>
                        <p>
                            Smart Caller est une solution SaaS B2B de qualification automatique de leads par SMS et messagerie, 
                            utilisant l'intelligence artificielle pour qualifier et scorer les prospects entrants.
                        </p>
                    </section>

                    <section>
                        <h2>2. Acceptation des conditions</h2>
                        <p>
                            En créant un compte et en utilisant le Service, vous acceptez sans réserve les présentes CGU. 
                            Si vous n'acceptez pas ces conditions, vous ne devez pas utiliser le Service.
                        </p>
                        <p>
                            Smart Caller se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs 
                            seront informés de toute modification par email ou via l'interface du Service.
                        </p>
                    </section>

                    <section>
                        <h2>3. Description du Service</h2>
                        <p>Smart Caller propose les fonctionnalités suivantes :</p>
                        <ul>
                            <li>Agent IA de qualification de leads par SMS</li>
                            <li>Scoring automatique des prospects (méthode BANT)</li>
                            <li>Tableau de bord analytics en temps réel</li>
                            <li>Intégration webhook avec vos formulaires existants</li>
                            <li>Campagnes de réactivation et nurturing</li>
                            <li>Export des données et intégrations CRM</li>
                        </ul>
                    </section>

                    <section>
                        <h2>4. Inscription et compte utilisateur</h2>
                        <h3>4.1 Création de compte</h3>
                        <p>
                            Pour utiliser le Service, vous devez créer un compte en fournissant des informations exactes 
                            et complètes. Vous êtes responsable de la confidentialité de vos identifiants de connexion.
                        </p>
                        
                        <h3>4.2 Éligibilité</h3>
                        <p>
                            Le Service est destiné aux professionnels (B2B). Vous déclarez agir dans le cadre de votre 
                            activité professionnelle et disposer de la capacité juridique nécessaire.
                        </p>
                    </section>

                    <section>
                        <h2>5. Abonnements et paiement</h2>
                        <h3>5.1 Formules d'abonnement</h3>
                        <p>
                            Smart Caller propose plusieurs formules d'abonnement (Starter, Growth, Scale) avec des 
                            fonctionnalités et limites de leads mensuels différentes.
                        </p>
                        
                        <h3>5.2 Facturation</h3>
                        <p>
                            Les abonnements sont facturés mensuellement ou annuellement selon la formule choisie. 
                            Le paiement s'effectue par carte bancaire via notre prestataire sécurisé Stripe.
                        </p>
                        
                        <h3>5.3 Période d'essai</h3>
                        <p>
                            Une période d'essai gratuite de 7 jours avec 10 leads offerts peut être proposée. 
                            À l'issue de cette période, l'abonnement choisi sera automatiquement activé.
                        </p>
                        
                        <h3>5.4 Résiliation</h3>
                        <p>
                            Vous pouvez résilier votre abonnement à tout moment depuis votre espace client. 
                            La résiliation prend effet à la fin de la période de facturation en cours.
                        </p>
                    </section>

                    <section>
                        <h2>6. Utilisation acceptable</h2>
                        <p>Vous vous engagez à :</p>
                        <ul>
                            <li>Utiliser le Service conformément à la législation en vigueur</li>
                            <li>Respecter le RGPD et obtenir le consentement des personnes contactées</li>
                            <li>Ne pas envoyer de messages à caractère illicite, frauduleux ou non sollicité (spam)</li>
                            <li>Ne pas tenter de contourner les mesures de sécurité du Service</li>
                            <li>Ne pas revendre ou sous-licencier le Service sans autorisation</li>
                        </ul>
                    </section>

                    <section>
                        <h2>7. Propriété intellectuelle</h2>
                        <p>
                            Smart Caller détient l'ensemble des droits de propriété intellectuelle sur le Service, 
                            incluant le logiciel, les algorithmes d'IA, l'interface et la documentation.
                        </p>
                        <p>
                            L'utilisateur conserve la propriété de ses données et contenus. Il accorde à Smart Caller 
                            une licence limitée pour traiter ces données dans le cadre de la fourniture du Service.
                        </p>
                    </section>

                    <section>
                        <h2>8. Protection des données</h2>
                        <p>
                            Le traitement des données personnelles est régi par notre <Link to="/privacy">Politique de Confidentialité</Link>. 
                            Smart Caller agit en tant que sous-traitant au sens du RGPD pour le traitement des données 
                            de vos leads.
                        </p>
                    </section>

                    <section>
                        <h2>9. Disponibilité du Service</h2>
                        <p>
                            Smart Caller s'efforce d'assurer une disponibilité du Service 24h/24, 7j/7. Toutefois, 
                            le Service peut être temporairement interrompu pour maintenance ou mise à jour.
                        </p>
                        <p>
                            Smart Caller ne garantit pas un taux de disponibilité spécifique sauf accord contractuel 
                            particulier (SLA pour les plans Scale).
                        </p>
                    </section>

                    <section>
                        <h2>10. Limitation de responsabilité</h2>
                        <p>
                            Smart Caller ne saurait être tenu responsable des dommages indirects, incluant notamment 
                            la perte de chiffre d'affaires, de données ou d'opportunités commerciales.
                        </p>
                        <p>
                            La responsabilité totale de Smart Caller est limitée au montant des sommes versées par 
                            l'utilisateur au cours des 12 derniers mois.
                        </p>
                    </section>

                    <section>
                        <h2>11. Droit applicable et juridiction</h2>
                        <p>
                            Les présentes CGU sont soumises au droit français. En cas de litige, et après tentative 
                            de résolution amiable, les tribunaux de Paris seront seuls compétents.
                        </p>
                    </section>

                    <section>
                        <h2>12. Contact</h2>
                        <p>
                            Pour toute question concernant ces conditions, vous pouvez nous contacter à :
                        </p>
                        <ul>
                            <li>Email : <a href="mailto:legal@smart-caller.ai">legal@smart-caller.ai</a></li>
                            <li>Adresse : Smart Caller SAS, Paris, France</li>
                        </ul>
                    </section>
                </div>

                <div className="legal-footer">
                    <p>© {new Date().getFullYear()} Smart Caller. Tous droits réservés.</p>
                </div>
            </div>
        </div>
    );
};

export default Terms;

