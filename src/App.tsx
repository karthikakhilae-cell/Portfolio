import { BrowserRouter as Router, useLocation, useRoutes } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import { cloneElement, lazy, ReactElement, Suspense } from "react";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import ScrollToTop from "./components/layout/ScrollToTop";
import PageTransition from "./components/layout/PageTransition";
import Landing from "./pages/Landing";

// Code-split: each page loads only when visited, so the first paint
// doesn't wait for the whole site's JavaScript.
const AIAssistant = lazy(() => import("./components/ai/AIAssistant"));
const Home = lazy(() => import("./pages/Home"));
const Work = lazy(() => import("./pages/Work"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Lab = lazy(() => import("./pages/Lab"));
const About = lazy(() => import("./pages/About"));
const Thinking = lazy(() => import("./pages/Thinking"));
const Blogs = lazy(() => import("./pages/Blogs"));
const Life = lazy(() => import("./pages/Life"));
const Arts = lazy(() => import("./pages/Arts"));
const Journal = lazy(() => import("./pages/Journal"));
const Store = lazy(() => import("./pages/Store"));
const Contact = lazy(() => import("./pages/Contact"));
const HireMe = lazy(() => import("./pages/HireMe"));
const NotFound = lazy(() => import("./pages/NotFound"));

function AnimatedRoutes() {
  const location = useLocation();
  
  const element = useRoutes([
    { path: "/", element: <PageTransition><Landing /></PageTransition> },
    { path: "/home", element: <PageTransition><Home /></PageTransition> },
    { path: "/work", element: <PageTransition><Work /></PageTransition> },
    { path: "/dashboard", element: <PageTransition><Dashboard /></PageTransition> },
    { path: "/lab", element: <PageTransition><Lab /></PageTransition> },
    { path: "/about", element: <PageTransition><About /></PageTransition> },
    { path: "/thinking", element: <PageTransition><Thinking /></PageTransition> },
    { path: "/blogs", element: <PageTransition><Blogs /></PageTransition> },
    { path: "/life", element: <PageTransition><Life /></PageTransition> },
    { path: "/arts", element: <PageTransition><Arts /></PageTransition> },
    { path: "/journal", element: <PageTransition><Journal /></PageTransition> },
    { path: "/store", element: <PageTransition><Store /></PageTransition> },
    { path: "/contact", element: <PageTransition><Contact /></PageTransition> },
    { path: "/hire-me", element: <PageTransition><HireMe /></PageTransition> },
    { path: "*", element: <PageTransition><NotFound /></PageTransition> },
  ]);

  if (!element) return null;

  return (
    <Suspense fallback={null}>
      <AnimatePresence mode="wait">
        {cloneElement(element as ReactElement, { key: location.pathname })}
      </AnimatePresence>
    </Suspense>
  );
}

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-bg selection:bg-accent selection:text-white">
        <Navbar />
        <AnimatedRoutes />
        <AIAssistantWrapper />
        <Footer />
      </div>
    </Router>
  );
}

function AIAssistantWrapper() {
  const location = useLocation();
  if (location.pathname === "/") return null;
  return (
    <Suspense fallback={null}>
      <AIAssistant />
    </Suspense>
  );
}
