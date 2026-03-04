import { useState } from 'react';
import { INDIAN_STATES, fieldLabels } from '../utils/theme';

export function ProfileForm({ questions, intentSummary, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({});
  const [error, setError] = useState('');

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const handleSubmit = () => {
    const allFilled = questions.every(q => formData[q.field]?.trim());
    if (!allFilled) {
      setError('Sabhi jawab bharna zaroori hai');
      return;
    }
    onSubmit(formData);
  };

  const renderInput = (question) => {
    const { field, hint } = question;
    const value = formData[field] || '';

    if (field === 'gender') {
      return (
        <select
          value={value}
          onChange={(e) => handleChange(field, e.target.value)}
          className="w-full px-4 py-2.5 rounded-[10px] border-2 border-[#e2dcd4] bg-[#f5f0ea] text-sm outline-none focus:border-[#e8570a] focus:bg-white transition-colors"
        >
          <option value="">-- chunein --</option>
          <option value="male">Male (Purush)</option>
          <option value="female">Female (Mahila)</option>
          <option value="other">Other</option>
        </select>
      );
    }

    if (field === 'state') {
      return (
        <select
          value={value}
          onChange={(e) => handleChange(field, e.target.value)}
          className="w-full px-4 py-2.5 rounded-[10px] border-2 border-[#e2dcd4] bg-[#f5f0ea] text-sm outline-none focus:border-[#e8570a] focus:bg-white transition-colors"
        >
          <option value="">-- chunein --</option>
          {INDIAN_STATES.map(state => (
            <option key={state} value={state}>{state}</option>
          ))}
        </select>
      );
    }

    if (field === 'caste') {
      return (
        <select
          value={value}
          onChange={(e) => handleChange(field, e.target.value)}
          className="w-full px-4 py-2.5 rounded-[10px] border-2 border-[#e2dcd4] bg-[#f5f0ea] text-sm outline-none focus:border-[#e8570a] focus:bg-white transition-colors"
        >
          <option value="">-- chunein --</option>
          <option value="General">General</option>
          <option value="OBC">OBC (Other Backward Class)</option>
          <option value="SC">SC (Scheduled Caste)</option>
          <option value="ST">ST (Scheduled Tribe)</option>
        </select>
      );
    }

    const isNumber = field === 'age' || field === 'annualIncomeLPA';
    return (
      <input
        type={isNumber ? 'number' : 'text'}
        value={value}
        onChange={(e) => handleChange(field, e.target.value)}
        placeholder={hint || ''}
        min={field === 'age' ? 5 : 0}
        max={field === 'age' ? 100 : undefined}
        step={field === 'annualIncomeLPA' ? 0.5 : undefined}
        className="w-full px-4 py-2.5 rounded-[10px] border-2 border-[#e2dcd4] bg-[#f5f0ea] text-sm outline-none focus:border-[#e8570a] focus:bg-white transition-colors"
      />
    );
  };

  return (
    <div className="bg-white border-2 border-[#ffd4b8] rounded-[18px] p-4 shadow-[0_2px_14px_rgba(0,0,0,0.08)] animate-[fadeUp_0.3s_ease]">
      <h3 className="text-[#0f1f6e] font-bold text-[0.95rem] mb-3.5 flex items-center gap-1.5">
        📋 Thoda aur batayein
      </h3>
      
      {intentSummary && (
        <span className="inline-block text-[#c44a00] text-xs bg-[#fff3ec] px-2.5 py-1 rounded-full mb-3.5">
          🎯 {intentSummary}
        </span>
      )}
      
      <div className="flex flex-col gap-3 mb-4">
        {questions.map(q => (
          <div key={q.field} className="flex flex-col gap-1.5">
            <label className="text-[#6b6880] text-xs font-semibold tracking-wide">
              {q.question}
            </label>
            {renderInput(q)}
            {q.hint && !['gender', 'state', 'caste'].includes(q.field) && (
              <span className="text-[#bbb] text-[0.71rem]">{q.hint}</span>
            )}
          </div>
        ))}
      </div>

      {error && (
        <p className="text-[#c44a00] text-xs text-center mb-3">{error}</p>
      )}
      
      <button
        onClick={handleSubmit}
        className="w-full py-3.5 rounded-full bg-[#e8570a] text-white font-semibold text-sm hover:bg-[#c44a00] transition-colors flex items-center justify-center gap-2"
      >
        🔍 Yojana Dhundho
      </button>
    </div>
  );
}
