import React from 'react';
import Icon from './Icons.jsx';
import { categories, conditions, cap } from '../data.js';

const statuses = [['all', 'All'], ['active', 'Available'], ['sold', 'Sold']];

export default function FilterBar({filters, setFilter, activeCount, onClear}){
  return (
    <div className="filters" role="search" aria-label="Filter listings">
      <div className="chip-row" role="group" aria-label="Category">
        {['all', ...categories].map(c => (
          <button key={c} type="button" className={`chip ${filters.category === c ? 'on' : ''}`} aria-pressed={filters.category === c}
            onClick={() => setFilter('category', c)}>{c === 'all' ? 'All categories' : cap(c)}</button>
        ))}
      </div>
      <div className="filter-controls">
        <label className="field-inline">
          <span>Condition</span>
          <select className="select" value={filters.condition} onChange={e => setFilter('condition', e.target.value)}>
            <option value="all">Any condition</option>
            {conditions.map(c => <option key={c} value={c}>{cap(c)}</option>)}
          </select>
        </label>
        <div className="field-inline">
          <span id="status-label">Status</span>
          <div className="segmented" role="group" aria-labelledby="status-label">
            {statuses.map(([value, text]) => (
              <button key={value} type="button" className={filters.status === value ? 'on' : ''} aria-pressed={filters.status === value}
                onClick={() => setFilter('status', value)}>{text}</button>
            ))}
          </div>
        </div>
        <label className="field-inline">
          <span>Sort by</span>
          <select className="select" value={filters.sort} onChange={e => setFilter('sort', e.target.value)}>
            <option value="featured">Recommended</option>
            <option value="newest">Newest first</option>
            <option value="low">Price: low to high</option>
            <option value="high">Price: high to low</option>
          </select>
        </label>
        {activeCount > 0 && (
          <button type="button" className="btn btn-link clear-filters" onClick={onClear}>
            <Icon name="x" size={15} /> Clear {activeCount} {activeCount === 1 ? 'filter' : 'filters'}
          </button>
        )}
      </div>
    </div>
  );
}
