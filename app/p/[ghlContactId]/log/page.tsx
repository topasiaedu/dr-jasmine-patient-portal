"use client";

import { useState, useEffect, useRef, type ChangeEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
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
import { ArrowLeft, Camera, FileEdit, CheckCircle2, Loader2 } from "lucide-react";
import { format, subDays } from "date-fns";
import { toast } from "sonner";

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

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Daily log page for patient readings capture flow. */
export default function LoggingPage() {
  const router = useRouter();
  const params = useParams();
  const ghlContactId = typeof params?.ghlContactId === "string" ? params.ghlContactId : "";
  const basePath = ghlContactId.length > 0 ? `/p/${ghlContactId}` : "/p";
  
  const [step, setStep] = useState(0);
  const [method, setMethod] = useState<"photo" | "manual" | null>(null);
  const [photoLoading, setPhotoLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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

  const draftKey = `patient_log_draft_${ghlContactId}`;
  const draftStepKey = `patient_log_step_${ghlContactId}`;

  useEffect(() => {
    const draft = localStorage.getItem(draftKey);
    const draftStep = localStorage.getItem(draftStepKey);
    if (draft) {
      try {
        setData(JSON.parse(draft) as LogData);
      } catch (e: unknown) {
        console.error("Failed to parse localStorage:", e);
      }
    }
    if (draftStep) {
      const parsedStep = parseFloat(draftStep);
      if (!Number.isNaN(parsedStep)) {
        setStep(parsedStep === 0.5 ? 0 : parsedStep);
      }
    }
  }, [draftKey, draftStepKey]);

  useEffect(() => {
    if (step >= 1) {
      const timer = setTimeout(() => {
        localStorage.setItem(draftKey, JSON.stringify(data));
        localStorage.setItem(draftStepKey, step.toString());
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [data, step, draftKey, draftStepKey]);

  const handleNext = () => {
    setValidationError("");
    if (step === 1 && !data.date) return setValidationError("Date is required.");
    // We allow skipping fields, but if desired could validate step 2 onwards
    
    if (step < 8) {
      setStep((s) => s + 1);
    } else {
      void submitForm(false);
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

  const handlePhotoSelect = (): void => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) {
      return;
    }

    setPhotoLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/readings/extract-image", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!res.ok) {
        toast.error("Could not read the photo. Please enter manually.");
        setMethod("manual");
        setStep(1);
        return;
      }

      const bodyUnknown: unknown = await res.json();
      const extractedUnknown =
        typeof bodyUnknown === "object" && bodyUnknown !== null
          ? Reflect.get(bodyUnknown, "extracted")
          : undefined;

      if (!isPlainObject(extractedUnknown)) {
        toast.error("Could not read the photo. Please enter manually.");
        setMethod("manual");
        setStep(1);
        return;
      }

      const ext = extractedUnknown;

      setData((prev) => {
        let next: LogData = { ...prev };
        if (typeof ext.fastingBloodSugar === "number" && Number.isFinite(ext.fastingBloodSugar)) {
          next = { ...next, fastingSugar: ext.fastingBloodSugar };
        }
        if (typeof ext.postDinnerBloodSugar === "number" && Number.isFinite(ext.postDinnerBloodSugar)) {
          next = { ...next, postDinnerSugar: ext.postDinnerBloodSugar };
        }
        if (typeof ext.bloodPressureSystolic === "number" && Number.isFinite(ext.bloodPressureSystolic)) {
          next = { ...next, systolic: ext.bloodPressureSystolic };
        }
        if (typeof ext.bloodPressureDiastolic === "number" && Number.isFinite(ext.bloodPressureDiastolic)) {
          next = { ...next, diastolic: ext.bloodPressureDiastolic };
        }
        if (typeof ext.pulseRate === "number" && Number.isFinite(ext.pulseRate)) {
          next = { ...next, pulse: ext.pulseRate };
        }
        if (typeof ext.weightKg === "number" && Number.isFinite(ext.weightKg)) {
          next = { ...next, weight: ext.weightKg };
        }
        if (typeof ext.waistlineCm === "number" && Number.isFinite(ext.waistlineCm)) {
          next = { ...next, waistline: ext.waistlineCm };
        }
        return next;
      });

      setMethod("photo");
      setStep(1);
    } finally {
      setPhotoLoading(false);
    }
  };

  const handleManualSelect = () => {
    setMethod("manual");
    setStep(1);
  };

  const submitForm = async (overwrite: boolean) => {
    const fastingBloodSugar = Number(data.fastingSugar);
    const postDinnerBloodSugar = Number(data.postDinnerSugar);
    const bloodPressureSystolic = Number(data.systolic);
    const bloodPressureDiastolic = Number(data.diastolic);
    const pulseRate = Number(data.pulse);
    const weightKg = Number(data.weight);
    const waistlineCm = Number(data.waistline);
    if (
      Number.isNaN(fastingBloodSugar) ||
      Number.isNaN(postDinnerBloodSugar) ||
      Number.isNaN(bloodPressureSystolic) ||
      Number.isNaN(bloodPressureDiastolic) ||
      Number.isNaN(pulseRate) ||
      Number.isNaN(weightKg) ||
      Number.isNaN(waistlineCm)
    ) {
      toast.error("Please enter valid numbers for all readings.");
      return;
    }

    const res = await fetch("/api/readings", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        readingDate: data.date,
        fastingBloodSugar,
        postDinnerBloodSugar,
        bloodPressureSystolic,
        bloodPressureDiastolic,
        pulseRate,
        weightKg,
        waistlineCm,
        overwrite,
        entryMethod: method === "photo" ? "photo_extracted" : "manual",
      }),
    });

    if (res.status === 409) {
      setShowDuplicateDialog(true);
      return;
    }

    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as { error?: string };
      toast.error(typeof err.error === "string" ? err.error : "Could not save readings.");
      return;
    }

    localStorage.removeItem(draftKey);
    localStorage.removeItem(draftStepKey);
    setShowDuplicateDialog(false);
    router.push(`${basePath}/log/success`);
  };

  // Dates for selector
  const past7Days = Array.from({length: 7}).map((_, i) => subDays(new Date(), i));

  // STEP 0: ENTRY CHOICE
  if (step === 0) {
    return (
      <div className="min-h-screen bg-bg-main flex flex-col max-w-md md:max-w-2xl mx-auto relative">
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
            <Link href={`${basePath}/home`} className="p-2 -ml-2 text-main hover:bg-gray-100 rounded-full">
              <ArrowLeft size={24} />
            </Link>
            <span className="font-bold text-main">Daily Log</span>
            <div className="w-10"></div>
          </div>
        </div>

        <div className="px-6 pt-8 pb-6 flex-1 flex flex-col">
          <h1 className="text-[28px] font-display text-main mb-2">How would you like to log your readings today?</h1>
          <p className="text-text-secondary text-sm mb-12">Log your readings manually below.</p>

          <div className="space-y-4">
            {/* Photo scan hidden until tested — re-enable by removing the false && wrapper */}
            {false && (
            <div
              className={`rounded-2xl border p-6 transition-all ${
                method === "photo"
                  ? "bg-primary-light border-primary/40 shadow-card"
                  : "bg-surface border-border shadow-sm"
              } ${photoLoading ? "opacity-70 pointer-events-none" : ""}`}
            >
              <button
                type="button"
                onClick={handlePhotoSelect}
                disabled={photoLoading}
                className="w-full text-left"
                aria-pressed={method === "photo"}
                aria-busy={photoLoading}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center text-primary">
                    {photoLoading ? (
                      <Loader2 size={22} className="animate-spin" aria-hidden="true" />
                    ) : (
                      <Camera size={22} aria-hidden="true" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-main">Take a photo instead</h3>
                    <p className="text-sm text-text-secondary mt-1">Auto-scan your paper logbook in one step.</p>
                    {photoLoading && (
                      <p className="mt-2 text-sm font-medium text-primary">Analysing photo…</p>
                    )}
                  </div>
                </div>
              </button>
            </div>
            )}
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

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(ev) => {
            void handleFileChange(ev);
          }}
          aria-hidden="true"
        />
      </div>
    );
  }

  // STEPS 1-8: MANUAL FORM
  return (
    <div className="min-h-screen bg-bg-main flex flex-col max-w-md md:max-w-2xl mx-auto relative overflow-hidden pb-32">
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
          <Link href={`${basePath}/home`} className="text-sm font-semibold text-secondary hover:text-main">
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
              onClick={() => {
                setShowDuplicateDialog(false);
                void submitForm(true);
              }}
              variant="default"
              size="patient"
              className="w-full"
            >
              Yes, update
            </Button>
            <Button
              variant="outline"
              size="patient"
              onClick={() => router.push(`${basePath}/home`)}
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
