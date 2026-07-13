"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "../styles/Resources.css";
import {
  Search, Tag, Download, Lock, CheckCircle2,
  AlertCircle, Loader2, X, ExternalLink, BookOpen
} from "lucide-react";

const CATEGORIES = [
  { id: "all", name: "All Resources" },
  { id: "guides", name: "Guides & Tutorials" },
  { id: "webinars", name: "Webinars" },
  { id: "tools", name: "Tools & Templates" },
  { id: "research", name: "Research & Case Studies" },
];

/* ─────────────────────────────────────────
   Paystack checkout hook
───────────────────────────────────────── */
function usePaystack() {
  const initiate = useCallback(({ email, amount, resourceId, resourceTitle, onSuccess, onCancel, onError }) => {
    const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
    if (!publicKey) {
      onError?.("Payment is not configured. Please contact support.");
      return false;
    }
    if (!window.PaystackPop?.setup) {
      onError?.("Payment provider failed to load. Please refresh and try again.");
      return false;
    }

    const handler = window.PaystackPop.setup({
      key: publicKey,
      email,
      amount: Math.round(Number(amount) * 100), // kobo
      currency: "NGN",
      ref: `TEAZY_${resourceId}_${Date.now()}`,
      metadata: { resource_id: resourceId, resource_title: resourceTitle },
      callback: (response) => onSuccess(response.reference),
      onClose: onCancel,
    });
    handler.openIframe();
    return true;
  }, []);
  return { initiate };
}

/* ─────────────────────────────────────────
   Email prompt modal (before payment)
───────────────────────────────────────── */
function EmailModal({ resource, onConfirm, onClose }) {
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");
  const isFree = Number(resource.price) === 0;

  const submit = (e) => {
    e.preventDefault();
    if (!/\S+@\S+\.\S+/.test(email)) { setErr("Please enter a valid email."); return; }
    onConfirm(email);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#2F6FCC] to-[#1a4d99] px-6 py-6 text-white">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
          <button onClick={onClose} className="absolute top-4 right-4 rounded-full p-1.5 hover:bg-white/20 transition-colors">
            <X className="h-4 w-4" />
          </button>
          <div className="relative">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 mb-3">
              {isFree ? <Download className="h-6 w-6" /> : <Lock className="h-6 w-6" />}
            </div>
            <h2 className="text-lg font-bold">{resource.title}</h2>
            <p className="mt-1 text-sm text-white/80">
              {isFree ? "Free download — enter your email to continue" : `₦${Number(resource.price).toLocaleString()} — pay securely with Paystack`}
            </p>
          </div>
        </div>

        <form onSubmit={submit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setErr(""); }}
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-[#2F6FCC] focus:ring-2 focus:ring-[#2F6FCC]/20 outline-none transition-all"
              placeholder="you@example.com"
              autoFocus
            />
            {err && <p className="mt-1 text-xs text-red-500">{err}</p>}
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-[#2F6FCC] py-3 text-sm font-semibold text-white hover:bg-[#2561b8] transition-colors flex items-center justify-center gap-2"
          >
            {isFree
              ? <><Download className="h-4 w-4" /> Download Free Resource</>
              : <><Lock className="h-4 w-4" /> Pay ₦{Number(resource.price).toLocaleString()} & Download</>
            }
          </button>
          <p className="text-center text-xs text-gray-400">
            {isFree ? "We'll use your email for download confirmation only." : "Secure payment powered by Paystack."}
          </p>
        </form>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Verifying payment overlay
───────────────────────────────────────── */
function VerifyingModal({ message }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-sm w-full">
        <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#2F6FCC] mb-4" />
        <h3 className="text-base font-semibold text-gray-900">{message}</h3>
        <p className="text-sm text-gray-500 mt-1">Please don't close this window.</p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Success overlay
───────────────────────────────────────── */
function SuccessModal({ resource, downloadUrl, onClose }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-sm w-full">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">Payment Confirmed!</h3>
        <p className="text-sm text-gray-500 mt-1 mb-6">Your resource is ready to download.</p>
        <a
          href={downloadUrl}
          target="_blank"
          rel="noreferrer"
          onClick={onClose}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#2F6FCC] py-3 text-sm font-semibold text-white hover:bg-[#2561b8] transition-colors mb-3"
        >
          <Download className="h-4 w-4" /> Download {resource.title}
        </a>
        <button onClick={onClose} className="text-sm text-gray-400 hover:text-gray-600">Close</button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Resource Card
───────────────────────────────────────── */
function ResourceCard({ resource, onAccess }) {
  const isFree = Number(resource.price) === 0;
  const catColors = {
    guides: 'bg-blue-100 text-blue-700',
    tools: 'bg-purple-100 text-purple-700',
    webinars: 'bg-green-100 text-green-700',
    research: 'bg-amber-100 text-amber-700',
  };
  const catLabel = {
    guides: 'Guide', tools: 'Tool', webinars: 'Webinar', research: 'Research',
  };

  return (
    <div className="group bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
      {/* Thumbnail */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100" style={{ height: '180px' }}>
        {resource.thumbnailUrl
          ? <img src={resource.thumbnailUrl} alt={resource.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="h-16 w-16 text-[#2F6FCC]/30" />
            </div>
          )
        }
        {/* Price badge */}
        <div className={`absolute top-3 right-3 rounded-full px-3 py-1 text-xs font-bold shadow-md ${isFree ? 'bg-green-500 text-white' : 'bg-[#2F6FCC] text-white'}`}>
          {isFree ? 'FREE' : `₦${Number(resource.price).toLocaleString()}`}
        </div>
        {/* Category */}
        {resource.category && (
          <div className={`absolute top-3 left-3 rounded-full px-2.5 py-1 text-[10px] font-semibold ${catColors[resource.category] || 'bg-gray-100 text-gray-600'}`}>
            {catLabel[resource.category] || resource.category}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-base font-bold text-gray-900 leading-snug mb-2 line-clamp-2">{resource.title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed mb-4 flex-1 line-clamp-3">{resource.description}</p>

        <button
          onClick={() => onAccess(resource)}
          className={`w-full rounded-xl py-2.5 text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${
            isFree
              ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-600 hover:text-white hover:border-green-600'
              : 'bg-[#2F6FCC] text-white hover:bg-[#2561b8] shadow-md shadow-blue-500/20'
          }`}
        >
          {isFree ? <><Download className="h-4 w-4" /> Download Free</> : <><Lock className="h-4 w-4" /> Buy Resource</>}
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Main Resources Page
───────────────────────────────────────── */
const Resources = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [resources, setResources] = useState([]);
  const [featuredResources, setFeaturedResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [apiError, setApiError] = useState(null);

  // Modal state machine: null | 'email' | 'verifying' | 'success' | 'error'
  const [modalState, setModalState] = useState(null);
  const [selectedResource, setSelectedResource] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [payError, setPayError] = useState(null);

  // Newsletter form: status is null | 'sending' | 'success' | 'error'
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState(null);

  const { initiate } = usePaystack();

  useEffect(() => {
    // Deep links like /resources#newsletter land on the newsletter section
    if (window.location.hash === "#newsletter") {
      setTimeout(() => {
        document
          .getElementById("newsletter")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    } else {
      window.scroll({ top: 0, left: 0, behavior: "smooth" });
    }
    fetchResources();
  }, []);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterStatus("sending");
    try {
      await axios.post("/api/newsletter/subscribe", { email: newsletterEmail });
      setNewsletterStatus("success");
      setNewsletterEmail("");
    } catch (err) {
      console.error("Newsletter subscription failed:", err);
      setNewsletterStatus("error");
    }
  };

  const fetchResources = async () => {
    try {
      const [resourcesRes, featuredRes] = await Promise.all([
        axios.get("/api/resources"),
        axios.get("/api/resources/featured"),
      ]);
      setResources(resourcesRes.data);
      const featured = featuredRes.data;
      setFeaturedResources(
        Array.isArray(featured) ? featured : featured ? [featured] : [],
      );
      setApiError(null);
    } catch {
      setApiError("Could not load resources from server.");
    } finally {
      setLoading(false);
    }
  };

  const handleAccess = (resource) => {
    setSelectedResource(resource);
    setModalState("email");
    setPayError(null);
  };

  const handleEmailConfirm = async (email) => {
    const isFree = Number(selectedResource.price) === 0;

    if (isFree) {
      // Free resource → verify instantly (no payment reference needed)
      setModalState("verifying");
      try {
        const res = await axios.get(`/api/resources/${selectedResource.id}/verify`, {
          params: { ref: "FREE", email },
        });
        setDownloadUrl(res.data.downloadUrl);
        setModalState("success");
      } catch {
        setPayError("Failed to prepare download. Please try again.");
        setModalState("error");
      }
      return;
    }

    // Paid resource → open Paystack
    setModalState(null); // close email modal first
    initiate({
      email,
      amount: Number(selectedResource.price),
      resourceId: selectedResource.id,
      resourceTitle: selectedResource.title,
      onSuccess: async (reference) => {
        setModalState("verifying");
        try {
          const res = await axios.get(`/api/resources/${selectedResource.id}/verify`, {
            params: { ref: reference, email },
          });
          setDownloadUrl(res.data.downloadUrl);
          setModalState("success");
        } catch {
          setPayError("Payment verification failed. Please contact support.");
          setModalState("error");
        }
      },
      onCancel: () => { /* user closed Paystack — do nothing */ },
      onError: (message) => {
        setPayError(message);
        setModalState("error");
      },
    });
  };

  const closeAll = () => {
    setModalState(null);
    setSelectedResource(null);
    setDownloadUrl(null);
    setPayError(null);
  };

  const featuredIds = new Set(featuredResources.map((r) => r.id));

  const filtered = resources.filter(r => {
    if (featuredIds.has(r.id)) return false;
    const matchCat = activeCategory === "all" || r.category === activeCategory;
    const matchSearch = !search || r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.description?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="resources-page">
      {/* Modals */}
      {modalState === "email" && selectedResource && (
        <EmailModal resource={selectedResource} onConfirm={handleEmailConfirm} onClose={closeAll} />
      )}
      {modalState === "verifying" && (
        <VerifyingModal message="Verifying payment…" />
      )}
      {modalState === "success" && selectedResource && downloadUrl && (
        <SuccessModal resource={selectedResource} downloadUrl={downloadUrl} onClose={closeAll} />
      )}
      {modalState === "error" && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-sm w-full">
            <AlertCircle className="mx-auto h-10 w-10 text-red-500 mb-4" />
            <h3 className="text-base font-semibold text-gray-900">Something went wrong</h3>
            <p className="text-sm text-gray-500 mt-1 mb-6">{payError}</p>
            <button onClick={closeAll} className="w-full rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white hover:bg-gray-700 transition-colors">
              Close
            </button>
          </div>
        </div>
      )}

      {/* ── Hero ── */}
      <section className="resources-hero">
        <div className="resources-overlay" />
        <div className="container">
          <div className="resources-hero-content">
            <h1>Educational Resources</h1>
            <p>Practical tools, guides, and research to enhance your teaching with technology</p>
          </div>
        </div>
      </section>

      {/* ── Filter & Search bar ── */}
      <section className="section resources-grid-section !mt-0 !pt-0 !bg-blue-200/60">
        <section className="section resources-filter">
          <div className="container">
            {/* Search */}
            <div className="relative mb-4 max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search resources…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full rounded-full border border-gray-200 bg-white pl-9 pr-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 shadow-sm focus:border-[#2F6FCC] focus:ring-2 focus:ring-[#2F6FCC]/20 outline-none transition-all"
              />
            </div>
            {/* Category tabs */}
            <div className="filter-tabs">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  className={`filter-tab !bg-none ${activeCategory === cat.id ? "active" : ""}`}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── Grid ── */}
        <div className="container">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-[#2F6FCC]" />
            </div>
          ) : apiError ? (
            <div className="py-12 text-center">
              <AlertCircle className="mx-auto h-10 w-10 text-amber-500 mb-3" />
              <p className="text-gray-600">{apiError}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="no-resources py-12">
              <BookOpen className="mx-auto h-12 w-12 text-gray-300 mb-3" />
              <p>No resources found in this category. Check back soon!</p>
            </div>
          ) : (
            <div className="resources-grid">
              {filtered.map(resource => (
                <ResourceCard key={resource.id} resource={resource} onAccess={handleAccess} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Featured resources (from admin dashboard) ── */}
      {featuredResources.length > 0 && (
        <section className="section featured-resources !bg-gray-100">
          <div className="container">
            <div className="featured-resources-header">
              <span className="featured-badge">Featured Resources</span>
              <h2>Hand-picked for educators</h2>
              <p>Resources our team recommends — guides, tools, and downloads to level up your classroom.</p>
            </div>
            <div className="featured-resources-grid">
              {featuredResources.map((resource) => (
                <article key={resource.id} className="featured-resource-card">
                  <div className="featured-resource-card__image">
                    <img
                      src={
                        resource.thumbnailUrl ||
                        "/images/resourcesFolder/becomingTechSavvyTeacher.png"
                      }
                      alt={resource.title}
                    />
                  </div>
                  <div className="featured-resource-card__body">
                    <h3>{resource.title}</h3>
                    <p>{resource.description}</p>
                    <button
                      type="button"
                      onClick={() => handleAccess(resource)}
                      className="btn btn-primary"
                    >
                      {Number(resource.price) === 0
                        ? "Download Free Resource"
                        : `Buy for ₦${Number(resource.price).toLocaleString()}`}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Newsletter ── */}
      <section id="newsletter" className="section resources-newsletter !bg-blue-200">
        <div className="container">
          <div className="resources-newsletter-content">
            <div className="resources-newsletter-text">
              <h2 className="!text-black">Get New Resources First</h2>
              <p className="!text-brand">
                Subscribe to our newsletter to receive the latest educational
                technology resources directly to your inbox.
              </p>
            </div>
            <form
              className="resources-newsletter-form !bg-white/60 !p-2 rounded-[30px]"
              onSubmit={handleNewsletterSubmit}
            >
              <input
                type="email"
                placeholder="Your email address"
                className="!text-brand !outline-none !bg-none !border-none placeholder:!text-black"
                value={newsletterEmail}
                onChange={(e) => {
                  setNewsletterEmail(e.target.value);
                  if (newsletterStatus) setNewsletterStatus(null);
                }}
                required
              />
              <button
                type="submit"
                disabled={newsletterStatus === "sending"}
                className="btn btn-accent !rounded-[30px] disabled:opacity-60"
              >
                {newsletterStatus === "sending" ? "Subscribing..." : "Subscribe"}
              </button>
            </form>
            {newsletterStatus === "success" && (
              <p className="mt-3 text-sm font-semibold text-green-700">
                You're subscribed! We'll be in touch.
              </p>
            )}
            {newsletterStatus === "error" && (
              <p className="mt-3 text-sm font-semibold text-red-600">
                Something went wrong. Please try again later.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Resources;
