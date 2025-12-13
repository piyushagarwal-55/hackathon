export type CategoryId = 'crypto' | 'politics' | 'sports' | 'tech' | 'entertainment' | 'other';

export interface Category {
  id: CategoryId;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
}

export const CATEGORIES: Record<CategoryId, Category> = {
  crypto: {
    id: 'crypto',
    name: 'Crypto',
    icon: '₿',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    description: 'Cryptocurrency and blockchain markets',
  },
  politics: {
    id: 'politics',
    name: 'Politics',
    icon: '🏛️',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    description: 'Political events and elections',
  },
  sports: {
    id: 'sports',
    name: 'Sports',
    icon: '⚽',
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    description: 'Sports games and tournaments',
  },
  tech: {
    id: 'tech',
    name: 'Tech',
    icon: '💻',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    description: 'Technology and innovation',
  },
  entertainment: {
    id: 'entertainment',
    name: 'Entertainment',
    icon: '🎬',
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/30',
    description: 'Movies, TV, and pop culture',
  },
  other: {
    id: 'other',
    name: 'Other',
    icon: '🎯',
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/30',
    description: 'General predictions',
  },
};

export const CATEGORY_LIST: Category[] = Object.values(CATEGORIES);

export function getCategoryById(id: string): Category {
  return CATEGORIES[id as CategoryId] || CATEGORIES.other;
}

export function getCategoryFromQuestion(question: string): CategoryId {
  const lowerQuestion = question.toLowerCase();
  
  // Keywords for each category
  if (lowerQuestion.match(/crypto|bitcoin|ethereum|btc|eth|blockchain|defi|nft|token|coin/)) {
    return 'crypto';
  }
  if (lowerQuestion.match(/election|president|congress|senate|vote|political|government|policy/)) {
    return 'politics';
  }
  if (lowerQuestion.match(/game|match|championship|tournament|league|team|player|sport|soccer|football|basketball|baseball/)) {
    return 'sports';
  }
  if (lowerQuestion.match(/tech|technology|ai|software|app|apple|google|microsoft|meta|twitter|launch|release/)) {
    return 'tech';
  }
  if (lowerQuestion.match(/movie|film|tv|show|actor|actress|award|oscar|emmy|music|album|concert/)) {
    return 'entertainment';
  }
  
  return 'other';
}

