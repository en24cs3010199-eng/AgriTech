const CropRecord = require('../models/CropRecord');
const Farm = require('../models/Farm');
const { generateCropTimeline, getEstimatedHarvestDate } = require('../utils/cropTimelineGenerator');

// @desc    Get all crops for the logged-in farmer
// @route   GET /api/crops
// @access  Private
const getCrops = async (req, res, next) => {
  try {
    const { farmId, status } = req.query;
    const filter = req.user.role === 'admin' ? {} : { farmer: req.user.id };

    if (farmId) filter.farm = farmId;
    if (status) filter.status = status;

    const crops = await CropRecord.find(filter)
      .populate('farm', 'name location soilType totalArea')
      .sort({ sowingDate: -1 });

    res.status(200).json({
      success: true,
      count: crops.length,
      crops
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single crop record by ID
// @route   GET /api/crops/:id
// @access  Private
const getCropById = async (req, res, next) => {
  try {
    const crop = await CropRecord.findById(req.params.id)
      .populate('farm', 'name location soilType irrigationSource totalArea');

    if (!crop) {
      return res.status(404).json({
        success: false,
        message: 'Crop record not found'
      });
    }

    if (crop.farmer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to this crop record'
      });
    }

    res.status(200).json({
      success: true,
      crop
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new crop record with automated personalized timeline
// @route   POST /api/crops
// @access  Private
const createCrop = async (req, res, next) => {
  try {
    const { farm, cropName, variety, season, sowingDate, expectedHarvestDate, areaPlanted, expectedYield, notes } = req.body;

    // Verify farm ownership
    const farmDoc = await Farm.findById(farm);
    if (!farmDoc) {
      return res.status(404).json({
        success: false,
        message: 'Associated farm does not exist'
      });
    }

    if (farmDoc.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only add crops to farms you own'
      });
    }

    // Auto-compute harvest date if not manually specified
    const sDate = new Date(sowingDate);
    const computedHarvestDate = expectedHarvestDate ? new Date(expectedHarvestDate) : getEstimatedHarvestDate(cropName, sDate);

    // Generate personalized stage-by-stage agronomic activity timeline
    const timeline = generateCropTimeline(cropName, sDate);

    const crop = await CropRecord.create({
      farm,
      farmer: req.user.id,
      cropName,
      variety: variety || 'Standard High-Yield',
      season,
      sowingDate: sDate,
      expectedHarvestDate: computedHarvestDate,
      areaPlanted,
      expectedYield: expectedYield || 0,
      timeline,
      notes: notes || ''
    });

    res.status(201).json({
      success: true,
      message: `Crop cycle for ${cropName} initialized with personalized agronomic timeline.`,
      crop
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update crop record details
// @route   PUT /api/crops/:id
// @access  Private
const updateCrop = async (req, res, next) => {
  try {
    const crop = await CropRecord.findById(req.params.id);

    if (!crop) {
      return res.status(404).json({
        success: false,
        message: 'Crop record not found'
      });
    }

    if (crop.farmer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to update this crop record'
      });
    }

    const updated = await CropRecord.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Crop record updated successfully',
      crop: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle or update a specific timeline activity in a crop's personalized calendar
// @route   PUT /api/crops/:id/activity/:activityId
// @access  Private
const updateTimelineActivity = async (req, res, next) => {
  try {
    const { id, activityId } = req.params;
    const { completed, notes } = req.body;

    const crop = await CropRecord.findById(id);

    if (!crop) {
      return res.status(404).json({
        success: false,
        message: 'Crop record not found'
      });
    }

    if (crop.farmer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const activity = crop.timeline.id(activityId);
    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found in timeline'
      });
    }

    if (completed !== undefined) {
      activity.completed = completed;
      activity.completedAt = completed ? new Date() : null;
    }
    if (notes !== undefined) {
      activity.notes = notes;
    }

    await crop.save();

    res.status(200).json({
      success: true,
      message: `Activity '${activity.stage}' status updated.`,
      crop
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete crop record
// @route   DELETE /api/crops/:id
// @access  Private
const deleteCrop = async (req, res, next) => {
  try {
    const crop = await CropRecord.findById(req.params.id);

    if (!crop) {
      return res.status(404).json({
        success: false,
        message: 'Crop record not found'
      });
    }

    if (crop.farmer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    await crop.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Crop record deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCrops,
  getCropById,
  createCrop,
  updateCrop,
  updateTimelineActivity,
  deleteCrop
};
