import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, ChevronRight, CornerDownLeft, Sparkles } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const FAQS = [
  {
    id: 1,
    question: "How do I create a new invoice?",
    answer: "Go to the Invoices tab and click the 'Create Invoice' button. You can add client details, line items, select your currency, and apply taxes."
  },
  {
    id: 2,
    question: "Can I add GST to my invoices?",
    answer: "Absolutely! In the invoice form, look for the 'GST %' field. It will automatically calculate the tax amount and add it to your grand total."
  },
  {
    id: 3,
    question: "How do I email an invoice to a client?",
    answer: "Once an invoice is saved, open it and click the 'Send via Email' button. We'll automatically generate a PDF and email it to your client's inbox."
  },
  {
    id: 4,
    question: "What is included in the Pro Plan?",
    answer: "The Pro Plan unlocks unlimited clients, custom branding (your logo & colors), digital signatures on invoices, and premium high-deliverability email routing."
  },
  {
    id: 5,
    question: "How do I add my signature and logo?",
    answer: "Navigate to the 'Branding' page from the sidebar menu. There you can upload a logo, set your brand color, and draw or upload your signature."
  }
];

const FAQBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', text: "Hi there! 👋 I'm your InvoiceFlow Assistant. How can I help you today?" }
  ]);
  const [showOptions, setShowOptions] = useState(true);
  const messagesEndRef = useRef(null);
  const location = useLocation();

  // Hide on auth pages
  const hiddenPaths = ['/login', '/register', '/forgot-password', '/reset-password', '/onboarding', '/super-admin-secret-dashboard'];
  if (hiddenPaths.some(p => location.pathname.includes(p))) {
    return null;
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => scrollToBottom(), 100);
    }
  }, [messages, isOpen]);

  const handleOptionClick = (faq) => {
    setShowOptions(false);
    setMessages(prev => [
      ...prev,
      { type: 'user', text: faq.question },
      { type: 'bot', text: faq.answer }
    ]);
  };

  const handleReset = () => {
    setMessages(prev => [
      ...prev,
      { type: 'bot', text: "What else would you like to know?" }
    ]);
    setShowOptions(true);
  };

  return (
    <div className="faq-bot-container">
      {isOpen && (
        <div className="faq-bot-window">
          <div className="faq-bot-header">
            <div className="faq-bot-title">
              <Sparkles size={16} color="#c4b5fd" />
              <span>InvoiceFlow Assistant</span>
            </div>
            <button className="faq-bot-close" onClick={() => setIsOpen(false)}>
              <X size={18} />
            </button>
          </div>
          
          <div className="faq-bot-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`faq-message-wrapper ${msg.type}`}>
                <div className={`faq-message ${msg.type}`}>
                  {msg.text}
                </div>
              </div>
            ))}

            {showOptions && (
              <div className="faq-options-list">
                {FAQS.map(faq => (
                  <button 
                    key={faq.id} 
                    className="faq-option-btn"
                    onClick={() => handleOptionClick(faq)}
                  >
                    <span>{faq.question}</span>
                    <ChevronRight size={14} />
                  </button>
                ))}
              </div>
            )}

            {!showOptions && (
              <div className="faq-action-row">
                <button className="faq-back-btn" onClick={handleReset}>
                  <CornerDownLeft size={14} /> Back to questions
                </button>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      <button 
        className={`faq-bot-toggle ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>
    </div>
  );
};

export default FAQBot;
