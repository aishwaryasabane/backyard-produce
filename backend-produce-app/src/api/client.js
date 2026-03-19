import { API_BASE_URL } from './config';

/**
 * Request to the backend. Adds Authorization header if token is provided.
 * For FormData, omit Content-Type so the browser sets multipart boundary.
 */
export async function request(path, options = {}) {
  const { token, ...fetchOptions } = options;
  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;
  const headers = { ...fetchOptions.headers };
  if (!(fetchOptions.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(url, {
    ...fetchOptions,
    headers,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.detail || res.statusText || 'Request failed');
    err.status = res.status;
    err.detail = data.detail;
    throw err;
  }
  return data;
}

export const api = {
  async login(email, password) {
    return request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
  async register({ name, email, password, neighborhood }) {
    return request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, neighborhood: neighborhood || null }),
    });
  },

  async uploadImage(fileUri, token) {
    const formData = new FormData();
    const name = fileUri.split('/').pop() || 'image.jpg';
    const mime = name.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? 'image/jpeg' : 'image/jpeg';
    formData.append('file', { uri: fileUri, name, type: mime });
    return request('/api/upload/image', { method: 'POST', body: formData, token });
  },

  async getListing(id, token) {
    return request(`/api/listings/${id}`, { token });
  },
  async getMyListings(token) {
    return request('/api/listings/me', { token });
  },
  async getAllListings(limit = 50) {
    return request(`/api/listings?limit=${limit}`);
  },
  async getNearbyListings({ lat, lng, radius_km = 50, limit = 50 }) {
    const params = new URLSearchParams({ lat, lng, radius_km, limit });
    return request(`/api/listings/nearby?${params}`);
  },
  async createListing(body, token) {
    return request('/api/listings', { method: 'POST', body: JSON.stringify(body), token });
  },
  async updateListing(id, body, token) {
    return request(`/api/listings/${id}`, { method: 'PUT', body: JSON.stringify(body), token });
  },
  async deleteListing(id, token) {
    const url = `${API_BASE_URL}/api/listings/${id}`;
    const res = await fetch(url, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.detail || res.statusText);
    }
    return null;
  },

  async schedulePickup({ listingId, scheduled_day, scheduled_time }, token) {
    return request('/api/pickups', {
      method: 'POST',
      body: JSON.stringify({ listing_id: listingId, scheduled_day, scheduled_time }),
      token,
    });
  },
  async getMyPickups(token) {
    return request('/api/pickups', { token });
  },

  async addReview({ listingId, rating, text }, token) {
    return request('/api/reviews', {
      method: 'POST',
      body: JSON.stringify({ listing_id: listingId, rating, text: text || null }),
      token,
    });
  },
  async getReviewsForListing(listingId) {
    return request(`/api/reviews?listing_id=${listingId}`);
  },
  async getMyReviews(token) {
    return request('/api/reviews/me', { token });
  },

  async getConversations(token) {
    return request('/api/conversations', { token });
  },
  async createOrGetConversation(listingId, token) {
    return request('/api/conversations', {
      method: 'POST',
      body: JSON.stringify({ listing_id: listingId }),
      token,
    });
  },
  async getMessages(conversationId, token) {
    return request(`/api/conversations/${conversationId}/messages`, { token });
  },
  async sendMessage(conversationId, text, token) {
    return request(`/api/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ text }),
      token,
    });
  },
};
