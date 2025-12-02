import React from 'react';
import { Rocket } from 'lucide-react';

const CreateCampaign = () => {
    return (
        <div className="page-container">
            <div className="page-header">
                <div className="header-content">
                    <h1 className="page-title">Créer une campagne</h1>
                    <p className="page-subtitle">Configurez et lancez vos campagnes de prospection.</p>
                </div>
                <div className="header-actions">
                    <button className="btn-primary">
                        <Rocket size={18} />
                        Lancer la campagne
                    </button>
                </div>
            </div>

            <div className="content-grid">
                <div className="glass-panel p-6">
                    <div className="text-center py-12">
                        <Rocket size={48} className="mx-auto text-accent mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Nouvelle Campagne</h3>
                        <p className="text-muted max-w-md mx-auto">
                            Cette fonctionnalité est en cours de développement. Bientôt, vous pourrez importer des contacts et lancer des campagnes multicanales.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateCampaign;
