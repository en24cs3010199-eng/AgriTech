const Consultation = require('../models/Consultation');

// @desc    Submit a new agronomy consultation request
// @route   POST /api/consultations
// @access  Private (Farmer)
const createConsultation = async (req, res, next) => {
  try {
    const { subject, cropAffected, symptoms, severity } = req.body;

    const consultation = await Consultation.create({
      farmer: req.user.id,
      subject,
      cropAffected,
      symptoms,
      severity: severity || 'Moderate',
      status: 'pending'
    });

    const populated = await consultation.populate('farmer', 'name email phone location');

    res.status(201).json({
      success: true,
      message: 'Consultation request submitted. An agricultural expert will review it promptly.',
      consultation: populated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get consultations (Farmers see their own, Experts/Admins see all)
// @route   GET /api/consultations
// @access  Private
const getConsultations = async (req, res, next) => {
  try {
    const filter = req.user.role === 'farmer' ? { farmer: req.user.id } : {};

    const consultations = await Consultation.find(filter)
      .populate('farmer', 'name email phone location')
      .populate('expert', 'name bio isVerifiedExpert')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: consultations.length,
      consultations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Provide expert advice and prescription
// @route   PUT /api/consultations/:id/prescribe
// @access  Private (Expert / Admin)
const prescribeAdvice = async (req, res, next) => {
  try {
    const { expertAdvice, prescription, status } = req.body;

    const consultation = await Consultation.findById(req.params.id);
    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation request not found'
      });
    }

    consultation.expert = req.user.id;
    consultation.expertAdvice = expertAdvice;
    if (prescription) consultation.prescription = prescription;
    consultation.status = status || 'answered';
    consultation.answeredAt = new Date();

    await consultation.save();

    const updated = await Consultation.findById(req.params.id)
      .populate('farmer', 'name email phone location')
      .populate('expert', 'name bio isVerifiedExpert');

    res.status(200).json({
      success: true,
      message: 'Agronomic prescription submitted successfully',
      consultation: updated
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createConsultation,
  getConsultations,
  prescribeAdvice
};
