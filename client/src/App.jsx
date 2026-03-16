import { useEffect, useRef, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';
const USER_STORAGE_KEY = 'nesthub_user';
const TOKEN_STORAGE_KEY = 'nesthub_token';

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
};

const navigateTo = (event, path, setPathname) => {
  event.preventDefault();
  if (window.location.pathname !== path) {
    window.history.pushState({}, '', path);
  }
  setPathname(path);
};

const navigateWithoutEvent = (path, setPathname) => {
  if (window.location.pathname !== path) {
    window.history.pushState({}, '', path);
  }
  setPathname(path);
};

const getListingIdFromPath = (path) => {
  const match = path.match(/^\/listings\/([^/]+)$/);
  return match ? match[1] : null;
};

const AuthPage = ({ mode, onNavigateHome, onToggleMode, onAuthSuccess }) => {
  const isRegister = mode === 'register';
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'tenant',
    avatar_url: ''
  });
  const [loading, setLoading] = useState(false);
  const [imageProcessing, setImageProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const readFileAsDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result || '');
      reader.onerror = () => reject(new Error('Failed to read image file.'));
      reader.readAsDataURL(file);
    });

  const handleAvatarUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setForm((prev) => ({ ...prev, avatar_url: '' }));
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      event.target.value = '';
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setError('Image must be smaller than 3MB.');
      event.target.value = '';
      return;
    }

    setError('');
    setImageProcessing(true);
    readFileAsDataUrl(file)
      .then((dataUrl) => {
        setForm((prev) => ({ ...prev, avatar_url: dataUrl }));
      })
      .catch(() => {
        setError('Could not process the selected image.');
        event.target.value = '';
      })
      .finally(() => {
        setImageProcessing(false);
      });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (isRegister && imageProcessing) {
      setError('Image is still processing. Please wait a moment and submit again.');
      return;
    }

    setLoading(true);

    const endpoint = isRegister ? `${API_BASE}/auth/register` : `${API_BASE}/auth/login`;
    const payload = isRegister
      ? {
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
          role: form.role,
          avatar_url: form.avatar_url
        }
      : { email: form.email, password: form.password };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const rawBody = await response.text();
      let data = {};
      try {
        data = rawBody ? JSON.parse(rawBody) : {};
      } catch (parseError) {
        throw new Error(
          'Auth API returned non-JSON response. Start backend on http://127.0.0.1:5000 and retry.'
        );
      }

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      localStorage.setItem('nesthub_token', data.token);
      localStorage.setItem('nesthub_user', JSON.stringify(data.user));
      setSuccess(isRegister ? 'Registration successful.' : 'Login successful.');
      setTimeout(() => {
        onAuthSuccess();
      }, 500);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-shell">
        <button className="auth-back" onClick={onNavigateHome}>
          ← Back to Home
        </button>
        <h1 className="auth-title">{isRegister ? 'Create Account' : 'Welcome Back'}</h1>
        <p className="auth-subtitle">
          {isRegister
            ? 'Register as a tenant or owner to start using NestHub.'
            : 'Log in to manage listings, reviews, and ratings.'}
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {isRegister && (
            <>
              <label>
                Full Name
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Phone
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Role
                <select name="role" value={form.role} onChange={handleChange}>
                  <option value="tenant">Tenant</option>
                  <option value="owner">Owner</option>
                </select>
              </label>
              <label>
                Profile Image (optional)
                <input type="file" accept="image/*" onChange={handleAvatarUpload} />
              </label>
              {form.avatar_url ? (
                <div className="upload-preview-block">
                  <img src={form.avatar_url} alt="Profile preview" className="upload-preview-image" />
                </div>
              ) : null}
              {imageProcessing ? <p className="listings-feedback">Processing image...</p> : null}
            </>
          )}

          <label>
            Email
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
          </label>
          <label>
            Password
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </label>

          {error ? <p className="auth-message error">{error}</p> : null}
          {success ? <p className="auth-message success">{success}</p> : null}

          <button type="submit" className="auth-submit" disabled={loading || imageProcessing}>
            {loading ? 'Please wait...' : imageProcessing ? 'Processing...' : isRegister ? 'Register' : 'Login'}
          </button>
        </form>

        <p className="auth-switch">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <a href={isRegister ? '/login' : '/register'} onClick={onToggleMode}>
            {isRegister ? 'Login' : 'Register'}
          </a>
        </p>
      </div>
    </main>
  );
};

const ListingsPage = ({
  listings,
  loading,
  error,
  currentUser,
  deletingListingId,
  reviewDrafts,
  reviewSubmittingId,
  reviewStatus,
  onReviewDraftChange,
  onSubmitReview,
  onDeleteListing,
  onOpenListing,
  onNavigateHome,
  onNavigateAddListing
}) => {
  return (
    <main className="listings-page">
      <div className="listings-shell">
        <div className="listings-topbar">
          <button type="button" className="auth-back" onClick={onNavigateHome}>
            ← Back to Home
          </button>
          <button type="button" className="nav-cta" onClick={onNavigateAddListing}>
            Add Listing
          </button>
        </div>

        <h1 className="auth-title">All Listings</h1>
        <p className="auth-subtitle">Browse all PG, flat, and hostel listings added on NestHub.</p>

        {loading ? <p className="listings-feedback">Loading listings...</p> : null}
        {error ? <p className="auth-message error">{error}</p> : null}

        {!loading && !error && listings.length === 0 ? (
          <p className="listings-feedback">No listings available yet. Be the first one to add.</p>
        ) : null}

        <div className="listings-grid">
          {listings.map((listing) => (
            <article
              key={listing._id || listing.id}
              className="listing-item listing-item-clickable"
              role="button"
              tabIndex={0}
              onClick={() => onOpenListing(listing._id || listing.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onOpenListing(listing._id || listing.id);
                }
              }}
            >
              {listing.image_url ? (
                <img
                  className="listing-image"
                  src={listing.image_url}
                  alt={listing.title}
                  loading="lazy"
                  onError={(event) => {
                    event.currentTarget.style.display = 'none';
                  }}
                />
              ) : null}
              <div className="listing-item-head">
                <span className="listing-type">{listing.type}</span>
                <span className="listing-price">Rs {listing.price}/month</span>
              </div>
              <h3 className="listing-title">{listing.title}</h3>
              <p className="listing-location">
                {listing.locality}, {listing.city}
              </p>
              <p className="listing-description">{listing.description}</p>
              {currentUser?.role === 'tenant' ? (
                <div
                  className="review-box"
                  onClick={(event) => event.stopPropagation()}
                  onKeyDown={(event) => event.stopPropagation()}
                >
                  <textarea
                    className="review-input"
                    rows={3}
                    value={reviewDrafts[listing._id || listing.id] || ''}
                    onChange={(event) =>
                      onReviewDraftChange(listing._id || listing.id, event.target.value)
                    }
                    placeholder="Write your review as a tenant..."
                  />
                  <button
                    type="button"
                    className="review-submit-btn"
                    disabled={reviewSubmittingId === (listing._id || listing.id)}
                    onClick={() => onSubmitReview(listing._id || listing.id)}
                  >
                    {reviewSubmittingId === (listing._id || listing.id)
                      ? 'Submitting...'
                      : 'Submit Review'}
                  </button>
                  {reviewStatus[listing._id || listing.id] ? (
                    <p className="review-status">{reviewStatus[listing._id || listing.id]}</p>
                  ) : null}
                </div>
              ) : null}
              {currentUser?.id && listing?.owner_id?._id === currentUser.id ? (
                <button
                  type="button"
                  className="listing-delete-btn"
                  onClick={(event) => {
                    event.stopPropagation();
                    onDeleteListing(listing._id || listing.id);
                  }}
                  disabled={deletingListingId === (listing._id || listing.id)}
                >
                  {deletingListingId === (listing._id || listing.id) ? 'Deleting...' : 'Delete'}
                </button>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </main>
  );
};

const AddListingPage = ({ currentUser, onNavigateHome, onCreated }) => {
  const imageInputRef = useRef(null);
  const [form, setForm] = useState({
    title: '',
    type: 'PG',
    city: '',
    locality: '',
    price: '',
    description: '',
    image_url: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [imageProcessing, setImageProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const readFileAsDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result || '');
      reader.onerror = () => reject(new Error('Failed to read image file.'));
      reader.readAsDataURL(file);
    });

  const convertImageToJpegDataUrl = async (file) => {
    const originalDataUrl = await readFileAsDataUrl(file);
    if (!file.type.startsWith('image/')) {
      return originalDataUrl;
    }

    try {
      const image = await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Failed to decode image.'));
        img.src = originalDataUrl;
      });

      const maxWidth = 1280;
      const scale = image.width > maxWidth ? maxWidth / image.width : 1;
      const width = Math.round(image.width * scale);
      const height = Math.round(image.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d');
      if (!context) {
        return originalDataUrl;
      }
      context.drawImage(image, 0, 0, width, height);
      return canvas.toDataURL('image/jpeg', 0.86);
    } catch (error) {
      return originalDataUrl;
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setForm((prev) => ({ ...prev, image_url: '' }));
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      event.target.value = '';
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setError('Image must be smaller than 3MB.');
      event.target.value = '';
      return;
    }

    setError('');
    setImageProcessing(true);
    convertImageToJpegDataUrl(file)
      .then((dataUrl) => {
        setForm((prev) => ({ ...prev, image_url: dataUrl }));
      })
      .catch(() => {
        setError('Could not process the selected image.');
        event.target.value = '';
      })
      .finally(() => {
        setImageProcessing(false);
      });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!currentUser?.id) {
      setError('Please login first to add a listing.');
      return;
    }

    if (imageProcessing) {
      setError('Image is still processing. Please wait a moment and submit again.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE}/listings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem(TOKEN_STORAGE_KEY) || ''}`
        },
        body: JSON.stringify({
          owner_id: currentUser.id,
          title: form.title,
          type: form.type,
          city: form.city,
          locality: form.locality,
          price: Number(form.price),
          description: form.description,
          image_url: form.image_url
        })
      });

      const rawBody = await response.text();
      let data = {};
      try {
        data = rawBody ? JSON.parse(rawBody) : {};
      } catch (parseError) {
        throw new Error('Listing API returned non-JSON response.');
      }

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create listing');
      }

      setSuccess('Listing added successfully.');
      setForm({
        title: '',
        type: 'PG',
        city: '',
        locality: '',
        price: '',
        description: '',
        image_url: ''
      });
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }

      setTimeout(() => {
        onCreated();
      }, 400);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-shell">
        <button className="auth-back" onClick={onNavigateHome}>
          ← Back to Home
        </button>
        <h1 className="auth-title">Add Listing</h1>
        <p className="auth-subtitle">Create a new property listing to publish it on NestHub.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Title
            <input type="text" name="title" value={form.title} onChange={handleChange} required />
          </label>
          <label>
            Type
            <select name="type" value={form.type} onChange={handleChange}>
              <option value="PG">PG</option>
              <option value="Flat">Flat</option>
              <option value="Hostel">Hostel</option>
            </select>
          </label>
          <label>
            City
            <input type="text" name="city" value={form.city} onChange={handleChange} required />
          </label>
          <label>
            Locality
            <input type="text" name="locality" value={form.locality} onChange={handleChange} required />
          </label>
          <label>
            Price
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              min={0}
              required
            />
          </label>
          <label>
            Description
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              required
            />
          </label>
          <label>
            Upload Image
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageUpload}
            />
          </label>
          {form.image_url ? (
            <div className="upload-preview-block">
              <img src={form.image_url} alt="Listing preview" className="upload-preview-image" />
            </div>
          ) : null}
          {imageProcessing ? <p className="listings-feedback">Processing image...</p> : null}

          {error ? <p className="auth-message error">{error}</p> : null}
          {success ? <p className="auth-message success">{success}</p> : null}

          <button type="submit" className="auth-submit" disabled={submitting || imageProcessing}>
            {submitting ? 'Saving...' : imageProcessing ? 'Processing...' : 'Create Listing'}
          </button>
        </form>
      </div>
    </main>
  );
};

const ListingDetailPage = ({ listing, loading, error, onNavigateListings, onNavigateHome }) => {
  return (
    <main className="listings-page">
      <div className="listings-shell">
        <div className="listings-topbar">
          <button type="button" className="auth-back" onClick={onNavigateListings}>
            ← Back to Listings
          </button>
          <button type="button" className="nav-cta" onClick={onNavigateHome}>
            Home
          </button>
        </div>

        {loading ? <p className="listings-feedback">Loading post details...</p> : null}
        {error ? <p className="auth-message error">{error}</p> : null}

        {!loading && !error && listing ? (
          <article className="listing-detail-card">
            {listing.image_url ? (
              <img
                className="listing-detail-image"
                src={listing.image_url}
                alt={listing.title}
                loading="lazy"
              />
            ) : null}
            <div className="listing-detail-head">
              <span className="listing-type">{listing.type}</span>
              <span className="listing-price">Rs {listing.price}/month</span>
            </div>
            <h1 className="listing-detail-title">{listing.title}</h1>
            <p className="listing-location">
              {listing.locality}, {listing.city}
            </p>
            <p className="listing-detail-description">{listing.description}</p>

            <div className="listing-meta-grid">
              <div>
                <strong>Owner</strong>
                <p>{listing?.owner_id?.name || 'N/A'}</p>
              </div>
              <div>
                <strong>Contact</strong>
                <p>{listing?.owner_id?.phone || 'N/A'}</p>
              </div>
              <div>
                <strong>Average Rating</strong>
                <p>{listing?.rating_summary?.average_rating || 0} / 10</p>
              </div>
              <div>
                <strong>Total Ratings</strong>
                <p>{listing?.rating_summary?.count || 0}</p>
              </div>
            </div>
          </article>
        ) : null}
      </div>
    </main>
  );
};

function App() {
  const [apiStatus, setApiStatus] = useState('checking');
  const [pathname, setPathname] = useState(window.location.pathname);
  const [currentUser, setCurrentUser] = useState(getStoredUser);
  const [allListings, setAllListings] = useState([]);
  const [listingsLoading, setListingsLoading] = useState(false);
  const [listingsError, setListingsError] = useState('');
  const [deletingListingId, setDeletingListingId] = useState(null);
  const [reviewDrafts, setReviewDrafts] = useState({});
  const [reviewSubmittingId, setReviewSubmittingId] = useState(null);
  const [reviewStatus, setReviewStatus] = useState({});
  const [selectedListing, setSelectedListing] = useState(null);
  const [selectedListingLoading, setSelectedListingLoading] = useState(false);
  const [selectedListingError, setSelectedListingError] = useState('');
  const listingIdFromPath = getListingIdFromPath(pathname);

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

  useEffect(() => {
    const handlePopState = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const fetchListings = async () => {
    setListingsLoading(true);
    setListingsError('');
    try {
      const response = await fetch(`${API_BASE}/listings`);
      const rawBody = await response.text();
      let data = [];
      try {
        data = rawBody ? JSON.parse(rawBody) : [];
      } catch (parseError) {
        throw new Error('Listings API returned non-JSON response.');
      }
      if (!response.ok) {
        throw new Error(data.message || 'Failed to load listings');
      }
      setAllListings(Array.isArray(data) ? data : []);
    } catch (error) {
      setListingsError(error.message);
    } finally {
      setListingsLoading(false);
    }
  };

  const fetchListingById = async (listingId) => {
    setSelectedListingLoading(true);
    setSelectedListingError('');
    try {
      const response = await fetch(`${API_BASE}/listings/${listingId}`);
      const rawBody = await response.text();
      let data = {};
      try {
        data = rawBody ? JSON.parse(rawBody) : {};
      } catch (parseError) {
        throw new Error('Listing details API returned non-JSON response.');
      }
      if (!response.ok) {
        throw new Error(data.message || 'Failed to load listing details');
      }
      setSelectedListing(data);
    } catch (error) {
      setSelectedListing(null);
      setSelectedListingError(error.message);
    } finally {
      setSelectedListingLoading(false);
    }
  };

  useEffect(() => {
    if (pathname === '/listings') {
      fetchListings();
    }
  }, [pathname]);

  useEffect(() => {
    if (listingIdFromPath) {
      fetchListingById(listingIdFromPath);
    }
  }, [listingIdFromPath]);

  useEffect(() => {
    if (pathname === '/listings/new' && !currentUser) {
      navigateWithoutEvent('/login', setPathname);
    }
  }, [pathname, currentUser]);

  const handleAuthSuccess = () => {
    setCurrentUser(getStoredUser());
    window.history.pushState({}, '', '/');
    setPathname('/');
  };

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    setCurrentUser(null);
    if (window.location.pathname !== '/') {
      window.history.pushState({}, '', '/');
      setPathname('/');
    }
  };

  const handleDeleteListing = async (listingId) => {
    const confirmDelete = window.confirm('Delete this listing permanently?');
    if (!confirmDelete) {
      return;
    }

    setListingsError('');
    setDeletingListingId(listingId);
    try {
      const response = await fetch(`${API_BASE}/listings/${listingId}`, {
        method: 'DELETE'
      });
      const rawBody = await response.text();
      let data = {};
      try {
        data = rawBody ? JSON.parse(rawBody) : {};
      } catch (parseError) {
        data = {};
      }
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete listing');
      }
      setAllListings((prev) =>
        prev.filter((listing) => (listing._id || listing.id) !== listingId)
      );
    } catch (error) {
      setListingsError(error.message);
    } finally {
      setDeletingListingId(null);
    }
  };

  const handleReviewDraftChange = (listingId, text) => {
    setReviewDrafts((prev) => ({ ...prev, [listingId]: text }));
  };

  const handleSubmitReview = async (listingId) => {
    const reviewText = (reviewDrafts[listingId] || '').trim();
    if (!reviewText) {
      setReviewStatus((prev) => ({ ...prev, [listingId]: 'Review text is required.' }));
      return;
    }

    setReviewSubmittingId(listingId);
    setReviewStatus((prev) => ({ ...prev, [listingId]: '' }));
    try {
      const response = await fetch(`${API_BASE}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem(TOKEN_STORAGE_KEY) || ''}`
        },
        body: JSON.stringify({
          listing_id: listingId,
          review_text: reviewText
        })
      });

      const rawBody = await response.text();
      let data = {};
      try {
        data = rawBody ? JSON.parse(rawBody) : {};
      } catch (parseError) {
        data = {};
      }
      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit review');
      }

      setReviewDrafts((prev) => ({ ...prev, [listingId]: '' }));
      setReviewStatus((prev) => ({ ...prev, [listingId]: 'Review submitted successfully.' }));
    } catch (error) {
      setReviewStatus((prev) => ({ ...prev, [listingId]: error.message }));
    } finally {
      setReviewSubmittingId(null);
    }
  };

  if (pathname === '/login') {
    return (
      <AuthPage
        mode="login"
        onNavigateHome={(event) => navigateTo(event, '/', setPathname)}
        onToggleMode={(event) => navigateTo(event, '/register', setPathname)}
        onAuthSuccess={handleAuthSuccess}
      />
    );
  }

  if (pathname === '/register') {
    return (
      <AuthPage
        mode="register"
        onNavigateHome={(event) => navigateTo(event, '/', setPathname)}
        onToggleMode={(event) => navigateTo(event, '/login', setPathname)}
        onAuthSuccess={handleAuthSuccess}
      />
    );
  }

  if (pathname === '/listings') {
    return (
      <ListingsPage
        listings={allListings}
        loading={listingsLoading}
        error={listingsError}
        currentUser={currentUser}
        deletingListingId={deletingListingId}
        reviewDrafts={reviewDrafts}
        reviewSubmittingId={reviewSubmittingId}
        reviewStatus={reviewStatus}
        onReviewDraftChange={handleReviewDraftChange}
        onSubmitReview={handleSubmitReview}
        onDeleteListing={handleDeleteListing}
        onOpenListing={(listingId) => navigateWithoutEvent(`/listings/${listingId}`, setPathname)}
        onNavigateHome={(event) => navigateTo(event, '/', setPathname)}
        onNavigateAddListing={() => navigateWithoutEvent('/listings/new', setPathname)}
      />
    );
  }

  if (listingIdFromPath) {
    return (
      <ListingDetailPage
        listing={selectedListing}
        loading={selectedListingLoading}
        error={selectedListingError}
        onNavigateListings={() => navigateWithoutEvent('/listings', setPathname)}
        onNavigateHome={() => navigateWithoutEvent('/', setPathname)}
      />
    );
  }

  if (pathname === '/listings/new') {
    return (
      <AddListingPage
        currentUser={currentUser}
        onNavigateHome={(event) => navigateTo(event, '/', setPathname)}
        onCreated={() => navigateWithoutEvent('/listings', setPathname)}
      />
    );
  }

  return (
    <>

  <nav>
    <div className="nav-logo">Nest<span>Hub</span></div>
    <ul className="nav-links">
      <li><a href="#features">Features</a></li>
      <li><a href="#how">How it Works</a></li>
      <li><a href="#bot">WhatsApp Bot</a></li>
    </ul>
    <div className="nav-auth">
      {currentUser ? (
        <>
          <span className="nav-role">{currentUser.role === 'owner' ? 'Owner' : 'Tenant'}</span>
          <a
            href="/listings/new"
            className="nav-login"
            onClick={(event) => navigateTo(event, '/listings/new', setPathname)}
          >
            Add Listing
          </a>
          <button type="button" className="nav-logout" onClick={handleLogout}>
            Logout
          </button>
        </>
      ) : (
        <>
          <a href="/login" className="nav-login" onClick={(event) => navigateTo(event, '/login', setPathname)}>Login</a>
          <a href="/register" className="nav-cta" onClick={(event) => navigateTo(event, '/register', setPathname)}>Register</a>
        </>
      )}
    </div>
  </nav>
  <div className="api-pill">API: {apiStatus}</div>
  <section className="hero">
    <div className="hero-left">
      <div className="hero-tag">Now live in Indore · Bhopal · Pune</div>
      <h1>Find your room,<br />not just <em>a roof.</em></h1>
      <p className="hero-sub">Verified PGs, flats & hostels — with honest reviews on noise, water, and electricity. No
        surprises, no scams.</p>
      <div className="hero-actions">
        <a href="/listings" className="btn-primary" onClick={(event) => navigateTo(event, '/listings', setPathname)}>Search Rooms</a>
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
        <a
          href="/listings"
          className="room-card card-main room-card-link"
          onClick={(event) => navigateTo(event, '/listings', setPathname)}
        >
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
        </a>
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
      <a href="/listings" className="btn-white" onClick={(event) => navigateTo(event, '/listings', setPathname)}>Search Rooms Now</a>
      <a href="/listings/new" className="btn-outline-white" onClick={(event) => navigateTo(event, '/listings/new', setPathname)}>List Your Property</a>
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
