// Agronomic Timeline Templates for Indian Crops
// Stages are calculated in Days After Sowing (DAS)

const CROP_TEMPLATES = {
  wheat: {
    durationDays: 130,
    activities: [
      {
        stage: 'Basal Nutrition & Sowing',
        daysAfterSowing: 0,
        category: 'sowing',
        taskDescription: 'Apply basal dose of DAP (50kg/acre) and MOP (20kg/acre). Ensure proper seed treatment with Trichoderma.',
        taskDescriptionHi: 'बुवाई के समय 50 किग्रा डीएपी और 20 किग्रा पोटाश प्रति एकड़ डालें। बीजोपचार ट्राइकोडर्मा से करें।'
      },
      {
        stage: 'Crown Root Initiation (CRI)',
        daysAfterSowing: 21,
        category: 'irrigation',
        taskDescription: 'Critical 1st irrigation at CRI stage. Apply 1st split of Urea (35kg/acre).',
        taskDescriptionHi: 'सीआरआई अवस्था पर पहली सिंचाई करें (बुवाई के 21 दिन बाद)। यूरिया की पहली खुराक (35 किग्रा/एकड़) दें।'
      },
      {
        stage: 'Tillering & Weed Control',
        daysAfterSowing: 35,
        category: 'weeding',
        taskDescription: 'Scout for broadleaf and grassy weeds. Apply selective herbicide if weed pressure is high.',
        taskDescriptionHi: 'खरपतवार नियंत्रण करें। यदि चौड़ी पत्ती वाले खरपतवार हों तो अनुशंसित शाकनाशी का छिड़काव करें।'
      },
      {
        stage: 'Jointing Stage',
        daysAfterSowing: 45,
        category: 'irrigation',
        taskDescription: '2nd irrigation. Apply remaining split of Urea with Zinc Sulphate for vigorous stem elongation.',
        taskDescriptionHi: 'दूसरी सिंचाई करें। जिंक सल्फेट के साथ शेष यूरिया का छिड़काव करें।'
      },
      {
        stage: 'Booting / Panicle Emergence',
        daysAfterSowing: 65,
        category: 'irrigation',
        taskDescription: '3rd critical irrigation. Inspect for yellow rust symptoms on leaves.',
        taskDescriptionHi: 'तीसरी सिंचाई बालियां निकलते समय करें। पीला रतुआ (येलो रस्ट) के लक्षणों की जांच करें।'
      },
      {
        stage: 'Flowering & Fungicide Guard',
        daysAfterSowing: 80,
        category: 'pesticide',
        taskDescription: 'Monitor for aphid infestation or Karnal bunt. Apply neem oil or recommended bio-pesticide if needed.',
        taskDescriptionHi: 'माहू (एफिड्स) और फफूंद जनित रोगों की निगरानी करें। आवश्यकतानुसार नीम तेल या अनुशंसित कीटनाशक का प्रयोग करें।'
      },
      {
        stage: 'Grain Filling (Milking)',
        daysAfterSowing: 95,
        category: 'irrigation',
        taskDescription: '4th light irrigation to prevent moisture stress during grain weight accumulation.',
        taskDescriptionHi: 'दाना भरते समय हल्की सिंचाई करें ताकि नमी की कमी से दाना सिकुड़े नहीं।'
      },
      {
        stage: 'Dough / Maturity Stage',
        daysAfterSowing: 115,
        category: 'harvest',
        taskDescription: 'Stop all irrigation. Allow crop to dry down naturally.',
        taskDescriptionHi: 'सिंचाई पूरी तरह बंद कर दें। फसल को प्राकृतिक रूप से पकने दें।'
      },
      {
        stage: 'Harvesting & Threshing',
        daysAfterSowing: 130,
        category: 'harvest',
        taskDescription: 'Harvest when grains are hard and moisture is below 12-14%. Clean and store in dry place.',
        taskDescriptionHi: 'जब दाने सख्त हो जाएं और नमी 12-14% हो, तब कटाई और गहाई करें।'
      }
    ]
  },
  rice: {
    durationDays: 125,
    activities: [
      {
        stage: 'Transplanting & Basal Fertilizer',
        daysAfterSowing: 0,
        category: 'sowing',
        taskDescription: 'Transplant 20-25 day old seedlings. Apply DAP (40kg/acre) and Zinc (10kg/acre) in puddle soil.',
        taskDescriptionHi: 'पौध की रोपाई करें। खेत में डीएपी 40 किग्रा और जिंक 10 किग्रा प्रति एकड़ डालें।'
      },
      {
        stage: 'Active Tillering & Weed Management',
        daysAfterSowing: 20,
        category: 'weeding',
        taskDescription: 'Maintain 2-3 cm standing water. Top-dress with Urea (30kg/acre). Perform manual or cono-weeding.',
        taskDescriptionHi: '2-3 सेमी पानी बनाए रखें। यूरिया 30 किग्रा/एकड़ का छिड़काव करें और खरपतवार निकालें।'
      },
      {
        stage: 'Panicle Initiation',
        daysAfterSowing: 50,
        category: 'fertilizer',
        taskDescription: 'Apply MOP (Potash 15kg/acre) and second split of Urea. Essential for robust panicle length.',
        taskDescriptionHi: 'पोटाश (एमओपी 15 किग्रा) और यूरिया की दूसरी खुराक दें ताकि बालियां लंबी और स्वस्थ बनें।'
      },
      {
        stage: 'Stem Borer & Leaf Folder Scouting',
        daysAfterSowing: 65,
        category: 'pesticide',
        taskDescription: 'Check for dead hearts or folded leaves. Install pheromone traps or spray neem formulation.',
        taskDescriptionHi: 'तना छेदक और पत्ती लपेटक की जांच करें। फेरोमोन ट्रैप लगाएं या नीम आधारित कीटनाशक का छिड़काव करें।'
      },
      {
        stage: 'Flowering & Grain Filling',
        daysAfterSowing: 85,
        category: 'irrigation',
        taskDescription: 'Ensure field does not dry out. Protect against blast disease and gundhi bug.',
        taskDescriptionHi: 'खेत में नमी बनाए रखें। ब्लास्ट रोग और गांधी बग कीट से बचाव करें।'
      },
      {
        stage: 'Pre-Harvest Drainage',
        daysAfterSowing: 110,
        category: 'harvest',
        taskDescription: 'Drain water 10-14 days before expected harvest to facilitate combine harvesting.',
        taskDescriptionHi: 'कटाई से 10-14 दिन पहले खेत से सारा पानी निकाल दें।'
      },
      {
        stage: 'Harvesting',
        daysAfterSowing: 125,
        category: 'harvest',
        taskDescription: 'Harvest when 85% of panicles turn golden brown.',
        taskDescriptionHi: 'जब 85% बालियां सुनहरी भूरी हो जाएं तब कटाई करें।'
      }
    ]
  },
  mustard: {
    durationDays: 110,
    activities: [
      {
        stage: 'Sowing & Basal Dose',
        daysAfterSowing: 0,
        category: 'sowing',
        taskDescription: 'Sow in well-pulverized moist soil. Apply single super phosphate (SSP) for sulphur nutrition.',
        taskDescriptionHi: 'अच्छी नमी वाले खेत में बुवाई करें। सल्फर की पूर्ति के लिए सिंगल सुपर फॉस्फेट (एसएसपी) डालें।'
      },
      {
        stage: 'Thinning & Weeding',
        daysAfterSowing: 20,
        category: 'weeding',
        taskDescription: 'Thin plants to maintain 10-15 cm spacing. 1st irrigation and top-dress urea.',
        taskDescriptionHi: 'पौधों के बीच 10-15 सेमी की दूरी रखने के लिए छंटाई करें। पहली सिंचाई करें और यूरिया डालें।'
      },
      {
        stage: 'Flowering & Aphid (Chetpa) Protection',
        daysAfterSowing: 50,
        category: 'pesticide',
        taskDescription: 'Regularly inspect inflorescence for aphids. Spray neem extract or dimethoate if pest threshold crossed.',
        taskDescriptionHi: 'माहू (चेपा) कीट की निगरानी करें। प्रकोप दिखने पर नीम का तेल या अनुशंसित दवा का छिड़काव करें।'
      },
      {
        stage: 'Pod Formation (Siliqua)',
        daysAfterSowing: 75,
        category: 'irrigation',
        taskDescription: 'Critical 2nd irrigation at siliqua development to maximize oil content.',
        taskDescriptionHi: 'फलियां बनते समय दूसरी महत्वपूर्ण सिंचाई करें ताकि दानों में तेल की मात्रा बढ़े।'
      },
      {
        stage: 'Maturity & Harvesting',
        daysAfterSowing: 110,
        category: 'harvest',
        taskDescription: 'Harvest in morning hours when pods turn yellowish to minimize shattering losses.',
        taskDescriptionHi: 'सुबह के समय कटाई करें जब फलियां पीली हो जाएं, ताकि दाने बिखरें नहीं।'
      }
    ]
  },
  maize: {
    durationDays: 105,
    activities: [
      {
        stage: 'Sowing & Basal Fertilizer',
        daysAfterSowing: 0,
        category: 'sowing',
        taskDescription: 'Sow at 60cm row-to-row and 20cm plant-to-plant spacing. Apply NPK complex (50kg/acre).',
        taskDescriptionHi: 'कतार से कतार 60 सेमी और पौधे से पौधा 20 सेमी की दूरी पर बुवाई करें। एनपीके खाद डालें।'
      },
      {
        stage: 'Knee-High Stage',
        daysAfterSowing: 30,
        category: 'fertilizer',
        taskDescription: 'Top-dress with Urea. Scout for Fall Armyworm (FAW) egg masses in the whorl.',
        taskDescriptionHi: 'घुटने की ऊंचाई पर यूरिया डालें। फॉल आर्मीवर्म कीट के अंडों और सुंडी की पत्तियों में जांच करें।'
      },
      {
        stage: 'Tasseling & Silking',
        daysAfterSowing: 55,
        category: 'irrigation',
        taskDescription: 'Most sensitive stage for moisture stress. Ensure adequate irrigation.',
        taskDescriptionHi: 'मंजरी (टेसल) और बाल (सिल्क) आते समय खेत में बिल्कुल सूखा न पड़ने दें, सिंचाई करें।'
      },
      {
        stage: 'Cob Development',
        daysAfterSowing: 75,
        category: 'fertilizer',
        taskDescription: 'Monitor kernel filling and cob borer. Light irrigation if rain is absent.',
        taskDescriptionHi: 'भुट्टे में दाना भरने की निगरानी करें। बारिश न होने पर हल्की सिंचाई करें।'
      },
      {
        stage: 'Harvest',
        daysAfterSowing: 105,
        category: 'harvest',
        taskDescription: 'Harvest when husk leaves turn brown and black layer forms at seed base.',
        taskDescriptionHi: 'जब भुट्टे के छिलके सूखकर भूरे हो जाएं तब भुट्टों की तुड़ाई करें।'
      }
    ]
  },
  cotton: {
    durationDays: 160,
    activities: [
      {
        stage: 'Sowing & Pre-emergence Weed Control',
        daysAfterSowing: 0,
        category: 'sowing',
        taskDescription: 'Sow Bt-cotton seeds on ridges. Apply basal DAP and potash.',
        taskDescriptionHi: 'मेड़ों पर कपास की बुवाई करें। डीएपी और पोटाश की आधार खुराक डालें।'
      },
      {
        stage: 'Square (Bud) Formation',
        daysAfterSowing: 45,
        category: 'fertilizer',
        taskDescription: 'Apply urea split. Install pheromone traps for pink bollworm detection.',
        taskDescriptionHi: 'फूल की कलियां बनते समय यूरिया डालें। गुलाबी सुंडी की निगरानी के लिए फेरोमोन ट्रैप लगाएं।'
      },
      {
        stage: 'Peak Flowering & Boll Setting',
        daysAfterSowing: 75,
        category: 'pesticide',
        taskDescription: 'Scout for sucking pests (whitefly, jassids). Spray 1% potassium nitrate (13:0:45) to prevent boll shedding.',
        taskDescriptionHi: 'रस चूसक कीटों (सफेद मक्खी) की जांच करें। गूलर गिरने से रोकने के लिए 13:0:45 का छिड़काव करें।'
      },
      {
        stage: 'Boll Development & Irrigation',
        daysAfterSowing: 110,
        category: 'irrigation',
        taskDescription: 'Provide timely irrigation. Prevent waterlogging.',
        taskDescriptionHi: 'समय पर सिंचाई दें, खेत में जलभराव न होने दें।'
      },
      {
        stage: 'Boll Bursting & First Picking',
        daysAfterSowing: 140,
        category: 'harvest',
        taskDescription: 'Pick dry, clean bolls during sunny hours. Store in clean bags.',
        taskDescriptionHi: 'धूप में अच्छी तरह खिले हुए गूलरों से साफ कपास की पहली चुगाई करें।'
      },
      {
        stage: 'Final Picking',
        daysAfterSowing: 160,
        category: 'harvest',
        taskDescription: 'Complete remaining pickings. Shred and incorporate crop residue to break pest cycle.',
        taskDescriptionHi: 'अंतिम चुगाई पूरी करें और अवशेषों को नष्ट करें ताकि कीट चक्र समाप्त हो।'
      }
    ]
  },
  general: {
    durationDays: 100,
    activities: [
      {
        stage: 'Land Preparation & Sowing',
        daysAfterSowing: 0,
        category: 'sowing',
        taskDescription: 'Prepare fine seedbed and apply organic manure / balanced basal NPK.',
        taskDescriptionHi: 'खेत की अच्छी जुताई कर सड़ी गोबर की खाद और संतुलित एनपीके उर्वरक डालें।'
      },
      {
        stage: 'Early Vegetative Stage',
        daysAfterSowing: 20,
        category: 'irrigation',
        taskDescription: 'First irrigation and intercultural weeding operation.',
        taskDescriptionHi: 'पहली सिंचाई करें और निराई-गुड़ाई कर खरपतवार निकालें।'
      },
      {
        stage: 'Mid-Season Top Dressing',
        daysAfterSowing: 45,
        category: 'fertilizer',
        taskDescription: 'Top-dress nitrogenous fertilizer and scout for foliar pests.',
        taskDescriptionHi: 'यूरिया की खुराक दें और पत्तियों पर कीट-रोगों की निगरानी करें।'
      },
      {
        stage: 'Flowering / Fruiting Guard',
        daysAfterSowing: 70,
        category: 'pesticide',
        taskDescription: 'Maintain soil moisture and apply recommended pest repellent.',
        taskDescriptionHi: 'नमी बनाए रखें और आवश्यकता पड़ने पर कीट निवारक का प्रयोग करें।'
      },
      {
        stage: 'Crop Maturity & Harvesting',
        daysAfterSowing: 100,
        category: 'harvest',
        taskDescription: 'Check crop maturity index and harvest under clear sunny weather.',
        taskDescriptionHi: 'फसल पकने की जांच करें और साफ मौसम में कटाई करें।'
      }
    ]
  }
};

/**
 * Generates an individualized crop activity timeline based on crop name and sowing date.
 * @param {string} cropName - Name of the crop (e.g. 'Wheat', 'Rice', 'Mustard')
 * @param {Date|string} sowingDate - Sowing / Planting date
 * @returns {Array} Timeline activities with calculated scheduledDate
 */
const generateCropTimeline = (cropName, sowingDate) => {
  const normalized = (cropName || '').toLowerCase().trim();
  const template = CROP_TEMPLATES[normalized] || CROP_TEMPLATES.general;
  const baseDate = new Date(sowingDate);

  return template.activities.map((act) => {
    const scheduled = new Date(baseDate);
    scheduled.setDate(scheduled.getDate() + act.daysAfterSowing);

    return {
      stage: act.stage,
      daysAfterSowing: act.daysAfterSowing,
      scheduledDate: scheduled,
      category: act.category,
      taskDescription: act.taskDescription,
      taskDescriptionHi: act.taskDescriptionHi,
      completed: false,
      completedAt: null,
      notes: ''
    };
  });
};

const getEstimatedHarvestDate = (cropName, sowingDate) => {
  const normalized = (cropName || '').toLowerCase().trim();
  const template = CROP_TEMPLATES[normalized] || CROP_TEMPLATES.general;
  const harvestDate = new Date(sowingDate);
  harvestDate.setDate(harvestDate.getDate() + template.durationDays);
  return harvestDate;
};

module.exports = {
  generateCropTimeline,
  getEstimatedHarvestDate
};
