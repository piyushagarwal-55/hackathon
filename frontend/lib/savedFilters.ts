import { CategoryId } from './categories';

export interface SavedFilter {
  id: string;
  name: string;
  searchQuery: string;
  filterStatus: 'all' | 'active' | 'ended';
  filterPopularity: 'all' | 'popular' | 'new';
  filterCategory: CategoryId | 'all';
  sortBy: 'recent' | 'votes' | 'ending';
  createdAt: number;
}

const SAVED_FILTERS_KEY = 'repvote_saved_filters';

export function getSavedFilters(): SavedFilter[] {
  try {
    const stored = localStorage.getItem(SAVED_FILTERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveFilter(filter: Omit<SavedFilter, 'id' | 'createdAt'>): SavedFilter {
  const newFilter: SavedFilter = {
    ...filter,
    id: `filter_${Date.now()}_${Math.random()}`,
    createdAt: Date.now(),
  };

  const filters = getSavedFilters();
  filters.push(newFilter);
  localStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify(filters));

  return newFilter;
}

export function deleteFilter(filterId: string) {
  const filters = getSavedFilters();
  const updated = filters.filter((f) => f.id !== filterId);
  localStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify(updated));
}

export function updateFilter(filterId: string, updates: Partial<SavedFilter>) {
  const filters = getSavedFilters();
  const updated = filters.map((f) =>
    f.id === filterId ? { ...f, ...updates } : f
  );
  localStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify(updated));
}

