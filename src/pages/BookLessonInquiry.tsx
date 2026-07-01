import LessonInquiry from "./LessonInquiry";

export default function BookLessonInquiry() {
  return (
    <LessonInquiry
      lockedType="lesson"
      metaTitle="Book a lesson — Peninsula Equine"
      metaDescription="Request a riding lesson on the Mornington Peninsula. Structured intake, confirmed within one business day."
      headerOverline="Lesson request"
      headerTitle="Book a lesson"
      headerSubtitle="Tell us about you and your horse. We'll confirm timing within one business day."
      backLink={{ to: "/lessons", label: "Back to lessons" }}
    />
  );
}
