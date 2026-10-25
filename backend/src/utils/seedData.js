const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const { connectDB } = require('../config/db');
const User = require('../models/User');
const Farm = require('../models/Farm');
const CropRecord = require('../models/CropRecord');
const SoilHealth = require('../models/SoilHealth');
const Resource = require('../models/Resource');
const Order = require('../models/Order');
const ForumPost = require('../models/ForumPost');
const Consultation = require('../models/Consultation');
const WeatherAlert = require('../models/WeatherAlert');
const { generateCropTimeline } = require('./cropTimelineGenerator');
const { analyzeSoilMetrics } = require('../controllers/soilController');

const seedData = async (exitOnComplete = false) => {
  try {
    await connectDB();

    console.log('🌱 Purging existing database records...');
    await Promise.all([
      User.deleteMany(),
      Farm.deleteMany(),
      CropRecord.deleteMany(),
      SoilHealth.deleteMany(),
      Resource.deleteMany(),
      Order.deleteMany(),
      ForumPost.deleteMany(),
      Consultation.deleteMany(),
      WeatherAlert.deleteMany()
    ]);

    console.log('👤 Seeding default users (Farmer, Expert, Admin)...');
    const farmerPassword = await bcrypt.hash('Farmer@123', 10);
    const expertPassword = await bcrypt.hash('Expert@123', 10);
    const adminPassword = await bcrypt.hash('Admin@123', 10);

    const [farmer, expert, admin] = await User.insertMany([
      {
        name: 'Gurpreet Singh',
        email: 'farmer@agritech.com',
        password: farmerPassword,
        phone: '+91 98765 43210',
        role: 'farmer',
        preferredLanguage: 'hi',
        location: {
          state: 'Punjab',
          district: 'Ludhiana',
          village: 'Samrala',
          latitude: 30.9010,
          longitude: 75.8573
        },
        bio: 'Progressive wheat and paddy farmer practicing integrated nutrient management.'
      },
      {
        name: 'Dr. Ramesh Sharma',
        email: 'expert@agritech.com',
        password: expertPassword,
        phone: '+91 98111 22233',
        role: 'expert',
        preferredLanguage: 'hi',
        location: {
          state: 'Punjab',
          district: 'Ludhiana',
          village: 'PAU Campus',
          latitude: 30.9010,
          longitude: 75.8573
        },
        isVerifiedExpert: true,
        bio: 'Senior Agronomist, Punjab Agricultural University. Specializes in soil pathology and bio-pest management.'
      },
      {
        name: 'AgriTech Admin',
        email: 'admin@agritech.com',
        password: adminPassword,
        phone: '+91 98000 11122',
        role: 'admin',
        preferredLanguage: 'en',
        location: {
          state: 'Delhi',
          district: 'New Delhi',
          village: 'Krishi Bhawan',
          latitude: 28.6139,
          longitude: 77.2090
        },
        bio: 'Master Platform Administrator for AgriTech Operations.'
      }
    ]);

    console.log('🌾 Seeding farms...');
    const farm1 = await Farm.create({
      owner: farmer._id,
      name: 'Green Field Organic Farm',
      totalArea: 6.5,
      areaUnit: 'Acres',
      soilType: 'Alluvial',
      irrigationSource: 'Borewell / Tubewell',
      location: {
        state: 'Punjab',
        district: 'Ludhiana',
        village: 'Samrala',
        latitude: 30.9010,
        longitude: 75.8573
      },
      notes: 'Laser-leveled alluvial plot with underground pipe irrigation.'
    });

    const farm2 = await Farm.create({
      owner: farmer._id,
      name: 'Surya Model Orchard & Plot',
      totalArea: 3.2,
      areaUnit: 'Acres',
      soilType: 'Sandy Loam',
      irrigationSource: 'Drip Irrigation',
      location: {
        state: 'Punjab',
        district: 'Ludhiana',
        village: 'Machhiwara',
        latitude: 30.9100,
        longitude: 76.0100
      },
      notes: 'Micro-drip fertigation setup for vegetables and mustard.'
    });

    console.log('🌱 Seeding crop records with personalized activity timelines...');
    const wheatSowingDate = new Date();
    wheatSowingDate.setDate(wheatSowingDate.getDate() - 25); // Sown 25 days ago

    const wheatTimeline = generateCropTimeline('wheat', wheatSowingDate);
    // Mark first 2 activities complete
    wheatTimeline[0].completed = true;
    wheatTimeline[0].completedAt = wheatSowingDate;
    wheatTimeline[0].notes = 'Applied 50kg DAP + 20kg Potash basal dose.';

    wheatTimeline[1].completed = true;
    wheatTimeline[1].completedAt = new Date();
    wheatTimeline[1].notes = 'Completed CRI irrigation and first top dressing of urea.';

    await CropRecord.create({
      farm: farm1._id,
      farmer: farmer._id,
      cropName: 'Wheat',
      variety: 'HD-3086 (Pusa Gautami)',
      season: 'Rabi',
      sowingDate: wheatSowingDate,
      expectedHarvestDate: new Date(wheatSowingDate.getTime() + 130 * 24 * 60 * 60 * 1000),
      areaPlanted: 4.5,
      status: 'vegetative',
      expectedYield: 90, // Quintals
      timeline: wheatTimeline,
      notes: 'Certified seed treated with Trichoderma viride.'
    });

    const mustardSowingDate = new Date();
    mustardSowingDate.setDate(mustardSowingDate.getDate() - 15);
    const mustardTimeline = generateCropTimeline('mustard', mustardSowingDate);
    mustardTimeline[0].completed = true;
    mustardTimeline[0].completedAt = mustardSowingDate;

    await CropRecord.create({
      farm: farm2._id,
      farmer: farmer._id,
      cropName: 'Mustard',
      variety: 'Pusa Bold',
      season: 'Rabi',
      sowingDate: mustardSowingDate,
      expectedHarvestDate: new Date(mustardSowingDate.getTime() + 110 * 24 * 60 * 60 * 1000),
      areaPlanted: 3.0,
      status: 'vegetative',
      expectedYield: 24,
      timeline: mustardTimeline,
      notes: 'Sown under drip line.'
    });

    console.log('🧪 Seeding soil health records and automated diagnostics...');
    const diag1 = analyzeSoilMetrics(240, 18, 110, 7.8);
    await SoilHealth.create({
      farm: farm1._id,
      farmer: farmer._id,
      sampleDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      nitrogen: 240,
      phosphorus: 18,
      potassium: 110,
      phLevel: 7.8,
      organicCarbon: 0.48,
      electricalConductivity: 0.42,
      moisture: 28,
      fertilityRating: diag1.fertilityRating,
      deficiencyAlerts: diag1.deficiencyAlerts,
      recommendations: diag1.recommendations
    });

    const diag2 = analyzeSoilMetrics(340, 32, 210, 6.8);
    await SoilHealth.create({
      farm: farm2._id,
      farmer: farmer._id,
      sampleDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      nitrogen: 340,
      phosphorus: 32,
      potassium: 210,
      phLevel: 6.8,
      organicCarbon: 0.72,
      electricalConductivity: 0.31,
      moisture: 35,
      fertilityRating: diag2.fertilityRating,
      deficiencyAlerts: diag2.deficiencyAlerts,
      recommendations: diag2.recommendations
    });

    console.log('🛒 Seeding agricultural resource catalogue...');
    const resources = await Resource.insertMany([
      {
        title: 'Certified Wheat Seed HD-3086 (40kg Bag)',
        titleHi: 'प्रमाणित गेहूं बीज HD-3086 (40 किग्रा बैग)',
        category: 'seeds',
        description: 'High-yielding, rust-resistant wheat seed variety suitable for timely sown irrigated conditions.',
        descriptionHi: 'उच्च उपज और रतुआ प्रतिरोधी गेहूं बीज किस्म, सिंचित क्षेत्रों के लिए उत्तम।',
        price: 1450,
        unit: '40kg Bag',
        stockQuantity: 120,
        brand: 'National Seeds Corporation',
        imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop',
        rating: 4.9
      },
      {
        title: 'Neem-Coated Urea (45kg Bag)',
        titleHi: 'नीम लेपित यूरिया (45 किग्रा बैग)',
        category: 'fertilizers',
        description: 'Slow-release nitrogen fertilizer that enhances nitrogen use efficiency and limits leaching.',
        descriptionHi: 'धीमी गति से अवशोषित होने वाला नाइट्रोजन उर्वरक जो मिट्टी की सेहत बनाए रखता है।',
        price: 266,
        unit: '45kg Bag',
        stockQuantity: 350,
        brand: 'IFFCO',
        imageUrl: 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?w=600&auto=format&fit=crop',
        rating: 4.8
      },
      {
        title: 'Di-Ammonium Phosphate (DAP 18:46:0)',
        titleHi: 'डीएपी खाद (18:46:0) - 50 किग्रा',
        category: 'fertilizers',
        description: 'Essential phosphatic fertilizer for vigorous root proliferation and sturdy crop establishment.',
        descriptionHi: 'जड़ों के तेजी से विकास और मजबूत फसल स्थापना के लिए फास्फेटिक खाद।',
        price: 1350,
        unit: '50kg Bag',
        stockQuantity: 180,
        brand: 'KRIBHCO',
        imageUrl: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=600&auto=format&fit=crop',
        rating: 4.9
      },
      {
        title: 'Organic Cold-Pressed Neem Oil (1500 PPM)',
        titleHi: 'जैविक कोल्ड-प्रेस्ड नीम तेल (1500 PPM) - 1 लीटर',
        category: 'pesticides',
        description: 'Eco-friendly broad-spectrum bio-pesticide and repellent against aphids, whiteflies, and caterpillars.',
        descriptionHi: 'एफिड्स, सफेद मक्खी और सुंडी के विरुद्ध सुरक्षित जैविक कीटनाशक।',
        price: 480,
        unit: '1 Liter Bottle',
        stockQuantity: 95,
        brand: 'Kisan Kendra Bio',
        imageUrl: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&auto=format&fit=crop',
        rating: 4.7
      },
      {
        title: 'Battery Operated Knapsack Sprayer (16L)',
        titleHi: 'बैटरी चालित नैपसैक स्प्रेयर (16 लीटर)',
        category: 'equipment',
        description: 'Rechargeable 12V 8Ah battery backpack sprayer with dual nozzle and telescopic brass lance.',
        descriptionHi: 'रिचार्जेबल 12V बैटरी से चलने वाला 16 लीटर स्प्रेयर, कीटनाशक व खाद छिड़काव हेतु।',
        price: 2499,
        unit: 'Unit',
        stockQuantity: 40,
        brand: 'AgroPower India',
        imageUrl: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=600&auto=format&fit=crop',
        rating: 4.8
      },
      {
        title: 'Inline Drip Irrigation Lateral Kit (1 Acre)',
        titleHi: 'ड्रिप सिंचाई लेटरल किट (1 एकड़)',
        category: 'irrigation',
        description: '16mm UV stabilized drip lateral pipe with integrated 2 LPH drippers spaced at 40cm, including filter and connectors.',
        descriptionHi: '16 मिमी यूवी प्रतिरोधी ड्रिप पाइप, फिल्टर और कनेक्टर्स सहित पूरा 1 एकड़ किट।',
        price: 7800,
        unit: 'Complete Kit',
        stockQuantity: 25,
        brand: 'Jain Irrigation',
        imageUrl: 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?w=600&auto=format&fit=crop',
        rating: 4.9
      }
    ]);

    console.log('📦 Seeding sample order with live tracking history...');
    await Order.create({
      farmer: farmer._id,
      items: [
        {
          resource: resources[0]._id,
          title: resources[0].title,
          unitPrice: 1450,
          quantity: 2,
          totalItemPrice: 2900
        },
        {
          resource: resources[3]._id,
          title: resources[3].title,
          unitPrice: 480,
          quantity: 2,
          totalItemPrice: 960
        }
      ],
      totalAmount: 3860,
      shippingAddress: {
        recipientName: 'Gurpreet Singh',
        phone: '+91 98765 43210',
        village: 'Samrala',
        district: 'Ludhiana',
        state: 'Punjab',
        pincode: '141114'
      },
      paymentMethod: 'Cash on Delivery',
      isPaid: false,
      status: 'dispatched',
      trackingHistory: [
        { status: 'placed', timestamp: new Date(Date.now() - 48 * 3600 * 1000), notes: 'Order placed via AgriTech Portal.' },
        { status: 'confirmed', timestamp: new Date(Date.now() - 36 * 3600 * 1000), notes: 'Stock verified at Ludhiana Agro Hub.' },
        { status: 'dispatched', timestamp: new Date(Date.now() - 12 * 3600 * 1000), notes: 'Order dispatched with rural logistics partner.' }
      ]
    });

    console.log('💬 Seeding community forum discussions...');
    await ForumPost.create({
      author: farmer._id,
      title: 'How to manage Yellow Rust (पीला रतुआ) in early sown wheat?',
      content: 'I noticed small yellow stripe lesions on the lower leaves of HD-3086 in the morning. Night temperatures have been cool and humid. What is the recommended organic or bio-chemical treatment?',
      cropTag: 'Wheat',
      category: 'Pest & Disease',
      upvotes: [farmer._id, admin._id],
      replies: [
        {
          author: expert._id,
          isExpertReply: true,
          content: 'Hello Gurpreet ji. Yellow rust thrives in 10-18°C temperature with fog or dews. Immediately inspect whether the yellow powder stains your fingers. If confirmed, spray Propiconazole 25 EC (Tilt) @ 1 ml/liter or Nativo (Tebuconazole + Trifloxystrobin) @ 0.5 g/liter immediately. Ensure nozzle reaches under-canopy.',
          createdAt: new Date(Date.now() - 12 * 3600 * 1000)
        }
      ]
    });

    console.log('🩺 Seeding expert consultation requests...');
    await Consultation.create({
      farmer: farmer._id,
      expert: expert._id,
      subject: 'Severe curling and leaf crinkling in Mustard seedlings',
      cropAffected: 'Mustard',
      symptoms: 'Young tender leaves are curling inward with black dots underneath. Growth is stunted.',
      severity: 'Urgent / High',
      status: 'answered',
      expertAdvice: 'These symptoms indicate severe aphid (Lipaphis erysimi) nymph infestation sucking phloem sap. Avoid over-dosing nitrogenous fertilizer as it promotes succulent leaves.',
      prescription: [
        {
          productOrMeasure: 'Neem Oil 1500 PPM + Detergent solution',
          dosage: '5 ml / liter of water',
          applicationTiming: 'Late evening spray'
        },
        {
          productOrMeasure: 'Dimethoate 30% EC (Rogor) if pest count > 20/plant',
          dosage: '1.7 ml / liter of water',
          applicationTiming: 'Clear sunny morning'
        }
      ],
      answeredAt: new Date()
    });

    console.log('⚠️ Seeding regional weather & pest alerts...');
    await WeatherAlert.create({
      state: 'Punjab',
      district: 'Ludhiana',
      alertType: 'High Pest Risk',
      severity: 'Warning',
      title: 'Aphid & Whitefly Outbreak Advisory for Central Punjab',
      titleHi: 'मध्य पंजाब में माहू व सफेद मक्खी के प्रकोप की चेतावनी',
      description: 'Persistent dry weather coupled with morning humidity has accelerated aphid reproduction in oilseeds and vegetable crops.',
      descriptionHi: 'लगातार शुष्क मौसम और सुबह की आर्द्रता से सरसों और सब्जियों में माहू कीट की संख्या बढ़ रही है।',
      affectedCrops: ['Mustard', 'Wheat', 'Tomato', 'Potato'],
      recommendedAction: 'Install yellow sticky traps (15/acre) and initiate prophylactic neem oil spray immediately.',
      recommendedActionHi: 'प्रति एकड़ 15 पीले चिपचिपे ट्रैप लगाएं और तुरंत नीम तेल का छिड़काव शुरू करें।',
      validUntil: new Date(Date.now() + 5 * 24 * 3600 * 1000),
      isActive: true
    });

    console.log('✅ Realistic AgriTech demo dataset seeded successfully!');
    console.log('\n--- DEMO USER CREDENTIALS ---');
    console.log('Farmer:  farmer@agritech.com  |  Farmer@123');
    console.log('Expert:  expert@agritech.com  |  Expert@123');
    console.log('Admin:   admin@agritech.com   |  Admin@123');
    console.log('-----------------------------\n');

    if (exitOnComplete) {
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    if (exitOnComplete) {
      process.exit(1);
    }
    throw error;
  }
};

if (require.main === module) {
  seedData(true);
}

module.exports = { seedData };
