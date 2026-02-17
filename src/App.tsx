import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Services from "./pages/Services";
import ServiceDetail from "./pages/ServiceDetail";
import Boarding from "./pages/Boarding";
import About from "./pages/About";
import Gallery from "./pages/Gallery";
import Testimonials from "./pages/Testimonials";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import { Privacy, Terms } from "./pages/Legal";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import AdminServices from "./pages/AdminServices";
import AdminTestimonials from "./pages/AdminTestimonials";
import AdminEvents from "./pages/AdminEvents";
import HQ from "./pages/HQ";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import BookLesson from "./pages/BookLesson";
import Lessons from "./pages/Lessons";
import BrandGuide from "./pages/BrandGuide";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Forge from "./pages/Forge";
import Events from "./pages/Events";
import Process from "./pages/Process";
import BookingsDashboard from "./pages/BookingsDashboard";
import StudentSpotlight from "./pages/StudentSpotlight";
import RoundPens from "./pages/RoundPens";
import Schedule from "./pages/Schedule";
import ThankYou from "./pages/ThankYou";
import Pricing from "./pages/Pricing";
import GroupBooking from "./pages/GroupBooking";
import Estimate from "./pages/Estimate";
import StaffDocuments from "./pages/StaffDocuments";
import AdminDocuments from "./pages/AdminDocuments";
import { useCartSync } from "./hooks/useCartSync";

const queryClient = new QueryClient();

function AppContent() {
  useCartSync();
  return (
    <>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/login" element={<Login />} />
          <Route path="/hq" element={<HQ />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/services" element={<AdminServices />} />
          <Route path="/admin/testimonials" element={<AdminTestimonials />} />
          <Route path="/admin/events" element={<AdminEvents />} />
          <Route path="/employee" element={<EmployeeDashboard />} />
          <Route path="/lessons" element={<Lessons />} />
          <Route path="/book-lesson" element={<BookLesson />} />
          <Route path="/brand" element={<BrandGuide />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/shop/:handle" element={<ProductDetail />} />
          <Route path="/forge" element={<Forge />} />
          <Route path="/events" element={<Events />} />
          <Route path="/process" element={<Process />} />
          <Route path="/bookings" element={<BookingsDashboard />} />
          <Route path="/student-spotlight" element={<StudentSpotlight />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/thank-you" element={<ThankYou />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/group-booking" element={<GroupBooking />} />
          <Route path="/estimate" element={<Estimate />} />
          <Route path="/documents" element={<StaffDocuments />} />
          <Route path="/admin/documents" element={<AdminDocuments />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppContent />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
