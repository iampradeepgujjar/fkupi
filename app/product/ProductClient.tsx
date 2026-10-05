"use client";

import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Heart,
  House,
  Search,
  Send,
  ShoppingCart,
  Star,
  Truck,
  Store,
  ShieldCheck,
  RefreshCw,
  Banknote,
} from "lucide-react";
import productsData from "../../data/products.json";
import { SaleBanner } from "../../components/SaleBanner";

const highlights: [string, string][] = [
  ["Base Material", "Alloy, Zinc"],
  ["Plating", "Brass"],
  ["Gemstone", "Pearl"],
  ["Color", "Multicolor"],
  ["Model Number", "1000 krrishaa"],
  ["Model Name", "Korean earrings set"],
  ["Ideal For", "Women, Baby Girls, Girls"],
  ["Type", "Stud Earring"],
];

const ratingChips: [string, string][] = [
  ["Value for money", "4.3"],
  ["Good quality", "4.2"],
  ["Sturdiness", "4.1"],
  ["Perfect Packing", "4.1"],
  ["Value For Money", "4.5"],
  ["Portiblity", "4.3"],
];

const reviews = [
  {
    score: "4",
    title: "Good quality product",
    age: "3 years ago",
    body: "This is a good purchase. It's actually a decent in...",
    author: "Flipkart Customer",
    up: "228",
    down: "12",
  },
  {
    score: "5",
    title: "Excellent",
    age: "2 years ago",
    body: "Recommend for everyone, loved the packaging and...",
    author: "Nghaktea Tlau",
    up: "96",
    down: "4",
  },
  {
    score: "5",
    title: "Value for money",
    age: "1 month ago",
    body: "Very nice product at this price point. Totally loved it...",
    author: "Anonymous Customer",
    up: "45",
    down: "2",
  },
  {
    score: "4",
    title: "Nice design",
    age: "6 months ago",
    body: "Looks exactly like the pictures. Good build quality.",
    author: "Verified Buyer",
    up: "12",
    down: "1",
  },
  {
    score: "5",
    title: "Awesome!",
    age: "1 year ago",
    body: "Gifted this to my sister and she loved it. Highly recommended.",
    author: "Happy Shopper",
    up: "89",
    down: "5",
  },
];

export default function ProductClient() {
  const searchParams = Object.fromEntries(useSearchParams().entries());
  const product = productsData.find((p) => p.id === searchParams.id) || productsData[0];
  const galleryImages = product.gallery || [product.image];
  const activeHighlights = product.highlights ? Object.entries(product.highlights) : highlights;

  const [activeSlide, setActiveSlide] = useState(0);
  const [benefitsOpen, setBenefitsOpen] = useState(true);
  const [highlightsOpen, setHighlightsOpen] = useState(true);
  const [reviewsOpen, setReviewsOpen] = useState(true);
  const [questionsOpen, setQuestionsOpen] = useState(false);
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (product?.title) {
      document.title = product.title;
    }
  }, [product?.title]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (!scrollRef.current) return;
      const el = scrollRef.current;
      const nextSlide = (activeSlide + 1) % galleryImages.length;
      el.scrollTo({ left: nextSlide * el.offsetWidth, behavior: "smooth" });
    }, 3000);
    return () => window.clearInterval(timer);
  }, [activeSlide, galleryImages.length]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const slide = Math.round(el.scrollLeft / el.offsetWidth);
    setActiveSlide(slide);
  };

  const handleBuy = () => {
    const cartProduct = {
      id: product.id,
      title: product.title,
      price: parseInt(product.newPrice.replace(/[^\d]/g, ""), 10),
      image: product.image
    };
    try {
      const existingCartStr = localStorage.getItem("cart");
      let existingCart = existingCartStr ? JSON.parse(existingCartStr) : [];
      if (!existingCart.find((p: any) => p.id === product.id)) {
        existingCart.push(cartProduct);
      }
      localStorage.setItem("cart", JSON.stringify(existingCart));
    } catch {
      localStorage.setItem("cart", JSON.stringify([cartProduct]));
    }
    router.push("/address");
  };

  return (
    <div className="store-shell pdp">
      <div className="pdp-top">
        <Link href="/" aria-label="Go back">
          <ArrowLeft />
        </Link>
        <label className="search-box pdp-search">
          <Search aria-hidden="true" />
          <input aria-label="Search for products" />
        </label>
        <Link href="/order-summary" aria-label="Cart">
          <ShoppingCart />
        </Link>
      </div>

      <main className="pdp-main">
        <section className="pdp-gallery">
          <div
            ref={scrollRef}
            style={{ display: "flex", overflowX: "auto", scrollSnapType: "x mandatory", scrollbarWidth: "none", width: "100%", WebkitOverflowScrolling: "touch" }}
            onScroll={handleScroll}
          >
            {galleryImages.map((src, idx) => (
              <img
                key={idx}
                src={src}
                alt={`Product image ${idx + 1}`}
                style={{ scrollSnapAlign: "start", flex: "0 0 100%", width: "100%", maxHeight: "70vh", objectFit: "contain" }}
              />
            ))}
          </div>

          <div className="_1psv1zeb9 _1psv1ze0" style={{ display: "flex", flexBasis: "auto", flexDirection: "column", flexShrink: 0, alignItems: "center", minHeight: "0px", minWidth: "0px", position: "absolute", bottom: "8px", left: "0", right: "0", zIndex: 10, boxSizing: "border-box", borderWidth: "0px", height: "25px", justifyContent: "center", pointerEvents: "none" }}>
            <div className="_1psv1zeb9 _1psv1ze0 _1psv1zel _1psv1ze90 _1psv1ze6r" style={{ display: "flex", flexBasis: "auto", flexDirection: "column", flexShrink: 0, alignItems: "stretch", minHeight: "0px", minWidth: "0px", position: "relative", zIndex: 0, boxSizing: "border-box", borderWidth: "0px", justifyContent: "center", overflow: "hidden", width: "80px" }}>
              <div className="css-g5y9jx r-18u37iz r-u8s1d" style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "6px", transform: "translateX(0px)" }}>
                {galleryImages.map((_, idx) => {
                  let scale = 0.65;
                  if (idx === activeSlide) scale = 1.4;
                  else if (Math.abs(idx - activeSlide) === 1) scale = 1.15;
                  else if (Math.abs(idx - activeSlide) === 2) scale = 0.9;
                  const fill = idx === activeSlide ? "#1152e0ff" : "#e0e0e0ff";
                  return (
                    <div key={idx} className="css-g5y9jx r-1awozwy r-1777fci r-1537yvj" style={{ transform: `scale(${scale})`, transition: "transform 0.2s" }}>
                      <svg width="8" height="8" viewBox="0 0 9 9" fill="none" style={{ height: "8px", width: "8px" }}>
                        <circle cx="4.98926" cy="4.5" r="4" fill={fill}></circle>
                      </svg>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <span className="pdp-flag">BESTSELLER</span>
          <div className="pdp-actions">
            <button type="button" aria-label="Add to wishlist"><Heart /></button>
            <button type="button" aria-label="Share product"><Send /></button>
          </div>
          <div className="pdp-rating-pill">
            5.0 <Star fill="currentColor" /> <span>| {(200000 + (((product.id.charCodeAt(0) + product.id.charCodeAt(product.id.length - 1)) || 1) * 12345) % 100000).toLocaleString('en-IN')}</span>
          </div>
        </section>

        <section className="pdp-block">
          <h1>{product.title}</h1>
          <div style={{ marginBottom: "10px" }}>
            <span style={{ display: "inline-block", padding: "4px 9px", borderRadius: "4px", background: "#800080", color: "#fff", fontSize: "11px", fontWeight: 700, letterSpacing: "0.3px" }}>
              LOWEST PRICE IN LAST 30 DAYS
            </span>
          </div>
          <p className="pdp-price">
            <span className="pdp-off">
              <svg width="20" height="20" fill="none" viewBox="0 0 12 12"><path d="M6 1.875v8.25M2.625 6.75 6 10.125 9.375 6.75" stroke="#008042ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>
              {product.discount}
            </span>
            <del>{product.oldPrice}</del>
            <strong>{product.newPrice}</strong>
          </p>

          <div className="pdp-card">
            <button type="button" className="pdp-card-head" onClick={() => setBenefitsOpen((v) => !v)}>
              Additional benefits on this purchase
              {benefitsOpen ? <ChevronUp /> : <ChevronDown />}
            </button>
            {benefitsOpen && (
              <div className="pdp-coin">
                <img src="/assets/supercoin.webp" alt="SuperCoin" style={{ width: 18, height: 18, flex: "none" }} />
                15 SuperCoins cashback with <em>Plus Silver</em>
              </div>
            )}
          </div>
        </section>

        <section className="pdp-block pdp-divided" style={{ padding: '8px 0' }}>
          <SaleBanner />
        </section>

        <section className="pdp-block pdp-divided">
          <h2>Delivery details</h2>

          <div className="pdp-row pdp-row-grey">
            <Truck /> <strong>Delivery by {new Date(Date.now() + 2 * 86400000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', weekday: 'short' })}</strong>
          </div>
          <div className="pdp-row pdp-row-grey pdp-row-column">
            <a className="pdp-link" href="#sellers">See other sellers</a>
          </div>
          <div className="pdp-row pdp-row-grey pdp-seller">
            <Store className="pdp-row-icon" color="#2874f0" style={{ width: 22, height: 22 }} />
            <div>
              <strong>Fulfilled by Cresurge</strong>
              <small>5.0 ★ • 11 years with Flipkart</small>
            </div>
          </div>
          <div className="pdp-warranty">
            <ShieldCheck color="#2874f0" size={32} className="pdp-warranty-icon" style={{ width: 32, height: 32 }} />
            <p>Warranty is applicable for manufacturing defects in the product</p>
          </div>
        </section>

        <section className="pdp-assurance">
          <div><RefreshCw size={32} color="#2874f0" /><span>7 Days Replacement</span></div>
          <div><Banknote size={32} color="#2874f0" /><span>No Delivery Charges</span></div>
          <div><img src="/assets/f-assured.png" alt="Flipkart Assured" style={{ height: "20px" }} /><span>Flipkart Assured</span></div>
        </section>

        <section className="pdp-block pdp-divided">
          <button type="button" className="pdp-section-head" onClick={() => setHighlightsOpen((v) => !v)}>
            <h2>Product highlights</h2>
            <span className="pdp-toggle">{highlightsOpen ? <ChevronUp /> : <ChevronDown />}</span>
          </button>
          {highlightsOpen && (
            <dl className="pdp-specs">
              {activeHighlights.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          )}
        </section>

        <section className="pdp-block pdp-divided" style={{ padding: 0 }}>
          <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
            {galleryImages.slice(1).map((src, idx) => (
              <img key={idx} src={src} style={{ width: "100%", display: "block" }} alt="" />
            ))}
          </div>
        </section>

        <section className="pdp-block pdp-divided">
          <button type="button" className="pdp-section-head" onClick={() => setReviewsOpen((v) => !v)}>
            <h2>Ratings and reviews</h2>
            <span className="pdp-toggle">{reviewsOpen ? <ChevronUp /> : <ChevronDown />}</span>
          </button>
          {reviewsOpen && (
            <>
              <p className="pdp-score">
                <strong>5.0</strong> <Star fill="currentColor" /> <span className="pdp-badge">Very Good</span>
              </p>
              <p className="pdp-score-note" style={{ display: "flex", alignItems: "center", gap: "4px" }}>based on 264,901 ratings by <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8.0013" cy="7.9991" r="5.33333" stroke="#707070" strokeWidth="0.96"></circle><path fillRule="evenodd" clipRule="evenodd" d="M5.42041 8.32183C5.29024 8.19165 5.29024 7.9806 5.42041 7.85042L5.53075 7.74009C5.66079 7.61004 5.87159 7.6099 6.00182 7.73976L7.01075 8.74588C7.14098 8.87574 7.35178 8.8756 7.48183 8.74555L10.1396 6.08773C10.2701 5.95723 10.4818 5.95761 10.6119 6.08857L10.7236 6.20103C10.8529 6.33134 10.8526 6.54175 10.7227 6.6716L7.48216 9.91217C7.35198 10.0423 7.14093 10.0423 7.01075 9.91217L5.42041 8.32183Z" fill="#707070" stroke="#707070" strokeWidth="0.16"></path></svg> Verified Buyers</p>
              <div className="pdp-chips">
                {ratingChips.map(([label, value]) => (
                  <span key={label + value}>
                    {label} <strong>{value}</strong> <Star fill="currentColor" />
                  </span>
                ))}
              </div>
              <div className="pdp-reviews">
                {reviews.map((review) => (
                  <article key={review.title}>
                    <p className="pdp-review-head">
                      <span className="pdp-review-score">{review.score} <Star fill="currentColor" /></span>
                      <strong>{review.title}</strong>
                      <small>{review.age}</small>
                    </p>
                    <p className="pdp-review-body">{review.body} <a href="#more">more</a></p>
                    <p className="pdp-review-foot">
                      <span>{review.author}<br /><small style={{ display: "flex", alignItems: "center", gap: "4px" }}><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8.0013" cy="7.9991" r="5.33333" stroke="#707070" strokeWidth="0.96"></circle><path fillRule="evenodd" clipRule="evenodd" d="M5.42041 8.32183C5.29024 8.19165 5.29024 7.9806 5.42041 7.85042L5.53075 7.74009C5.66079 7.61004 5.87159 7.6099 6.00182 7.73976L7.01075 8.74588C7.14098 8.87574 7.35178 8.8756 7.48183 8.74555L10.1396 6.08773C10.2701 5.95723 10.4818 5.95761 10.6119 6.08857L10.7236 6.20103C10.8529 6.33134 10.8526 6.54175 10.7227 6.6716L7.48216 9.91217C7.35198 10.0423 7.14093 10.0423 7.01075 9.91217L5.42041 8.32183Z" fill="#707070" stroke="#707070" strokeWidth="0.16"></path></svg> Verified Buyer</small></span>
                      <span className="pdp-votes">👍 {review.up} &nbsp; 👎 {review.down}</span>
                    </p>
                  </article>
                ))}
              </div>
              <a className="pdp-all-reviews" href="#reviews">Show all reviews <ChevronRight /></a>
            </>
          )}
        </section>

        <section className="pdp-block pdp-divided">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#212121' }}>Similar Products</h2>
            <div style={{ background: '#212121', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <ArrowRight color="#fff" size={16} />
            </div>
          </div>
          <div style={{ display: 'flex', overflowX: 'auto', gap: '12px', paddingBottom: '12px', scrollbarWidth: 'none', msOverflowStyle: 'none' }} className="hide-scroll">
            {[...productsData]
              .filter(p => p.id !== product.id)
              .slice(0, 3)
              .map((p) => (
                <Link href={{ pathname: "/product", query: { id: p.id } }} key={p.id} style={{ width: '150px', flexShrink: 0, textDecoration: 'none' }}>
                  <div style={{ background: '#f5f5f5', borderRadius: '8px', overflow: 'hidden', position: 'relative', height: '200px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <img src={p.image} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="" />
                    {p.rating && (
                      <div style={{ position: 'absolute', bottom: '8px', right: '8px', background: '#fff', borderRadius: '12px', padding: '2px 6px', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '2px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                        {p.rating} <Star fill="#22c55e" stroke="#22c55e" size={10} />
                      </div>
                    )}
                  </div>
                  <div style={{ marginTop: '8px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#212121', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#388e3c', marginTop: '2px' }}>{p.discount}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <span style={{ fontSize: '12px', color: '#878787', textDecoration: 'line-through' }}>{p.oldPrice}</span>
                      <span style={{ fontSize: '15px', fontWeight: 700, color: '#212121' }}>{p.newPrice}</span>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </section>

        <section className="pdp-block pdp-divided">
          <button type="button" className="pdp-section-head" onClick={() => setQuestionsOpen((v) => !v)}>
            <h2>Questions and Answers</h2>
            <span className="pdp-toggle">{questionsOpen ? <ChevronUp /> : <ChevronDown />}</span>
          </button>
          <p className="pdp-score-note">No questions and answers available</p>
        </section>

        <section className="pdp-block">
          <img className="pdp-paylater" src="/assets/paylater-new.jpg" alt="Shop today and pay later with Flipkart Pay Later" />
        </section>
      </main>

      <div className="pdp-buybar">
        <button type="button" className="pdp-cart" onClick={handleBuy}>Add to cart</button>
        <button type="button" className="pdp-buy" onClick={handleBuy}>Buy at {product.newPrice}</button>
      </div>
    </div>
  );
}
