import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import './Legal.css';

const Privacy = () => {
    return (
        <div className="legal-page">
            <div className="legal-container">
                <Link to="/signup" className="back-link">
                    <ArrowLeft size={18} />
                    Retour
                </Link>

                <div className="legal-header">
                    <div className="legal-icon privacy">
                        <Shield size={32} />
                    </div>
                    <h1>Politique de Confidentialité</h1>
                    <p className="legal-subtitle">Dernière mise à jour : 6 décembre 2024</p>
                </div>

                <div className="legal-content">
                    <section className="intro-section">
                        <p>
                            Chez Smart Caller, la protection de vos données personnelles est une priorité. Cette politique 
                            de confidentialité explique comment nous collectons, utilisons et protégeons vos informations 
                            conformément au Règlement Général sur la Protection des Données (RGPD).
                        </p>
                    </section>

                    <section>
                        <h2>1. Responsable du traitement</h2>
                        <p>
                            Le responsable du traitement des données est :
                        </p>
                        <div className="info-box">
                            <p><strong>Smart Caller SAS</strong></p>
                            <p>Paris, France</p>
                            <p>Email : <a href="mailto:privacy@smart-caller.ai">privacy@smart-caller.ai</a></p>
                        </div>
                    </section>

                    <section>
                        <h2>2. Données collectées</h2>
                        
                        <h3>2.1 Données de compte</h3>
                        <p>Lors de votre inscription, nous collectons :</p>
                        <ul>
                            <li>Nom et prénom</li>
                            <li>Adresse email professionnelle</li>
                            <li>Mot de passe (chiffré)</li>
                            <li>Informations de facturation</li>
                        </ul>

                        <h3>2.2 Données d'utilisation</h3>
                        <p>Nous collectons automatiquement :</p>
                        <ul>
                            <li>Logs de connexion et d'activité</li>
                            <li>Statistiques d'utilisation du Service</li>
                            <li>Informations techniques (navigateur, appareil)</li>
                        </ul>

                        <h3>2.3 Données des leads (en tant que sous-traitant)</h3>
                        <p>Dans le cadre du Service, vous nous transmettez les données de vos leads :</p>
                        <ul>
                            <li>Nom et coordonnées (téléphone, email)</li>
                            <li>Historique des conversations SMS</li>
                            <li>Scores de qualification</li>
                            <li>Toute information transmise via vos formulaires</li>
                        </ul>
                        <p className="note">
                            <strong>Note :</strong> Pour ces données, vous restez responsable du traitement et Smart Caller 
                            agit en tant que sous-traitant au sens du RGPD.
                        </p>
                    </section>

                    <section>
                        <h2>3. Finalités du traitement</h2>
                        <p>Vos données sont traitées pour :</p>
                        <table className="purposes-table">
                            <thead>
                                <tr>
                                    <th>Finalité</th>
                                    <th>Base légale</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Fourniture du Service (qualification de leads)</td>
                                    <td>Exécution du contrat</td>
                                </tr>
                                <tr>
                                    <td>Gestion de votre compte</td>
                                    <td>Exécution du contrat</td>
                                </tr>
                                <tr>
                                    <td>Facturation et paiement</td>
                                    <td>Obligation légale</td>
                                </tr>
                                <tr>
                                    <td>Amélioration du Service et de l'IA</td>
                                    <td>Intérêt légitime</td>
                                </tr>
                                <tr>
                                    <td>Communications commerciales</td>
                                    <td>Consentement</td>
                                </tr>
                                <tr>
                                    <td>Prévention de la fraude</td>
                                    <td>Intérêt légitime</td>
                                </tr>
                            </tbody>
                        </table>
                    </section>

                    <section>
                        <h2>4. Partage des données</h2>
                        <p>Vos données peuvent être partagées avec :</p>
                        <ul>
                            <li><strong>Twilio</strong> : envoi et réception de SMS</li>
                            <li><strong>OpenAI</strong> : traitement IA des conversations (données anonymisées)</li>
                            <li><strong>Stripe</strong> : traitement des paiements</li>
                            <li><strong>Supabase</strong> : hébergement de la base de données (UE)</li>
                        </ul>
                        <p>
                            Ces sous-traitants sont soumis à des obligations contractuelles strictes et respectent le RGPD.
                        </p>
                    </section>

                    <section>
                        <h2>5. Transferts internationaux</h2>
                        <p>
                            Certains de nos sous-traitants sont situés aux États-Unis. Ces transferts sont encadrés par 
                            des Clauses Contractuelles Types (CCT) approuvées par la Commission Européenne.
                        </p>
                    </section>

                    <section>
                        <h2>6. Durée de conservation</h2>
                        <table className="retention-table">
                            <thead>
                                <tr>
                                    <th>Type de données</th>
                                    <th>Durée de conservation</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Données de compte</td>
                                    <td>Durée de l'abonnement + 3 ans</td>
                                </tr>
                                <tr>
                                    <td>Données de leads</td>
                                    <td>Durée de l'abonnement + 1 an</td>
                                </tr>
                                <tr>
                                    <td>Historique des conversations</td>
                                    <td>2 ans</td>
                                </tr>
                                <tr>
                                    <td>Données de facturation</td>
                                    <td>10 ans (obligation légale)</td>
                                </tr>
                                <tr>
                                    <td>Logs techniques</td>
                                    <td>1 an</td>
                                </tr>
                            </tbody>
                        </table>
                    </section>

                    <section>
                        <h2>7. Sécurité des données</h2>
                        <p>Nous mettons en œuvre des mesures de sécurité appropriées :</p>
                        <ul>
                            <li>Chiffrement des données en transit (TLS) et au repos</li>
                            <li>Authentification sécurisée et mots de passe hashés</li>
                            <li>Accès restreint aux données (principe du moindre privilège)</li>
                            <li>Sauvegardes régulières et plan de reprise d'activité</li>
                            <li>Audits de sécurité réguliers</li>
                        </ul>
                    </section>

                    <section>
                        <h2>8. Vos droits</h2>
                        <p>Conformément au RGPD, vous disposez des droits suivants :</p>
                        
                        <div className="rights-grid">
                            <div className="right-card">
                                <h4>📋 Droit d'accès</h4>
                                <p>Obtenir une copie de vos données personnelles</p>
                            </div>
                            <div className="right-card">
                                <h4>✏️ Droit de rectification</h4>
                                <p>Corriger vos données inexactes ou incomplètes</p>
                            </div>
                            <div className="right-card">
                                <h4>🗑️ Droit à l'effacement</h4>
                                <p>Demander la suppression de vos données</p>
                            </div>
                            <div className="right-card">
                                <h4>⏸️ Droit à la limitation</h4>
                                <p>Limiter le traitement de vos données</p>
                            </div>
                            <div className="right-card">
                                <h4>📦 Droit à la portabilité</h4>
                                <p>Recevoir vos données dans un format structuré</p>
                            </div>
                            <div className="right-card">
                                <h4>🚫 Droit d'opposition</h4>
                                <p>Vous opposer au traitement de vos données</p>
                            </div>
                        </div>

                        <p>
                            Pour exercer ces droits, contactez-nous à : <a href="mailto:privacy@smart-caller.ai">privacy@smart-caller.ai</a>
                        </p>
                        <p>
                            Vous pouvez également introduire une réclamation auprès de la CNIL : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">www.cnil.fr</a>
                        </p>
                    </section>

                    <section>
                        <h2>9. Cookies</h2>
                        <p>
                            Notre site utilise des cookies essentiels au fonctionnement du Service. Ces cookies ne 
                            nécessitent pas votre consentement. Nous n'utilisons pas de cookies publicitaires ou de tracking.
                        </p>
                        <table className="cookies-table">
                            <thead>
                                <tr>
                                    <th>Cookie</th>
                                    <th>Finalité</th>
                                    <th>Durée</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>sb-auth-token</td>
                                    <td>Authentification utilisateur</td>
                                    <td>Session</td>
                                </tr>
                                <tr>
                                    <td>smartcaller_tour</td>
                                    <td>Mémoriser le guide interactif</td>
                                    <td>1 an</td>
                                </tr>
                            </tbody>
                        </table>
                    </section>

                    <section>
                        <h2>10. Liste noire et opt-out</h2>
                        <p>
                            Smart Caller intègre une fonctionnalité de liste noire conforme au RGPD. Lorsqu'un destinataire 
                            répond "STOP" ou tout mot-clé similaire, son numéro est automatiquement ajouté à la liste noire 
                            et ne recevra plus aucun message.
                        </p>
                    </section>

                    <section>
                        <h2>11. Modifications</h2>
                        <p>
                            Nous pouvons mettre à jour cette politique de confidentialité. En cas de modification 
                            substantielle, vous serez informé par email ou via l'interface du Service.
                        </p>
                    </section>

                    <section>
                        <h2>12. Contact DPO</h2>
                        <p>
                            Pour toute question relative à la protection de vos données :
                        </p>
                        <div className="info-box">
                            <p><strong>Délégué à la Protection des Données</strong></p>
                            <p>Email : <a href="mailto:dpo@smart-caller.ai">dpo@smart-caller.ai</a></p>
                        </div>
                    </section>
                </div>

                <div className="legal-footer">
                    <p>© {new Date().getFullYear()} Smart Caller. Tous droits réservés.</p>
                    <p>
                        <Link to="/terms">Conditions d'utilisation</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Privacy;

