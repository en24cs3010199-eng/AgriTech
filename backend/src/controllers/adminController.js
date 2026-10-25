const User = require('../models/User');
const Farm = require('../models/Farm');
const CropRecord = require('../models/CropRecord');
const SoilHealth = require('../models/SoilHealth');
const Order = require('../models/Order');
const Resource = require('../models/Resource');
const ForumPost = require('../models/ForumPost');
const Consultation = require('../models/Consultation');

// @desc    Get aggregate platform metrics for Admin Dashboard
// @route   GET /api/admin/metrics
// @access  Private (Admin)
const getAdminMetrics = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalFarmers,
      totalExperts,
      totalFarms,
      totalCrops,
      totalSoilTests,
      orders,
      totalResources,
      forumPostsCount,
      pendingConsultations
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'farmer' }),
      User.countDocuments({ role: 'expert' }),
      Farm.countDocuments(),
      CropRecord.countDocuments(),
      SoilHealth.countDocuments(),
      Order.find(),
      Resource.countDocuments(),
      ForumPost.countDocuments(),
      Consultation.countDocuments({ status: 'pending' })
    ]);

    const totalRevenue = orders.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
    const deliveredOrders = orders.filter((o) => o.status === 'delivered').length;
    const pendingOrders = orders.filter((o) => o.status === 'placed' || o.status === 'confirmed').length;

    // Recent user signups
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('-password');

    // Recent orders
    const recentOrders = await Order.find()
      .populate('farmer', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      metrics: {
        totalUsers,
        totalFarmers,
        totalExperts,
        totalFarms,
        totalCrops,
        totalSoilTests,
        totalOrders: orders.length,
        deliveredOrders,
        pendingOrders,
        totalRevenue,
        totalResources,
        forumPostsCount,
        pendingConsultations
      },
      recentUsers,
      recentOrders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users with search and role filter
// @route   GET /api/admin/users
// @access  Private (Admin)
const getAllUsers = async (req, res, next) => {
  try {
    const { role, search } = req.query;
    const query = {};

    if (role && role !== 'all') query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role or verify expert badge
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
const updateUserStatus = async (req, res, next) => {
  try {
    const { role, isVerifiedExpert } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (role) user.role = role;
    if (isVerifiedExpert !== undefined) user.isVerifiedExpert = isVerifiedExpert;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User permissions updated successfully',
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user account and cascade delete their farm records
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Admins cannot delete their own master account.'
      });
    }

    await Farm.deleteMany({ owner: user._id });
    await CropRecord.deleteMany({ farmer: user._id });
    await SoilHealth.deleteMany({ farmer: user._id });
    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User and all associated farm records removed.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminMetrics,
  getAllUsers,
  updateUserStatus,
  deleteUser
};
