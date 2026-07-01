import LessonInquiry from "./LessonInquiry";

export default function ConsultInquiry() {
  return (
    <LessonInquiry
      lockedType="consult"
      metaTitle="Request a consult — Peninsula Equine"
      metaDescription="Request a horsemanship consult on the Mornington Peninsula. Behaviour, groundwork, and structured plan."
      headerOverline="Consult request"
      headerTitle="Request a consult"
      headerSubtitle="Behaviour, groundwork, plan. A short intake — we'll respond within one business day."
      backLink={{ to: "/", label: "Return home" }}
    />
  );
}
