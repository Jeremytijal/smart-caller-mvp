import React, { useState, useMemo } from 'react';
import { Calendar, Clock, ChevronLeft, ChevronRight, X } from 'lucide-react';

/**
 * CALENDAR PICKER - Sélecteur de créneaux sandbox
 * 
 * Simule une interface de prise de RDV type Calendly
 * Créneaux générés dynamiquement (prochains jours ouvrés)
 */

const CalendarPicker = ({ onSelect, onDismiss }) => {
    const [selectedDay, setSelectedDay] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);

    // Generate available days (next 5 business days)
    const availableDays = useMemo(() => {
        const days = [];
        const today = new Date();
        let currentDay = new Date(today);
        
        // Start from tomorrow
        currentDay.setDate(currentDay.getDate() + 1);
        
        while (days.length < 5) {
            const dayOfWeek = currentDay.getDay();
            // Skip weekends (0 = Sunday, 6 = Saturday)
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                days.push({
                    date: new Date(currentDay),
                    dayName: currentDay.toLocaleDateString('fr-FR', { weekday: 'short' }),
                    dayNumber: currentDay.getDate(),
                    monthName: currentDay.toLocaleDateString('fr-FR', { month: 'short' }),
                    fullLabel: currentDay.toLocaleDateString('fr-FR', { 
                        weekday: 'long', 
                        day: 'numeric', 
                        month: 'long' 
                    })
                });
            }
            currentDay.setDate(currentDay.getDate() + 1);
        }
        
        return days;
    }, []);

    // Available time slots
    const timeSlots = [
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
    ];

    // Randomly "book" some slots for realism
    const bookedSlots = useMemo(() => {
        const booked = new Set();
        timeSlots.forEach(slot => {
            if (Math.random() > 0.7) {
                booked.add(slot);
            }
        });
        return booked;
    }, []);

    const handleConfirm = () => {
        if (selectedDay && selectedTime) {
            onSelect({
                day: selectedDay.fullLabel,
                time: selectedTime,
                date: selectedDay.date.toISOString()
            });
        }
    };

    return (
        <div className="calendar-picker">
            {/* Header */}
            <div className="calendar-header">
                <div className="calendar-title">
                    <Calendar size={18} />
                    <span>Choisissez un créneau</span>
                </div>
                <button className="calendar-close" onClick={onDismiss}>
                    <X size={18} />
                </button>
            </div>

            {/* Day Selection */}
            <div className="calendar-days">
                {availableDays.map((day, index) => (
                    <button
                        key={index}
                        className={`day-button ${selectedDay?.dayNumber === day.dayNumber ? 'selected' : ''}`}
                        onClick={() => {
                            setSelectedDay(day);
                            setSelectedTime(null);
                        }}
                    >
                        <span className="day-name">{day.dayName}</span>
                        <span className="day-number">{day.dayNumber}</span>
                        <span className="month-name">{day.monthName}</span>
                    </button>
                ))}
            </div>

            {/* Time Selection */}
            {selectedDay && (
                <div className="calendar-times">
                    <div className="times-header">
                        <Clock size={16} />
                        <span>Horaires disponibles - {selectedDay.fullLabel}</span>
                    </div>
                    <div className="times-grid">
                        {timeSlots.map((slot, index) => {
                            const isBooked = bookedSlots.has(slot);
                            return (
                                <button
                                    key={index}
                                    className={`time-button ${selectedTime === slot ? 'selected' : ''} ${isBooked ? 'booked' : ''}`}
                                    onClick={() => !isBooked && setSelectedTime(slot)}
                                    disabled={isBooked}
                                >
                                    {slot}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Confirm Button */}
            {selectedDay && selectedTime && (
                <div className="calendar-confirm">
                    <div className="confirm-summary">
                        <span>📅 {selectedDay.fullLabel}</span>
                        <span>🕐 {selectedTime}</span>
                    </div>
                    <button className="confirm-button" onClick={handleConfirm}>
                        Confirmer ce créneau
                    </button>
                </div>
            )}

            {/* Footer */}
            <div className="calendar-footer">
                <span>🔒 Simulation sandbox - Aucun RDV réel n'est créé</span>
            </div>
        </div>
    );
};

export default CalendarPicker;

