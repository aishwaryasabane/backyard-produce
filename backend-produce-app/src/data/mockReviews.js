// Mock reviews for local development and fallback when API returns empty

/** For ReviewsScreen (reviews for a listing) - generic listing reviews */
export const mockReviewsForListing = [
  { id: 'r1', author: 'Alex M.', rating: 5, text: 'Super fresh oranges, and Maria was so friendly. Will definitely get more!', date: '2 weeks ago', created_at: new Date().toISOString() },
  { id: 'r2', author: 'Jamie K.', rating: 5, text: 'Great experience. Easy pickup, produce as described.', date: '1 month ago', created_at: new Date().toISOString() },
  { id: 'r3', author: 'Sam T.', rating: 4, text: 'Good quality. A bit of a wait at pickup but worth it.', date: '1 month ago', created_at: new Date().toISOString() },
];

/** For MyReviewsScreen (reviews you received as seller) */
export const mockReviewsReceived = [
  { id: 'm1', author: 'Alex M.', rating: 5, text: 'Great swap! Fresh herbs and easy to coordinate.', date: '1 week ago', listing_title: 'Basil & Mint', created_at: new Date().toISOString() },
  { id: 'm2', author: 'Jamie K.', rating: 5, text: 'Friendly and on time. Would trade again.', date: '2 weeks ago', listing_title: 'Cherry Tomatoes', created_at: new Date().toISOString() },
  { id: 'm3', author: 'Sam T.', rating: 4, text: 'Good produce. Smooth pickup.', date: '3 weeks ago', listing_title: 'Honeycrisp Apples', created_at: new Date().toISOString() },
];
