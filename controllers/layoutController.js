const Layout = require('../models/Layout');

// Save new layout
exports.saveLayout = async (req, res) => {
    try {
        // Create new layout
        const layout = new Layout({
            ...req.body,
            createdAt: new Date(),
            isActive: req.body.isActive || false
        });
        await layout.save();

        res.status(201).json({
            success: true,
            message: 'Layout saved successfully',
            data: layout
        });
    } catch (error) {
        console.error('Save layout error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save layout',
            error: error.message
        });
    }
};

// Get active layouts
exports.getActiveLayouts = async (req, res) => {
    try {
        const layouts = await Layout.find({ isActive: true })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: layouts
        });
    } catch (error) {
        console.error('Get active layouts error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get active layouts',
            error: error.message
        });
    }
};

// Get all layouts
exports.getAllLayouts = async (req, res) => {
    try {
        const layouts = await Layout.find()
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: layouts
        });
    } catch (error) {
        console.error('Get all layouts error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get layouts',
            error: error.message
        });
    }
};

// Toggle layout active status
exports.toggleLayoutActive = async (req, res) => {
    try {
        const { id } = req.params;
        const layout = await Layout.findById(id);

        if (!layout) {
            return res.status(404).json({
                success: false,
                message: 'Layout not found'
            });
        }

        // Toggle the active status
        layout.isActive = !layout.isActive;
        await layout.save();

        res.status(200).json({
            success: true,
            message: `Layout ${layout.isActive ? 'activated' : 'deactivated'} successfully`,
            data: layout
        });
    } catch (error) {
        console.error('Toggle layout active status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to toggle layout status',
            error: error.message
        });
    }
};

// Activate layout
exports.activateLayout = async (req, res) => {
    try {
        const layout = await Layout.findByIdAndUpdate(
            req.params.id,
            { isActive: true },
            { new: true }
        );

        if (!layout) {
            return res.status(404).json({
                success: false,
                message: 'Layout not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Layout activated successfully',
            data: layout
        });
    } catch (error) {
        console.error('Activate layout error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to activate layout',
            error: error.message
        });
    }
};

// Deactivate layout
exports.deactivateLayout = async (req, res) => {
    try {
        const layout = await Layout.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        if (!layout) {
            return res.status(404).json({
                success: false,
                message: 'Layout not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Layout deactivated successfully',
            data: layout
        });
    } catch (error) {
        console.error('Deactivate layout error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to deactivate layout',
            error: error.message
        });
    }
};

// Delete layout
exports.deleteLayout = async (req, res) => {
    try {
        const { id } = req.params;
        const layout = await Layout.findById(id);

        if (!layout) {
            return res.status(404).json({
                success: false,
                message: 'Layout not found'
            });
        }

        await Layout.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Layout deleted successfully'
        });
    } catch (error) {
        console.error('Delete layout error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete layout',
            error: error.message
        });
    }
};
