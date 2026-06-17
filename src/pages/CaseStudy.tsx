import { useParams, Navigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { CASE_STUDIES } from "@/data/caseStudyData";
import { CaseStudyArrival } from "@/components/casestudy/CaseStudyArrival";
import { CaseStudyScope } from "@/components/casestudy/CaseStudyScope";
import { CaseStudyTransformation } from "@/components/casestudy/CaseStudyTransformation";
import { CaseStudyProcess } from "@/components/casestudy/CaseStudyProcess";
import { CaseStudyGallery } from "@/components/casestudy/CaseStudyGallery";
import { CaseStudyOutcomes } from "@/components/casestudy/CaseStudyOutcomes";
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

      {/* Dossier — Location, Scope */}
      {study.scope && <CaseStudyScope location={study.location} scope={study.scope} />}

      {/* Transformation — Before / After */}
      {study.transformation && <CaseStudyTransformation t={study.transformation} />}

      {/* Act 2 — Understanding */}
      <CaseStudyUnderstanding act={study.understanding} />

      {/* Construction Process */}
      {study.process && study.process.length > 0 && (
        <CaseStudyProcess images={study.process} />
      )}

      {/* Act 3 — Solution */}
      <CaseStudySolution act={study.solution} />

      {/* Completed Estate Gallery */}
      {study.final && study.final.length > 0 && (
        <CaseStudyGallery images={study.final} />
      )}

      {/* Key Outcomes */}
      {study.outcomes && study.outcomes.length > 0 && (
        <CaseStudyOutcomes outcomes={study.outcomes} />
      )}

      {/* Act 4 — Outcome */}
      <CaseStudyOutcome act={study.outcome} />

      {/* Act 5 — Close */}
      <CaseStudyClose closingLine={study.closingLine} />
    </Layout>
  );
}
