import React from 'react';
import { Icon } from './ui.jsx';
import { cap, categories, conditions } from '../data.js';

export const defaultFilters = {query: '', category: 'all', condition: 'all', status: 'all', maxPrice: '', scope: 'all'};
export const sortOptions = [['newest', 'Newest first'], ['price-asc', 'Price: low to high'], ['price-desc', 'Price: high to low']];

export function hasActiveFilters(f) {
  return f.query.trim() !== '' || f.category !== 'all' || f.condition !== 'all' || f.status !== 'all' || f.maxPrice !== '';
}

export default function Filters({filters, setFilter, sort, setSort, counts, onClear}) {
  return <div className="filters">
    <div className="chip-row" role="group" aria-label="Filter by category">
      {['all', ...categories].map(c => <button type="button" key={c} className={`chip${filters.category === c ? ' on' : ''}`} aria-pressed={filters.category === c} onClick={() => setFilter('category', c)}>
        {c === 'all' ? 'All categories' : cap(c)}<span className="chip-count">{counts[c] || 0}</span>
      </button>)}
    </div>
    <div className="filter-bar">
      <label className="control">
        <span>Condition</span>
        <select value={filters.condition} onChange={e => setFilter('condition', e.target.value)}>
          <option value="all">Any condition</option>
          {conditions.map(c => <option key={c} value={c}>{cap(c)}</option>)}
        </select>
      </label>
      <label className="control">
        <span>Status</span>
        <select value={filters.status} onChange={e => setFilter('status', e.target.value)}>
          <option value="all">All listings</option>
          <option value="active">Available only</option>
          <option value="sold">Sold only</option>
        </select>
      </label>
      <label className="control">
        <span>Max price (EGP)</span>
        <input type="number" min="0" step="10" inputMode="numeric" placeholder="No limit" value={filters.maxPrice} onChange={e => setFilter('maxPrice', e.target.value)} />
      </label>
      <label className="control">
        <span>Sort by</span>
        <select value={sort} onChange={e => setSort(e.target.value)}>
          {sortOptions.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
        </select>
      </label>
      {hasActiveFilters(filters) && <button type="button" className="btn btn-ghost btn-sm clear-btn" onClick={onClear}><Icon name="close" size={15} />Clear filters</button>}
    </div>
  </div>;
}
