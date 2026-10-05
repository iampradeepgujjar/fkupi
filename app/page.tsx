"use client";

import Link from 'next/link';
import { useEffect, useState } from "react";
import { Grid2X2, Home, Search, ShoppingCart, Star, UserRound } from "lucide-react";

const departments = [
  {
    icon: "/assets/dept-flipkart-icon.png",
    text: "/assets/dept-flipkart-text.png",
    label: "Flipkart",
    bgColor: "#ffe51f",
  },
  {
    icon: "/assets/dept-value365-icon.png",
    text: "/assets/dept-value365-text.png",
    label: "Value 365",
    bgColor: "#ffffff",
  },
  {
    icon: "/assets/dept-travel-icon.png",
    text: "/assets/dept-travel-text.png",
    label: "Travel",
    bgColor: "#ffffff",
  },
  {
    icon: "/assets/dept-grocery-icon.png",
    text: "/assets/dept-grocery-text.png",
    label: "Grocery",
    bgColor: "#ffffff",
  },
];

const categories = ["For You", "Fashion", "Mobiles", "Electronics", "Beauty", "Home", "Appliances"];

import productsData from "../data/products.json";
import { SaleBanner } from "../components/SaleBanner";

const productFeed = [...productsData].sort((a, b) => (a.order || 0) - (b.order || 0));

const slides = [
  { id: 0, image: "https://rukminim1.flixcart.com/fk-p-flap/951/464/image/c1df46c9f1092ac9.jpg?q=80", alt: "Slider image 1" },
  { id: 1, image: "https://rukminim1.flixcart.com/fk-p-flap/940/460/image/d8808717c7a1f43a.jpg?q=60", alt: "Slider image 2" },
  { id: 2, image: "https://rukminim1.flixcart.com/fk-p-flap/1000/490/image/9a344b95a0d29852.png?q=80", alt: "Slider image 3" },
  { id: 3, image: "https://rukminim1.flixcart.com/fk-p-flap/1000/490/image/1312x640-19f82h-1790798764140.png?q=80", alt: "Slider image 4" },
];

function Index() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  useEffect(() => {
    document.title = "Online shopping";
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 3000);
    return () => window.clearInterval(timer);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    if (diff > 50) {
      // Swiped left (next)
      setActiveSlide((current) => (current + 1) % slides.length);
    } else if (diff < -50) {
      // Swiped right (prev)
      setActiveSlide((current) => (current - 1 + slides.length) % slides.length);
    }
    setTouchStart(null);
  };

  return (
    <div className="store-shell">
      <header className="store-header">
        <div className="department-row" aria-label="Flipkart services">
          {departments.map((item) => (
            <a
              href={`#${item.label.toLowerCase().replace(" ", "-")}`}
              className="department"
              style={{ backgroundColor: item.bgColor }}
              key={item.label}
            >
              <div className="department-content">
                <img src={item.icon} alt="" className="dept-icon" />
                <img src={item.text} alt={item.label} className="dept-text" />
              </div>
            </a>
          ))}
        </div>
      </header>

      <div className="search-band">
        <label className="search-box">
          <Search aria-hidden="true" />
          <input aria-label="Search for products" placeholder="Search for Products" />
        </label>
      </div>

      <nav className="category-strip" aria-label="Product categories">
        {categories.map((category, index) => (
          <a
            className={index === 0 ? "category-active" : ""}
            href={`#${category.toLowerCase()}`}
            key={category}
          >
            {category}
          </a>
        ))}
      </nav>

      <main>
        <section className="offer-section" aria-label="Featured offer">
          <div
            className="slider-window"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className="slider-track"
              style={{ transform: `translateX(-${activeSlide * 100}%)` }}
            >
              {slides.map((slide) => (
                <img src={slide.image} alt={slide.alt} key={slide.id} />
              ))}
            </div>
          </div>
          <div className="slider-dots" aria-label={`Slide ${activeSlide + 1} of ${slides.length}`}>
            {slides.map((slide) => (
              <button
                type="button"
                aria-label={`Show slide ${slide.id + 1}`}
                className={activeSlide === slide.id ? "dot-active" : ""}
                onClick={() => setActiveSlide(slide.id)}
                key={slide.id}
              />
            ))}
          </div>
        </section>

        <SaleBanner />

        <section className="products-grid-custom" aria-label="Recommended products">
          {productFeed.map((product) => (
            <Link href={{ pathname: "/product", query: { id: product.id } }} className="product-card" key={product.id}>
              <div className="product-media">
                <img src={product.image} alt={product.title} />
                <span className="product-rating">
                  5.0 <Star fill="#008c00" stroke="#008c00" size={14} />{" "}
                  <span className="product-rating-count">| {(200000 + (((product.id.charCodeAt(0) + product.id.charCodeAt(product.id.length - 1)) || 1) * 12345) % 100000).toLocaleString('en-IN')}</span>
                </span>
              </div>
              <h2>{product.title}</h2>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  gap: "6px",
                  margin: "6px 0",
                  fontSize: "14px",
                  lineHeight: "20px",
                  fontWeight: "bold",
                }}
              >
                <span
                  className="pdp-off"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    color: "#388e3c",
                    fontSize: "14px",
                    lineHeight: "20px",
                  }}
                >
                  <svg
                    width="12"
                    height="12"
                    fill="none"
                    viewBox="0 0 12 12"
                    style={{ marginRight: "2px" }}
                  >
                    <path
                      d="M6 1.875v8.25M2.625 6.75 6 10.125 9.375 6.75"
                      stroke="#388e3c"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
                  </svg>
                  {(() => {
                    const p = parseInt(product.newPrice.replace(/[^\d]/g, ""), 10);
                    const op = parseInt(product.oldPrice.replace(/[^\d]/g, ""), 10);
                    return op > p && op > 0 ? `${Math.min(Math.round(((op - p) / op) * 100), 99)}%` : "";
                  })()}
                </span>
                <del
                  style={{
                    color: "#878787",
                    fontWeight: "bold",
                    fontSize: "14px",
                    lineHeight: "20px",
                  }}
                >
                  {product.oldPrice}
                </del>
                <strong
                  style={{
                    color: "#212121",
                    fontWeight: "bold",
                    fontSize: "14px",
                    lineHeight: "20px",
                  }}
                >
                  {product.newPrice}
                </strong>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  gap: "6px",
                  color: "rgba(6,31,128,1.00)",
                  fontSize: "12px",
                  marginTop: "4px",
                }}
              >
                <img
                  src="/assets/offers-badge.png"
                  alt="Offers"
                  style={{ height: "16px", width: "38px", flex: "0 0 auto", objectFit: "contain" }}
                />
                <span style={{ whiteSpace: "nowrap" }}>
                  {product.newPrice} with {(() => {
                    const hash = product.id.charCodeAt(0) + product.id.charCodeAt(product.id.length - 1);
                    const count = (hash || 1) % 3 + 1;
                    return `${count} offer${count > 1 ? 's' : ''}`;
                  })()}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  gap: "8px",
                  marginTop: "8px",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "2px", flex: "0 0 auto" }}
                >
                  <Star fill="#008c00" stroke="#008c00" size={12} />
                  <Star fill="#008c00" stroke="#008c00" size={12} />
                  <Star fill="#008c00" stroke="#008c00" size={12} />
                  <Star fill="#008c00" stroke="#008c00" size={12} />
                  <Star fill="#008c00" stroke="#008c00" size={12} />
                </div>
                <img
                  src="/assets/f-assured.png"
                  alt="Flipkart Assured"
                  style={{ height: "16px", width: "60px", flex: "0 0 auto", objectFit: "contain" }}
                />
              </div>
            </Link>
          ))}
        </section>
      </main>

      <nav className="bottom-nav" aria-label="Main navigation">
        <a href="#home" className="bottom-active">
          <Home fill="currentColor" />
          <span>Home</span>
        </a>
        <a href="#categories">
          <Grid2X2 />
          <span>Categories</span>
        </a>
        <a href="#account">
          <UserRound />
          <span>Account</span>
        </a>
        <Link href="/order-summary">
          <ShoppingCart />
          <span>Cart</span>
        </Link>
      </nav>
    </div>
  );
}

export default Index;