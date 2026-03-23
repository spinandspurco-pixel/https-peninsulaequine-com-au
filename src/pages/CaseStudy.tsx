import { useParams, Navigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { CASE_STUDIES } from "@/data/caseStudyData";
import { CaseStudyArrival } from "@/components/casestudy/CaseStudyArrival";
import { CaseStudyUnderstanding } from "@/components/casestudy/CaseStudyUnderstanding";
import { CaseStudySolution } from "@/components/casestudy/CaseStudySolution";
import { CaseStudyOutcome } from "@/components/casestudy/CaseStudyOutcome";
import { CaseStudyClose } from "@/components/casestudy/CaseStudyClose";

export default function CaseStudy() {
  const { slug } = useParams<{ slug: string }>();
  const study = CASE_STUDIES.find((s) => s.slug === slug);

  if (!study) return <Navigate to="/gallery" replace />;

  return (
    <Layout>
      {/* Act 1 — Arrival */}
      <CaseStudyArrival
        title={study.title}
        location={study.location}
        hero={study.hero}
        heroAlt={study.heroAlt}
      />

      {/* Act 2 — Understanding */}
      <CaseStudyUnderstanding act={study.understanding} />

      {/* Act 3 — Solution */}
      <CaseStudySolution act={study.solution} />

      {/* Act 4 — Outcome */}
      <CaseStudyOutcome act={study.outcome} />

      {/* Act 5 — Close */}
      <CaseStudyClose closingLine={study.closingLine} />
    </Layout>
  );
}
