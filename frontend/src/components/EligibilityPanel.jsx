import { useState } from 'react';
import { BottomSheet, BottomSheetSection, ActionButton } from './BottomSheet';
import { api } from '../services/api';

export function EligibilityPanel({ scheme, isOpen, onClose }) {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleOpen = () => {
    if (scheme?.eligibilityParsed?.questions) {
      setQuestions(scheme.eligibilityParsed.questions);
      setAnswers([]);
      setCurrentIndex(0);
      setResult(null);
    }
  };

  const handleAnswer = (answer) => {
    const newAnswers = [...answers, {
      question: questions[currentIndex].title || questions[currentIndex].question,
      userAnswer: answer,
    }];
    setAnswers(newAnswers);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      checkEligibility(newAnswers);
    }
  };

  const checkEligibility = async (finalAnswers) => {
    setLoading(true);
    try {
      const data = await api.eligibilityCheck(scheme.slug, finalAnswers);
      setResult(data);
    } catch (err) {
      setResult({ eligible: null, verdict: `Error: ${err.message}` });
    }
    setLoading(false);
  };

  const progress = questions.length > 0 ? Math.round((currentIndex / questions.length) * 100) : 0;

  const getResultClass = () => {
    if (result?.eligible === true) return 'pass';
    if (result?.eligible === false) return 'fail';
    return 'partial';
  };

  const getResultIcon = () => {
    if (result?.eligible === true) return '✅';
    if (result?.eligible === false) return '❌';
    return '⚠️';
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Eligibility Check">
      <div className="px-5 py-4">
        {!scheme?.eligibilityParsed?.questions ? (
          <p className="text-[#6b6880] text-sm">Is scheme ke liye koi eligibility questions available nahi hain.</p>
        ) : result ? (
          <>
            <div className={`p-4 rounded-[12px] mb-4 border-l-4 ${
              result.eligible === true ? 'bg-[#ebf7ea] border-[#107a0d] text-[#155724]' :
              result.eligible === false ? 'bg-[#ffebee] border-[#ef5350] text-[#c62828]' :
              'bg-[#fff8e1] border-[#ffb74d] text-[#6d4c41]'
            }`}>
              {getResultIcon()} {result.verdict || 'Result available nahi hai.'}
            </div>
            <ActionButton variant="outline" className="w-full" onClick={onClose}>
              ← Wapas Jaiye
            </ActionButton>
          </>
        ) : loading ? (
          <div className="text-center py-8">
            <div className="flex justify-center gap-1.5 mb-3">
              {[0, 1, 2].map(i => (
                <span key={i} className="w-1.5 h-1.5 bg-[#e8570a] rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
            <p className="text-[#6b6880] text-sm">Checking eligibility…</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-4 text-[#6b6880] text-xs">
              <span>Sawaal {currentIndex + 1} / {questions.length}</span>
              <div className="flex-1 h-1 bg-[#e2dcd4] rounded-full overflow-hidden">
                <div className="h-full bg-[#e8570a] transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <p className="text-[#1a1225] font-medium mb-5 leading-relaxed">
              {questions[currentIndex]?.title || questions[currentIndex]?.question}
            </p>
            <div className="flex gap-2.5">
              <button 
                onClick={() => handleAnswer('Yes')}
                className="flex-1 py-3.5 rounded-full border-2 border-transparent font-semibold bg-[#ebf7ea] text-[#107a0d] border-[#b2e0b0] hover:bg-[#b2e0b0] transition-colors"
              >
                ✅ Haan (Yes)
              </button>
              <button 
                onClick={() => handleAnswer('No')}
                className="flex-1 py-3.5 rounded-full border-2 border-transparent font-semibold bg-[#ffebee] text-[#c62828] border-[#ffcdd2] hover:bg-[#ffcdd2] transition-colors"
              >
                ❌ Nahi (No)
              </button>
            </div>
          </>
        )}
      </div>
    </BottomSheet>
  );
}
