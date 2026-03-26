"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DemoControls } from "@/components/demo/DemoControls";
import { StepProgress } from "@/components/patient/StepProgress";
import { MotionStep } from "@/components/motion/MotionStep";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CheckCircle2, X } from "lucide-react";
import { MOCK_PATIENT } from "@/lib/mock-data";

type OccupationType =
  | "business_owner"
  | "leader"
  | "freelancer"
  | "employee"
  | "retired"
  | "unemployed";

type StepData = {
  /** Step 1 — Personal Details */
  fullName: string;
  icOrPassport: string;
  gender: string;
  contactNumber: string;
  email: string;
  homeAddress: string;

  /** Step 2 — Occupation & Contacts */
  occupation: OccupationType | "";
  emergencyContact: string;
  referredBy: string;
  payerFullName: string;

  /** Step 3 — Health Background */
  chiefComplaint: string;
  existingConditions: string[];
  currentMedications: string[];
  allergies: string[];

  /** Step 4 — Lifestyle */
  smokingStatus: string;
  alcoholUse: string;
  activityLevel: string;
  dietaryNotes: string;
  familyHistory: string;
  additionalNotes: string;

  /** Step 5 — Terms & Conditions */
  agreedToTerms: boolean;
  agreedToTestimonial: boolean | null;
};

/**
 * Patient onboarding flow with six premium bilingual steps.
 */
export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [submitted, setSubmitted] = useState(false);
  const [data, setData] = useState<StepData>({
    fullName: MOCK_PATIENT.fullName,
    icOrPassport: "",
    gender: "",
    contactNumber: "",
    email: MOCK_PATIENT.email,
    homeAddress: "",
    occupation: "",
    emergencyContact: "",
    referredBy: "",
    payerFullName: MOCK_PATIENT.fullName,
    chiefComplaint: "",
    existingConditions: [],
    currentMedications: [],
    allergies: [],
    smokingStatus: "",
    alcoholUse: "",
    activityLevel: "",
    dietaryNotes: "",
    familyHistory: "",
    additionalNotes: "",
    agreedToTerms: false,
    agreedToTestimonial: null,
  });
  const [validationError, setValidationError] = useState("");
  const [inputCondition, setInputCondition] = useState("");
  const [inputMedication, setInputMedication] = useState("");
  const [inputAllergy, setInputAllergy] = useState("");

  const stepTitle = useMemo(() => {
    const mapping: Record<number, string> = {
      1: "Personal Details",
      2: "Occupation & Contacts",
      3: "Health Background",
      4: "Lifestyle",
      5: "Terms & Conditions",
      6: "Review & Submit",
    };
    return mapping[step];
  }, [step]);

  useEffect(() => {
    const draft = localStorage.getItem("demo_onboarding_draft");
    const draftStep = localStorage.getItem("demo_onboarding_step");
    if (draft) {
      try {
        setData(JSON.parse(draft));
      } catch (e: unknown) {
        console.error("Failed to parse localStorage:", e);
      }
    }
    if (draftStep) {
      const parsedStep = parseInt(draftStep, 10);
      if (parsedStep >= 1 && parsedStep <= 6) {
        setStep(parsedStep);
      }
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem("demo_onboarding_draft", JSON.stringify(data));
      localStorage.setItem("demo_onboarding_step", step.toString());
    }, 300);
    return () => clearTimeout(timer);
  }, [data, step]);

  const validateCurrentStep = (): string => {
    if (step === 1) {
      if (
        !data.fullName.trim() ||
        !data.icOrPassport.trim() ||
        !data.gender ||
        !data.contactNumber.trim() ||
        !data.email.trim() ||
        !data.homeAddress.trim()
      ) {
        return "Please complete all required personal details fields.";
      }
    }

    if (step === 2) {
      if (!data.occupation || !data.emergencyContact.trim() || !data.payerFullName.trim()) {
        return "Please complete occupation, emergency contact, and payer details.";
      }
    }

    if (step === 3) {
      if (!data.chiefComplaint.trim()) {
        return "Please provide your chief complaint.";
      }
    }

    if (step === 4) {
      if (!data.smokingStatus || !data.alcoholUse || !data.activityLevel) {
        return "Please complete smoking, alcohol, and activity selections.";
      }
    }

    if (step === 5) {
      if (!data.agreedToTerms || data.agreedToTestimonial === null) {
        return "Please confirm terms and choose a testimonial preference.";
      }
    }

    return "";
  };

  const handleNext = () => {
    const errorText = validateCurrentStep();
    if (errorText) {
      setValidationError(errorText);
      return;
    }

    setValidationError("");
    if (step < 6) {
      setDirection(1);
      setStep((previousStep) => previousStep + 1);
    } else {
      submitForm();
    }
  };

  const handleBack = () => {
    setValidationError("");
    if (step > 1) {
      setDirection(-1);
      setStep((previousStep) => previousStep - 1);
    }
  };

  const submitForm = () => {
    localStorage.removeItem("demo_onboarding_draft");
    localStorage.removeItem("demo_onboarding_step");
    localStorage.setItem("demo_onboarding_data", JSON.stringify(data));
    localStorage.setItem("demo_patient_status", "booked");
    setSubmitted(true);
    setTimeout(() => {
      router.push("/p/demo/book");
    }, 2500);
  };

  const MultiAddChips = ({
    items,
    onRemove 
  }: {
    items: string[];
    onRemove: (idx: number) => void;
  }) => (
    <div className="flex flex-wrap gap-2 mt-3">
      {items.map((item, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-0.5 pl-3 pr-1 py-1 bg-primary-light text-primary rounded-full text-sm font-medium"
        >
          {item}
          <button
            type="button"
            onClick={() => onRemove(i)}
            className="text-primary hover:text-primary-hover p-2 -mr-1 rounded-full touch-manipulation flex items-center justify-center min-w-[32px] min-h-[32px] transition-colors hover:bg-primary/10"
            aria-label={`Remove ${item}`}
          >
            <X size={14} />
          </button>
        </span>
      ))}
    </div>
  );

  if (submitted) {
    return (
      <div className="min-h-screen bg-bg-app flex flex-col items-center justify-center p-6 max-w-sm mx-auto text-center">
        <div className="relative w-24 h-24 mb-6">
          <div className="absolute inset-0 bg-primary/[0.08] rounded-full flex items-center justify-center animate-in zoom-in spin-in-12 duration-500 z-10 shadow-card">
            <CheckCircle2 size={56} className="text-primary" />
          </div>
        </div>
        <h1 className="font-display text-[32px] font-normal tracking-[-0.02em] text-text-primary mb-3 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-150">
          You&apos;re all set!
        </h1>
        <p className="text-text-secondary text-lg mb-12 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-300">
          Now let&apos;s book your first consultation with Dr. Jasmine.
        </p>
        <button
          onClick={() => router.push("/p/demo/book")}
          className="text-primary font-bold hover:underline animate-in fade-in duration-500 delay-500"
        >
          Continue
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-app flex flex-col max-w-md mx-auto relative overflow-hidden">
      <DemoControls />

      <div className="px-4 pt-6 pb-2 z-10 bg-bg-app relative">
        <StepProgress totalSteps={6} currentStep={step} />
        {step === 1 && (
          <button
            onClick={() => router.push("/p/demo")}
            className="absolute top-4 right-4 p-2 text-secondary hover:text-main bg-white rounded-full border border-border shadow-sm transform translate-y-2 hover:bg-gray-50 flex items-center justify-center transition-colors z-20"
            aria-label="Close onboarding"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <div className="flex-1 px-4 py-4 overflow-y-auto w-full">
        <MotionStep stepKey={step} direction={direction} className="w-full">
          <div className="space-y-6">
            <div>
              <h1 className="font-display text-[28px] font-normal tracking-[-0.02em] text-text-primary mb-2">
                {stepTitle}
              </h1>
            </div>

          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="onboarding-name" className="block text-sm font-semibold text-main mb-1">
                    Full Name / 病患的全名 *
                  </label>
                  <Input
                    id="onboarding-name"
                    value={data.fullName}
                    onChange={(event) => setData({ ...data, fullName: event.target.value })}
                    placeholder="E.g. Lily Tan"
                    className="h-14 rounded-xl"
                  />
                </div>

                <div>
                  <label htmlFor="onboarding-id" className="block text-sm font-semibold text-main mb-1">
                    IC or Passport Number / 身份证/护照号码 *
                  </label>
                  <Input
                    id="onboarding-id"
                    value={data.icOrPassport}
                    onChange={(event) => setData({ ...data, icOrPassport: event.target.value })}
                    placeholder="xxxxxx-xx-xxxx"
                    className="h-14 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-main mb-2">Gender / 性别 *</label>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { id: "male", label: "Male 男" },
                      { id: "female", label: "Female 女" },
                    ].map((option) => (
                      <button
                        type="button"
                        key={option.id}
                        onClick={() => setData({ ...data, gender: option.id })}
                        className={[
                          "h-14 rounded-xl border text-left px-4 font-medium transition-colors min-h-[56px]",
                          data.gender === option.id
                            ? "border-primary bg-primary-light text-primary"
                            : "border-border text-main hover:border-gray-300",
                        ].join(" ")}
                        aria-pressed={data.gender === option.id}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="onboarding-contact-number" className="block text-sm font-semibold text-main mb-1">
                    Contact Number / 联络号码 *
                  </label>
                  <Input
                    id="onboarding-contact-number"
                    type="tel"
                    value={data.contactNumber}
                    onChange={(event) => setData({ ...data, contactNumber: event.target.value })}
                    placeholder="+60 12 345 6789"
                    className="h-14 rounded-xl"
                  />
                </div>

                <div>
                  <label htmlFor="onboarding-email" className="block text-sm font-semibold text-main mb-1">
                    Email / 电邮 *
                  </label>
                  <Input
                    id="onboarding-email"
                    type="email"
                    value={data.email}
                    onChange={(event) => setData({ ...data, email: event.target.value })}
                    placeholder="lily@example.com"
                    className="h-14 rounded-xl"
                  />
                </div>

                <div>
                  <label htmlFor="onboarding-home-address" className="block text-sm font-semibold text-main mb-1">
                    Home Address / 住家地址 *
                  </label>
                  <Textarea
                    id="onboarding-home-address"
                    value={data.homeAddress}
                    onChange={(event) => setData({ ...data, homeAddress: event.target.value })}
                    placeholder="Your full home address"
                    className="min-h-[100px] rounded-xl"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-main mb-2">
                    Current Job Title / 目前职位 *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      ["business_owner", "Business Owner 企业家/老板"],
                      ["leader", "Leader 领导"],
                      ["freelancer", "Freelancer 自由业"],
                      ["employee", "Employee 打工族"],
                      ["retired", "Retired 退休"],
                      ["unemployed", "Unemployed 暂时没有工作"],
                    ].map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setData({ ...data, occupation: value as OccupationType })}
                        className={[
                          "min-h-[56px] rounded-xl border px-4 font-medium transition-colors text-left",
                          data.occupation === value
                            ? "border-primary bg-primary-light text-primary"
                            : "border-border text-main hover:border-gray-300",
                        ].join(" ")}
                        aria-pressed={data.occupation === value}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="onboarding-emergency-contact" className="block text-sm font-semibold text-main mb-1">
                    Emergency Contact / 紧急联络人 *
                  </label>
                  <Textarea
                    id="onboarding-emergency-contact"
                    value={data.emergencyContact}
                    onChange={(event) => setData({ ...data, emergencyContact: event.target.value })}
                    placeholder="Name and phone number"
                    className="min-h-[90px] rounded-xl"
                  />
                </div>

                <div>
                  <label htmlFor="onboarding-referred-by" className="block text-sm font-semibold text-main mb-1">
                    Referred By / 介绍人
                  </label>
                  <Input
                    id="onboarding-referred-by"
                    value={data.referredBy}
                    onChange={(event) => setData({ ...data, referredBy: event.target.value })}
                    placeholder="Optional"
                    className="h-14 rounded-xl"
                  />
                </div>

                <div>
                  <label htmlFor="onboarding-payer-name" className="block text-sm font-semibold text-main mb-1">
                    Payer Full Name / 付款人全名 *
                  </label>
                  <Input
                    id="onboarding-payer-name"
                    value={data.payerFullName}
                    onChange={(event) => setData({ ...data, payerFullName: event.target.value })}
                    placeholder="Full payer name"
                    className="h-14 rounded-xl"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-6">
                <div>
                  <label htmlFor="onboarding-complaint" className="block text-sm font-semibold text-main mb-1">
                    Why are you seeing Dr. Jasmine today? *
                  </label>
                  <Textarea
                    id="onboarding-complaint"
                    value={data.chiefComplaint}
                    onChange={(event) => setData({ ...data, chiefComplaint: event.target.value })}
                    placeholder="Briefly describe your main health concerns..."
                    className="min-h-[100px] rounded-xl"
                  />
                </div>

                <div>
                  <label htmlFor="onboarding-conditions" className="block text-sm font-semibold text-main mb-1">
                    Existing Medical Conditions
                  </label>
                  <div className="flex gap-2">
                    <Input
                      id="onboarding-conditions"
                      value={inputCondition}
                      onChange={(event) => setInputCondition(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && inputCondition.trim()) {
                          setData({
                            ...data,
                            existingConditions: [...data.existingConditions, inputCondition.trim()],
                          });
                          setInputCondition("");
                        }
                      }}
                      placeholder="E.g. Hypertension"
                      className="h-12 rounded-xl flex-1"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="default"
                      onClick={() => {
                        if (inputCondition.trim()) {
                          setData({
                            ...data,
                            existingConditions: [...data.existingConditions, inputCondition.trim()],
                          });
                          setInputCondition("");
                        }
                      }}
                      className="h-12 px-4 rounded-xl"
                    >
                      Add
                    </Button>
                  </div>
                  <MultiAddChips
                    items={data.existingConditions}
                    onRemove={(index) =>
                      setData({
                        ...data,
                        existingConditions: data.existingConditions.filter((_, itemIndex) => itemIndex !== index),
                      })
                    }
                  />
                </div>

                <div>
                  <label htmlFor="onboarding-medications" className="block text-sm font-semibold text-main mb-1">
                    Current Medications
                  </label>
                  <div className="flex gap-2">
                    <Input
                      id="onboarding-medications"
                      value={inputMedication}
                      onChange={(event) => setInputMedication(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && inputMedication.trim()) {
                          setData({
                            ...data,
                            currentMedications: [...data.currentMedications, inputMedication.trim()],
                          });
                          setInputMedication("");
                        }
                      }}
                      placeholder="E.g. Metformin 500mg"
                      className="h-12 rounded-xl flex-1"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="default"
                      onClick={() => {
                        if (inputMedication.trim()) {
                          setData({
                            ...data,
                            currentMedications: [...data.currentMedications, inputMedication.trim()],
                          });
                          setInputMedication("");
                        }
                      }}
                      className="h-12 px-4 rounded-xl"
                    >
                      Add
                    </Button>
                  </div>
                  <MultiAddChips
                    items={data.currentMedications}
                    onRemove={(index) =>
                      setData({
                        ...data,
                        currentMedications: data.currentMedications.filter((_, itemIndex) => itemIndex !== index),
                      })
                    }
                  />
                </div>

                <div>
                  <label htmlFor="onboarding-allergies" className="block text-sm font-semibold text-main mb-1">
                    Known Allergies
                  </label>
                  <div className="flex gap-2">
                    <Input
                      id="onboarding-allergies"
                      value={inputAllergy}
                      onChange={(event) => setInputAllergy(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && inputAllergy.trim()) {
                          setData({ ...data, allergies: [...data.allergies, inputAllergy.trim()] });
                          setInputAllergy("");
                        }
                      }}
                      placeholder="E.g. Penicillin"
                      className="h-12 rounded-xl flex-1"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="default"
                      onClick={() => {
                        if (inputAllergy.trim()) {
                          setData({ ...data, allergies: [...data.allergies, inputAllergy.trim()] });
                          setInputAllergy("");
                        }
                      }}
                      className="h-12 px-4 rounded-xl"
                    >
                      Add
                    </Button>
                  </div>
                  <MultiAddChips
                    items={data.allergies}
                    onRemove={(index) =>
                      setData({ ...data, allergies: data.allergies.filter((_, itemIndex) => itemIndex !== index) })
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-main mb-2">Smoking Status</label>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      ["never", "Never"],
                      ["former", "Former Smoker"],
                      ["current", "Current Smoker"],
                    ].map(([value, label]) => (
                      <button
                        type="button"
                        key={value}
                        onClick={() => setData({ ...data, smokingStatus: value })}
                        className={[
                          "h-14 rounded-xl border text-left px-4 font-medium transition-colors",
                          data.smokingStatus === value
                            ? "border-primary bg-primary-light text-primary"
                            : "border-[#E5DFD8] text-main hover:border-gray-300",
                        ].join(" ")}
                        aria-pressed={data.smokingStatus === value}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-main mb-2">Alcohol Use</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      ["none", "None"],
                      ["occasional", "Occasional"],
                      ["moderate", "Moderate"],
                      ["frequent", "Frequent"],
                    ].map(([value, label]) => (
                      <button
                        type="button"
                        key={value}
                        onClick={() => setData({ ...data, alcoholUse: value })}
                        className={[
                          "h-14 rounded-xl border px-4 font-medium transition-colors flex items-center justify-center",
                          data.alcoholUse === value
                            ? "border-primary bg-primary-light text-primary"
                            : "border-[#E5DFD8] text-main hover:border-gray-300",
                        ].join(" ")}
                        aria-pressed={data.alcoholUse === value}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-main mb-2">Physical Activity</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      ["sedentary", "Sedentary"],
                      ["light", "Light"],
                      ["moderate", "Moderate"],
                      ["active", "Active"],
                    ].map(([value, label]) => (
                      <button
                        type="button"
                        key={value}
                        onClick={() => setData({ ...data, activityLevel: value })}
                        className={[
                          "h-14 rounded-xl border px-4 font-medium transition-colors flex items-center justify-center",
                          data.activityLevel === value
                            ? "border-primary bg-primary-light text-primary"
                            : "border-[#E5DFD8] text-main hover:border-gray-300",
                        ].join(" ")}
                        aria-pressed={data.activityLevel === value}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="onboarding-dietary" className="block text-sm font-semibold text-main mb-1">Dietary Notes</label>
                  <Textarea
                    id="onboarding-dietary"
                    value={data.dietaryNotes}
                    onChange={(event) => setData({ ...data, dietaryNotes: event.target.value })}
                    placeholder="Any food preferences, restrictions, or cultural requirements"
                    className="min-h-[100px] rounded-xl"
                  />
                </div>

                <div>
                  <label htmlFor="onboarding-family-history" className="block text-sm font-semibold text-main mb-1">Family History of Illness</label>
                  <Textarea
                    id="onboarding-family-history"
                    value={data.familyHistory}
                    onChange={(event) => setData({ ...data, familyHistory: event.target.value })}
                    placeholder="E.g. Mother had diabetes, father had heart disease"
                    className="min-h-[120px] rounded-xl"
                  />
                </div>

                <div>
                  <label htmlFor="onboarding-extra-notes" className="block text-sm font-semibold text-main mb-1">Anything else you&apos;d like Dr. Jasmine to know?</label>
                  <Textarea
                    id="onboarding-extra-notes"
                    value={data.additionalNotes}
                    onChange={(event) => setData({ ...data, additionalNotes: event.target.value })}
                    placeholder="Add any extra details..."
                    className="min-h-[150px] rounded-xl"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6">
              <Card className="p-4">
                <CardHeader className="px-0">
                  <CardTitle className="font-semibold text-text-primary">Programme Terms &amp; Conditions</CardTitle>
                </CardHeader>
                <CardContent className="px-0 space-y-3 text-sm text-text-secondary leading-relaxed">
                  <p>
                    I hereby acknowledge that I have read, understand and agree to these terms.
                    我在此确认我已阅读、理解并同意以上条款。
                  </p>
                  <a
                    href="https://drive.google.com/file/d/1rSxdxzg3AkhONK0XuNxewY1R1Sa_j759/view"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary font-medium hover:underline"
                  >
                    View full terms PDF
                  </a>
                  <label className="flex items-center gap-3 min-h-[48px]">
                    <input
                      type="checkbox"
                      checked={data.agreedToTerms}
                      onChange={(event) => setData({ ...data, agreedToTerms: event.target.checked })}
                      className="h-5 w-5 rounded border-border accent-primary"
                    />
                    <span className="text-sm font-medium text-main">Yes, I agree / 是的，我同意</span>
                  </label>
                </CardContent>
              </Card>

              <Card className="p-4">
                <CardHeader className="px-0">
                  <CardTitle className="font-semibold text-text-primary">Testimonial Agreement</CardTitle>
                </CardHeader>
                <CardContent className="px-0 space-y-4 text-sm text-text-secondary leading-relaxed">
                  <p>
                    I hereby give Metanova Health and its associates the permission to take photographs and videos of me.
                    我同意 Metanova Health 及其合作伙伴拍摄我的照片和视频。
                  </p>
                  <div className="grid grid-cols-1 gap-3">
                    <button
                      type="button"
                      onClick={() => setData({ ...data, agreedToTestimonial: true })}
                      className={[
                        "h-14 rounded-xl border px-4 text-left font-medium transition-colors",
                        data.agreedToTestimonial === true
                          ? "border-primary bg-primary-light text-primary"
                          : "border-border text-main hover:border-gray-300",
                      ].join(" ")}
                    >
                      Yes, I agree / 是的，我同意
                    </button>
                    <button
                      type="button"
                      onClick={() => setData({ ...data, agreedToTestimonial: false })}
                      className={[
                        "h-14 rounded-xl border px-4 text-left font-medium transition-colors",
                        data.agreedToTestimonial === false
                          ? "border-primary bg-primary-light text-primary"
                          : "border-border text-main hover:border-gray-300",
                      ].join(" ")}
                    >
                      No, I disagree / 不，我不同意
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-6">
              <div className="space-y-4 mb-4">
                <Card className="p-0 overflow-hidden">
                  <div className="px-4 py-3 bg-[#EDE8E1]">
                    <h3 className="font-display text-[20px] font-normal text-text-primary">Personal Details</h3>
                  </div>
                  <CardContent className="p-4 space-y-2 text-sm">
                    <p><span className="font-semibold text-main">Full Name:</span> <span className="text-text-secondary">{data.fullName || "—"}</span></p>
                    <p><span className="font-semibold text-main">IC/Passport:</span> <span className="text-text-secondary">{data.icOrPassport || "—"}</span></p>
                    <p><span className="font-semibold text-main">Gender:</span> <span className="text-text-secondary capitalize">{data.gender || "—"}</span></p>
                    <p><span className="font-semibold text-main">Contact:</span> <span className="text-text-secondary">{data.contactNumber || "—"}</span></p>
                    <p><span className="font-semibold text-main">Email:</span> <span className="text-text-secondary">{data.email || "—"}</span></p>
                    <p><span className="font-semibold text-main">Home Address:</span> <span className="text-text-secondary">{data.homeAddress || "—"}</span></p>
                  </CardContent>
                </Card>

                <Card className="p-0 overflow-hidden">
                  <div className="px-4 py-3 bg-[#EDE8E1]">
                    <h3 className="font-display text-[20px] font-normal text-text-primary">Occupation & Contacts</h3>
                  </div>
                  <CardContent className="p-4 space-y-2 text-sm">
                    <p><span className="font-semibold text-main">Occupation:</span> <span className="text-text-secondary capitalize">{data.occupation || "—"}</span></p>
                    <p><span className="font-semibold text-main">Emergency Contact:</span> <span className="text-text-secondary">{data.emergencyContact || "—"}</span></p>
                    <p><span className="font-semibold text-main">Referred By:</span> <span className="text-text-secondary">{data.referredBy || "—"}</span></p>
                    <p><span className="font-semibold text-main">Payer Name:</span> <span className="text-text-secondary">{data.payerFullName || "—"}</span></p>
                  </CardContent>
                </Card>

                <Card className="p-0 overflow-hidden">
                  <div className="px-4 py-3 bg-[#EDE8E1]">
                    <h3 className="font-display text-[20px] font-normal text-text-primary">Health Background</h3>
                  </div>
                  <CardContent className="p-4 space-y-2 text-sm">
                    <p><span className="font-semibold text-main">Chief Complaint:</span> <span className="text-text-secondary">{data.chiefComplaint || "—"}</span></p>
                    <p><span className="font-semibold text-main">Conditions:</span> <span className="text-text-secondary">{data.existingConditions.length ? data.existingConditions.join(", ") : "None"}</span></p>
                    <p><span className="font-semibold text-main">Medications:</span> <span className="text-text-secondary">{data.currentMedications.length ? data.currentMedications.join(", ") : "None"}</span></p>
                    <p><span className="font-semibold text-main">Allergies:</span> <span className="text-text-secondary">{data.allergies.length ? data.allergies.join(", ") : "None"}</span></p>
                  </CardContent>
                </Card>

                <Card className="p-0 overflow-hidden">
                  <div className="px-4 py-3 bg-[#EDE8E1]">
                    <h3 className="font-display text-[20px] font-normal text-text-primary">Lifestyle & Agreements</h3>
                  </div>
                  <CardContent className="p-4 space-y-2 text-sm">
                    <p><span className="font-semibold text-main">Smoking:</span> <span className="text-text-secondary capitalize">{data.smokingStatus || "—"}</span></p>
                    <p><span className="font-semibold text-main">Alcohol:</span> <span className="text-text-secondary capitalize">{data.alcoholUse || "—"}</span></p>
                    <p><span className="font-semibold text-main">Activity:</span> <span className="text-text-secondary capitalize">{data.activityLevel || "—"}</span></p>
                    <p><span className="font-semibold text-main">Dietary Notes:</span> <span className="text-text-secondary">{data.dietaryNotes || "—"}</span></p>
                    <p><span className="font-semibold text-main">Family History:</span> <span className="text-text-secondary">{data.familyHistory || "—"}</span></p>
                    <p><span className="font-semibold text-main">Additional Notes:</span> <span className="text-text-secondary">{data.additionalNotes || "—"}</span></p>
                    <p><span className="font-semibold text-main">Terms Agreed:</span> <span className="text-text-secondary">{data.agreedToTerms ? "Yes" : "No"}</span></p>
                    <p><span className="font-semibold text-main">Testimonial:</span> <span className="text-text-secondary">{data.agreedToTestimonial ? "Agree" : "Disagree"}</span></p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

            <div className="h-[20px] mb-20" />
          </div>
        </MotionStep>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur border-t border-border p-4 z-40 max-w-md mx-auto">
        {validationError && (
          <p className="text-danger text-sm font-medium mb-3 text-center" aria-live="assertive" role="alert">
            {validationError}
          </p>
        )}
        <div className="flex gap-3">
          {step > 1 && step < 6 && (
            <Button
              variant="outline"
              size="patient"
              className="w-14 flex-shrink-0"
              onClick={handleBack}
            >
              <ArrowLeft size={24} />
            </Button>
          )}

          {step === 6 && (
            <Button
              variant="outline"
              size="patient"
              className="w-1/3"
              onClick={handleBack}
            >
              Edit
            </Button>
          )}

          <Button
            variant="default"
            size="patient"
            className={step === 6 ? "w-2/3" : "flex-1"}
            onClick={handleNext}
          >
            {step === 6 ? "Submit →" : "Next →"}
          </Button>
        </div>
      </div>
    </div>
  );
}
