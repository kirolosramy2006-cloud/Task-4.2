import React, { useEffect, useMemo, useRef, useState } from 'react';
import { categoryEmoji, currentUser, emptyForm, formatPrice, isMine, loadItems, saveItems, seed } from './data.js';
import { Icon, Toast } from './components/ui.jsx';
import Filters, { defaultFilters, hasActiveFilters } from './components/Filters.jsx';
import ListingCard from './components/ListingCard.jsx';
import ListingDetail from './components/ListingDetail.jsx';
import ListingForm from './components/ListingForm.jsx';

function matches(item, f, {ignoreCategory = false} = {}) {
  const q = f.query.trim().toLowerCase();
  const max = f.maxPrice === '' ? Infinity : Number(f.maxPrice);
  return (f.scope === 'all' || isMine(item))
    && (!q || `${item.title} ${item.description} ${item.category}`.toLowerCase().includes(q))
    && (ignoreCategory || f.category === 'all' || item.category === f.category)
    && (f.condition === 'all' || item.condition === f.condition)
    && (f.status === 'all' || item.status === f.status)
    && (!Number.isFinite(max) || item.price <= max);
}

export default function App() {
  const [items, setItems] = useState(loadItems);
  const [filters, setFilters] = useState(defaultFilters);
  const [sort, setSort] = useState('newest');
  const [selected, setSelected] = useState(null);
  const [editor, setEditor] = useState(null); // null or {id, form, initial}
  const [toast, setToast] = useState(null);
  const listingsRef = useRef(null);

  useEffect(() => saveItems(items), [items]);

  const setFilter = (key, value) => setFilters(f => ({...f, [key]: value}));
  const notify = (message, extra = {}) => setToast({id: Date.now(), message, ...extra});
  const scrollToListings = () => listingsRef.current?.scrollIntoView({behavior: 'smooth', block: 'start'});

  const results = useMemo(() => {
    const order = new Map(items.map((x, i) => [x.id, i])); // array order = listing order (new items are prepended)
    const list = items.filter(x => matches(x, filters));
    const byPrice = sort === 'price-asc' ? (a, b) => a.price - b.price : sort === 'price-desc' ? (a, b) => b.price - a.price : null;
    // Available items always come before sold ones, so the cheapest *buyable* item is at the top.
    return list.sort((a, b) => (a.status === 'sold') - (b.status === 'sold') || (byPrice ? byPrice(a, b) : 0) || order.get(a.id) - order.get(b.id));
  }, [items, filters, sort]);

  const counts = useMemo(() => {
    const c = {all: 0};
    items.filter(x => matches(x, filters, {ignoreCategory: true})).forEach(x => { c.all++; c[x.category] = (c[x.category] || 0) + 1; });
    return c;
  }, [items, filters]);

  const available = results.filter(x => x.status === 'active');
  const lowestId = available.length > 1 ? available.reduce((a, b) => (b.price < a.price ? b : a)).id : null;
  const allActive = items.filter(x => x.status === 'active');
  const cheapest = allActive.length ? Math.min(...allActive.map(x => x.price)) : null;
  const mine = items.filter(isMine);
  const scopeMine = filters.scope === 'mine';

  function showScope(scope) { setFilters(f => ({...f, scope})); scrollToListings(); }

  function startEdit(item) {
    if (item && !isMine(item)) return; // only the owner may edit
    const form = item
      ? {title: item.title, price: String(item.price), category: item.category, condition: item.condition, description: item.description || '', pickup: item.pickup || '', status: item.status}
      : {...emptyForm};
    setSelected(null);
    setEditor({id: item?.id || null, form, initial: form});
  }

  function closeEditor() {
    if (JSON.stringify(editor.form) !== JSON.stringify(editor.initial) && !window.confirm('Discard your unsaved changes?')) return;
    setEditor(null);
  }

  function submit() {
    const f = editor.form;
    const original = editor.id ? items.find(x => x.id === editor.id) : null;
    if (original && !isMine(original)) return;
    const next = {...f, title: f.title.trim(), price: Number(f.price), description: f.description.trim(), pickup: f.pickup.trim(),
      photos: original?.photos || [], emoji: original?.emoji || categoryEmoji[f.category] || '📦',
      owner: 'you', seller: currentUser.name, sellerEmail: currentUser.email};
    if (original) {
      setItems(list => list.map(x => x.id === original.id ? {...x, ...next} : x));
      notify(`Changes to “${next.title}” saved.`);
    } else {
      const id = `m-${Date.now()}`;
      setItems(list => [{...next, id, status: 'active', createdAt: new Date().toISOString()}, ...list]); // new listings always start active
      setFilters({...defaultFilters, scope: filters.scope});
      setSort('newest');
      notify(`“${next.title}” is now listed for ${formatPrice(next.price)}.`, {action: {label: 'View', run: () => setSelected(id)}});
      setTimeout(scrollToListings, 50);
    }
    setEditor(null);
  }

  function toggleStatus(item) {
    if (!isMine(item)) return; // status changes are owner-only
    const previous = item.status;
    const status = previous === 'sold' ? 'active' : 'sold';
    setItems(list => list.map(x => x.id === item.id ? {...x, status} : x));
    notify(status === 'sold' ? `“${item.title}” marked as sold.` : `“${item.title}” is available again.`,
      {action: {label: 'Undo', run: () => setItems(list => list.map(x => x.id === item.id ? {...x, status: previous} : x))}});
  }

  function reset() {
    if (!window.confirm('Reset the demo? This removes your changes and restores the original example listings.')) return;
    setItems(seed); setSelected(null); setEditor(null); setFilters(defaultFilters); setSort('newest');
    notify('Example listings restored.', {tone: 'info'});
  }

  const selectedItem = selected && items.find(x => x.id === selected);

  return <div className="app">
    <a className="skip-link" href="#listings">Skip to listings</a>
    <header className="site-header">
      <div className="container header-inner">
        <button type="button" className="brand" onClick={() => { setFilters(defaultFilters); window.scrollTo({top: 0, behavior: 'smooth'}); }} aria-label="Campus Marketplace home">
          <span className="brand-mark" aria-hidden="true"><Icon name="tag" size={18} /></span>
          <span>Campus<span className="brand-light">Marketplace</span></span>
        </button>
        <nav className="main-nav" aria-label="Main">
          <button type="button" className={!scopeMine ? 'active' : ''} aria-current={!scopeMine ? 'page' : undefined} onClick={() => showScope('all')}>Browse</button>
          <button type="button" className={scopeMine ? 'active' : ''} aria-current={scopeMine ? 'page' : undefined} onClick={() => showScope('mine')}>My listings<span className="nav-count">{mine.length}</span></button>
        </nav>
        <div className="header-actions">
          <span className="avatar" title={`Signed in as ${currentUser.name} (${currentUser.email})`} aria-label={`Signed in as ${currentUser.name}`}>Y</span>
          <button type="button" className="btn btn-primary" onClick={() => startEdit(null)}><Icon name="plus" size={18} /><span>Sell an item</span></button>
        </div>
      </div>
    </header>

    <main>
      <section className="hero">
        <div className="container hero-inner">
          <p className="eyebrow">Your campus second-hand market</p>
          <h1>Find great deals around campus.</h1>
          <p className="hero-sub">Buy, sell, and discover affordable second-hand items from your campus community.</p>
          <form className="hero-search" role="search" onSubmit={e => { e.preventDefault(); scrollToListings(); }}>
            <Icon name="search" size={20} />
            <label htmlFor="search" className="sr-only">Search listings</label>
            <input id="search" type="search" placeholder="Search items, e.g. lamp or calculus" value={filters.query} onChange={e => setFilter('query', e.target.value)} />
            <button type="submit" className="btn btn-primary">Search</button>
          </form>
          <ul className="hero-stats">
            <li><strong>{allActive.length}</strong> items available</li>
            {cheapest !== null && <li>Prices from <strong>{formatPrice(cheapest)}</strong></li>}
            <li>All prices in EGP</li>
          </ul>
        </div>
      </section>

      <section className="container listings" id="listings" ref={listingsRef} aria-labelledby="listings-title" tabIndex={-1}>
        <div className="listings-head">
          <div>
            <h2 id="listings-title">{scopeMine ? 'Your listings' : 'Browse listings'}</h2>
            <p className="listings-summary" aria-live="polite">
              {results.length} {results.length === 1 ? 'listing' : 'listings'}
              {results.length > 0 && <> · {available.length} available{available.length > 0 && <> · from {formatPrice(Math.min(...available.map(x => x.price)))}</>}</>}
              {filters.query.trim() && <> for “{filters.query.trim()}”</>}
            </p>
          </div>
          <div className="segmented scope-toggle" role="group" aria-label="Which listings to show">
            <button type="button" className={!scopeMine ? 'on' : ''} aria-pressed={!scopeMine} onClick={() => setFilter('scope', 'all')}>All listings</button>
            <button type="button" className={scopeMine ? 'on' : ''} aria-pressed={scopeMine} onClick={() => setFilter('scope', 'mine')}>My listings ({mine.length})</button>
          </div>
        </div>

        <Filters filters={filters} setFilter={setFilter} sort={sort} setSort={setSort} counts={counts}
          onClear={() => setFilters(f => ({...defaultFilters, scope: f.scope}))} />

        {results.length > 0
          ? <div className="grid">
            {results.map(item => <ListingCard key={item.id} item={item} lowest={item.id === lowestId} onOpen={setSelected} onEdit={startEdit} onToggleStatus={toggleStatus} />)}
          </div>
          : <div className="empty-state">
            <span className="empty-icon" aria-hidden="true"><Icon name={scopeMine && !mine.length ? 'tag' : 'search'} size={28} /></span>
            {scopeMine && !mine.length
              ? <><h3>You have no listings yet</h3><p>Sell something you no longer need. It only takes a minute.</p>
                <button type="button" className="btn btn-primary" onClick={() => startEdit(null)}><Icon name="plus" size={18} />Sell an item</button></>
              : <><h3>No listings match your search</h3><p>Try a different keyword, a higher max price, or fewer filters.</p>
                {hasActiveFilters(filters) && <button type="button" className="btn btn-secondary" onClick={() => setFilters(f => ({...defaultFilters, scope: f.scope}))}>Clear all filters</button>}</>}
          </div>}
      </section>
    </main>

    <footer className="site-footer">
      <div className="container footer-inner">
        <div>
          <strong>Campus Marketplace</strong>
          <p>From students, for students. Demo data is stored only in this browser.</p>
        </div>
        <button type="button" className="btn btn-ghost btn-sm" onClick={reset}><Icon name="refresh" size={16} />Reset demo</button>
      </div>
    </footer>

    {selectedItem && <ListingDetail key={selectedItem.id} item={selectedItem} onClose={() => setSelected(null)} onEdit={startEdit} onToggleStatus={toggleStatus} />}
    {editor && <ListingForm editor={editor} onClose={closeEditor} onSubmit={submit}
      onChange={(key, value) => setEditor(s => ({...s, form: {...s.form, [key]: value}}))} />}
    <Toast toast={toast} onDismiss={() => setToast(null)} />
  </div>;
}
