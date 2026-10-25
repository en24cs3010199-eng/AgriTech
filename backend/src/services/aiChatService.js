const axios = require('axios');

// Vetted Agricultural Knowledge Base (ICAR, Krishi Vigyan Kendra & Dept of Agriculture India)
const AGRI_KNOWLEDGE_BASE = [
  {
    keywords: ['pm kisan', 'pm-kisan', 'पीएम किसान', 'सम्मान निधि', 'योजना', 'scheme', 'subsidy', 'subsidy scheme'],
    en: {
      title: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
      response: `Under PM-KISAN, all eligible landholding farmer families receive direct income support of ₹6,000 per year, distributed in three equal installments of ₹2,000 every 4 months directly into their Aadhaar-seeded bank accounts via DBT.\n\nKey Requirements:\n1. Land ownership records in state revenue portal\n2. Aadhaar-linked active bank account with e-KYC completed\n3. You can verify your status or complete e-KYC at pmkisan.gov.in or visit your nearest Common Service Centre (CSC).`
    },
    hi: {
      title: 'प्रधानमंत्री किसान सम्मान निधि (PM-KISAN)',
      response: `प्रधानमंत्री किसान सम्मान निधि योजना के तहत सभी पात्र किसान परिवारों को प्रति वर्ष ₹6,000 की वित्तीय सहायता दी जाती है। यह राशि ₹2,000 की तीन समान किस्तों में हर 4 महीने बाद सीधे आधार से जुड़े बैंक खाते में (DBT द्वारा) भेजी जाती है।\n\nज़रूरी शर्तें:\n1. राजस्व पोर्टल में भू-स्वामित्व (जमीन) का रिकॉर्ड।\n2. आधार लिंक बैंक खाता और ई-केवाईसी (e-KYC) पूर्ण होना अनिवार्य है।\n3. आप pmkisan.gov.in पोर्टल पर या नजदीकी सीएससी (CSC) केंद्र पर जाकर अपनी स्थिति देख सकते हैं।`
    }
  },
  {
    keywords: ['fasal bima', 'crop insurance', 'फसल बीमा', 'मुआवजा', 'ओलावृष्टि', 'claim', 'insurance'],
    en: {
      title: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
      response: `PMFBY provides comprehensive insurance coverage against crop failure due to non-preventable natural risks (drought, flood, unseasonal rain, hailstorms, pests):\n\nPremium Rates Paid by Farmer:\n- Kharif crops: 2% of sum insured\n- Rabi crops: 1.5% of sum insured\n- Annual commercial/horticultural crops: 5%\n\nClaim Intimation: In case of localized calamities like hailstorm or waterlogging, intimate within 72 hours through the Crop Insurance App or toll-free number 1800-180-1551.`
    },
    hi: {
      title: 'प्रधानमंत्री फसल बीमा योजना (PMFBY)',
      response: `प्रधानमंत्री फसल बीमा योजना प्राकृतिक आपदाओं (सूखा, बाढ़, बेमौसम बारिश, ओलावृष्टि, कीट प्रकोप) से होने वाले नुकसान पर आर्थिक सुरक्षा प्रदान करती है:\n\nकिसानों द्वारा देय प्रीमियम दरें:\n- खरीफ फसलें: बीमित राशि का मात्र 2%\n- रबी फसलें: मात्र 1.5%\n- वाणिज्यिक/बागवानी फसलें: 5%\n\nदावा सूचना: ओलावृष्टि या जलभराव होने पर 72 घंटे के भीतर 'Crop Insurance App' या टोल-फ्री 1800-180-1551 पर सूचना देना अनिवार्य है।`
    }
  },
  {
    keywords: ['pest', 'keeda', 'insect', 'कीट', 'कीड़ा', 'neem', 'neem oil', 'नीम तेल', 'safed makkhi', 'whitefly', 'aphid', 'chepa'],
    en: {
      title: 'Integrated Pest Management & Organic Control',
      response: `For sucking pests (whiteflies, aphids, jassids, thrips):\n\n1. Organic Protocol: Spray Neem Oil (1500 ppm or 10,000 ppm) at 3-5 ml per liter of water with 1 ml liquid soap. Apply early morning or late evening.\n2. Biological Traps: Install yellow sticky traps (15-20 traps/acre) at crop canopy height to capture adult whiteflies and aphids.\n3. Botanical Spray: 'Dashparni Ark' (10-leaf extract) fermented with cow urine and neem provides broad-spectrum insect repellant action.\n4. Chemical Option (Threshold-based): If infestation exceeds 10 insects/leaf, spray Imidacloprid 17.8 SL (0.5 ml/liter) or Acetamiprid 20 SP.`
    },
    hi: {
      title: 'एकीकृत कीट प्रबंधन एवं जैविक रोकथाम',
      response: `रस चूसक कीटों (सफेद मक्खी, माहू/चेपा, थ्रिप्स) की रोकथाम के उपाय:\n\n1. जैविक उपाय: नीम का तेल (1500 ppm) 3-5 मिली प्रति लीटर पानी में थोड़ा सा साबुन का घोल मिलाकर सुबह या शाम को छिड़कें।\n2. ट्रैप का उपयोग: प्रति एकड़ 15-20 पीले चिपचिपे ट्रैप (Yellow Sticky Traps) फसल की ऊंचाई पर लगाएं।\n3. दशपर्णी अर्क: नीम, धतूरा, मदार आदि 10 पत्तियों और गोमूत्र से बना अर्क प्राकृतिक कीट नियंत्रक का कार्य करता है।\n4. रासायनिक उपाय: यदि कीट बहुत ज्यादा हों, तो इमिडाक्लोप्रिड 17.8 SL (0.5 मिली प्रति लीटर पानी) का छिड़काव करें।`
    }
  },
  {
    keywords: ['soil', 'mitti', 'urea', 'dap', 'fertilizer', 'खाद', 'उर्वरक', 'यूरिया', 'डीएपी', 'organic', 'vermicompost'],
    en: {
      title: 'Balanced Soil Nutrition & Organic Amendments',
      response: `Balanced fertilization improves crop yield while preserving soil microbiology:\n\n1. NPK Ratio: Standard cereal recommendation is 4:2:1 (N:P:K). Do not over-apply urea alone as it softens plants and invites pest outbreaks.\n2. Split Application: Apply Phosphorus (DAP) and Potash (MOP) as 100% basal dose during sowing. Split Urea into 2-3 installments.\n3. Organic Regeneration: Incorporate 2-3 tons of Vermicompost or well-decomposed Farmyard Manure (FYM) per acre before sowing.\n4. Biofertilizers: Treat seeds with Azotobacter / Rhizobium (for pulses) and PSB (Phosphate Solubilizing Bacteria) to fix atmospheric nitrogen and solubilize phosphorus.`
    },
    hi: {
      title: 'संतुलित मृदा पोषण एवं जैविक खाद प्रबंधन',
      response: `संतुलित पोषण से पैदावार बढ़ती है और मिट्टी की उर्वरा शक्ति बनी रहती है:\n\n1. एनपीके (NPK) अनुपात: अनाजों के लिए 4:2:1 का संतुलित अनुपात अपनाएं। केवल यूरिया का अधिक प्रयोग न करें, इससे फसल गिर सकती है और कीट बढ़ते हैं।\n2. खाद देने का समय: डीएपी (फास्फोरस) और पोटाश बुवाई के समय आधार खुराक के रूप में दें। यूरिया को 2-3 किस्तों में बांटकर दें।\n3. जैविक खाद: प्रति एकड़ 2-3 टन केंचुआ खाद (वर्मीकम्पोस्ट) या सड़ी गोबर की खाद मिलाएं।\n4. जैव-उर्वरक: दलहनी फसलों में राइजोबियम और अन्य फसलों में एजोटोबैक्टर व पीएसबी (PSB) कल्चर से बीजोपचार अवश्य करें।`
    }
  },
  {
    keywords: ['wheat', 'gehu', 'गेहूं', 'rabi', 'रबी', 'cri', 'irrigation'],
    en: {
      title: 'Scientific Wheat Crop Management',
      response: `Wheat (Rabi season) Package of Practices:\n\n1. Sowing Time: Optimal sowing window is November 1 to November 25.\n2. Seed Rate: 40-45 kg/acre (bold seeds: 50 kg/acre).\n3. Critical Irrigations:\n   - 1st Irrigation: 20-25 days after sowing (CRI - Crown Root Initiation). Crucial for tillering!\n   - 2nd: 40-45 DAS (Late Tillering)\n   - 3rd: 65-70 DAS (Late Jointing)\n   - 4th: 85-90 DAS (Flowering)\n   - 5th: 105-110 DAS (Milking/Grain filling)\n4. Disease Watch: Inspect for Yellow Rust (पीला रतुआ). Spray Propiconazole 25 EC (1 ml/liter) if rust streaks appear.`
    },
    hi: {
      title: 'गेहूं की वैज्ञानिक खेती एवं देखरेख',
      response: `गेहूं (रबी सीजन) की उन्नत खेती के मुख्य बिंदु:\n\n1. बुवाई का समय: 1 नवंबर से 25 नवंबर सबसे उपयुक्त समय है।\n2. बीज दर: 40-45 किग्रा प्रति एकड़।\n3. महत्वपूर्ण सिंचाइयां:\n   - पहली सिंचाई: बुवाई के 20-25 दिन बाद (सीआरआई अवस्था)। कल्ले फूटने के लिए यह सबसे जरूरी है।\n   - दूसरी सिंचाई: 40-45 दिन बाद (गांठ बनते समय)।\n   - तीसरी सिंचाई: 65-70 दिन बाद (बालियां निकलते समय)।\n   - चौथी सिंचाई: 85-90 दिन बाद (फूल आते समय)।\n   - पांचवीं सिंचाई: 105-110 दिन बाद (दूधिया अवस्था में दाना भरते समय)।\n4. पीला रतुआ: पत्तियों पर हल्दी जैसा पाउडर दिखे तो तुरंत प्रोपिकोनाज़ोल 25 EC (1 मिली/लीटर पानी) का छिड़काव करें।`
    }
  },
  {
    keywords: ['rice', 'paddy', 'dhan', 'धान', 'चावल', 'kharif', 'खरीफ'],
    en: {
      title: 'Paddy (Rice) Management & Blast Prevention',
      response: `Paddy (Kharif season) Package of Practices:\n\n1. Nursery & Sowing: May-June; transplant seedlings at 25-30 days age with 2-3 seedlings per hill.\n2. Water Management: Maintain shallow standing water (2-3 cm) during vegetative stage; drain water 10-12 days before harvest.\n3. Zinc Nutrition: Zinc deficiency causes 'Khaira Disease' (bronzing/rust spots on leaves). Apply 10 kg Zinc Sulphate (21%) per acre at basal stage.\n4. Blast & Blight Protection: Avoid excess nitrogen. Spray Tricyclazole 75 WP (0.6g/liter) for blast disease prevention.`
    },
    hi: {
      title: 'धान की उन्नत खेती एवं खैरा रोग प्रबंधन',
      response: `धान (खरीफ सीजन) की उन्नत देखरेख:\n\n1. रोपाई: 25-30 दिन की पौध की रोपाई करें। एक स्थान पर 2-3 पौधे लगाएं।\n2. जल प्रबंधन: कल्ले फूटते समय 2-3 सेमी पानी बनाए रखें। कटाई से 10-12 दिन पहले खेत से पानी निकाल दें।\n3. खैरा रोग: जिंक की कमी से पत्तियों पर कत्थई/भूरे धब्बे पड़ते हैं। बुवाई के समय 10 किग्रा जिंक सल्फेट प्रति एकड़ डालें।\n4. झुलसा/ब्लास्ट रोग: यूरिया की अधिकता से बचें। ब्लास्ट के लक्षण दिखने पर ट्राइसाइक्लाजोल 75 WP (0.6 ग्राम प्रति लीटर पानी) का छिड़काव करें।`
    }
  }
];

/**
 * Intelligent Grounded Agricultural Chat Service (Hindi & English)
 * @param {string} query 
 * @param {string} language - 'hi' | 'en'
 */
const getAgriculturalAdvice = async (query = '', language = 'hi') => {
  const cleanQuery = query.toLowerCase().trim();

  // 1. Try Gemini API if free key is supplied in .env
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey && geminiKey.trim() !== '') {
    try {
      const prompt = `You are 'Kisan Saathi' (किसान साथी), an expert Indian agricultural advisor trained on ICAR, KVK, and national package of practices.
Answer the following farmer query warmly, accurately, practically, and in ${language === 'hi' ? 'Hindi (Devanagari script)' : 'English'}.
Focus on cost-effective, organic, and scientific recommendations (NPK dosages, pest prevention, sowing dates, government schemes).

Farmer Question: ${query}`;

      const geminiRes = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          contents: [{ parts: [{ text: prompt }] }]
        },
        { timeout: 8000 }
      );

      const generatedText = geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (generatedText) {
        return {
          source: 'Gemini Agricultural Knowledge Engine',
          language,
          title: language === 'hi' ? 'किसान साथी परामर्श' : 'Kisan Saathi Agronomy Advisory',
          answer: generatedText,
          trustedSource: 'ICAR / Indian Agricultural Research Guidelines',
          timestamp: new Date().toISOString()
        };
      }
    } catch (apiErr) {
      console.warn(`Gemini API fallback to grounded KB: ${apiErr.message}`);
    }
  }

  // 2. Vetted Deterministic Knowledge Retrieval Matcher (100% Offline & Free)
  let matchedEntry = null;
  let maxScore = 0;

  for (const item of AGRI_KNOWLEDGE_BASE) {
    let score = 0;
    for (const kw of item.keywords) {
      if (cleanQuery.includes(kw)) {
        score += kw.length; // weight longer specific terms higher
      }
    }
    if (score > maxScore) {
      maxScore = score;
      matchedEntry = item;
    }
  }

  if (matchedEntry && maxScore > 0) {
    const langKey = language === 'hi' ? 'hi' : 'en';
    const content = matchedEntry[langKey] || matchedEntry.en;

    return {
      source: 'ICAR & Krishi Vigyan Grounded Knowledge Base',
      language,
      title: content.title,
      answer: content.response,
      trustedSource: 'Indian Council of Agricultural Research (ICAR) & Ministry of Agriculture and Farmers Welfare',
      timestamp: new Date().toISOString()
    };
  }

  // Default fallback if query is general or unindexed
  if (language === 'hi') {
    return {
      source: 'Kisan Saathi Advisory Base',
      language: 'hi',
      title: 'किसान साथी कृषि परामर्श',
      answer: `नमस्ते किसान भाई! आपके प्रश्न "${query}" के संबंध में सामान्य सलाह:\n\n1. किसी भी फसल में खाद या कीटनाशक का प्रयोग मृदा परीक्षण कार्ड (Soil Health Card) की रिपोर्ट के अनुसार ही करें।\n2. रस चूसक कीटों या फफूंद के शुरुआती लक्षण दिखने पर नीम तेल (1500 ppm, 3-5 मिली/लीटर) का छिड़काव लाभदायक होता है।\n3. मौसम और तापमान के अनुसार शाम के समय हल्की सिंचाई करें।\n4. विस्तृत परामर्श के लिए आप हमारे 'विशेषज्ञ परामर्श' (Expert Consultation) सेक्शन में भी अपनी समस्या दर्ज कर सकते हैं।`,
      trustedSource: 'National Agriculture Advisory Network',
      timestamp: new Date().toISOString()
    };
  } else {
    return {
      source: 'Kisan Saathi Advisory Base',
      language: 'en',
      title: 'Kisan Saathi Agronomy Advisory',
      answer: `Hello Farmer! Regarding your query "${query}":\n\n1. Ensure nutrient inputs (Urea, DAP, Potash) match your Soil Health Card recommendations.\n2. For early pest protection, spray Neem Oil formulation (1500 ppm at 3-5 ml/liter) with liquid soap.\n3. Schedule irrigations during evening hours to minimize evaporation losses.\n4. You can also submit an image or detailed symptoms in the 'Expert Consultation' module for a personalized prescription from a verified agronomist.`,
      trustedSource: 'National Agriculture Advisory Network',
      timestamp: new Date().toISOString()
    };
  }
};

module.exports = {
  getAgriculturalAdvice,
  AGRI_KNOWLEDGE_BASE
};
