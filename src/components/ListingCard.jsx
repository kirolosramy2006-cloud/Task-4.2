import React from 'react';
import { Badge, Icon, ListingImage, StatusBadge } from './ui.jsx';
import { cap, contactHref, formatPrice, isMine } from '../data.js';

export default function ListingCard({item, lowest, onOpen, onEdit, onToggleStatus}) {
  const mine = isMine(item);
  const sold = item.status === 'sold';
  return <article className={`card${sold ? ' is-sold' : ''}${mine ? ' is-mine' : ''}`}>
    {/* Image duplicates the title button for mouse users; hidden from keyboard and screen readers. */}
    <button type="button" className="card-media" tabIndex={-1} aria-hidden="true" onClick={() => onOpen(item.id)}>
      <ListingImage src={item.photos?.[0]} alt="" emoji={item.emoji} className="card-img" />
      <span className="card-media-badges">
        <StatusBadge status={item.status} />
        {lowest && <Badge tone="deal"><Icon name="tag" size={13} />Lowest price</Badge>}
      </span>
      {mine && <span className="card-owner"><Badge tone="mine"><Icon name="user" size={13} />Your listing</Badge></span>}
    </button>
    <div className="card-body">
      <p className="card-price">{formatPrice(item.price)}</p>
      <h3 className="card-title"><button type="button" onClick={() => onOpen(item.id)}>{item.title}</button></h3>
      <div className="card-tags">
        <Badge>{cap(item.category)}</Badge>
        <Badge>{cap(item.condition)}</Badge>
      </div>
      <p className="card-meta"><Icon name="pin" size={15} /><span>{item.pickup || 'Arrange with seller'}</span></p>
      <p className="card-seller">{mine ? 'Listed by you' : `Seller: ${item.seller}`}</p>
    </div>
    <div className="card-actions">
      {mine ? <>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => onEdit(item)} aria-label={`Edit ${item.title}`}><Icon name="edit" size={16} />Edit</button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => onToggleStatus(item)} aria-label={sold ? `Mark ${item.title} as available` : `Mark ${item.title} as sold`}>
          <Icon name={sold ? 'undo' : 'check'} size={16} />{sold ? 'Relist' : 'Mark sold'}
        </button>
      </> : sold
        ? <p className="card-note">No longer available</p>
        : <>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => onOpen(item.id)} aria-label={`View details for ${item.title}`}>Details</button>
          <a className="btn btn-primary btn-sm" href={contactHref(item)} aria-label={`Contact ${item.seller} about ${item.title} by email`}><Icon name="mail" size={16} />Contact</a>
        </>}
    </div>
  </article>;
}
