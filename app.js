// Virginia Ambulance Truck Check App
// Local storage-based inspection tool

// Generate a cryptographically strong unique ID
function generateId() {
    // Use crypto API if available, fallback to Math.random
    const array = new Uint32Array(1);
    if (window.crypto && typeof window.crypto.getRandomValues === 'function') {
        window.crypto.getRandomValues(array);
        return 'id_' + array[0].toString(36);
    }
    return '_' + Math.random().toString(36).substr(2, 9);
}

// Format date for display
function formatDate(date) {
    return new Date(date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Checklist sections and items based on Virginia Department of Health Transport Vehicle Standards
const CHECKLIST_SECTIONS = [
    {
        id: 'general',
        title: 'General',
        items: [
            'Current State Inspection',
            'Exterior Clean',
            'Interior Clean',
            'Current EMS Permit',
            'Seatbelts for All',
            'Meds protected from climate extremes'
        ]
    },
    {
        id: 'bls-equipment',    
        title: 'BLS Equipment',
        items: [
            'AED with set of pads (2) or combination device with manual option',
            'Pocket masks (2)',
            'O/P Airways (6) - Sizes 0-5 (1 each)',
            'N/P Airways (4) - Various sizes',
            'Soluble lubricant',
            'Adult BVM with Adult/Peds Mask (1 each)',
            'Infant BVM with Infant Mask',
            'Oxygen Apparatus - 1150 psi minimum',
            'Adult High Concentration (NRB) Masks (4)',
            'Peds High Concentration (NRB) Masks (4)',
            'Adult Nasal Cannulae (4)',
            'Child Nasal Cannulae (4)'
        ]
    },
    {
        id: 'dressing-supplies',
        title: 'Dressing/Supplies',
        items: [
            'Durable First Aid Kit',
            'Trauma Dressings 8x10 (4)',
            'Sterile 4x4s (24)',
            'Occlusive Dressings 3x8 (4)',
            'Assorted Roller Gauze (12)',
            'Cravats (10)',
            'Tape 1" and 2" (4 rolls total)',
            'Trauma Scissors (1)',
            'Emesis Basins (2)',
            'NS for Irrigation (4L)',
            'Alcohol preps (12)',
            'Exam Gloves - 10 pairs per size',
            'Disposable Gowns (4)',
            'Face-shield/Eyewear (4)',
            'Infectious Waste Bags (4)'
        ]
    },
    {
        id: 'warning-tools',
        title: 'Warning Devices/Tools',
        items: [
            'Adjustable Wrench, 10" (1)',
            'Standard Screwdriver (1)',
            'Phillips Screwdriver (1)',
            'Center Punch (1)',
            'Flares or Cones/Triangles (3)',
            'Current USDOT ERG (1)',
            'Emergency Lights All Sides',
            'Minimum 2 Flashing in Grill',
            'Audible Warning Device',
            'Agency Markings with 3" Min. Lettering',
            '4" Min. Reflective Band',
            'D-Cell Flashlight (1)',
            'ABC Extinguisher 5# (2)',
            'Traffic safety apparel (2)',
            'Sharps Container',
            'No Smoking Sign'
        ]
    },
    {
        id: 'patient-assessment',
        title: 'Patient Assessment Equipment',
        items: [
            'Adult Stethoscope (2)',
            'Peds Stethoscope (1)',
            'B/P Cuffs: Child, Adult, Large (1 each)',
            'Penlight (1)',
            'Current Medical Protocols (1)',
            'Pocket Mask (2)',
            'O/P Airways (6) - Sizes 0-5 (1 each)',
            'N/P Airways (4) - Various sizes',
            'Adult BVM with Adult/Peds Mask (1 each)',
            'Infant BVM with Infant Mask',
            'Oxygen Apparatus - 1150 psi minimum',
            'Adult High Concentration (NRB) Masks (4)',
            'Peds High Concentration (NRB) Masks (4)',
            'Adult Nasal Cannulae (4)',
            'Child Nasal Cannulae (4)'
        ]
    },
    {
        id: 'suction',
        title: 'Suction Equipment',
        items: [
            'Battery Powered Portable Suction',
            'Suction Catheters: Rigid tonsil tip',
            'FR18, FR14, FR8 & FR6 (2 each)'
        ]
    },
    {
        id: 'splinting',
        title: 'Splinting',
        items: [
            'Rigid Collars (SA, MA, LA & Peds - 3 each)',
            'Traction splint with ankle hitch (adult and pediatric)',
            'Padded board splint upper extremity (2)',
            'Padded board splint lower extremity (2)',
            'Backboard (2)',
            'Short spine board (1)',
            'Pediatric immobilization device (1)',
            'Cervical immobilization device set (2)'
        ]
    },
    {
        id: 'obstetrical',
        title: 'Obstetrical Kit',
        items: [
            'Pair of sterile surgical gloves (2)',
            'Scissors or other cutting instrument (1)',
            'Umbilical cord ties (4)',
            'Sanitary pads (1)',
            'Cloth/Disposable hand towels (2)',
            'Soft tip bulb syringe (1)'
        ]
    },
    {
        id: 'linens',
        title: 'Linens',
        items: [
            'Towels (2)',
            'Blankets (2)',
            'Pillows (2)',
            'Pillow cases (2)',
            'Sheets (4)',
            'Male Urinal (1)',
            'Bedpan and toilet paper (1)'
        ]
    },
    {
        id: 'emt-enhanced',
        title: 'EMT-Enhanced Equipment',
        items: [
            'Lockable Drug Compartment',
            'Drug Kit (EMT-E)',
            'Assorted IV, IM, SQ Delivery Devices',
            'Supra-glottic Airway (1)',
            'Complete ETT Kit (1)'
        ]
    },
    {
        id: 'sign-off',
        title: 'Inspection Sign-Off',
        items: [
            'Inspector Name',
            'Signature',
            'Date'
        ],
        isSignOff: true
    }
];

// Initialize default checklist items
function initializeDefaultItems() {
    const defaultItems = {};
    
    CHECKLIST_SECTIONS.forEach(section => {
        defaultItems[section.id] = {
            title: section.title,
            items: section.items.map(item => ({
                id: generateId(),
                text: item,
                completed: false
            }))
        };
    });
    
    return defaultItems;
}

const STORAGE_KEY = 'truckCheckInspections';
const DEFAULT_CHECKLIST_ITEMS = initializeDefaultItems();

// DOM Elements
const checklistSections = document.getElementById('checklist-sections');
const inspectorNameInput = document.getElementById('inspector-name');
const unitNumberInput = document.getElementById('unit-number');
const saveBtn = document.getElementById('save-btn');
const newInspectionBtn = document.getElementById('new-inspection-btn');
const printBtn = document.getElementById('print-btn');
const savedChecksList = document.getElementById('saved-checks-list');
const inspectionTimerEl = document.getElementById('inspection-timer');

// Timer variables
let startTime = 0;
let elapsedTime = 0;
let timerInterval = null;
let isTimerRunning = false;
let isTimerInitialized = false; // Track if timer has been started by user interaction

// State
let signaturePad = null;
let currentInspection = {
    id: generateId(),
    unitNumber: '',
    inspectorName: '',
    date: new Date().toISOString(),
    signature: null,
    items: JSON.parse(JSON.stringify(DEFAULT_CHECKLIST_ITEMS))
};

// Format time in HH:MM:SS
function formatTime(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return [
        hrs.toString().padStart(2, '0'),
        mins.toString().padStart(2, '0'),
        secs.toString().padStart(2, '0')
    ].join(':');
}

// Start the inspection timer
function startTimer(force = false) {
    if (!isTimerInitialized && !force) {
        // Timer will be started on first interaction
        return;
    }
    
    if (isTimerRunning) return;
    
    isTimerRunning = true;
    isTimerInitialized = true;
    startTime = Date.now() - (elapsedTime * 1000);
    
    // Add animation class
    const timerElement = document.querySelector('.timer-display');
    if (timerElement) {
        timerElement.classList.add('running');
        // Remove the class after animation completes
        setTimeout(() => {
            timerElement.classList.remove('running');
        }, 2000);
    }
    
    timerInterval = setInterval(() => {
        elapsedTime = Math.floor((Date.now() - startTime) / 1000);
        if (inspectionTimerEl) {
            inspectionTimerEl.textContent = formatTime(elapsedTime);
        }
    }, 1000);
}

// Pause the inspection timer and return current time
function pauseTimer() {
    stopTimer();
    return elapsedTime;
}

// Stop the inspection timer
function stopTimer() {
    clearInterval(timerInterval);
    isTimerRunning = false;
    return elapsedTime;
}

// Reset the inspection timer
function resetTimer() {
    // Stop and clear any running timer
    stopTimer();
    
    // Reset timer state
    elapsedTime = 0;
    startTime = 0;
    isTimerRunning = false;
    isTimerInitialized = false;
    
    // Remove any running animation
    const timerElement = document.querySelector('.timer-display');
    if (timerElement) {
        timerElement.classList.remove('running');
    }
    
    // Update the display
    if (inspectionTimerEl) {
        inspectionTimerEl.textContent = '00:00:00';
    }
    
    console.log('Timer has been reset');
    return true;
}

// Initialize a default inspection object
function initializeDefaultInspection() {
    return {
        id: generateId(),
        unitNumber: '',
        inspectorName: '',
        date: new Date().toISOString(),
        signature: null,
        items: JSON.parse(JSON.stringify(DEFAULT_CHECKLIST_ITEMS))
    };
}

// Cleanup function to prevent memory leaks
function cleanupApp() {
    // Clear any active intervals or timeouts
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    // Remove event listeners
    const events = ['click', 'input', 'change', 'submit'];
    events.forEach(event => {
        document.removeEventListener(event, handleGlobalEvent);
    });
    
    // Clean up signature pad if it exists
    if (signaturePad) {
        signaturePad.off();
    }
}

// Global event handler for better memory management
function handleGlobalEvent(event) {
    // Handle global events here if needed
    console.debug('Global event:', event.type, event.target);
}

// Initialize the app
function initApp() {
    // Set up global error handler
    window.onerror = function(message, source, lineno, colno, error) {
        console.error('Global error:', { message, source, lineno, colno, error });
        // Show user-friendly error message
        alert('An unexpected error occurred. Please refresh the page and try again.');
        return true; // Prevent default error handling
    };
    
    try {
        // Initialize the signature pad first
        initSignaturePad();
        
        // Set up event listeners
        setupEventListeners();
        
        // Update the current date display
        updateCurrentDate();
        
        // Load any saved inspection (this will set up currentInspection)
        loadChecklist();
        
        // Make sure currentInspection is properly initialized
        if (!currentInspection || !currentInspection.items) {
            currentInspection = initializeDefaultInspection();
        }
        
        // Render the checklist
        renderChecklist();
        
        // Don't start the timer here - it will start on first interaction
        // The timer will show 00:00:00 until first interaction
        
        // Update the save button state
        updateSaveButtonState();
        
        console.log('App initialized successfully');
    } catch (error) {
        console.error('Error initializing app:', error);
        alert('An error occurred while initializing the application. Please try refreshing the page.');
    }    if (document.readyState === 'complete' || document.readyState === 'interactive') {
            // Call renderSavedChecks after a short delay to ensure DOM is ready
            setTimeout(renderSavedChecks, 100);
        } else {
            document.addEventListener('DOMContentLoaded', renderSavedChecks);
        }
}

// Make init available globally
window.init = initApp;

// Make loadInspectionIntoForm available globally
if (!window.loadInspectionIntoForm) {
    window.loadInspectionIntoForm = function(inspectionData) {
        if (!inspectionData) return;
        
        console.log('Loading inspection data:', inspectionData);
        
        // Reset the form first
        resetInspectionForm();
        
        // Update basic form fields
        const unitNumberInput = document.getElementById('unit-number');
        if (unitNumberInput) {
            unitNumberInput.value = inspectionData.unitNumber || '';
            // Trigger input event to update any dependent UI
            unitNumberInput.dispatchEvent(new Event('input'));
        }
        
        const inspectorNameInput = document.getElementById('inspector-name');
        if (inspectorNameInput) {
            inspectorNameInput.value = inspectionData.inspectorName || '';
            // Trigger input event to update any dependent UI
            inspectorNameInput.dispatchEvent(new Event('input'));
        }
        
        // Update current inspection data
        // Process checklist data if it exists
        if (inspectionData.checklist) {
            console.log('Processing checklist data:', inspectionData.checklist);
            
            // Initialize or reset currentInspection
            window.currentInspection = window.currentInspection || {};
            window.currentInspection.items = {}; // Reset items to ensure clean state
            
            // Process each section in the saved checklist
            Object.entries(inspectionData.checklist).forEach(([sectionId, sectionData]) => {
                if (!sectionData) return;
                
                // Initialize section data
                window.currentInspection.items[sectionId] = {
                    title: sectionData.title || sectionId,
                    items: []
                };
                
                // Process items if they exist
                if (sectionData.items && Array.isArray(sectionData.items) && sectionData.items.length > 0) {
                    // Process the saved items
                    window.currentInspection.items[sectionId].items = sectionData.items.map(item => {
                        if (!item) return null;
                        return {
                            id: item.id || generateId(),
                            text: item.text || '',
                            completed: !!item.completed
                        };
                    }).filter(Boolean); // Remove any null entries
                    
                    console.log(`Processed ${window.currentInspection.items[sectionId].items.length} items for section ${sectionId}`);
                } else {
                    // If no items in saved data, try to use default items from CHECKLIST_SECTIONS
                    const defaultSection = CHECKLIST_SECTIONS && CHECKLIST_SECTIONS.find(s => s.id === sectionId);
                    if (defaultSection) {
                        window.currentInspection.items[sectionId].items = defaultSection.items.map(text => ({
                            id: generateId(),
                            text: text,
                            completed: false
                        }));
                        console.log(`Used default items for section ${sectionId}`);
                    } else {
                        console.warn(`No default items found for section ${sectionId}`);
                        window.currentInspection.items[sectionId].items = [];
                    }
                }
            });
            
            console.log('Updated currentInspection with loaded data:', window.currentInspection);
            
            // Before rendering, ensure all sections from CHECKLIST_SECTIONS exist in currentInspection
            CHECKLIST_SECTIONS.forEach(section => {
                if (!window.currentInspection.items[section.id]) {
                    window.currentInspection.items[section.id] = {
                        title: section.title,
                        items: section.items.map(text => ({
                            id: generateId(),
                            text: text,
                            completed: false
                        }))
                    };
                    console.log(`Added missing section from CHECKLIST_SECTIONS: ${section.id}`);
                }
            });
            
            // Force re-render of the checklist with the updated data
            renderChecklist();
            
            // After rendering, ensure checkboxes reflect the loaded state
            Object.entries(window.currentInspection.items).forEach(([sectionId, section]) => {
                if (!section || !section.items) return;
                
                section.items.forEach(item => {
                    if (!item || !item.id) return;
                    
                    // Use a small delay to ensure DOM is fully rendered
                    setTimeout(() => {
                        const checkbox = document.querySelector(`#item-${item.id}`);
                        if (checkbox) {
                            checkbox.checked = !!item.completed;
                            const listItem = checkbox.closest('.checklist-item');
                            if (listItem) {
                                listItem.classList.toggle('completed', !!item.completed);
                            }
                        }
                    }, 50);
                });
            });
            
            console.log('Finished processing checklist items');
        }
        
        // Update signature if available
        if (inspectionData.signature && signaturePad) {
            signaturePad.fromDataURL(inspectionData.signature);
        }
        
        // Update current inspection data with any remaining properties
        if (window.currentInspection) {
            window.currentInspection = {
                ...window.currentInspection,
                ...inspectionData,
                id: inspectionData.id || generateId(), // Keep existing ID or generate new one
                // Preserve the items structure we just updated
                items: window.currentInspection.items || {}
            };
        }
        
        // Update the save button state
        if (window.updateSaveButtonState) {
            window.updateSaveButtonState();
        }
        
        // Scroll to top
        window.scrollTo(0, 0);
        
        // Show success message
        if (inspectionData.unitNumber) {
            showNotification(`Loaded inspection for ${inspectionData.unitNumber}`, 'success');
        } else {
            showNotification('Inspection loaded successfully', 'success');
        }
    };
}

// Initialize the signature pad
function initSignaturePad() {
    const canvas = document.getElementById('signature-canvas');
    if (!canvas) {
        return;
    }
    
    // Set canvas size
    function resizeCanvas() {
        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        const rect = canvas.getBoundingClientRect();
        
        // Set the canvas dimensions to match its display size
        canvas.style.width = '100%';
        canvas.style.height = '200px';
        
        // Set the internal canvas size (in pixels) accounting for device pixel ratio
        canvas.width = rect.width * ratio;
        canvas.height = 200 * ratio;
        
        // Scale the context to ensure crisp drawing on high DPI displays
        const ctx = canvas.getContext('2d');
        ctx.scale(ratio, ratio);
    }
    
    // Initial resize
    resizeCanvas();
    
    // Re-resize when the window is resized
    window.addEventListener('resize', function() {
        // Save any existing signature data
        const data = signaturePad ? signaturePad.toData() : [];
        
        // Resize the canvas
        resizeCanvas();
        
        // Restore the signature data if it exists
        if (signaturePad && data.length > 0) {
            signaturePad.fromData(data);
        }
    });
    
    // Initialize signature pad with options
    signaturePad = new SignaturePad(canvas, {
        backgroundColor: 'rgb(255, 255, 255)',
        penColor: 'rgb(0, 0, 0)',
        minWidth: 0.5,
        maxWidth: 2.5,
        throttle: 0, // No throttling for better touch response
        velocityFilterWeight: 0.7
    });
    
    // Add event handlers
    if (signaturePad) {
        signaturePad.addEventListener('endStroke', () => {
            currentSignature = signaturePad.toDataURL();
            updateSaveButtonState();
            updateSignaturePreview();
        });
    }
    
    // Add direct event listeners for debugging
    const events = ['mousedown', 'mousemove', 'mouseup', 'touchstart', 'touchmove', 'touchend'];
    events.forEach(event => {
        canvas.addEventListener(event, function(e) {
            // Prevent default to avoid scrolling/zooming on touch devices
            if (event.startsWith('touch')) {
                e.preventDefault();
            }
            
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX || (e.touches && e.touches[0]?.clientX);
            const y = e.clientY || (e.touches && e.touches[0]?.clientY);
        }, { passive: false });
    });
    
    // Clear signature button - only set up once
    const clearButton = document.getElementById('clear-signature');
    if (clearButton) {
        clearButton.addEventListener('click', () => {
            if (signaturePad) {
                signaturePad.clear();
                currentSignature = null;
                updateSaveButtonState();
                updateSignaturePreview();
            }
        });
        // Initial state update
        updateSaveButtonState();
        updateSignaturePreview();
        
        resizeCanvas();
    }
    
    // Add touch device support
    if (window.PointerEvent) {
        // This prevents iOS from treating the signature pad as a scroll target
        canvas.addEventListener('pointerdown', function(e) {
            e.preventDefault();
            e.stopPropagation();
        });
    }
    
    // Update signature preview
    function updateSignaturePreview() {
        const preview = document.getElementById('signature-preview');
        if (preview) {
            if (currentSignature) {
                preview.innerHTML = `<img src="${currentSignature}" alt="Signature Preview">`;
            } else {
                preview.innerHTML = '<p>No signature provided</p>';
            }
        }
    }
    
    // Update save button state based on form validity
    function updateSaveButtonState() {
        try {
            const saveBtn = document.getElementById('save-btn');
            if (!saveBtn) {
                console.warn('Save button not found');
                return;
            }
            
            const unitNumber = document.getElementById('unit-number').value.trim();
            const inspectorName = document.getElementById('inspector-name').value.trim();
            const hasSignature = signaturePad && !signaturePad.isEmpty();
            
            // Check if at least one item is checked
            const hasCheckedItems = document.querySelectorAll('.checklist-item.completed').length > 0;
            
            // Enable save button only if all required fields are filled and at least one item is checked
            const isFormValid = unitNumber && 
                              inspectorName && 
                              hasSignature && 
                              hasCheckedItems;
            
            saveBtn.disabled = !isFormValid;
            
        } catch (error) {
            console.error('Error updating save button state:', error);
            if (saveBtn) saveBtn.disabled = true;
        }
    }
}

// Update the current date display
function updateCurrentDate() {
    const currentDateElement = document.getElementById('current-date');
    if (!currentDateElement) {
        console.error('Could not find current date element');
        return;
    }
    
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    };
    
    currentDateElement.textContent = now.toLocaleDateString('en-US', options);
}

// Load inspection from localStorage or use default
function loadChecklist() {
    // Initialize with default values first
    currentInspection = initializeDefaultInspection();
    
    if (typeof Storage === 'undefined') {
        console.error('LocalStorage is not supported in this browser');
        return currentInspection;
    }

    try {
        const savedInspection = localStorage.getItem(STORAGE_KEY);
        
        if (!savedInspection) {
            return currentInspection;
        }

        // Basic validation of stored data
        if (typeof savedInspection !== 'string' || savedInspection.trim() === '') {
            console.warn('Invalid saved inspection data format');
            return currentInspection;
        }

        let parsed;
        try {
            parsed = JSON.parse(savedInspection);
        } catch (e) {
            console.error('Failed to parse saved inspection:', e);
            return currentInspection;
        }
        
        // Validate parsed data structure
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            // Merge with default inspection
            currentInspection = {
                ...currentInspection,
                ...parsed,
                items: {
                    ...currentInspection.items,
                    ...(parsed.items || {})
                }
            };
            
            // Safely update form fields
            const nameInput = document.getElementById('inspector-name');
            const unitInput = document.getElementById('unit-number');
            
            if (nameInput && typeof currentInspection.inspectorName === 'string') {
                nameInput.value = currentInspection.inspectorName;
            }
            
            if (unitInput && typeof currentInspection.unitNumber === 'string') {
                unitInput.value = currentInspection.unitNumber;
            }
            
            // Restore signature if it exists and is valid
            if (currentInspection.signature && signaturePad && 
                typeof currentInspection.signature === 'string' && 
                currentInspection.signature.startsWith('data:image/')) {
                signaturePad.fromDataURL(currentInspection.signature);
            }
        }
    } catch (error) {
        console.error('Error loading inspection:', error);
    }
    
    return currentInspection;
}

// Helper function to validate inspection data
function validateInspectionData(data) {
    if (typeof data !== 'object' || data === null) {
        throw new Error('Invalid inspection data format');
    }
    
    // Add any additional validation rules here
    const requiredFields = ['id', 'unitNumber', 'inspectorName', 'date'];
    for (const field of requiredFields) {
        if (!(field in data)) {
            throw new Error(`Missing required field: ${field}`);
        }
    }
    
    return true;
}

// Show a notification message to the user
function showNotification(message, type = 'info') {
    // Remove any existing notifications
    const existingNotification = document.getElementById('notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.id = 'notification';
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Save current inspection to localStorage
function saveInspection(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    // Prevent multiple simultaneous saves
    const saveBtn = document.getElementById('save-btn');
    if (saveBtn && saveBtn.disabled) {
        return false;
    }
    
    try {
        // Pause the timer during save
        const currentTime = pauseTimer();
        
        // Get and validate form inputs
        const unitNumberEl = document.getElementById('unit-number');
        const inspectorNameEl = document.getElementById('inspector-name');
        
        if (!unitNumberEl || !inspectorNameEl) {
            throw new Error('Required form elements not found');
        }
        
        const unitNumber = (unitNumberEl.value || '').trim() || 'Unspecified';
        const inspectorName = (inspectorNameEl.value || '').trim() || 'Unspecified';
        
        // Check if signature exists
        if (!signaturePad || signaturePad.isEmpty()) {
            // Resume timer if signature is missing
            if (currentTime > 0) startTimer();
            throw new Error('Signature is required');
        }
        
        const signatureData = signaturePad.toDataURL();
        
        // Create inspection object with properly structured checklist
        const inspection = {
            id: generateId(),
            unitNumber,
            inspectorName,
            signature: signatureData,
            date: new Date().toISOString(),
            duration: currentTime, // Use the paused time
            checklist: {
                general: {
                    title: 'General',
                    items: []
                },
                exterior: {
                    title: 'Exterior',
                    items: []
                },
                interior: {
                    title: 'Interior',
                    items: []
                },
                equipment: {
                    title: 'Equipment',
                    items: []
                },
                'sign-off': {
                    title: 'Inspection Sign-Off',
                    items: []
                }
            }
        };
        
        // Collect all checklist items
        document.querySelectorAll('.checklist-section').forEach(section => {
            const sectionId = section.dataset.sectionId;
            const sectionTitle = section.querySelector('.checklist-section-header').textContent.trim();
            
            // Skip if sectionId is not in our checklist structure
            if (!inspection.checklist[sectionId]) {
                console.warn(`Unknown section ID: ${sectionId}`);
                return;
            }
            
            // Clear any existing items to avoid duplicates
            inspection.checklist[sectionId].items = [];
            
            // Get all checklist items in this section
            const items = section.querySelectorAll('.checklist-item');
            console.log(`Found ${items.length} items in section ${sectionId}`);
            
            items.forEach((item, index) => {
                const itemId = item.dataset.itemId || `item-${sectionId}-${index}`;
                const itemLabel = item.querySelector('label');
                const itemText = itemLabel ? itemLabel.textContent.trim() : `Item ${index + 1}`;
                const isCompleted = item.classList.contains('completed');
                
                // Log the item being added
                console.log(`Adding item to ${sectionId}:`, { itemId, text: itemText, completed: isCompleted });
                
                inspection.checklist[sectionId].items.push({
                    id: itemId,
                    text: itemText,
                    completed: isCompleted
                });
            });
            
            // Log the section after adding items
            console.log(`Section ${sectionId} items:`, inspection.checklist[sectionId].items);
            
            // Update the section title
            inspection.checklist[sectionId].title = sectionTitle;
        });
        
        // Save to localStorage
        const savedInspections = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        savedInspections.push(inspection);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(savedInspections));
        
        // Stop and reset the timer completely
        stopTimer();
        resetTimer();
        isTimerInitialized = false; // Reset the initialization flag
        
        // Reset the form
        resetInspectionForm();
        
        // Show success message with inspection details
        const successMessage = `✅ Inspection for Unit ${unitNumber} saved successfully!`;
        showNotification(successMessage, 'success');
        
        // Refresh the saved inspections list
        renderSavedChecks();
        
        // Update the save button state
        updateSaveButtonState();
        
        return true;
        
    } catch (error) {
        console.error('Error saving inspection:', error);
        showNotification(`❌ Error: ${error.message}`, 'error');
    } finally {
        // Always ensure the timer is running after save attempt
        if (!isTimerRunning && elapsedTime > 0) {
            startTimer();
        }
    }
}

// Reset the inspection form
function resetInspectionForm() {
    try {
        // Show confirmation dialog
        if (!confirm('Are you sure you want to start a new inspection? All unsaved changes will be lost.')) {
            return; // User cancelled the reset
        }
        
        // Clear form fields
        const unitNumberInput = document.getElementById('unit-number');
        const inspectorNameInput = document.getElementById('inspector-name');
        
        if (unitNumberInput) unitNumberInput.value = '';
        if (inspectorNameInput) inspectorNameInput.value = '';
        
        // Reset all checkboxes and update their visual state
        document.querySelectorAll('.checklist-item').forEach(item => {
            item.classList.remove('completed');
            const checkbox = item.querySelector('input[type="checkbox"]');
            if (checkbox) {
                checkbox.checked = false;
            }
        });
        
        // Reset section headers
        document.querySelectorAll('.checklist-section-header').forEach(header => {
            header.classList.remove('all-completed');
        });
        
        // Clear signature pad if it exists
        if (typeof signaturePad !== 'undefined' && signaturePad) {
            signaturePad.clear();
        }
        
        // Reset any active filters or search
        const searchInput = document.querySelector('.search-input');
        if (searchInput) searchInput.value = '';
        
        // Reset the current inspection data
        if (typeof currentInspection !== 'undefined') {
            currentInspection = {
                id: generateId(),
                items: {}
            };
        }
        
                // Update UI state
        updateSaveButtonState();
        
        // Reset the current inspection data
        if (typeof currentInspection !== 'undefined') {
            // Re-initialize the inspection with default items
            currentInspection = initializeDefaultInspection();
            
            // Re-render the checklist to ensure all items are properly reset
            renderChecklist();
        }
        
        // Reset the timer but don't start it automatically
        if (typeof resetTimer === 'function') {
            resetTimer();
            console.log('Timer reset, waiting for user interaction');
        }
        
        // Set up interaction listeners to start the timer
        const startTimerOnInteraction = () => {
            if (!isTimerInitialized) {
                console.log('Starting timer after first interaction');
                startTimer();
                // Remove the event listeners after first interaction
                document.removeEventListener('click', startTimerOnInteraction);
                document.removeEventListener('keydown', startTimerOnInteraction);
            }
        };
        
        // Listen for first interaction
        document.addEventListener('click', startTimerOnInteraction, { once: true });
        document.addEventListener('keydown', startTimerOnInteraction, { once: true });
        
        // Set focus to unit number field for better UX
        if (unitNumberInput) unitNumberInput.focus();
        
        console.log('Inspection form has been reset');
        
    } catch (error) {
        console.error('Error resetting inspection form:', error);
        alert('An error occurred while resetting the form. Please try again.');
    }
}

// Render the checklist with collapsible sections
function renderChecklist() {
    const sectionsContainer = document.getElementById('checklist-sections');
    
    if (!sectionsContainer) {
        return;
    }
    
    // Ensure we have a valid currentInspection object
    if (!currentInspection) {
        currentInspection = {
            id: generateId(),
            items: {}
        };
    }
    
    // Initialize items if needed
    if (!currentInspection.items) {
        currentInspection.items = {};
    }
    

        // Clear the container first
    sectionsContainer.innerHTML = '';
    
    // Render each section
    CHECKLIST_SECTIONS.forEach(section => {
        // Get or create section data
        if (!currentInspection.items[section.id]) {
            currentInspection.items[section.id] = {
                title: section.title,
                items: section.items.map(text => ({
                    id: generateId(),
                    text: text,
                    completed: false
                }))
            };
        }
        
        const sectionData = currentInspection.items[section.id];
        if (!sectionData) {
            console.error(`Failed to initialize section: ${section.id}`);
            return;
        }

        
        // Create section container
        const sectionElement = document.createElement('div');
        sectionElement.className = 'checklist-section';
        sectionElement.id = `section-${section.id}`;
        
        // Create section header
        const sectionHeader = document.createElement('div');
        sectionHeader.className = 'checklist-section-header';
        sectionHeader.textContent = section.title;
        
        // Create section body
        const sectionBody = document.createElement('div');
        sectionBody.className = 'checklist-section-body';
        
        // Create section content
        const sectionContent = document.createElement('div');
        sectionContent.className = 'checklist-section-content';
        
        // Handle sign-off section
        if (section.isSignOff) {
            const signOffContent = `
                <div class="signature-section">
                    <div class="form-group">
                        <label>Signature:</label>
                        <div id="signature-pad" class="signature-pad">
                            <div class="signature-pad--body">
                                <canvas id="signature-canvas"></canvas>
                            </div>
                            <div class="signature-pad--footer">
                                <button type="button" id="clear-signature" class="btn btn-clear">
                                    <span class="material-icons">clear</span> Clear
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            sectionContent.innerHTML = signOffContent;
            sectionBody.appendChild(sectionContent);
            sectionElement.appendChild(sectionHeader);
            sectionElement.appendChild(sectionBody);
            sectionsContainer.appendChild(sectionElement);
            
            // Add toggle functionality to the header
            sectionHeader.addEventListener('click', () => {
                sectionBody.classList.toggle('collapsed');
                sectionHeader.classList.toggle('collapsed');
                
                // Save the collapsed state
                if (sectionBody.classList.contains('collapsed')) {
                    expandedSections.delete(section.id);
                } else {
                    expandedSections.add(section.id);
                }
            });
            
            // Set initial collapsed state
            if (!expandedSections.has(section.id)) {
                sectionBody.classList.add('collapsed');
                sectionHeader.classList.add('collapsed');
            }
            
            // Initialize signature pad after adding to DOM
            if (typeof initSignaturePad === 'function') {
                initSignaturePad();
            }
            
            // Update date display
            updateCurrentDate();
            
            // Add event listeners for sign-off section
            document.getElementById('inspector-name')?.addEventListener('input', updateSaveButtonState);
            
            return; // Skip the rest of the section rendering
        }
        
        // Handle regular checklist items
        if (!sectionData.items || !Array.isArray(sectionData.items)) {
            console.error(`Invalid items array for section ${section.id}:`, sectionData.items);
            return;
        }
        
        
        sectionData.items.forEach((item, index) => {
            if (!item || !item.id || !item.text) {
                console.error(`Invalid item at index ${index} in section ${section.id}:`, item);
                return;
            }
            
            
            const itemElement = document.createElement('div');
            itemElement.className = `checklist-item ${item.completed ? 'completed' : ''}`;
            itemElement.dataset.itemId = item.id;
            
            itemElement.innerHTML = `
                <input type="checkbox" id="item-${item.id}" ${item.completed ? 'checked' : ''}>
                <label for="item-${item.id}">${item.text}</label>
            `;

            const checkbox = itemElement.querySelector('input[type="checkbox"]');
            if (checkbox) {
                checkbox.addEventListener('change', () => {
                        toggleItemComplete(section.id, item.id);
                });
            } else {
                console.error(`Could not find checkbox for item ${item.id}`);
            }
            
            sectionContent.appendChild(itemElement);
        });
        
        // Assemble the section
        sectionBody.appendChild(sectionContent);
        sectionElement.appendChild(sectionHeader);
        sectionElement.appendChild(sectionBody);
        sectionsContainer.appendChild(sectionElement);
        
        
                // Toggle section collapse/expand
        sectionHeader.addEventListener('click', () => {
            const wasCollapsed = sectionHeader.classList.contains('collapsed');
            
            // Update the expanded state tracking
            if (wasCollapsed) {
                expandedSections.add(section.id);
            } else {
                expandedSections.delete(section.id);
            }
            
            sectionHeader.classList.toggle('collapsed');
            sectionBody.classList.toggle('collapsed');
        });
        
        // Set initial collapsed state based on tracking
        const shouldCollapse = !expandedSections.has(section.id);
        sectionHeader.classList.toggle('collapsed', shouldCollapse);
        sectionBody.classList.toggle('collapsed', shouldCollapse);
        
        sectionBody.appendChild(sectionContent);
        sectionElement.appendChild(sectionHeader);
        sectionElement.appendChild(sectionBody);
        sectionsContainer.appendChild(sectionElement);
    });
    
    if (sectionsContainer.children.length === 0) {
        sectionsContainer.innerHTML = '<p>No sections available. Please check the console for errors.</p>';
    }
}

// Track expanded sections
const expandedSections = new Set();

// Toggle item completion status
function toggleItemComplete(sectionId, itemId) {
    try {
        // Start timer on first interaction if not already started
        if (!isTimerInitialized) {
            startTimer(true);
        }
        
        // Get the section from the items object
        const section = currentInspection.items[sectionId];
        if (!section) {
            console.error(`Section not found: ${sectionId}`);
            return;
        }
        
        // Ensure section.items is an array
        if (!Array.isArray(section.items)) {
            console.error(`Section items is not an array for section ${sectionId}:`, section.items);
            return;
        }
        
        // Find the item
        const item = section.items.find(i => i && i.id === itemId);
        if (!item) {
            console.error(`Item ${itemId} not found in section ${sectionId}`);
            return;
        }
        
        // Toggle the completed status
        item.completed = !item.completed;
        
        // Re-render the checklist to update the UI
        renderChecklist();
        
        // Update the save button state to indicate unsaved changes
        updateSaveButtonState();
        
        // Don't save here - will be saved when user clicks Save button
        // This prevents the signature requirement error when toggling items
    } catch (error) {
        console.error('Error toggling item completion:', error);
    }
}

// Render saved checks
function renderSavedChecks() {
    console.log('Rendering saved checks...');
    const savedChecksList = document.getElementById('saved-checks-list');
    
    if (!savedChecksList) {
        console.error('Could not find saved-checks-list element');
        return;
    }
    
    const savedChecks = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    console.log('Found', savedChecks.length, 'saved inspections');
    
    if (savedChecks.length === 0) {
        savedChecksList.innerHTML = '<p>No saved inspections found.</p>';
        return;
    }
    
    // Clear existing content
    savedChecksList.innerHTML = '';
    
    // Sort inspections by date (newest first)
    const sortedInspections = [...savedChecks].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Create and append each inspection card
    sortedInspections.forEach(inspection => {
        const duration = inspection.duration ? 
            `<div class="saved-check-duration">
                <span class="material-icons" style="font-size: 14px; opacity: 0.7;">timer</span>
                ${formatTime(inspection.duration)}
            </div>` : '';
        
        // Create the inspection card
        const checkElement = document.createElement('div');
        checkElement.className = 'saved-check';
        checkElement.innerHTML = `
            <div class="saved-check-header">
                <h3>${inspection.unitNumber || 'Unnamed Unit'}</h3>
                <div class="saved-check-meta">
                    <span class="saved-check-date">${formatDate(inspection.date)}</span>
                    ${duration}
                </div>
            </div>
            <div class="saved-check-actions">
                <button class="btn btn-sm btn-primary load-edit-inspection" data-inspection-id="${inspection.id}">
                    <span class="material-icons">edit</span> Load/Edit
                </button>
                <button class="btn btn-sm btn-danger delete-inspection" data-inspection-id="${inspection.id}">
                    <span class="material-icons">delete</span> Delete
                </button>
            </div>
        `;
        
        // Add click handler for the load/edit button
        const loadEditButton = checkElement.querySelector('.load-edit-inspection');
        if (loadEditButton) {
            loadEditButton.addEventListener('click', async (e) => {
                e.stopPropagation();
                console.log('Load/Edit button clicked for inspection:', inspection);
                
                // Show confirmation dialog
                const shouldLoad = confirm('Load this inspection for editing? This will replace your current inspection.');
                if (shouldLoad) {
                    // Load the inspection into the form
                    if (window.loadInspectionIntoForm) {
                        window.loadInspectionIntoForm(inspection);
                    } else {
                        console.error('loadInspectionIntoForm function not found');
                    }
                    
                    // If the inspection has a duration, set it
                    if (inspection.duration) {
                        // Stop any running timer
                        if (isTimerRunning) {
                            stopTimer();
                        }
                        
                        // Set the elapsed time and update the display
                        elapsedTime = inspection.duration;
                        const timerDisplay = document.getElementById('timer');
                        if (timerDisplay) {
                            timerDisplay.textContent = formatTime(elapsedTime);
                        }
                        
                        // Show a success message
                        showNotification(`Loaded inspection for ${inspection.unitNumber}`, 'success');
                    }
                }
            });
        }
        
        // Add click handler for the delete button
        const deleteButton = checkElement.querySelector('.delete-inspection');
        if (deleteButton) {
            deleteButton.addEventListener('click', (e) => {
                e.stopPropagation();
                const inspectionId = deleteButton.getAttribute('data-inspection-id');
                if (inspectionId && confirm('Are you sure you want to delete this inspection?')) {
                    deleteInspection(inspectionId);
                }
            });
        }
        
        savedChecksList.appendChild(checkElement);
    });
    
    // If no inspections, show a message
    if (savedChecks.length === 0) {
        savedChecksList.innerHTML = '<p>No saved inspections found.</p>';
    }
}

// View a saved inspection in modal
window.viewInspection = function(inspection) {
    console.log('Viewing inspection:', JSON.stringify(inspection, null, 2));
    // Create modal container
    const modal = document.createElement('div');
    modal.className = 'modal';
    
    // Format duration if it exists
    const durationDisplay = inspection.duration ? 
        `<p><strong>Duration:</strong> ${formatTime(inspection.duration)}</p>` : '';
    
    // Initialize arrays for completed and incomplete items
    let completedItems = [];
    let incompleteItems = [];
    
    console.log('Inspection checklist:', JSON.stringify(inspection.checklist, null, 2));
    
    // Process checklist items based on the actual data structure
    if (inspection.checklist) {
        // If checklist is an array of sections
        if (Array.isArray(inspection.checklist)) {
            console.log('Checklist is an array of sections');
            // Flatten all items from all sections
            const allItems = inspection.checklist.flatMap(section => 
                section && section.items ? section.items : []
            );
            completedItems = allItems.filter(item => item && item.completed);
            incompleteItems = allItems.filter(item => item && !item.completed);
        }
        // If checklist is an object with sections
        else if (typeof inspection.checklist === 'object') {
            console.log('Checklist is an object with sections');
            const checklist = inspection.checklist;
            
            // Get all items from all sections
            const allItems = [];
            Object.keys(checklist).forEach(sectionId => {
                // Skip undefined or null sectionId
                if (sectionId === 'undefined' || sectionId === 'null') {
                    console.log('Skipping undefined/null section');
                    return;
                }
                
                const section = checklist[sectionId];
                if (section && Array.isArray(section.items)) {
                    // Filter out any null/undefined items
                    const validItems = section.items.filter(item => item);
                    allItems.push(...validItems);
                }
            });
            
            completedItems = allItems.filter(item => item.completed);
            incompleteItems = allItems.filter(item => !item.completed);
        }
        // If checklist is a direct array of items (old format)
        else if (inspection.checklist.items && Array.isArray(inspection.checklist.items)) {
            console.log('Checklist is a direct array of items');
            const validItems = inspection.checklist.items.filter(item => item);
            completedItems = validItems.filter(item => item.completed);
            incompleteItems = validItems.filter(item => !item.completed);
        }
    }
    
    // Function to safely get item text
    const getItemText = (item) => {
        if (typeof item === 'string') return item;
        return item.text || 'Untitled Item';
    };
    
    // Create modal content
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Inspection for ${inspection.unitNumber || 'Unknown Unit'}</h2>
                <button class="btn-icon close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <div class="inspection-details">
                    <p><strong>Date:</strong> ${formatDate(inspection.date) || 'Unknown Date'}</p>
                    ${durationDisplay}
                    <p><strong>Status:</strong> ${inspection.completed ? 'Completed' : 'Incomplete'}</p>
                </div>
                <div class="inspection-items">
                    <h3>Completed Items (${completedItems.length})</h3>
                    <div class="items-list">
                        ${completedItems.length > 0 ? 
                            completedItems.map(item => `
                                <div class="inspection-item completed">
                                    ${getItemText(item)}
                                </div>
                            `).join('') : 
                            '<p>No items completed.</p>'
                        }
                    </div>
                    
                    <h3>Incomplete Items (${incompleteItems.length})</h3>
                    <div class="items-list">
                        ${incompleteItems.length > 0 ? 
                            incompleteItems.map(item => `
                                <div class="inspection-item incomplete">
                                    ${getItemText(item)}
                                </div>
                            `).join('') : 
                            '<p>All items completed! 🎉</p>'
                        }
                    </div>
                </div>
            </div>
        </div>`;
    
    // Close modal when clicking the X
    modal.querySelector('.close-modal').addEventListener('click', function() {
        document.body.removeChild(modal);
    });
    
    // Close modal when clicking outside the modal content
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            document.body.removeChild(modal);
        }
    });
    
    // Add a Load button to load the inspection into the form
    const loadButton = document.createElement('button');
    loadButton.className = 'btn btn-primary load-inspection';
    loadButton.textContent = 'Load Inspection';
    loadButton.style.margin = '10px';
    
    // Insert the Load button after the modal content
    const modalContent = modal.querySelector('.modal-content');
    if (modalContent) {
        modalContent.appendChild(loadButton);
        
        // Add click handler for the Load button
        loadButton.addEventListener('click', function() {
            // Load the inspection data into the form
            if (window.loadInspectionIntoForm) {
                window.loadInspectionIntoForm(inspection);
            } else {
                console.error('loadInspectionIntoForm function not found');
            }
            // Close the modal
            document.body.removeChild(modal);
        });
    }
    
    // Add the modal to the document
    document.body.appendChild(modal);
    
// Function to load inspection data into the form
window.loadInspectionIntoForm = function(inspectionData) {
        if (!inspectionData) return;
        
        console.log('Loading inspection data:', inspectionData);
        
        // Reset the form first
        resetInspectionForm();
        
        // Update basic form fields
        const unitNumberInput = document.getElementById('unit-number');
        if (unitNumberInput) {
            unitNumberInput.value = inspectionData.unitNumber || '';
            // Trigger input event to update any dependent UI
            unitNumberInput.dispatchEvent(new Event('input'));
        }
        
        const inspectorNameInput = document.getElementById('inspector-name');
        if (inspectorNameInput) {
            inspectorNameInput.value = inspectionData.inspectorName || '';
            // Trigger input event to update any dependent UI
            inspectorNameInput.dispatchEvent(new Event('input'));
        }
        
        // Update current inspection data
        if (inspectionData.checklist) {
            console.log('Processing checklist data:', inspectionData.checklist);
            
            // Helper function to process checklist items
            const processChecklistItems = (items, sectionId = '') => {
                if (!items || !Array.isArray(items)) return;
                
                items.forEach((item, index) => {
                    if (!item) return;
                    
                    // Try to find the checkbox by ID or by section and index
                    let checkbox;
                    if (item.id) {
                        // Try with the exact ID first
                        checkbox = document.querySelector(`#item-${item.id}`);
                        
                        // If not found, try with just the ID part after the last dash
                        if (!checkbox && item.id.includes('-')) {
                            const idPart = item.id.split('-').pop();
                            checkbox = document.querySelector(`#item-${sectionId}-${idPart}`) || 
                                      document.querySelector(`[data-item-id="${item.id}"]`);
                        }
                    }
                    
                    // If still not found, try to find by text content (as a last resort)
                    if (!checkbox && item.text) {
                        const allCheckboxes = Array.from(document.querySelectorAll('.checklist-item input[type="checkbox"]'));
                        const matchingCheckbox = allCheckboxes.find(cb => {
                            const label = cb.closest('.checklist-item')?.querySelector('label');
                            return label && label.textContent.trim() === item.text.trim();
                        });
                        if (matchingCheckbox) {
                            checkbox = matchingCheckbox;
                        }
                    }
                    
                    if (checkbox) {
                        // Update the checkbox state
                        checkbox.checked = !!item.completed;
                        
                        // Update the parent checklist item class
                        const listItem = checkbox.closest('.checklist-item');
                        if (listItem) {
                            listItem.classList.toggle('completed', checkbox.checked);
                        }
                        
                        // Trigger change event to update UI
                        const event = new Event('change', { bubbles: true });
                        checkbox.dispatchEvent(event);
                        
                        console.log(`Updated item ${item.id || index}:`, {
                            checked: checkbox.checked,
                            text: item.text || '',
                            element: checkbox
                        });
                    } else {
                        console.warn('Could not find checkbox for item:', {
                            id: item.id,
                            text: item.text,
                            sectionId: sectionId || 'unknown'
                        });
                    }
                });
            };
            
            // If checklist is an array of sections
            if (Array.isArray(inspectionData.checklist)) {
                inspectionData.checklist.forEach(section => {
                    if (section && section.items) {
                        processChecklistItems(section.items, section.id || '');
                    }
                });
            }
            // If checklist is an object with sections
            else if (typeof inspectionData.checklist === 'object') {
                Object.entries(inspectionData.checklist).forEach(([sectionId, section]) => {
                    if (section && section.items) {
                        processChecklistItems(section.items, sectionId);
                    }
                });
            }
            
            console.log('Finished processing checklist items');
        }
        
        // Update signature if available
        if (inspectionData.signature && signaturePad) {
            signaturePad.fromDataURL(inspectionData.signature);
        }
        
        // Update current inspection data
        if (currentInspection) {
            currentInspection = {
                ...currentInspection,
                ...inspectionData,
                id: inspectionData.id || generateId() // Keep existing ID or generate new one
            };
        }
        
        // Update the save button state
        updateSaveButtonState();
        
        // Scroll to top
        window.scrollTo(0, 0);
    }
}

// Clear the current checklist
function clearChecklist() {
    if (confirm('Are you sure you want to clear the current inspection? This will reset all items to unchecked.')) {
        checklistItems.forEach(item => {
            item.completed = false;
        });
        saveChecklist();
        renderChecklist();
    }
}

// Delete a specific inspection by ID
function deleteInspection(inspectionId) {
    if (!inspectionId || !confirm('Are you sure you want to delete this inspection? This action cannot be undone.')) {
        return;
    }
    
    try {
        const savedInspections = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        const updatedInspections = savedInspections.filter(insp => insp.id !== inspectionId);
        
        if (updatedInspections.length < savedInspections.length) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedInspections));
            renderSavedChecks(); // Refresh the list
            console.log(`Inspection ${inspectionId} deleted successfully`);
        }
    } catch (error) {
        console.error('Error deleting inspection:', error);
        alert('Failed to delete inspection. Please try again.');
    }
}

// Clear local storage and reset to default items
function resetLocalStorage() {
    if (confirm('WARNING: This will clear all saved data and reset to default items. Are you sure?')) {
        localStorage.removeItem('ambulanceChecklist');
        checklistItems = initializeDefaultItems();
        saveChecklist();
        renderChecklist();
        renderSavedChecks();
        alert('Local storage has been reset to default items.');
    }
}



// Set up event listeners
function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Get all necessary elements
    const saveBtn = document.getElementById('save-btn');
    const newInspectionBtn = document.getElementById('new-inspection-btn');
    const printBtn = document.getElementById('print-btn');
    const clearSignatureBtn = document.getElementById('clear-signature');
    const inspectorNameInput = document.getElementById('inspector-name');
    const unitNumberInput = document.getElementById('unit-number');
    
    // Save button
    if (saveBtn) {
        saveBtn.addEventListener('click', saveInspection);
        console.log('Save button event listener added');
    } else {
        console.error('Could not find save button');
    }
    
    // New inspection button
    if (newInspectionBtn) {
        newInspectionBtn.addEventListener('click', resetInspectionForm);
        console.log('New inspection button event listener added');
    }
    
    // Print button
    if (printBtn) {
        printBtn.addEventListener('click', function() {
            window.print();
        });
        console.log('Print button event listener added');
    }
    
    // Clear signature button
    if (clearSignatureBtn) {
        clearSignatureBtn.addEventListener('click', function() {
            if (signaturePad) {
                signaturePad.clear();
                updateSaveButtonState();
            }
        });
        console.log('Clear signature button event listener added');
    }
    
    // Form input change handlers
    if (inspectorNameInput) {
        inspectorNameInput.addEventListener('input', function() {
            if (currentInspection) {
                currentInspection.inspectorName = this.value;
            }
            updateSaveButtonState();
        });
    }
    
    if (unitNumberInput) {
        unitNumberInput.addEventListener('input', function() {
            if (currentInspection) {
                currentInspection.unitNumber = this.value;
            }
        });
    }
    
    // Signature pad change handler
    if (signaturePad) {
        signaturePad.addEventListener('endStroke', function() {
            updateSaveButtonState();
        });
    }
    
    // Event delegation for saved checks list
    const savedChecksList = document.getElementById('saved-checks-list');
    if (savedChecksList) {
        // Remove any existing event listeners to prevent duplicates
        savedChecksList.replaceWith(savedChecksList.cloneNode(true));
        
        // Add new event listener
        savedChecksList.addEventListener('click', function(e) {
            // Handle view button clicks
            const viewButton = e.target.closest('.view-inspection');
            if (viewButton) {
                e.preventDefault();
                e.stopPropagation();
                
                const inspectionData = viewButton.getAttribute('data-inspection');
                if (inspectionData) {
                    try {
                        // Decode HTML entities and parse JSON
                        const decodedData = inspectionData
                            .replace(/&quot;/g, '"')
                            .replace(/&#39;/g, "'");
                        const inspection = JSON.parse(decodedData);
                        console.log('Viewing inspection:', inspection);
                        window.viewInspection(inspection);
                    } catch (error) {
                        console.error('Error parsing inspection data:', error, 'Data:', inspectionData);
                        alert('Error loading inspection. Please check the console for details.');
                    }
                }
                return;
            }
            
            // Handle delete button clicks
            const deleteButton = e.target.closest('.delete-inspection');
            if (deleteButton) {
                const inspectionId = deleteButton.getAttribute('data-inspection-id');
                if (inspectionId) {
                    deleteInspection(inspectionId);
                }
            }
        });
    }
    
    // Initial button state update
    updateSaveButtonState();
}

// Update save button state based on form validity
function updateSaveButtonState() {
    const saveBtn = document.getElementById('save-btn');
    
    if (!saveBtn) {
        console.error('Save button not found');
        return;
    }
    
    try {
        // Check if we have a signature (if signature pad is available)
        let isSignatureValid = true; // Default to true if no signature pad
        if (signaturePad) {
            isSignatureValid = !signaturePad.isEmpty();
        }
        
        // Check if we have at least one completed item
        const completedItems = document.querySelectorAll('.checklist-item.completed');
        const hasCompletedItems = completedItems.length > 0;
        
        // Check if we have a valid inspector name
        const inspectorNameInput = document.getElementById('inspector-name');
        const hasInspectorName = inspectorNameInput && inspectorNameInput.value.trim() !== '';
        
        // Determine if the form is valid
        const isFormValid = isSignatureValid && hasCompletedItems && hasInspectorName;
        
        // Update button state and tooltip
        saveBtn.disabled = !isFormValid;
        
        // Set appropriate tooltip based on what's missing
        if (!isFormValid) {
            if (!hasInspectorName) {
                saveBtn.title = 'Please enter your name';
            } else if (!isSignatureValid) {
                saveBtn.title = 'Please sign the inspection form';
            } else if (!hasCompletedItems) {
                saveBtn.title = 'Please complete at least one checklist item';
            } else {
                saveBtn.title = 'Cannot save inspection';
            }
        } else {
            saveBtn.title = 'Save inspection';
        }
        
        // Visual feedback for the button state
        if (saveBtn.disabled) {
            saveBtn.classList.add('disabled');
        } else {
            saveBtn.classList.remove('disabled');
        }
        
    } catch (error) {
        console.error('Error updating save button state:', error);
        if (saveBtn) {
            saveBtn.disabled = true;
            saveBtn.title = 'Error: Cannot save inspection';
            saveBtn.classList.add('disabled');
        }
    }
    
    return !saveBtn.disabled;
}

// Handle application cleanup before unload
function setupBeforeUnload() {
    window.addEventListener('beforeunload', function(e) {
        // Check if there are unsaved changes
        const hasUnsavedChanges = checkForUnsavedChanges();
        
        if (hasUnsavedChanges) {
            // Standard for most browsers
            e.preventDefault();
            // Chrome requires returnValue to be set
            e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
            return e.returnValue;
        }
    });
}

// Check for unsaved changes
function checkForUnsavedChanges() {
    // Implement logic to check for unsaved changes
    // For example, check if any checklist items are completed
    const completedItems = document.querySelectorAll('.checklist-item.completed');
    return completedItems.length > 0;
}

// Start the application when the DOM is ready
function startApplication() {
    try {
        setupBeforeUnload();
        
        if (typeof window.init === 'function') {
            window.init();
        } else {
            console.error('init function not found');
            document.body.innerHTML = `
                <div class="error-container">
                    <h2>Application Error</h2>
                    <p>Failed to initialize the application. Please refresh the page.</p>
                    <button onclick="window.location.reload()" class="btn">
                        <span class="material-icons">refresh</span>
                        Refresh Page
                    </button>
                </div>
            `;
        }
    } catch (error) {
        console.error('Failed to start application:', error);
        document.body.innerHTML = `
            <div class="error-container">
                <h2>Critical Error</h2>
                <p>Failed to start the application. Please contact support.</p>
                <p>Error: ${error.message}</p>
                <button onclick="window.location.reload()" class="btn">
                    <span class="material-icons">refresh</span>
                    Try Again
                </button>
            </div>
        `;
    }
}

// Start the application when the DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startApplication);
} else {
    // DOMContentLoaded already fired, run immediately
    startApplication();
}

// Clean up on unload
window.addEventListener('unload', cleanupApp);
