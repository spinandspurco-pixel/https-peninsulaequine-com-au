import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { ProtectedRoute } from "./components/ProtectedRoute";
import { RouteCanonical } from "./components/RouteCanonical";
import { RouteAnalytics } from "./components/RouteAnalytics";
import { IntroContext } from "./hooks/useIntroState";
import { IntakeProvider } from "./hooks/useIntake";
import { AuthProvider } from "./hooks/useAuth";
import { AuthDebugPanel } from "./components/AuthDebugPanel";
import { GuidedIntake } from "./components/GuidedIntake";
import { SiteRail } from "./components/layout/SiteRail";

import Index from "./pages/Index";

const Arenas = lazy(() => import("./pages/Arenas"));
const Stables = lazy(() => import("./pages/Stables"));
const LumenArc = lazy(() => import("./pages/LumenArc"));
import LumenArcRouteFallback from "./components/lumenarc/LumenArcRouteFallback";
const InfrastructurePage = lazy(() => import("./pages/Infrastructure"));

const Services = lazy(() => import("./pages/Services"));
const ServiceDetail = lazy(() => import("./pages/ServiceDetail"));
const About = lazy(() => import("./pages/About"));

const Contact = lazy(() => import("./pages/Contact"));
const LegalPrivacy = lazy(() => import("./pages/Legal").then(m => ({ default: m.Privacy })));
const LegalTerms = lazy(() => import("./pages/Legal").then(m => ({ default: m.Terms })));
const NotFound = lazy(() => import("./pages/NotFound"));
const Login = lazy(() => import("./pages/Login"));
const Admin = lazy(() => import("./pages/Admin"));
const AdminServices = lazy(() => import("./pages/AdminServices"));
const AdminTestimonials = lazy(() => import("./pages/AdminTestimonials"));
const AdminEvents = lazy(() => import("./pages/AdminEvents"));
const AdminCMS = lazy(() => import("./pages/AdminCMS"));
const AdminSelectedWorks = lazy(() => import("./pages/AdminSelectedWorks"));
const AdminFieldNotes = lazy(() => import("./pages/AdminFieldNotes"));
const HqProjectDetail = lazy(() => import("./pages/HqProjectDetail"));
const EmployeeDashboard = lazy(() => import("./pages/EmployeeDashboard"));
const AdminEmailMigration = lazy(() => import("./pages/AdminEmailMigration"));
const AdminActivity = lazy(() => import("./pages/AdminActivity"));
const AdminInquiries = lazy(() => import("./pages/AdminInquiries"));
const AdminMedia = lazy(() => import("./pages/AdminMedia"));
const DnsVerify = lazy(() => import("./pages/DnsVerify"));
const DnsPublish = lazy(() => import("./pages/DnsPublish"));
const DnsWizard = lazy(() => import("./pages/DnsWizard"));
const DnsStatus = lazy(() => import("./pages/DnsStatus"));
const HqWhoAmI = lazy(() => import("./pages/HqWhoAmI"));
const HqStaffAllowlist = lazy(() => import("./pages/HqStaffAllowlist"));
const HqStaff = lazy(() => import("./pages/HqStaff"));


const BookLesson = lazy(() => import("./pages/BookLesson"));
const Lessons = lazy(() => import("./pages/Lessons"));
const Events = lazy(() => import("./pages/Events"));
const BookingsDashboard = lazy(() => import("./pages/BookingsDashboard"));
const Schedule = lazy(() => import("./pages/Schedule"));
const ThankYou = lazy(() => import("./pages/ThankYou"));
const Pricing = lazy(() => import("./pages/Pricing"));
const GroupBooking = lazy(() => import("./pages/GroupBooking"));
const Estimate = lazy(() => import("./pages/Estimate"));
const StaffDocuments = lazy(() => import("./pages/StaffDocuments"));
const AdminDocuments = lazy(() => import("./pages/AdminDocuments"));
const StaffDocumentPortal = lazy(() => import("./pages/StaffDocumentPortal"));
const TrainerDocumentPortal = lazy(() => import("./pages/TrainerDocumentPortal"));
const TrainerProfile = lazy(() => import("./pages/TrainerProfile"));

const CaseStudy = lazy(() => import("./pages/CaseStudy"));

const SiteAssessment = lazy(() => import("./pages/SiteAssessment"));
const ClientQuote = lazy(() => import("./pages/ClientQuote"));
const ClientPortal = lazy(() => import("./pages/ClientPortal"));
const ClientPortalLogin = lazy(() => import("./pages/ClientPortalLogin"));
const FieldNotes = lazy(() => import("./pages/FieldNotes"));
const CoveredArenaStablesBuild = lazy(() => import("./pages/CoveredArenaStablesBuild"));
const MainRidgePavilion = lazy(() => import("./pages/MainRidgePavilion"));
const Aberdeen = lazy(() => import("./pages/Aberdeen"));
const SelectedWorks = lazy(() => import("./pages/SelectedWorks"));

const queryClient = new QueryClient();

function AppContent() {
  return (
    <IntroContext.Provider value={{ headerLogoReady: true, headerReady: true }}>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <RouteCanonical />
        <RouteAnalytics />
        <SiteRail />
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<Index />} />

            <Route path="/arenas" element={<Arenas />} />
            <Route path="/stables" element={<Stables />} />
            <Route path="/equine-estates" element={<Navigate to="/services#whole-property" replace />} />
            <Route
              path="/lumenarc"
              element={
                <Suspense fallback={<LumenArcRouteFallback />}>
                  <LumenArc />
                </Suspense>
              }
            />
            <Route path="/recovery-stations" element={<Navigate to="/lumenarc" replace />} />
            <Route path="/infrastructure" element={<InfrastructurePage />} />
            <Route path="/selected-works" element={<SelectedWorks />} />
            <Route path="/gallery" element={<Navigate to="/selected-works" replace />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />

            <Route path="/services" element={<Services />} />
            <Route path="/services/:slug" element={<ServiceDetail />} />
            <Route path="/services/round-pens" element={<Navigate to="/services" replace />} />
            <Route path="/boarding" element={<Navigate to="/services" replace />} />
            <Route path="/testimonials" element={<Navigate to="/selected-works" replace />} />
            <Route path="/faq" element={<Navigate to="/contact" replace />} />
            <Route path="/privacy" element={<LegalPrivacy />} />
            <Route path="/terms" element={<LegalTerms />} />
            <Route path="/login" element={<Login />} />
            {/* Staff Command Centre — /hq/* requires authenticated staff role.
                Preview role is allowed on read-only HQ surfaces (DB trigger
                block_preview_writes enforces read-only at the data layer). */}
            <Route path="/hq" element={<ProtectedRoute allowedRoles={["admin","employee","trainer","moderator","preview"]}><Admin /></ProtectedRoute>} />
            {/* Diagnostic: any signed-in user can see their own role mapping */}
            <Route path="/hq/whoami" element={<HqWhoAmI />} />
            <Route path="/hq/services" element={<ProtectedRoute allowedRoles={["admin","employee","trainer","moderator","preview"]}><AdminServices /></ProtectedRoute>} />
            <Route path="/hq/cms" element={<ProtectedRoute allowedRoles={["admin"]}><AdminCMS /></ProtectedRoute>} />
            <Route path="/hq/testimonials" element={<ProtectedRoute allowedRoles={["admin","employee","trainer","moderator","preview"]}><AdminTestimonials /></ProtectedRoute>} />
            <Route path="/hq/events" element={<ProtectedRoute allowedRoles={["admin","employee","trainer","moderator","preview"]}><AdminEvents /></ProtectedRoute>} />
            <Route path="/hq/selected-works" element={<ProtectedRoute allowedRoles={["admin","employee","trainer","moderator","preview"]}><AdminSelectedWorks /></ProtectedRoute>} />
            <Route path="/hq/field-notes" element={<ProtectedRoute allowedRoles={["admin","employee","trainer","moderator","preview"]}><AdminFieldNotes /></ProtectedRoute>} />
            <Route path="/hq/projects/:id" element={<ProtectedRoute allowedRoles={["admin","employee","trainer","moderator","preview"]}><HqProjectDetail /></ProtectedRoute>} />
            {/* /hq/documents is a private staff surface. Preview users see a polite stub. */}
            <Route path="/hq/documents" element={<ProtectedRoute allowedRoles={["admin","employee","preview"]}><AdminDocuments /></ProtectedRoute>} />
            <Route path="/hq/email-migration" element={<ProtectedRoute allowedRoles={["admin"]}><AdminEmailMigration /></ProtectedRoute>} />
            <Route path="/hq/staff-allowlist" element={<ProtectedRoute allowedRoles={["admin"]}><HqStaffAllowlist /></ProtectedRoute>} />
            <Route path="/hq/staff" element={<ProtectedRoute allowedRoles={["admin","employee","trainer","moderator","preview"]}><HqStaff /></ProtectedRoute>} />
           <Route path="/hq/activity" element={<ProtectedRoute allowedRoles={["admin","moderator","preview"]}><AdminActivity /></ProtectedRoute>} />
           <Route path="/hq/inquiries" element={<ProtectedRoute allowedRoles={["admin","employee","preview"]}><AdminInquiries /></ProtectedRoute>} />
           <Route path="/hq/media" element={<ProtectedRoute allowedRoles={["admin","moderator","employee","trainer","preview"]}><AdminMedia /></ProtectedRoute>} />
            <Route path="/hq/dns-verify" element={<ProtectedRoute allowedRoles={["admin"]}><DnsVerify /></ProtectedRoute>} />
            <Route path="/hq/dns-publish" element={<ProtectedRoute allowedRoles={["admin"]}><DnsPublish /></ProtectedRoute>} />
            <Route path="/hq/dns-status" element={<ProtectedRoute allowedRoles={["admin"]}><DnsStatus /></ProtectedRoute>} />

            <Route path="/hq/dns-wizard" element={<ProtectedRoute allowedRoles={["admin"]}><DnsWizard /></ProtectedRoute>} />
            <Route path="/hq/preview" element={<Navigate to="/hq?view=preview" replace />} />
            <Route path="/admin" element={<Navigate to="/hq" replace />} />
            <Route path="/admin/services" element={<Navigate to="/hq/services" replace />} />
            <Route path="/admin/testimonials" element={<Navigate to="/hq/testimonials" replace />} />

            <Route path="/admin/events" element={<Navigate to="/hq/events" replace />} />
            <Route path="/employee" element={<ProtectedRoute allowedRoles={["admin","employee"]}><EmployeeDashboard /></ProtectedRoute>} />
            <Route path="/lessons" element={<Lessons />} />
            {/*
              * /book-lesson is intentionally redirected to /lessons until public lesson
              * booking is rolled out. The BookLesson page (and create-lesson-checkout slot-hold
               * hardening) remain in the codebase behind ProtectedRoute, but no public surface
              * should reach the checkout flow yet. See security memory: "Lesson checkout
              * slot-hold hardening deferred".
              */}
            <Route path="/book-lesson" element={<Navigate to="/lessons" replace />} />

            <Route path="/events" element={<Events />} />
            <Route path="/process" element={<Navigate to="/services" replace />} />
            <Route path="/bookings" element={<ProtectedRoute allowedRoles={["admin","employee"]}><BookingsDashboard /></ProtectedRoute>} />
            <Route path="/schedule" element={<ProtectedRoute allowedRoles={["admin","employee","trainer"]}><Schedule /></ProtectedRoute>} />
            <Route path="/thank-you" element={<ThankYou />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/group-booking" element={<GroupBooking />} />
            <Route path="/estimate" element={<Estimate />} />
            {/* /documents is a private staff surface — auth + staff role required, no preview. */}
            <Route path="/documents" element={<ProtectedRoute allowedRoles={["admin","employee","trainer"]}><StaffDocuments /></ProtectedRoute>} />
            <Route path="/staff/documents" element={<ProtectedRoute allowedRoles={["admin","employee"]}><StaffDocumentPortal /></ProtectedRoute>} />
            <Route path="/trainer/documents" element={<ProtectedRoute allowedRoles={["admin","trainer"]}><TrainerDocumentPortal /></ProtectedRoute>} />
            <Route path="/admin/documents" element={<Navigate to="/hq/documents" replace />} />
            <Route path="/trainers/:slug" element={<TrainerProfile />} />
            <Route path="/equus-ridge" element={<Navigate to="/services#whole-property" replace />} />
            <Route path="/site-assessment" element={<SiteAssessment />} />
            <Route path="/project/:slug" element={<CaseStudy />} />
            <Route path="/quote/:token" element={<ClientQuote />} />
            <Route path="/visualise" element={<Navigate to="/services" replace />} />
            <Route path="/the-standard" element={<Navigate to="/about" replace />} />
            <Route path="/why" element={<Navigate to="/about" replace />} />
            <Route path="/portal" element={<ProtectedRoute loginPath="/portal/login"><ClientPortal /></ProtectedRoute>} />
            <Route path="/portal/login" element={<ClientPortalLogin />} />
            <Route path="/field-notes" element={<FieldNotes />} />
            <Route path="/field-notes/covered-arena-stables-build" element={<CoveredArenaStablesBuild />} />
            <Route path="/field-notes/aberdeen-farm" element={<Navigate to="/field-notes/covered-arena-stables-build" replace />} />
            <Route path="/selected-works/aberdeen" element={<Aberdeen />} />
            <Route path="/selected-works/main-ridge-pavilion" element={<MainRidgePavilion />} />
            <Route path="/projects/aberdeen" element={<Navigate to="/selected-works/aberdeen" replace />} />
            <Route path="/project/aberdeen" element={<Navigate to="/selected-works/aberdeen" replace />} />
            <Route path="/selected-works/aberdeen-farm" element={<Navigate to="/selected-works/aberdeen" replace />} />
            <Route path="/aberdeen" element={<Navigate to="/selected-works/aberdeen" replace />} />
            <Route path="/projects/main-ridge-pavilion" element={<Navigate to="/selected-works/main-ridge-pavilion" replace />} />
            <Route path="/projects/main-ridge" element={<Navigate to="/selected-works/main-ridge-pavilion" replace />} />
            <Route path="/project/main-ridge" element={<Navigate to="/selected-works/main-ridge-pavilion" replace />} />
            <Route path="/selected-works/main-ridge" element={<Navigate to="/selected-works/main-ridge-pavilion" replace />} />
            <Route path="/main-ridge" element={<Navigate to="/selected-works/main-ridge-pavilion" replace />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <GuidedIntake />
        <AuthDebugPanel />
      </BrowserRouter>
    </IntroContext.Provider>

  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <IntakeProvider>
          <AppContent />
        </IntakeProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
