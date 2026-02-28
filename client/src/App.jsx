import { useEffect, useState } from 'react';

function App() {
  const [apiStatus, setApiStatus] = useState('checking');

  useEffect(() => {
    const checkApi = async () => {
      try {
        const response = await fetch('/api/health');
        if (!response.ok) {
          throw new Error('API unavailable');
        }
        setApiStatus('connected');
      } catch (error) {
        setApiStatus('offline');
      }
    };

    checkApi();
  }, []);

  return (
    <>

  <nav>
    <div className="nav-logo">Nest<span>Hub</span></div>
    <ul className="nav-links">
      <li><a href="#features">Features</a></li>
      <li><a href="#how">How it Works</a></li>
      <li><a href="#bot">WhatsApp Bot</a></li>
    </ul>
    <a href="#" className="nav-cta">List Your Property</a>
  </nav>
  <div className="api-pill">API: {apiStatus}</div>
  <section className="hero">
    <div className="hero-left">
      <div className="hero-tag">Now live in Indore · Bhopal · Pune</div>
      <h1>Find your room,<br />not just <em>a roof.</em></h1>
      <p className="hero-sub">Verified PGs, flats & hostels — with honest reviews on noise, water, and electricity. No
        surprises, no scams.</p>
      <div className="hero-actions">
        <a href="#" className="btn-primary">Search Rooms</a>
        <a href="#how" className="btn-secondary">How it Works</a>
      </div>
      <div className="hero-stats">
        <div>
          <div className="stat-num">2,400+</div>
          <div className="stat-label">Verified Listings</div>
        </div>
        <div>
          <div className="stat-num">98%</div>
          <div className="stat-label">Owner ID Verified</div>
        </div>
        <div>
          <div className="stat-num">4.7★</div>
          <div className="stat-label">Avg. Tenant Rating</div>
        </div>
      </div>
    </div>

    <div className="hero-right">
      <div className="card-stack">
        <div className="room-card card-bg2">
          <div className="card-img">🏠</div>
        </div>
        <div className="room-card card-bg1">
          <div className="card-img">🏢</div>
        </div>
        <div className="room-card card-main">
          <div className="card-img">🏡</div>
          <div className="card-body">
            <div className="card-type">PG — Vijay Nagar</div>
            <div className="card-title">Sunrise PG for Ladies</div>
            <div className="card-location">📍 Near Prestige College, Indore</div>
            <div className="card-ratings">
              <div className="rating-pill">🔊 Low Noise</div>
              <div className="rating-pill">💧 24hr Water</div>
              <div className="rating-pill">⚡ Stable Power</div>
            </div>
            <div className="card-footer">
              <div className="price">₹6,500 <span>/month</span></div>
              <div className="verified-badge">✓ Verified</div>
            </div>
          </div>
        </div>
      </div>
      <div className="whatsapp-float">📱 Ask via WhatsApp</div>
    </div>
  </section>
  <div className="problem-strip">
    <div className="problem-label">The Problem</div>
    <div className="problems">
      <div className="problem-item">
        <span className="problem-icon">😤</span>
        <div className="problem-text"><strong>Fake listings</strong><br />unverified owners</div>
      </div>
      <div className="problem-item">
        <span className="problem-icon">💸</span>
        <div className="problem-text"><strong>Hidden costs</strong><br />after moving in</div>
      </div>
      <div className="problem-item">
        <span className="problem-icon">🚿</span>
        <div className="problem-text"><strong>Water cuts</strong><br />daily, unannounced</div>
      </div>
      <div className="problem-item">
        <span className="problem-icon">🔇</span>
        <div className="problem-text"><strong>No honest</strong><br />reviews from tenants</div>
      </div>
    </div>
  </div>
  <section className="features" id="features">
    <div className="section-tag">What Makes Us Different</div>
    <h2 className="section-title">Built for students & working professionals.</h2>
    <div className="features-grid">
      <div className="feature-card">
        <div className="feature-icon">🪪</div>
        <div className="feature-title">Verified Owner IDs</div>
        <div className="feature-desc">Every landlord is verified with Aadhaar or government ID before listing. You know
          exactly who you're renting from — no ghosts, no middlemen.</div>
      </div>
      <div className="feature-card sage">
        <div className="feature-icon">⭐</div>
        <div className="feature-title">Honest Tenant Reviews</div>
        <div className="feature-desc">Only verified past tenants can leave reviews. No anonymous trolls, no paid
          testimonials. Real experiences from people who lived there.</div>
      </div>
      <div className="feature-card gold">
        <div className="feature-icon">📊</div>
        <div className="feature-title">Noise · Water · Electricity Ratings</div>
        <div className="feature-desc">India's first utility rating system for rentals. Know if there are daily power cuts or
          noisy neighbors before signing the agreement.</div>
      </div>
      <div className="feature-card">
        <div className="feature-icon">📱</div>
        <div className="feature-title">WhatsApp Bot Listings</div>
        <div className="feature-desc">Landlords can list rooms directly via WhatsApp in minutes. No app required, no complex
          forms. Just message and it's live.</div>
      </div>
      <div className="feature-card sage">
        <div className="feature-icon">🗺️</div>
        <div className="feature-title">Hyperlocal Search</div>
        <div className="feature-desc">Filter by locality, college proximity, or workplace. Find rooms that match your
          commute and lifestyle, not just your budget.</div>
      </div>
      <div className="feature-card gold">
        <div className="feature-icon">📝</div>
        <div className="feature-title">Digital Agreement</div>
        <div className="feature-desc">Generate and sign rental agreements digitally on the platform. Timestamped, legally
          valid, and stored securely for both parties.</div>
      </div>
    </div>
  </section>
  <section className="rating-section">
    <div>
      <div className="section-tag">Rating System</div>
      <h2 className="section-title" style={{ color: "var(--cream)" }}>Know before you go.</h2>
      <p>We rate every listing on the three things that actually affect daily life — and that no landlord will tell you
        upfront.</p>
      <div className="rating-bars">
        <div className="rating-row">
          <div className="rating-name">🔊 Noise</div>
          <div className="bar-track">
            <div className="bar-fill bar-noise" style={{ width: "82%" }}></div>
          </div>
          <div className="rating-score">8.2</div>
        </div>
        <div className="rating-row">
          <div className="rating-name">💧 Water</div>
          <div className="bar-track">
            <div className="bar-fill bar-water" style={{ width: "91%" }}></div>
          </div>
          <div className="rating-score">9.1</div>
        </div>
        <div className="rating-row">
          <div className="rating-name">⚡ Power</div>
          <div className="bar-track">
            <div className="bar-fill bar-elec" style={{ width: "75%" }}></div>
          </div>
          <div className="rating-score">7.5</div>
        </div>
      </div>
    </div>
    <div className="rating-mockup">
      <div className="mockup-header">
        <div className="mockup-title">Top Rated in Vijay Nagar</div>
        <div style={{ fontSize: ".75rem", color: "rgba(245,240,232,.5)" }}>Indore</div>
      </div>
      <div className="mockup-rooms">
        <div className="mockup-room">
          <div className="mockup-room-icon">🏡</div>
          <div className="mockup-room-info">
            <div className="mockup-room-name">Sunrise PG Ladies</div>
            <div className="mockup-room-loc">⭐ 4.9 · 32 reviews</div>
          </div>
          <div className="mockup-room-price">₹6,500</div>
        </div>
        <div className="mockup-room">
          <div className="mockup-room-icon">🏢</div>
          <div className="mockup-room-info">
            <div className="mockup-room-name">Krishna Residency</div>
            <div className="mockup-room-loc">⭐ 4.7 · 18 reviews</div>
          </div>
          <div className="mockup-room-price">₹8,000</div>
        </div>
        <div className="mockup-room">
          <div className="mockup-room-icon">🏠</div>
          <div className="mockup-room-info">
            <div className="mockup-room-name">Anand Flats 2BHK</div>
            <div className="mockup-room-loc">⭐ 4.6 · 12 reviews</div>
          </div>
          <div className="mockup-room-price">₹12,000</div>
        </div>
      </div>
    </div>
  </section>
  <section className="how" id="how">
    <div className="section-tag">Simple Process</div>
    <h2 className="section-title">Room hunting shouldn't be a full-time job.</h2>
    <div className="steps">
      <div className="step">
        <div className="step-num">01</div>
        <div className="step-icon">🔍</div>
        <div className="step-title">Search your locality</div>
        <div className="step-desc">Enter your college, office, or area and filter by budget, room type, and amenities.</div>
      </div>
      <div className="step">
        <div className="step-num">02</div>
        <div className="step-icon">📊</div>
        <div className="step-title">Check the ratings</div>
        <div className="step-desc">Read noise, water, and electricity scores alongside tenant reviews before shortlisting.
        </div>
      </div>
      <div className="step">
        <div className="step-num">03</div>
        <div className="step-icon">📱</div>
        <div className="step-title">Contact via WhatsApp</div>
        <div className="step-desc">One tap to chat with the verified owner directly — no brokers, no commission.</div>
      </div>
      <div className="step">
        <div className="step-num">04</div>
        <div className="step-icon">✍️</div>
        <div className="step-title">Sign & Move in</div>
        <div className="step-desc">Generate a digital agreement on the platform and move in with full peace of mind.</div>
      </div>
    </div>
  </section>
  <section className="bot-section" id="bot">
    <div className="chat-mockup">
      <div className="chat-header">
        <div className="chat-avatar">🏠</div>
        <div>
          <div className="chat-name">NestHub Bot</div>
          <div className="chat-status">● Online</div>
        </div>
      </div>
      <div className="message">
        <div className="msg-bot">👋 Hi! I'm the NestHub listing bot. Type <strong>LIST</strong> to add your room, or
          <strong>SEARCH</strong> to find one.
        </div>
        <div className="msg-time">10:30 AM</div>
      </div>
      <div className="message" style={{ marginLeft: "auto", textAlign: "right" }}>
        <div className="msg-user">SEARCH Vijay Nagar under 7000</div>
        <div className="msg-time">10:31 AM</div>
      </div>
      <div className="message">
        <div className="msg-bot">✅ Found <strong>6 verified rooms</strong> in Vijay Nagar under ₹7,000. Sending top 3 now...
        </div>
        <div className="msg-time">10:31 AM</div>
      </div>
      <div className="message">
        <div className="msg-bot">🏡 <strong>Sunrise PG Ladies</strong><br />₹6,500/mo · 🔊8.2 💧9.1 ⚡7.5<br />📍 Near Prestige
          College<br /><em>Reply 1 to contact owner</em></div>
        <div className="msg-time">10:31 AM</div>
      </div>
      <div className="message" style={{ marginLeft: "auto", textAlign: "right" }}>
        <div className="msg-user">1</div>
        <div className="msg-time">10:32 AM</div>
      </div>
      <div className="message">
        <div className="msg-bot">Connecting you to <strong>Ramesh Kumar</strong> (✓ ID Verified)... 📲</div>
        <div className="msg-time">10:32 AM</div>
      </div>
    </div>

    <div>
      <div className="section-tag">WhatsApp Bot</div>
      <h2 className="section-title">Find a room on the app you already use.</h2>
      <p style={{ color: "var(--muted)", lineHeight: 1.7, marginBottom: "2rem" }}>
        No new apps to download. Our WhatsApp bot lets both landlords and tenants manage everything through simple
        messages — search, list, schedule visits, and even receive rent reminders.
      </p>
      <a href="#" className="btn-primary" style={{ display: "inline-block" }}>Try on WhatsApp →</a>
    </div>
  </section>
  <section className="cta">
    <h2 className="cta-title">Your next home is one search away.</h2>
    <p>Join thousands of students and workers who found safe, affordable rooms without the headache.</p>
    <div className="cta-buttons">
      <a href="#" className="btn-white">Search Rooms Now</a>
      <a href="#" className="btn-outline-white">List Your Property</a>
    </div>
  </section>
  <footer>
    <div className="logo">NestHub</div>
    <p>© 2025 NestHub Technologies · Made with ❤️ for Indian students & workers · Indore · Bhopal · Pune</p>
  </footer>
    </>
  );
}

export default App;
