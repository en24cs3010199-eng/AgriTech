const SoilHealth = require('../models/SoilHealth');
const Farm = require('../models/Farm');

/**
 * Diagnostic logic to evaluate soil health metrics and generate actionable agronomic advice
 */
const analyzeSoilMetrics = (n, p, k, ph) => {
  const deficiencyAlerts = [];
  const recommendations = [];
  let fertilityScore = 0; // out of 4

  // Nitrogen (N) Analysis
  if (n < 280) {
    deficiencyAlerts.push('Nitrogen (N) Deficiency: Pale yellowing of older leaves and stunted vegetative growth.');
    recommendations.push({
      fertilizerName: 'Neem-Coated Urea (46% N)',
      dosageKgPerAcre: Math.round((280 - n) * 0.45),
      timing: 'Split application (50% basal + 25% at tillering + 25% at flowering)',
      description: 'Supplement available nitrogen to restore chlorophyll synthesis and vegetative vigor.'
    });
  } else if (n > 560) {
    deficiencyAlerts.push('Excess Nitrogen: Risk of excessive vegetative foliage, lodging, and pest vulnerability.');
  } else {
    fertilityScore++;
  }

  // Phosphorus (P) Analysis
  if (p < 23) {
    deficiencyAlerts.push('Phosphorus (P) Deficiency: Weak root establishment, purple pigmentation on lower leaves.');
    recommendations.push({
      fertilizerName: 'Di-Ammonium Phosphate (DAP 18:46:0) or SSP',
      dosageKgPerAcre: Math.round((23 - p) * 1.5),
      timing: 'Apply 100% as basal dose at sowing/planting',
      description: 'Phosphorus is critical for root proliferation and early plant vigour.'
    });
  } else {
    fertilityScore++;
  }

  // Potassium (K) Analysis
  if (k < 130) {
    deficiencyAlerts.push('Potassium (K) Deficiency: Marginal leaf scorch, weak stems, poor grain filling.');
    recommendations.push({
      fertilizerName: 'Muriate of Potash (MOP 0:0:60)',
      dosageKgPerAcre: Math.round((130 - k) * 0.8),
      timing: 'Basal application or split with flowering stage',
      description: 'Potassium regulates stomatal conductance, water retention, and disease resistance.'
    });
  } else {
    fertilityScore++;
  }

  // pH Level Analysis
  if (ph < 6.0) {
    deficiencyAlerts.push('Acidic Soil: Reduced nutrient availability, aluminum toxicity risk.');
    recommendations.push({
      fertilizerName: 'Agricultural Lime (Calcium Carbonate)',
      dosageKgPerAcre: 150,
      timing: 'Broadcast and plow 3 weeks before sowing',
      description: 'Raises soil pH towards neutral range and enhances microbial activity.'
    });
  } else if (ph > 8.0) {
    deficiencyAlerts.push('Alkaline / Saline Soil: Zinc, iron, and boron micronutrient lockup.');
    recommendations.push({
      fertilizerName: 'Agricultural Gypsum (Calcium Sulphate) + FYM',
      dosageKgPerAcre: 200,
      timing: 'Incorporate with well-rotted farmyard manure before sowing',
      description: 'Replaces exchangeable sodium and improves soil aggregation.'
    });
  } else {
    fertilityScore++;
  }

  // Fertility Rating
  let fertilityRating = 'Medium';
  if (fertilityScore === 4) fertilityRating = 'Optimal / High';
  else if (fertilityScore >= 2) fertilityRating = 'Medium';
  else if (fertilityScore === 1) fertilityRating = 'Low';
  else fertilityRating = 'Critical / Depleted';

  return { fertilityRating, deficiencyAlerts, recommendations };
};

// @desc    Get all soil health records for logged in user
// @route   GET /api/soil
// @access  Private
const getSoilRecords = async (req, res, next) => {
  try {
    const { farmId } = req.query;
    const filter = req.user.role === 'admin' ? {} : { farmer: req.user.id };
    if (farmId) filter.farm = farmId;

    const records = await SoilHealth.find(filter)
      .populate('farm', 'name location soilType totalArea')
      .sort({ sampleDate: -1 });

    res.status(200).json({
      success: true,
      count: records.length,
      records
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single soil health record
// @route   GET /api/soil/:id
// @access  Private
const getSoilRecordById = async (req, res, next) => {
  try {
    const record = await SoilHealth.findById(req.params.id)
      .populate('farm', 'name location soilType totalArea');

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Soil record not found'
      });
    }

    if (record.farmer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to this soil record'
      });
    }

    res.status(200).json({
      success: true,
      record
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Log a new soil test with automatic health analysis
// @route   POST /api/soil
// @access  Private
const createSoilRecord = async (req, res, next) => {
  try {
    const { farm, nitrogen, phosphorus, potassium, phLevel, organicCarbon, electricalConductivity, moisture, sampleDate } = req.body;

    const farmDoc = await Farm.findById(farm);
    if (!farmDoc) {
      return res.status(404).json({
        success: false,
        message: 'Farm not found'
      });
    }

    if (farmDoc.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to add soil tests for this farm'
      });
    }

    // Run diagnostics
    const { fertilityRating, deficiencyAlerts, recommendations } = analyzeSoilMetrics(
      Number(nitrogen),
      Number(phosphorus),
      Number(potassium),
      Number(phLevel)
    );

    const record = await SoilHealth.create({
      farm,
      farmer: req.user.id,
      sampleDate: sampleDate || new Date(),
      nitrogen: Number(nitrogen),
      phosphorus: Number(phosphorus),
      potassium: Number(potassium),
      phLevel: Number(phLevel),
      organicCarbon: organicCarbon !== undefined ? Number(organicCarbon) : 0.5,
      electricalConductivity: electricalConductivity !== undefined ? Number(electricalConductivity) : 0.35,
      moisture: moisture !== undefined ? Number(moisture) : 30,
      fertilityRating,
      deficiencyAlerts,
      recommendations
    });

    res.status(201).json({
      success: true,
      message: 'Soil health analysis generated successfully.',
      record
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete soil record
// @route   DELETE /api/soil/:id
// @access  Private
const deleteSoilRecord = async (req, res, next) => {
  try {
    const record = await SoilHealth.findById(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Soil record not found'
      });
    }

    if (record.farmer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    await record.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Soil health record deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSoilRecords,
  getSoilRecordById,
  createSoilRecord,
  deleteSoilRecord,
  analyzeSoilMetrics
};
