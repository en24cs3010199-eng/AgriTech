import React, { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export const KisanSaathiDrawer = () => {
  const { language, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      title: language === 'hi' ? 'नमस्ते किसान भाई!' : 'Hello Farmer!',
      text: language === 'hi'
        ? 'मैं आपका डिजिटल कृषि सहायक "किसान साथी" हूँ। आप मुझसे फसलों, खाद, कीट नियंत्रण, मौसम या सरकारी योजनाओं के बारे में हिंदी या अंग्रेजी में पूछ सकते हैं।'
        : 'I am "Kisan Saathi", your digital agronomic assistant. Ask me anything about crop diseases, NPK fertilizer dosages, organic pest solutions, or government schemes!',
      source: 'ICAR / Krishi Vigyan Kendra Knowledge Base',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (queryText = inputQuery) => {
    const textToSend = queryText.trim();
    if (!textToSend) return;

    // Add user message
    const userMsg = {
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    try {
      const res = await api.post('/ai/kisan-saathi', {
        query: textToSend,
        language
      });

      if (res.data.success && res.data.data) {
        const botMsg = {
          sender: 'bot',
          title: res.data.data.title,
          text: res.data.data.answer,
          source: res.data.data.trustedSource,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, botMsg]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          title: 'Advisory Note',
          text: language === 'hi'
            ? 'क्षमा करें, इस समय संपर्क स्थापित नहीं हो सका। कृपया पुनः प्रयास करें या हमारे विशेषज्ञ अनुभाग में प्रश्न पूछें।'
            : 'Unable to reach advisory engine at this moment. Please try again or ask an agronomist in the Expert Consultation section.',
          source: 'System Fallback',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const samplePrompts = [
    { labelHi: '🌾 गेहूं में पहला पानी (CRI)?', labelEn: '🌾 Wheat 1st Irrigation (CRI)?', query: language === 'hi' ? 'गेहूं में पहला पानी कब देना चाहिए और यूरिया की कितनी मात्रा डालें?' : 'When is the first irrigation (CRI stage) for wheat and what is urea dosage?' },
    { labelHi: '🐛 नीम तेल से कीट नियंत्रण?', labelEn: '🐛 Neem oil for pest control?', query: language === 'hi' ? 'सफेद मक्खी और माहू कीट से बचाव के लिए नीम तेल का छिड़काव कैसे करें?' : 'How to spray neem oil for aphids and whiteflies control organically?' },
    { labelHi: '💰 पीएम किसान सम्मान निधि?', labelEn: '💰 PM-Kisan installment rules?', query: language === 'hi' ? 'पीएम किसान सम्मान निधि योजना की किस्त और ई-केवाईसी कैसे करें?' : 'What are the rules and e-KYC steps for PM-Kisan scheme?' },
    { labelHi: '🌱 धान में खैरा रोग और जिंक?', labelEn: '🌱 Paddy Khaira disease & Zinc?', query: language === 'hi' ? 'धान में खैरा रोग के लक्षण और जिंक सल्फेट का प्रयोग' : 'Signs of Khaira disease in paddy and zinc sulphate dosage' }
  ];

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-success position-fixed bottom-0 end-0 m-4 rounded-circle shadow-lg d-flex align-items-center justify-content-center border-2 border-white pulse-button"
        style={{ width: '64px', height: '64px', zIndex: 1050 }}
        title="Kisan Saathi AI Assistant / किसान साथी"
      >
        <span className="fs-3">🤖</span>
      </button>

      {/* Slide-out Chat Drawer */}
      {isOpen && (
        <div
          className="card position-fixed bottom-0 end-0 m-md-4 shadow-2xl border-0 overflow-hidden"
          style={{
            width: '100%',
            maxWidth: '430px',
            height: '620px',
            maxHeight: '90vh',
            zIndex: 1060,
            borderRadius: '16px'
          }}
        >
          {/* Header */}
          <div className="card-header bg-dark-green text-white p-3 d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2">
              <span className="fs-4 bg-light bg-opacity-25 rounded-circle p-1">👨‍🌾</span>
              <div>
                <h6 className="mb-0 fw-bold">{t('kisan_saathi.title')}</h6>
                <small className="text-white-50" style={{ fontSize: '0.7rem' }}>
                  {language === 'hi' ? 'विश्वसनीय कृषि अनुसंधान ज्ञान' : 'Grounded ICAR Agronomic Advisory'}
                </small>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="btn btn-sm btn-link text-white text-decoration-none fs-5 p-0"
            >
              <i className="bi bi-x-circle-fill"></i>
            </button>
          </div>

          {/* Chat Messages Body */}
          <div className="card-body p-3 overflow-auto bg-light" style={{ flex: '1 1 auto' }}>
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`d-flex mb-3 ${m.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
              >
                <div
                  className={`p-3 rounded-4 shadow-sm ${
                    m.sender === 'user'
                      ? 'bg-success text-white'
                      : 'bg-white text-dark border'
                  }`}
                  style={{ maxWidth: '85%' }}
                >
                  {m.title && <div className="fw-bold small mb-1 border-bottom pb-1">{m.title}</div>}
                  <div className="small text-break" style={{ whiteSpace: 'pre-line', lineHeight: '1.45' }}>
                    {m.text}
                  </div>
                  {m.source && (
                    <div className="mt-2 text-muted fw-semibold" style={{ fontSize: '0.65rem' }}>
                      <i className="bi bi-patch-check-fill text-success me-1"></i>
                      {m.source}
                    </div>
                  )}
                  <div
                    className={`text-end mt-1 ${m.sender === 'user' ? 'text-white-50' : 'text-muted'}`}
                    style={{ fontSize: '0.65rem' }}
                  >
                    {m.time}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="d-flex justify-content-start mb-2">
                <div className="bg-white p-2 px-3 rounded-pill border small text-muted d-flex align-items-center gap-2">
                  <div className="spinner-grow spinner-grow-sm text-success" role="status"></div>
                  <span>{language === 'hi' ? 'सलाह खोजी जा रही है...' : 'Retrieving agronomist advisory...'}</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div className="px-3 py-2 bg-white border-top">
            <div className="d-flex gap-1 overflow-auto pb-1" style={{ whiteSpace: 'nowrap' }}>
              {samplePrompts.map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(p.query)}
                  className="btn btn-outline-secondary btn-sm rounded-pill py-0 px-2"
                  style={{ fontSize: '0.72rem' }}
                >
                  {language === 'hi' ? p.labelHi : p.labelEn}
                </button>
              ))}
            </div>
          </div>

          {/* Input Footer */}
          <div className="card-footer bg-white p-2 border-top">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="d-flex gap-2"
            >
              <input
                type="text"
                className="form-control form-control-sm rounded-pill px-3"
                placeholder={t('kisan_saathi.input_placeholder')}
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                disabled={isTyping}
              />
              <button
                type="submit"
                className="btn btn-success btn-sm rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: '36px', height: '36px' }}
                disabled={isTyping || !inputQuery.trim()}
              >
                <i className="bi bi-send-fill"></i>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default KisanSaathiDrawer;
