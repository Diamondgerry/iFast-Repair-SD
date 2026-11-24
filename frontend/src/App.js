import React, { useEffect, Component } from "react";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import Lenis from "lenis";
import "@/App.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Toaster } from "sonner";
import Home from "@/pages/Home";
import ServicesPage from "@/pages/ServicesPage";
import BookPage from "@/pages/BookPage";
import VisitPage from "@/pages/VisitPage";
import SellPage from "@/pages/SellPage";
import BuyPage from "@/pages/BuyPage";
import PayPage from "@/pages/PayPage";
import CheckoutPage from "@/pages/CheckoutPage";
import PaymentSuccess from "@/pages/PaymentSuccess";
import PaymentCancel from "@/pages/PaymentCancel";
import ReviewsPage from "@/pages/ReviewsPage";
import AdminPage from "@/pages/AdminPage";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err) {
    console.error("Render error:", err);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-brand-black px-6 text-center">
          <div>
            <p className="font-display text-2xl font-black uppercase text-white">Something broke</p>
            <p className="mt-3 text-sm text-white/50">Refresh the page — or walk in, we fix things.</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const SmoothScroll = () => {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const lenis = new Lenis({ lerp: 0.09, autoRaf: true, anchors: true });
    window.__lenis = lenis;
    return () => lenis.destroy();
  }, []);
  return null;
};

const ScrollToHash = () => {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const t = setTimeout(() => {
        if (window.__lenis) window.__lenis.scrollTo(hash, { offset: -90 });
        else document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" });
      }, 100);
      return () => clearTimeout(t);
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
};

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <SmoothScroll />
        <ScrollToHash />
        <div className="relative min-h-screen bg-brand-ocean text-white antialiased">
          <div className="noise-overlay" aria-hidden="true" />
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/book" element={<BookPage />} />
              <Route path="/visit" element={<VisitPage />} />
              <Route path="/sell" element={<SellPage />} />
              <Route path="/buy" element={<BuyPage />} />
              <Route path="/pay" element={<PayPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/payment/success" element={<PaymentSuccess />} />
              <Route path="/payment/cancel" element={<PaymentCancel />} />
              <Route path="/reviews" element={<ReviewsPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
          <Toaster theme="dark" position="bottom-right" />
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 pt-24 text-center" data-testid="not-found-page">
      <p className="font-display text-6xl font-black text-brand-yellow">404</p>
      <p className="mt-4 font-display text-xl font-bold uppercase text-white">This page took a dive.</p>
      <p className="mt-3 text-sm text-white/50">We couldn't find that page — but we can fix your phone.</p>
      <Link to="/" className="btn-primary mt-8">Back to home</Link>
    </div>
  );
}

export default App;
