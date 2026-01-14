"use client";

import { useState, useRef, useEffect } from "react";
import { Mail, ChevronDown, Check, Loader2 } from "lucide-react";
import { submitContactForm, ContactFormData } from "@/lib/xano-api";

const REASONS = [
  "General enquiry",
  "Error in database",
  "Error on the map",
  "Other"
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    organisation: "",
    email: "",
    reason: "",
    comments: "",
  });

  const [isReasonOpen, setIsReasonOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const reasonRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (reasonRef.current && !reasonRef.current.contains(event.target as Node)) {
        setIsReasonOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.organisation) newErrors.organisation = "Organisation is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format";
    if (!formData.reason) newErrors.reason = "Reason is required";
    if (!formData.comments) newErrors.comments = "Comments are required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitSuccess(false);
    setErrors({});

    try {
      const submitData: ContactFormData = {
        name: formData.name,
        organisation: formData.organisation,
        email: formData.email,
        reason: formData.reason,
        comments: formData.comments,
      };

      await submitContactForm(submitData);
      
      setSubmitSuccess(true);
      
      // 重置表單
      setFormData({
        name: "",
        organisation: "",
        email: "",
        reason: "",
        comments: "",
      });
      
      // 3 秒後隱藏成功訊息
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (error: any) {
      console.error('提交聯繫表單失敗:', error);
      setErrors({ submit: error.message || '提交失敗，請稍後再試' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-32 pb-24 bg-white min-h-screen">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-[#3B3469] text-3xl font-extrabold tracking-tight">Contact Us</h1>
          <p className="text-[#1E1B4B]/60 text-sm">
            Fill in the form to get in contact with us.
          </p>
        </div>

        {/* Success Message */}
        {submitSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl">
            <p className="text-green-800 text-sm font-medium">
              ✅ 訊息已成功發送！我們會盡快與您聯繫。
            </p>
          </div>
        )}

        {/* Submit Error Message */}
        {errors.submit && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
            <p className="text-red-800 text-sm font-medium">
              ❌ {errors.submit}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Your Name */}
          <div className="space-y-2">
            <label className="text-[13px] font-bold text-[#3B3469]">Your Name *</label>
            <input 
              type="text" 
              className={`w-full bg-[#F3F4F6] border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-[#3B3469] transition-all ${errors.name ? "ring-2 ring-red-400" : ""}`}
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          {/* Your Organisation */}
          <div className="space-y-2">
            <label className="text-[13px] font-bold text-[#3B3469]">Your Organisation *</label>
            <input 
              type="text" 
              placeholder="The organisation, business or initiative you represent"
              className={`w-full bg-[#F3F4F6] border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-[#3B3469] transition-all ${errors.organisation ? "ring-2 ring-red-400" : ""}`}
              value={formData.organisation}
              onChange={(e) => setFormData({...formData, organisation: e.target.value})}
            />
          </div>

          {/* Your Email */}
          <div className="space-y-2">
            <label className="text-[13px] font-bold text-[#3B3469]">Your Email *</label>
            <div className="relative">
              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="email" 
                className={`w-full bg-[#F3F4F6] border-none rounded-2xl pl-16 pr-6 py-4 focus:ring-2 focus:ring-[#3B3469] transition-all ${errors.email ? "ring-2 ring-red-400" : ""}`}
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          {/* Reason for getting in contact */}
          <div className="space-y-2 relative" ref={reasonRef}>
            <label className="text-[13px] font-bold text-[#3B3469]">Reason for getting in contact *</label>
            <div 
              onClick={() => setIsReasonOpen(!isReasonOpen)}
              className={`w-full bg-white border border-gray-200 rounded-2xl px-6 py-4 flex items-center justify-between cursor-pointer hover:border-gray-300 transition-all ${errors.reason ? "border-red-400" : ""}`}
            >
              <span className={`text-sm ${formData.reason ? "text-[#1E1B4B]" : "text-gray-400"}`}>
                {formData.reason || "Select one from the dropdown"}
              </span>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isReasonOpen ? "rotate-180" : ""}`} />
            </div>

            {/* Custom Dropdown */}
            {isReasonOpen && (
              <div className="absolute left-0 top-full mt-2 w-full bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2">
                {REASONS.map((reason) => (
                  <div 
                    key={reason}
                    onClick={() => {
                      setFormData({...formData, reason});
                      setIsReasonOpen(false);
                    }}
                    className="px-8 py-5 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-none flex items-center justify-between"
                  >
                    <span className="text-[#1E1B4B] font-medium text-sm">{reason}</span>
                    {formData.reason === reason && <Check className="w-4 h-4 text-[#3B3469]" />}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Comments/notes */}
          <div className="space-y-2">
            <label className="text-[13px] font-bold text-[#3B3469]">Comments/notes: *</label>
            <textarea 
              rows={5}
              className={`w-full bg-[#F3F4F6] border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-[#3B3469] transition-all ${errors.comments ? "ring-2 ring-red-400" : ""}`}
              value={formData.comments}
              onChange={(e) => setFormData({...formData, comments: e.target.value})}
            />
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#3B3469] text-white py-4 rounded-2xl font-bold hover:bg-[#2D2852] transition-all shadow-lg mt-8 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                發送中...
              </>
            ) : (
              'Get In Contact Now'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
