const Resource = require('../models/Resource');

// @desc    Get all resources with category & search filter
// @route   GET /api/resources
// @access  Public / Private
const getResources = async (req, res, next) => {
  try {
    const { category, search, sort } = req.query;
    const query = { isAvailable: true };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { titleHi: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } }
      ];
    }

    let result = Resource.find(query);

    if (sort === 'price_asc') {
      result = result.sort({ price: 1 });
    } else if (sort === 'price_desc') {
      result = result.sort({ price: -1 });
    } else {
      result = result.sort({ createdAt: -1 });
    }

    const resources = await result;

    res.status(200).json({
      success: true,
      count: resources.length,
      resources
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single resource by ID
// @route   GET /api/resources/:id
// @access  Public / Private
const getResourceById = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    res.status(200).json({
      success: true,
      resource
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new catalogue resource
// @route   POST /api/resources
// @access  Private (Admin)
const createResource = async (req, res, next) => {
  try {
    const resource = await Resource.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Resource added to catalogue',
      resource
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update resource
// @route   PUT /api/resources/:id
// @access  Private (Admin)
const updateResource = async (req, res, next) => {
  try {
    const resource = await Resource.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Resource updated successfully',
      resource
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete resource
// @route   DELETE /api/resources/:id
// @access  Private (Admin)
const deleteResource = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    await resource.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Resource removed from catalogue'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource
};
