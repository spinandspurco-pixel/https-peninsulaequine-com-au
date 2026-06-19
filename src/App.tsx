import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { ProtectedRoute } from "./components/ProtectedRoute";
import { RouteCanonical } from "./components/RouteCanonical";
import { IntroContext } from "./hooks/useIntroState";
import { IntakeProvider } from "./hooks/useIntake";
import { GuidedIntake } from "./components/GuidedIntake";

import Index from "./pages/Index";

const Arenas = lazy(() => import("./pages/Arenas"));
const Stables = lazy(() => import("./pages/Stables"));
const LumenArc = lazy(() => import("./pages/RecoveryStation"));
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
const EmployeeDashboard = lazy(() => import("./pages/EmployeeDashboard"));
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
            <Route path="/hq" element={<Navigate to="/about" replace />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/services" element={<AdminServices />} />
            <Route path="/admin/testimonials" element={<AdminTestimonials />} />
            <Route path="/admin/events" element={<AdminEvents />} />
            <Route path="/employee" element={<EmployeeDashboard />} />
            <Route path="/lessons" element={<Lessons />} />
            <Route path="/book-lesson" element={<ProtectedRoute><BookLesson /></ProtectedRoute>} />
            <Route path="/events" element={<Events />} />
            <Route path="/process" element={<Navigate to="/services" replace />} />
            <Route path="/bookings" element={<BookingsDashboard />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/thank-you" element={<ThankYou />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/group-booking" element={<GroupBooking />} />
            <Route path="/estimate" element={<Estimate />} />
            <Route path="/documents" element={<StaffDocuments />} />
            <Route path="/staff/documents" element={<StaffDocumentPortal />} />
            <Route path="/trainer/documents" element={<TrainerDocumentPortal />} />
            <Route path="/admin/documents" element={<AdminDocuments />} />
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
      </BrowserRouter>
    </IntroContext.Provider>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <IntakeProvider>
        <AppContent />
        <GuidedIntake />
      </IntakeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
