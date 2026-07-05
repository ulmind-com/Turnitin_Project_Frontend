import React, { useState } from 'react';
import { HiOutlineCheckCircle } from 'react-icons/hi';
import toast from 'react-hot-toast';

export default function GradingSidebar({ doc, onSaveGrade }) {
  const [grade, setGrade] = useState(doc?.grade !== undefined && doc?.grade !== null ? doc.grade : '');
  const [feedback, setFeedback] = useState(doc?.feedback || '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (grade !== '' && (isNaN(grade) || grade < 0 || grade > 100)) {
      toast.error('Grade must be a number between 0 and 100');
      return;
    }
    
    setSaving(true);
    try {
      if (onSaveGrade) {
        await onSaveGrade({ grade: grade !== '' ? parseFloat(grade) : null, feedback });
      }
      toast.success('Grade and feedback saved successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save grade');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Top Header */}
      <div className="p-6 border-b border-slate-200 bg-white">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Grading & Feedback</h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          Provide numerical grading and comprehensive feedback comments on student submissions.
        </p>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Numerical Grade */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Grade (out of 100)
          </label>
          <div className="relative rounded-xl shadow-sm max-w-[160px]">
            <input
              type="number"
              min="0"
              max="100"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              placeholder="--"
              className="block w-full pr-12 pl-4 py-2.5 border border-slate-200 rounded-xl text-slate-800 font-bold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-slate-400 font-bold">/100</span>
            </div>
          </div>
        </div>

        {/* General Feedback */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Instructor Feedback
          </label>
          <textarea
            rows="10"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Provide constructive feedback here..."
            className="block w-full p-4 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm leading-relaxed"
          />
        </div>

        {/* Save Button */}
        <button
          type="submit"
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-3 px-4 rounded-xl transition-all duration-150 shadow-md shadow-blue-200"
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-slate-300 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <HiOutlineCheckCircle className="text-lg" />
              Save Grade
            </>
          )}
        </button>
      </form>
    </div>
  );
}
