/**
 * Calculate compatibility score between two users based on their bios
 * Returns a score between 0-100
 */

// Common goal-related keywords and their categories
const KEYWORD_CATEGORIES = {
  fitness: ['workout', 'gym', 'exercise', 'fitness', 'health', 'running', 'yoga', 'weightlifting', 'cardio', 'training', 'athletic'],
  career: ['career', 'professional', 'work', 'business', 'entrepreneur', 'startup', 'job', 'promotion', 'productivity', 'skills'],
  education: ['learning', 'study', 'education', 'reading', 'books', 'course', 'degree', 'knowledge', 'school', 'university'],
  creative: ['creative', 'art', 'music', 'writing', 'design', 'craft', 'painting', 'photography', 'drawing', 'artistic'],
  personal: ['mindfulness', 'meditation', 'mental health', 'therapy', 'self-care', 'growth', 'development', 'habits', 'routine'],
  social: ['social', 'networking', 'friends', 'community', 'volunteer', 'relationship', 'family', 'connection'],
  financial: ['money', 'finance', 'saving', 'investment', 'budget', 'debt', 'financial', 'wealth', 'income'],
  lifestyle: ['lifestyle', 'travel', 'adventure', 'hobbies', 'cooking', 'food', 'organization', 'home', 'garden']
};

/**
 * Extract keywords from bio
 */
function extractKeywords(bio) {
  if (!bio) return [];

  const bioLower = bio.toLowerCase();
  const foundKeywords = [];

  for (const [category, keywords] of Object.entries(KEYWORD_CATEGORIES)) {
    for (const keyword of keywords) {
      if (bioLower.includes(keyword)) {
        foundKeywords.push({ category, keyword });
      }
    }
  }

  return foundKeywords;
}

/**
 * Calculate word overlap score using simple tokenization
 */
function calculateWordOverlap(bio1, bio2) {
  if (!bio1 || !bio2) return 0;

  const words1 = bio1.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const words2 = bio2.toLowerCase().split(/\s+/).filter(w => w.length > 3);

  const set1 = new Set(words1);
  const set2 = new Set(words2);

  let overlap = 0;
  for (const word of set1) {
    if (set2.has(word)) {
      overlap++;
    }
  }

  const union = new Set([...set1, ...set2]);
  return union.size > 0 ? (overlap / union.size) * 100 : 0;
}

/**
 * Calculate category overlap score
 */
function calculateCategoryScore(keywords1, keywords2) {
  const categories1 = new Set(keywords1.map(k => k.category));
  const categories2 = new Set(keywords2.map(k => k.category));

  let matchingCategories = 0;
  for (const cat of categories1) {
    if (categories2.has(cat)) {
      matchingCategories++;
    }
  }

  const totalCategories = new Set([...categories1, ...categories2]).size;
  return totalCategories > 0 ? (matchingCategories / totalCategories) * 100 : 0;
}

/**
 * Calculate similarity score between two users
 */
function calculateCompatibility(user1Bio, user2Bio) {
  if (!user1Bio || !user2Bio) {
    // If bios are empty, return a random moderate score
    return Math.floor(Math.random() * 30) + 35; // 35-65
  }

  const keywords1 = extractKeywords(user1Bio);
  const keywords2 = extractKeywords(user2Bio);

  // Calculate different aspects of compatibility
  const categoryScore = calculateCategoryScore(keywords1, keywords2);
  const wordOverlap = calculateWordOverlap(user1Bio, user2Bio);

  // Weighted combination
  const finalScore = (categoryScore * 0.6) + (wordOverlap * 0.4);

  // Add small random variation to avoid exact ties
  const randomVariation = (Math.random() - 0.5) * 5;

  return Math.max(0, Math.min(100, Math.round(finalScore + randomVariation)));
}

/**
 * Find top N compatible users for a given user
 */
function findTopMatches(currentUser, allUsers, topN = 3) {
  const availableUsers = allUsers.filter(u =>
    u.id !== currentUser.id &&
    !u.partnerId
  );

  const scoredUsers = availableUsers.map(user => ({
    ...user,
    compatibilityScore: calculateCompatibility(currentUser.bio, user.bio)
  }));

  // Sort by compatibility score (descending)
  scoredUsers.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

  return scoredUsers.slice(0, topN);
}

module.exports = {
  calculateCompatibility,
  findTopMatches,
  extractKeywords
};
