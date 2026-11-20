
const Service = require("../models/Service");

// CREATE SERVICE
exports.createService = async (req, res) => {
    try {
        const service = await Service.create(req.body);

        res.status(201).json({
            message: "Service created successfully",
            service
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET ALL SERVICES
exports.getServices = async (req, res) => {
    try {
        const services = await Service.find();

        res.status(200).json(services);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// UPDATE SERVICE
exports.updateService = async (req, res) => {
    try {
        const service = await Service.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!service) {
            return res.status(404).json({
                message: "Service not found"
            });
        }

        res.status(200).json({
            message: "Service updated successfully",
            service
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE SERVICE
exports.deleteService = async (req, res) => {
    try {
        const service = await Service.findByIdAndDelete(req.params.id);

        if (!service) {
            return res.status(404).json({
                message: "Service not found"
            });
        }

        res.status(200).json({
            message: "Service deleted successfully"
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
