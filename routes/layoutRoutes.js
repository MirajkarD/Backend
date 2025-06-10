const express = require('express');
const router = express.Router();
const { 
    saveLayout, 
    getActiveLayouts,
    getAllLayouts,
    toggleLayoutActive,
    deleteLayout,
    activateLayout,
    deactivateLayout
} = require('../controllers/layoutController');

// Save new layout
router.post('/save', saveLayout);

// Get active layouts
router.get('/active', getActiveLayouts);

// Get all saved layouts
router.get('/saved', getAllLayouts);

// Activate layout
router.put('/activate/:id', activateLayout);

// Deactivate layout
router.put('/deactivate/:id', deactivateLayout);

// Delete layout
router.delete('/delete/:id', deleteLayout);

module.exports = router;
