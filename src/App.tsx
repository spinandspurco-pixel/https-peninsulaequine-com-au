import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { ProtectedRoute } from "./components/ProtectedRoute";
import { IntroContext } from "./hooks/useIntroState";
import { IntakeProvider } from "./hooks/useIntake";
import { GuidedIntake } from "./components/GuidedIntake";


// Eagerly load the homepage for fastest FCP
import Index from "./pages/Index";

// Lazy-load all other routes
// Core 8 public capability routes
const Arenas = lazy(() => import("./pages/Arenas"));
const Stables = lazy(() => import("./pages/Stables"));
const EquineEstates = lazy(() => import("./pages/EquineEstates"));
const LumenArc = lazy(() => import("./pages/RecoveryStation"));
import LumenArcRouteFallback from "./components/lumenarc/LumenArcRouteFallback";
const InfrastructurePage = lazy(() => import("./pages/Infrastructure"));

// Supporting public pages
const Services = lazy(() => import("./pages/Services"));
const ServiceDetail = lazy(() => import("./pages/ServiceDetail"));
const Boarding = lazy(() => import("./pages/Boarding"));
const About = lazy(() => import("./pages/About"));
const Gallery = lazy(() => import("./pages/Gallery"));
const Testimonials = lazy(() => import("./pages/Testimonials"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Contact = lazy(() => import("./pages/Contact"));
const LegalPrivacy = lazy(() => import("./pages/Legal").then(m => ({ default: m.Privacy })));
const LegalTerms = lazy(() => import("./pages/Legal").then(m => ({ default: m.Terms })));
const NotFound = lazy(() => import("./pages/NotFound"));
const Login = lazy(() => import("./pages/Login"));
const Admin = lazy(() => import("./pages/Admin"));
const AdminServices = lazy(() => import("./pages/AdminServices"));
const AdminTestimonials = lazy(() => import("./pages/AdminTestimonials"));
const AdminEvents = lazy(() => import("./pages/AdminEvents"));
const HQ = lazy(() => import("./pages/HQ"));
const EmployeeDashboard = lazy(() => import("./pages/EmployeeDashboard"));
const BookLesson = lazy(() => import("./pages/BookLesson"));
const Lessons = lazy(() => import("./pages/Lessons"));
const Events = lazy(() => import("./pages/Events"));
const Process = lazy(() => import("./pages/Process"));
const BookingsDashboard = lazy(() => import("./pages/BookingsDashboard"));
const RoundPens = lazy(() => import("./pages/RoundPens"));
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
const Visualise = lazy(() => import("./pages/Visualise"));
const TheStandard = lazy(() => import("./pages/TheStandard"));
const WhyWeExist = lazy(() => import("./pages/WhyWeExist"));
const ClientPortal = lazy(() => import("./pages/ClientPortal"));
const ClientPortalLogin = lazy(() => import("./pages/ClientPortalLogin"));
const FieldNotes = lazy(() => import("./pages/FieldNotes"));
const MainRidgePavilion = lazy(() => import("./pages/MainRidgePavilion"));

const queryClient = new QueryClient();


function AppContent() {
  return (
    <IntroContext.Provider value={{ headerLogoReady: true, headerReady: true }}>
      <Toaster />
      <Sonner />
      <BrowserRouter>

        <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Index />} />

          {/* ─── Core 8 capability routes ─── */}
          <Route path="/arenas" element={<Arenas />} />
          <Route path="/stables" element={<Stables />} />
          <Route path="/equine-estates" element={<EquineEstates />} />
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
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />

          {/* ─── Supporting routes ─── */}
          <Route path="/services" element={<Services />} />
          <Route path="/services/:slug" element={<ServiceDetail />} />
          <Route path="/services/round-pens" element={<RoundPens />} />
          <Route path="/boarding" element={<Boarding />} />
          <Route path="/testimonials" element={<Testimonials />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/privacy" element={<LegalPrivacy />} />
          <Route path="/terms" element={<LegalTerms />} />
          <Route path="/login" element={<Login />} />
          <Route path="/hq" element={<HQ />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/services" element={<AdminServices />} />
          <Route path="/admin/testimonials" element={<AdminTestimonials />} />
          <Route path="/admin/events" element={<AdminEvents />} />
          <Route path="/employee" element={<EmployeeDashboard />} />
          <Route path="/lessons" element={<Lessons />} />
          <Route path="/book-lesson" element={<ProtectedRoute><BookLesson /></ProtectedRoute>} />
          <Route path="/events" element={<Events />} />
          <Route path="/process" element={<Process />} />
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
          <Route path="/equus-ridge" element={<Navigate to="/equine-estates" replace />} />
          <Route path="/site-assessment" element={<SiteAssessment />} />
          <Route path="/project/:slug" element={<CaseStudy />} />
          <Route path="/quote/:token" element={<ClientQuote />} />
          <Route path="/visualise" element={<Visualise />} />
          <Route path="/the-standard" element={<TheStandard />} />
          <Route path="/why" element={<WhyWeExist />} />
          <Route path="/portal" element={<ProtectedRoute loginPath="/portal/login"><ClientPortal /></ProtectedRoute>} />
          <Route path="/portal/login" element={<ClientPortalLogin />} />
          <Route path="/field-notes" element={<FieldNotes />} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
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
