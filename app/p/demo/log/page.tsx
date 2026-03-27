"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DemoControls } from "@/components/demo/DemoControls";
import { MotionStep } from "@/components/motion/MotionStep";
import { StepProgress } from "@/components/patient/StepProgress";
import { NumberStepper } from "@/components/patient/NumberStepper";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, Camera, FileEdit, CheckCircle2, ScanLine } from "lucide-react";
import { format, subDays } from "date-fns";
import { toast } from "sonner";
import { MOCK_READINGS } from "@/lib/mock-data";

const STEP_LABELS = [
  "Select Date",
  "Fasting Blood Sugar",
  "Post-Dinner Sugar",
  "Blood Pressure",
  "Pulse Rate",
  "Weight",
  "Waistline",
  "Review",
];

type LogData = {
  date: string;
  fastingSugar: number | "";
  postDinnerSugar: number | "";
  systolic: number | "";
  diastolic: number | "";
  pulse: number | "";
  weight: number | "";
  waistline: number | "";
};

/** Daily log page for patient readings capture flow. */
export default function LoggingPage() {
  const router = useRouter();
  
  // 0 = Method Choice, 0.5 = Scanning Stub, 1-8 = Manual Steps
  const [step, setStep] = useState(0); 
  const [method, setMethod] = useState<"photo" | "manual" | null>(null);
  
  const [data, setData] = useState<LogData>({
    date: format(new Date(), "yyyy-MM-dd"),
    fastingSugar: "",
    postDinnerSugar: "",
    systolic: "",
    diastolic: "",
    pulse: "",
    weight: "",
    waistline: "",
  });

  const [validationError, setValidationError] = useState("");
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);

  // Restore draft on mount
  useEffect(() => {
    if (localStorage.getItem("demo_reading_today") === "true") {
      setShowDuplicateDialog(true);
    }
    const draft = localStorage.getItem("demo_log_draft");
    const draftStep = localStorage.getItem("demo_log_step");
    if (draft) {
      try {
        setData(JSON.parse(draft));
      } catch (e: unknown) {
        console.error("Failed to parse localStorage:", e);
      }
    }
    if (draftStep) {
      setStep(parseFloat(draftStep));
    }
  }, []);

  // Autosave when data or step changes
  useEffect(() => {
    // Only autosave on manual steps, not the scanning stub
    if (step >= 1) {
      const timer = setTimeout(() => {
        localStorage.setItem("demo_log_draft", JSON.stringify(data));
        localStorage.setItem("demo_log_step", step.toString());
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [data, step]);

  const handleNext = () => {
    setValidationError("");
    if (step === 1 && !data.date) return setValidationError("Date is required.");
    // We allow skipping fields, but if desired could validate step 2 onwards
    
    if (step < 8) {
      setStep(s => s + 1);
    } else {
      submitForm();
    }
  };

  const handleBack = () => {
    setValidationError("");
    if (step > 1) {
      setStep(s => s - 1);
    } else if (step === 1) {
      setStep(0);
      setMethod(null);
    }
  };

  const handlePhotoSelect = () => {
    setMethod("photo");
    toast("Photo scan coming soon - please use manual entry for now.");
  };

  const handleManualSelect = () => {
    setMethod("manual");
    setStep(1);
  };

  const submitForm = () => {
    localStorage.removeItem("demo_log_draft");
    localStorage.removeItem("demo_log_step");
    localStorage.setItem("demo_reading_today", new Date().toDateString());
    
    // Add to history
    const historyStr = localStorage.getItem("demo_readings_history");
    const history = historyStr ? JSON.parse(historyStr) : MOCK_READINGS;
    
    const newEntry = {
      id: `r${Date.now()}`,
      patientId: "demo",
      readingDate: data.date,
      fastingBloodSugar: Number(data.fastingSugar) || 0,
      postDinnerBloodSugar: Number(data.postDinnerSugar) || 0,
      bloodPressureSystolic: Number(data.systolic) || 0,
      bloodPressureDiastolic: Number(data.diastolic) || 0,
      pulseRate: Number(data.pulse) || 0,
      weightKg: Number(data.weight) || 0,
      waistlineCm: Number(data.waistline) || 0,
      entryMethod: method === "photo" ? "photo_extracted" : "manual",
      submittedAt: new Date().toISOString(),
    };
    
    history.unshift(newEntry);
    localStorage.setItem("demo_readings_history", JSON.stringify(history));
    
    router.push("/p/demo/log/success");
  };

  // Dates for selector
  const past7Days = Array.from({length: 7}).map((_, i) => subDays(new Date(), i));

  // STEP 0.5: SCANNING STUB VIEW
  if (step === 0.5) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 max-w-md md:max-w-2xl mx-auto relative overflow-hidden text-center z-50">
        <DemoControls />
        
        <div className="relative w-64 h-80 border-2 border-primary/50 rounded-xl overflow-hidden mb-8">
          {/* Mock Document Backdrop */}
          <div className="absolute inset-0 bg-white/10 m-4 rounded blur-[2px]" />
          
          {/* Scan Line Animation */}
          <div className="absolute top-0 left-0 h-[3px] w-full animate-scanning bg-primary shadow-[0_0_15px_rgba(58,125,102,0.8)]" />
          
          <div className="absolute inset-0 flex items-center justify-center">
            <ScanLine size={48} className="text-primary animate-pulse" />
          </div>
        </div>
        
        <h2 className="text-xl font-bold text-white mb-2">Analyzing log sheet...</h2>
        <p className="text-gray-400 text-sm">Please hold your camera steady.</p>
      </div>
    );
  }

  // STEP 0: ENTRY CHOICE
  if (step === 0) {
    return (
      <div className="min-h-screen bg-bg-main flex flex-col max-w-md md:max-w-2xl mx-auto relative">
        <DemoControls />
        {/* Sticky header with brand strip on desktop */}
        <div className="sticky top-0 z-10 bg-surface border-b border-depth">
          {/* Brand strip — desktop only */}
          <div
            className="hidden md:flex items-center px-6 py-3 border-b border-depth"
            style={{
              background: "rgba(250, 248, 245, 0.90)",
              backdropFilter: "blur(20px) saturate(180%)",
              WebkitBackdropFilter: "blur(20px) saturate(180%)",
            }}
          >
            <div className="flex flex-col justify-center leading-none select-none">
              <span
                className="text-[18px] text-primary leading-none"
                style={{ fontFamily: "var(--font-display), serif" }}
              >
                Dr. Jasmine
              </span>
              <span className="text-[9px] font-semibold text-text-tertiary mt-1 uppercase tracking-[0.2em]">
                METANOVA HEALTH
              </span>
            </div>
          </div>
          {/* Step 0 navigation row */}
          <div className="flex items-center justify-between px-6 py-4">
            <Link href="/p/demo/home" className="p-2 -ml-2 text-main hover:bg-gray-100 rounded-full">
              <ArrowLeft size={24} />
            </Link>
            <span className="font-bold text-main">Daily Log</span>
            <div className="w-10"></div>
          </div>
        </div>

        <div className="px-6 pt-8 pb-6 flex-1 flex flex-col">
          <h1 className="text-[28px] font-display text-main mb-2">How would you like to log your readings today?</h1>
          <p className="text-text-secondary text-sm mb-12">Choose manual entry, or snap a photo of your paper logbook to auto-fill your numbers.</p>

          <div className="space-y-4">
            <div
              className={`rounded-2xl border p-6 transition-all ${
                method === "photo"
                  ? "bg-primary-light border-primary/40 shadow-card"
                  : "bg-surface border-border shadow-sm"
              }`}
            >
              <button
                type="button"
                onClick={handlePhotoSelect}
                className="w-full text-left"
                aria-pressed={method === "photo"}
                title="Coming soon - not available yet"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center text-primary">
                    <Camera size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-main">Take a photo instead</h3>
                    <p className="text-sm text-text-secondary mt-1">Auto-scan your paper logbook in one step.</p>
                    <span className="mt-2 inline-block text-xs font-medium text-text-tertiary bg-depth px-2 py-1 rounded-full">
                      Coming soon
                    </span>
                  </div>
                </div>
              </button>
            </div>
            <div
              className={`rounded-2xl border p-6 transition-all ${
                method === "manual"
                  ? "bg-primary-light border-primary/40 shadow-card"
                  : "bg-surface border-border shadow-sm"
              }`}
            >
              <button
                type="button"
                onClick={handleManualSelect}
                className="w-full text-left"
                aria-pressed={method === "manual"}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-depth rounded-full flex items-center justify-center text-main">
                    <FileEdit size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-main">Enter readings manually</h3>
                    <p className="text-sm text-text-secondary mt-1">Enter each reading with bilingual labels and step guidance.</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // STEPS 1-8: MANUAL FORM
  return (
    <div className="min-h-screen bg-bg-main flex flex-col max-w-md md:max-w-2xl mx-auto relative overflow-hidden pb-32">
      <DemoControls />

      {/* Top Bar with Cancel/Close */}
      <div className="bg-surface sticky top-0 z-10 border-b border-border">
        {/* Brand strip — desktop only */}
        <div
          className="hidden md:flex items-center px-6 py-3 border-b border-depth"
          style={{
            background: "rgba(250, 248, 245, 0.90)",
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
          }}
        >
          <div className="flex flex-col justify-center leading-none select-none">
            <span
              className="text-[18px] text-primary leading-none"
              style={{ fontFamily: "var(--font-display), serif" }}
            >
              Dr. Jasmine
            </span>
            <span className="text-[9px] font-semibold text-text-tertiary mt-1 uppercase tracking-[0.2em]">
              METANOVA HEALTH
            </span>
          </div>
        </div>
        {/* Cancel / title / step counter row */}
        <div className="flex items-center justify-between px-6 py-4">
          <Link href="/p/demo/home" className="text-sm font-semibold text-secondary hover:text-main">
            Cancel
          </Link>
          <span className="font-bold text-main text-sm">Log Readings</span>
          <div className="w-10 text-right text-xs font-bold text-primary">{step}/8</div>
        </div>
      </div>
      
      {/* Progress */}
      <div
        className="px-6 py-3 bg-surface z-10 border-b border-border shadow-sm flex flex-col items-center"
        aria-label={`Step ${step} of ${STEP_LABELS.length}: ${STEP_LABELS[step - 1]}`}
      >
        <StepProgress totalSteps={8} currentStep={step} />
        <p className="mt-1 text-center text-sm font-medium text-primary">
          {STEP_LABELS[step - 1]}
        </p>
      </div>

      <div className="flex-1 px-6 py-6 overflow-y-auto w-full">
        {method === "photo" && step < 8 && (
          <div className="px-4 py-3 bg-primary-light text-primary border border-primary/20 rounded-xl mb-6 text-sm flex gap-2 font-medium">
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            <p>We&apos;ve extracted the numbers from your photo. Please confirm they are correct.</p>
          </div>
        )}

        <MotionStep stepKey={step} direction={1}>
          
          {step === 1 && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-main mb-6">Select Date</h1>
              <div className="grid grid-cols-2 gap-3">
                {past7Days.map((d, i) => {
                  const val = format(d, "yyyy-MM-dd");
                  const isSelected = data.date === val;
                  const label = i === 0 ? "Today" : i === 1 ? "Yesterday" : format(d, "EEE, d MMM");
                  
                  return (
                    <button
                      key={val}
                      onClick={() => setData({...data, date: val})}
                      className={`h-14 rounded-xl border text-sm font-bold transition-colors flex items-center justify-center ${
                        isSelected 
                          ? "bg-primary border-primary text-white shadow-md ring-2 ring-primary ring-offset-2" 
                          : "bg-white border-border text-main hover:border-gray-300"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 flex flex-col items-center pt-8">
              <NumberStepper 
                value={Number(data.fastingSugar) || 0} 
                onChange={(v) => setData({...data, fastingSugar: v})} 
                min={0} max={30} step={0.1}
                label="Fasting Blood Sugar"
                labelZh="空腹血糖"
                unit="mmol/L"
                defaultValue={5.5}
                inputMode="decimal"
              />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 flex flex-col items-center pt-8">
              <NumberStepper 
                value={Number(data.postDinnerSugar) || 0} 
                onChange={(v) => setData({...data, postDinnerSugar: v})} 
                min={0} max={30} step={0.1}
                label="Post-Dinner Sugar"
                labelZh="饭后血糖 (两小时)"
                unit="mmol/L"
                defaultValue={7.0}
                inputMode="decimal"
              />
            </div>
          )}

          {step === 4 && (
            <div className="space-y-8 flex flex-col pt-4">
              <h1 className="text-2xl font-bold text-main text-center">Blood Pressure</h1>
              
              <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col items-center gap-6">
                <div className="w-full">
                  <div className="flex justify-center">
                    <NumberStepper 
                      value={Number(data.systolic) || 0} 
                      onChange={(v) => setData({...data, systolic: v})} 
                      min={0} max={250} step={1}
                      label="Systolic"
                      labelZh="收缩压 (高压)"
                      unit="mmHg"
                      defaultValue={120}
                      inputMode="numeric"
                    />
                  </div>
                </div>
                
                <div className="w-full h-px bg-border" />
                
                <div className="w-full">
                  <div className="flex justify-center">
                    <NumberStepper 
                      value={Number(data.diastolic) || 0} 
                      onChange={(v) => setData({...data, diastolic: v})} 
                      min={0} max={150} step={1}
                      label="Diastolic"
                      labelZh="舒张压 (低压)"
                      unit="mmHg"
                      defaultValue={80}
                      inputMode="numeric"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-8 flex flex-col items-center pt-8">
              <NumberStepper 
                value={Number(data.pulse) || 0} 
                onChange={(v) => setData({...data, pulse: v})} 
                min={0} max={200} step={1}
                label="Pulse Rate"
                labelZh="心率"
                unit="bpm"
                defaultValue={72}
                inputMode="numeric"
              />
            </div>
          )}

          {step === 6 && (
            <div className="space-y-8 flex flex-col items-center pt-8">
              <NumberStepper 
                value={Number(data.weight) || 0} 
                onChange={(v) => setData({...data, weight: v})} 
                min={30} max={200} step={0.1}
                label="Weight"
                labelZh="体重"
                unit="kg"
                defaultValue={65}
                inputMode="decimal"
              />
            </div>
          )}

          {step === 7 && (
            <div className="space-y-8 flex flex-col items-center pt-8">
              <NumberStepper 
                value={Number(data.waistline) || 0} 
                onChange={(v) => setData({...data, waistline: v})} 
                min={30} max={200} step={1}
                label="Waistline"
                labelZh="腰围"
                unit="cm"
                defaultValue={85}
                inputMode="numeric"
              />
            </div>
          )}

          {step === 8 && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-main mb-2">Review & Submit</h1>
                <p className="text-secondary text-sm">Please make sure the numbers are correct.</p>
              </div>

              <div className="bg-white rounded-2xl border border-border shadow-sm divide-y divide-border">
                
                <div className="p-4 flex justify-between items-center bg-gray-50 rounded-t-2xl">
                  <span className="font-semibold text-main">Date</span>
                  <span className="font-bold text-primary">{format(new Date(data.date), "dd MMM yyyy")}</span>
                </div>

                <div className="p-4 flex justify-between items-center">
                  <span className="font-medium text-secondary">Fasting Blood Sugar</span>
                  <span className="font-bold text-main">{data.fastingSugar || "—"} <span className="text-xs text-secondary font-normal">mmol/L</span></span>
                </div>
                
                <div className="p-4 flex justify-between items-center">
                  <span className="font-medium text-secondary">Post-Dinner Sugar</span>
                  <span className="font-bold text-main">{data.postDinnerSugar || "—"} <span className="text-xs text-secondary font-normal">mmol/L</span></span>
                </div>
                
                <div className="p-4 flex justify-between items-center">
                  <span className="font-medium text-secondary">Blood Pressure</span>
                  <span className="font-bold text-main">
                    {data.systolic || "—"}/{data.diastolic || "—"} <span className="text-xs text-secondary font-normal">mmHg</span>
                  </span>
                </div>

                <div className="p-4 flex justify-between items-center">
                  <span className="font-medium text-secondary">Pulse</span>
                  <span className="font-bold text-main">{data.pulse || "—"} <span className="text-xs text-secondary font-normal">bpm</span></span>
                </div>

                <div className="p-4 flex justify-between items-center">
                  <span className="font-medium text-secondary">Weight</span>
                  <span className="font-bold text-main">{data.weight || "—"} <span className="text-xs text-secondary font-normal">kg</span></span>
                </div>

                <div className="p-4 flex justify-between items-center">
                  <span className="font-medium text-secondary">Waistline</span>
                  <span className="font-bold text-main">{data.waistline || "—"} <span className="text-xs text-secondary font-normal">cm</span></span>
                </div>
              </div>
            </div>
          )}

        </MotionStep>
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-surface/90 backdrop-blur border-t border-depth p-4 z-40 max-w-md md:max-w-2xl mx-auto">
        {validationError && (
          <p className="text-danger text-sm font-medium mb-3 text-center" aria-live="polite" role="alert">{validationError}</p>
        )}
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="patient"
            className="w-1/3"
            onClick={handleBack}
          >
            {step === 8 ? "Edit" : "Back"}
          </Button>

          <Button
            variant="default"
            size="patient"
            className={step === 8 ? "w-2/3" : "flex-1"}
            onClick={handleNext}
          >
            {step === 8 ? "Submit →" : "Next →"}
          </Button>
        </div>
      </div>

      <Dialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-[28px] font-display text-main">Update readings?</DialogTitle>
            <DialogDescription className="text-text-secondary">
              You have already logged today&apos;s readings. Would you like to update them?
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-2">
            <Button
              onClick={() => setShowDuplicateDialog(false)}
              variant="default"
              size="patient"
              className="w-full"
            >
              Yes, update
            </Button>
            <Button
              variant="outline"
              size="patient"
              onClick={() => router.push("/p/demo/home")}
              className="w-full"
            >
              No, go back
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
