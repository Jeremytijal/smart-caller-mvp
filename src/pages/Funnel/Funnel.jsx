import React, { useState, useCallback } from 'react';
import FunnelLanding from './FunnelLanding';
import FunnelDiagnostic from './FunnelDiagnostic';
import FunnelResult from './FunnelResult';
import FunnelSmsTest from './FunnelSmsTest';
import FunnelQualification from './FunnelQualification';
import './Funnel.css';

/**
 * FUNNEL META ADS - SMART CALLER
 * 
 * Structure :
 * 1. Landing (accroche)
 * 2. Diagnostic (qualification)
 * 3. Résultat personnalisé
 * 4. Test SMS sandbox
 * 5. Qualification finale + CTA démo
 */

const Funnel = () => {
    // Current step in the funnel
    const [step, setStep] = useState(1);
    
    // Diagnostic answers storage
    const [diagnosticData, setDiagnosticData] = useState({
        leadsPerMonth: null,
        responseTime: null,
        leadSource: null,
        teamSize: null,
        mainGoal: null
    });
    
    // User phone for SMS test
    const [userPhone, setUserPhone] = useState('');
    
    // SMS conversation history
    const [conversation, setConversation] = useState([]);
    
    // AI qualification result
    const [qualificationResult, setQualificationResult] = useState(null);

    // Calculate if user is qualified based on diagnostic
    const isQualified = useCallback(() => {
        const { leadsPerMonth, teamSize } = diagnosticData;
        // Qualified if: >= 50 leads/month OR team >= 1
        const leadsScore = ['50-200', '200-500', '500+'].includes(leadsPerMonth);
        const teamScore = ['1-2', '3-5', '5+'].includes(teamSize);
        return leadsScore || teamScore;
    }, [diagnosticData]);

    // Calculate estimated loss based on response time
    const calculateEstimatedLoss = useCallback(() => {
        const { leadsPerMonth, responseTime } = diagnosticData;
        
        const leadsMap = {
            '<50': 30,
            '50-200': 125,
            '200-500': 350,
            '500+': 750
        };
        
        const lossRateMap = {
            '<5min': 0.05,
            '5-30min': 0.15,
            '30min-2h': 0.35,
            '+2h': 0.60
        };
        
        const avgLeads = leadsMap[leadsPerMonth] || 100;
        const lossRate = lossRateMap[responseTime] || 0.25;
        const avgDealValue = 500; // Valeur moyenne estimée par deal
        
        return Math.round(avgLeads * lossRate * avgDealValue * 12); // Perte annuelle
    }, [diagnosticData]);

    // Navigation functions
    const goToStep = (newStep) => setStep(newStep);
    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => Math.max(1, prev - 1));

    // Update diagnostic data
    const updateDiagnostic = (field, value) => {
        setDiagnosticData(prev => ({ ...prev, [field]: value }));
    };

    // Add message to conversation
    const addMessage = (role, content) => {
        setConversation(prev => [...prev, { role, content, timestamp: new Date() }]);
    };

    // Render current step
    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <FunnelLanding 
                        onStart={() => nextStep()} 
                    />
                );
            case 2:
                return (
                    <FunnelDiagnostic 
                        data={diagnosticData}
                        onUpdate={updateDiagnostic}
                        onComplete={() => nextStep()}
                        onBack={() => prevStep()}
                    />
                );
            case 3:
                return (
                    <FunnelResult 
                        data={diagnosticData}
                        estimatedLoss={calculateEstimatedLoss()}
                        onTestSms={() => nextStep()}
                        onBack={() => prevStep()}
                    />
                );
            case 4:
                return (
                    <FunnelSmsTest 
                        phone={userPhone}
                        setPhone={setUserPhone}
                        conversation={conversation}
                        addMessage={addMessage}
                        onComplete={(result) => {
                            setQualificationResult(result);
                            nextStep();
                        }}
                        onBack={() => prevStep()}
                    />
                );
            case 5:
                return (
                    <FunnelQualification 
                        diagnosticData={diagnosticData}
                        conversation={conversation}
                        qualificationResult={qualificationResult}
                        isQualified={isQualified()}
                        onBookDemo={() => {
                            // Redirect to Calendly with UTM params
                            const params = new URLSearchParams({
                                utm_source: 'meta_ads',
                                utm_medium: 'funnel',
                                utm_campaign: 'sms_test',
                                leads: diagnosticData.leadsPerMonth,
                                team: diagnosticData.teamSize
                            });
                            window.open(`https://zcal.co/i/CkMTM7p_?${params.toString()}`, '_blank');
                        }}
                        onBack={() => prevStep()}
                    />
                );
            default:
                return <FunnelLanding onStart={() => setStep(1)} />;
        }
    };

    return (
        <div className="funnel-container">
            {/* Progress indicator (hidden on step 1) */}
            {step > 1 && step < 5 && (
                <div className="funnel-progress">
                    <div className="progress-bar">
                        <div 
                            className="progress-fill" 
                            style={{ width: `${((step - 1) / 4) * 100}%` }}
                        />
                    </div>
                    <span className="progress-text">Étape {step - 1}/4</span>
                </div>
            )}
            
            {renderStep()}
        </div>
    );
};

export default Funnel;

