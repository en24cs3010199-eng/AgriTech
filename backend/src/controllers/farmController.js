const Farm = require('../models/Farm');
const CropRecord = require('../models/CropRecord');
const SoilHealth = require('../models/SoilHealth');

// @desc    Get all farms for the logged-in user
// @route   GET /api/farms
// @access  Private
const getFarms = async (req, res, next) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { owner: req.user.id };
    const farms = await Farm.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: farms.length,
      farms
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single farm details with crop & soil data
// @route   GET /api/farms/:id
// @access  Private
const getFarmById = async (req, res, next) => {
  try {
    const farm = await Farm.findById(req.params.id);

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: 'Farm not found'
      });
    }

    // Security check: farmer must own this farm unless admin
    if (farm.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. You do not own this farm record.'
      });
    }

    // Fetch related crops and soil tests
    const crops = await CropRecord.find({ farm: farm._id }).sort({ sowingDate: -1 });
    const soilRecords = await SoilHealth.find({ farm: farm._id }).sort({ sampleDate: -1 });

    res.status(200).json({
      success: true,
      farm,
      crops,
      soilRecords
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new farm
// @route   POST /api/farms
// @access  Private (Farmer)
const createFarm = async (req, res, next) => {
  try {
    const { name, totalArea, areaUnit, soilType, irrigationSource, location, notes } = req.body;

    const farm = await Farm.create({
      owner: req.user.id,
      name,
      totalArea,
      areaUnit: areaUnit || 'Acres',
      soilType,
      irrigationSource,
      location: location || req.user.location,
      notes: notes || ''
    });

    res.status(201).json({
      success: true,
      message: 'Farm registered successfully!',
      farm
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update farm details
// @route   PUT /api/farms/:id
// @access  Private (Farmer)
const updateFarm = async (req, res, next) => {
  try {
    let farm = await Farm.findById(req.params.id);

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: 'Farm not found'
      });
    }

    // Ownership check
    if (farm.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. You do not have permission to edit this farm.'
      });
    }

    farm = await Farm.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Farm details updated successfully',
      farm
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete farm
// @route   DELETE /api/farms/:id
// @access  Private (Farmer)
const deleteFarm = async (req, res, next) => {
  try {
    const farm = await Farm.findById(req.params.id);

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: 'Farm not found'
      });
    }

    // Ownership check
    if (farm.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. You do not have permission to delete this farm.'
      });
    }

    // Cascade delete associated crop and soil records
    await CropRecord.deleteMany({ farm: farm._id });
    await SoilHealth.deleteMany({ farm: farm._id });
    await farm.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Farm and associated crop/soil records deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFarms,
  getFarmById,
  createFarm,
  updateFarm,
  deleteFarm
};
