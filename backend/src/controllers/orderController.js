const Order = require('../models/Order');
const Resource = require('../models/Resource');

// @desc    Place a new order for agricultural resources
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No items in order'
      });
    }

    let calculatedTotal = 0;
    const orderItems = [];

    // Verify inventory and calculate total price
    for (const item of items) {
      const resourceDoc = await Resource.findById(item.resourceId || item.resource);
      if (!resourceDoc) {
        return res.status(404).json({
          success: false,
          message: `Resource with ID ${item.resourceId} not found`
        });
      }

      const qty = Number(item.quantity);
      if (resourceDoc.stockQuantity < qty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${resourceDoc.title}. Available: ${resourceDoc.stockQuantity}`
        });
      }

      // Deduct stock
      resourceDoc.stockQuantity -= qty;
      await resourceDoc.save();

      const itemTotal = resourceDoc.price * qty;
      calculatedTotal += itemTotal;

      orderItems.push({
        resource: resourceDoc._id,
        title: resourceDoc.title,
        unitPrice: resourceDoc.price,
        quantity: qty,
        totalItemPrice: itemTotal
      });
    }

    const order = await Order.create({
      farmer: req.user.id,
      items: orderItems,
      totalAmount: calculatedTotal,
      shippingAddress: shippingAddress || {
        recipientName: req.user.name,
        phone: req.user.phone,
        village: req.user.location?.village || '',
        district: req.user.location?.district || 'Ludhiana',
        state: req.user.location?.state || 'Punjab',
        pincode: '141001'
      },
      paymentMethod: paymentMethod || 'Cash on Delivery',
      status: 'placed',
      trackingHistory: [
        {
          status: 'placed',
          timestamp: new Date(),
          notes: 'Order received and being prepared at local agricultural hub.'
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully! Delivery tracking initiated.',
      order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get orders for current user (or all if admin)
// @route   GET /api/orders
// @access  Private
const getOrders = async (req, res, next) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { farmer: req.user.id };

    const orders = await Order.find(filter)
      .populate('farmer', 'name email phone')
      .populate('items.resource', 'title imageUrl category')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order details by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('farmer', 'name email phone location')
      .populate('items.resource', 'title imageUrl brand price unit');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.farmer._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to this order'
      });
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status and add tracking milestone
// @route   PUT /api/orders/:id/status
// @access  Private (Admin)
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.status = status;
    order.trackingHistory.push({
      status,
      timestamp: new Date(),
      notes: notes || `Order status updated to ${status}`
    });

    if (status === 'delivered') {
      order.isPaid = true;
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel an order (Farmer)
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.farmer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    if (order.status !== 'placed') {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled in '${order.status}' stage.`
      });
    }

    order.status = 'cancelled';
    order.trackingHistory.push({
      status: 'cancelled',
      timestamp: new Date(),
      notes: 'Order was cancelled by the customer.'
    });

    // Restore stock
    for (const item of order.items) {
      await Resource.findByIdAndUpdate(item.resource, {
        $inc: { stockQuantity: item.quantity }
      });
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order cancelled and inventory restored.',
      order
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder
};
