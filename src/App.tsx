import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { ProtectedRoute } from "./components/ProtectedRoute";
import { IntroContext } from "./hooks/useIntroState";
import { IntakeProvider } from "./hooks/useIntake";
import { GuidedIntake } from "./components/GuidedIntake";


// Eagerly load the homepage for fastest FCP
import Index from "./pages/Index";

// Lazy-load all other routes
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

const Shop = lazy(() => import("./pages/Shop"));

const Forge = lazy(() => import("./pages/Forge"));
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

const GroundLock = lazy(() => import("./pages/GroundLock"));
const GroundLockHowItWorks = lazy(() => import("./pages/GroundLockHowItWorks"));
const CaseStudy = lazy(() => import("./pages/CaseStudy"));
const GroundLockSystems = lazy(() => import("./pages/GroundLockSystems"));
const EquusRidge = lazy(() => import("./pages/EquusRidge"));
const InstallerAccess = lazy(() => import("./pages/InstallerAccess"));
const SiteAssessment = lazy(() => import("./pages/SiteAssessment"));
const SignatureSystems = lazy(() => import("./pages/SignatureSystems"));
const GroundLockSetup = lazy(() => import("./pages/GroundLockSetup"));
const GroundLockOnboarding = lazy(() => import("./pages/GroundLockOnboarding"));
const GroundLockLicensing = lazy(() => import("./pages/GroundLockLicensing"));
const GroundLockEvents = lazy(() => import("./pages/GroundLockEvents"));
const ClientQuote = lazy(() => import("./pages/ClientQuote"));
const ProposalTemplate = lazy(() => import("./pages/ProposalTemplate"));
const ProposalEditor = lazy(() => import("./pages/ProposalEditor"));
const Visualise = lazy(() => import("./pages/Visualise"));
const TheStandard = lazy(() => import("./pages/TheStandard"));
const WhyWeExist = lazy(() => import("./pages/WhyWeExist"));
const ClientPortal = lazy(() => import("./pages/ClientPortal"));
const ClientPortalLogin = lazy(() => import("./pages/ClientPortalLogin"));
const Pavilion = lazy(() => import("./pages/Pavilion"));

const queryClient = new QueryClient();


function AppContent() {
  return (
    <IntroContext.Provider value={{ headerLogoReady: true }}>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        
        <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/:slug" element={<ServiceDetail />} />
          <Route path="/services/round-pens" element={<RoundPens />} />
          <Route path="/boarding" element={<Boarding />} />
          <Route path="/about" element={<About />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/testimonials" element={<Testimonials />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/contact" element={<Contact />} />
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
          
          <Route path="/systems" element={<Shop />} />
          
          <Route path="/forge" element={<Forge />} />
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
           
          <Route path="/groundlock" element={<GroundLock />} />
          <Route path="/groundlock/how-it-works" element={<GroundLockHowItWorks />} />
          <Route path="/groundlock-systems" element={<GroundLockSystems />} />
          <Route path="/equus-ridge" element={<EquusRidge />} />
           <Route path="/installer" element={<InstallerAccess />} />
           <Route path="/site-assessment" element={<SiteAssessment />} />
           <Route path="/signature-systems" element={<SignatureSystems />} />
           <Route path="/groundlock-setup" element={<ProtectedRoute><GroundLockSetup /></ProtectedRoute>} />
           <Route path="/groundlock-onboarding" element={<ProtectedRoute><GroundLockOnboarding /></ProtectedRoute>} />
           <Route path="/groundlock-licensing" element={<GroundLockLicensing />} />
           <Route path="/groundlock/events" element={<GroundLockEvents />} />
          <Route path="/project/:slug" element={<CaseStudy />} />
          <Route path="/quote/:token" element={<ClientQuote />} />
          <Route path="/proposal" element={<ProposalTemplate />} />
           <Route path="/proposal-editor/:id" element={<ProposalEditor />} />
           <Route path="/visualise" element={<Visualise />} />
           <Route path="/the-standard" element={<TheStandard />} />
           <Route path="/why" element={<WhyWeExist />} />
           <Route path="/portal" element={<ProtectedRoute loginPath="/portal/login"><ClientPortal /></ProtectedRoute>} />
           <Route path="/portal/login" element={<ClientPortalLogin />} />
           <Route path="/pavilion" element={<Pavilion />} />
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
