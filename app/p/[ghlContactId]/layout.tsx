import { PatientPortalChrome } from "@/components/patient/PatientPortalChrome";

interface PatientLayoutProps {
  children: React.ReactNode;
  params: { ghlContactId: string };
}

export default function PatientDynamicLayout({
  children,
  params,
}: PatientLayoutProps): React.ReactElement {
  return (
    <PatientPortalChrome ghlContactId={params.ghlContactId}>{children}</PatientPortalChrome>
  );
}
