/**
 * RescueLink Emergency Family Contact Notification Service
 * Dispatches privacy-conscious emergency SMS/broadcast alerts to registered contacts.
 */

export const INITIAL_CONTACTS = {
    'W-042': [
        { name: 'Elena Mercer', relation: 'Spouse', phone: '+1 (555) 234-8901', notifyOnCritical: true }
    ],
    'W-011': [
        { name: 'John Connor', relation: 'Son', phone: '+1 (555) 987-6543', notifyOnCritical: true }
    ],
    'W-007': [
        { name: 'Eve Moneypenny', relation: 'Emergency Liaison', phone: '+44 20 7946 0912', notifyOnCritical: true }
    ]
};

export const dispatchFamilyEmergencyAlert = (workerId, workerName, zone, triggerType) => {
    const contacts = INITIAL_CONTACTS[workerId] || [
        { name: 'Designated Family Contact', relation: 'Next of Kin', phone: '+1 (555) 000-1122', notifyOnCritical: true }
    ];

    const timestamp = new Date().toLocaleTimeString();
    const notifications = contacts.map(c => ({
        recipient: `${c.name} (${c.relation})`,
        phone: c.phone,
        status: 'DISPATCHED_SIMULATED',
        timestamp,
        message: `RESCUELINK AUTOMATED SAFETY ALERT: Worker ${workerName} reported an incident (${triggerType}) in ${zone} at ${timestamp}. Rescue units have been deployed. Standard updates will follow.`
    }));

    return {
        success: true,
        isSimulated: true,
        notifications
    };
};
