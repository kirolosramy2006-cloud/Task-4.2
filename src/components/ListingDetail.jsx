import React, { useState } from 'react';
import { Badge, Icon, ListingImage, Modal, StatusBadge } from './ui.jsx';
import { cap, contactHref, formatPrice, isMine } from '../data.js';

export default function ListingDetail({item, onClose, onEdit, onToggleStatus}) {
  const [active, setActive] = useState(0);
  const images = item.photos || [];
  const mine = isMine(item);
  const sold = item.status === 'sold';
  return <Modal labelledBy="detail-title" onClose={onClose} className="detail">
    <div className="detail-gallery">
      <div className={`detail-visual${sold ? ' is-sold' : ''}`}>
        <ListingImage src={images[active] || images[0]} alt={`${item.title}, photo ${active + 1}`} emoji={item.emoji} className="detail-img" />
      </div>
      {images.length > 1 && <div className="detail-thumbs" role="group" aria-label="Item photos">
        {images.map((src, index) => <button type="button" key={index} className={active === index ? 'thumb active' : 'thumb'} aria-label={`Show photo ${index + 1} of ${images.length}`} aria-pressed={active === index} onClick={() => setActive(index)}>
          <ListingImage src={src} alt="" emoji={item.emoji} className="thumb-img" compact />
        </button>)}
      </div>}
    </div>
    <div className="detail-info">
      <div className="detail-badges">
        <StatusBadge status={item.status} />
        {mine && <Badge tone="mine"><Icon name="user" size={13} />Your listing</Badge>}
      </div>
      <h2 id="detail-title" className="detail-title">{item.title}</h2>
      <p className="detail-price">{formatPrice(item.price)}</p>
      <dl className="detail-facts">
        <div><dt>Category</dt><dd>{cap(item.category)}</dd></div>
        <div><dt>Condition</dt><dd>{cap(item.condition)}</dd></div>
        <div className="wide"><dt>Pickup location</dt><dd><Icon name="pin" size={15} />{item.pickup || 'Arrange directly with the seller'}</dd></div>
        <div className="wide"><dt>Seller</dt><dd>{mine ? `You (${item.sellerEmail})` : item.seller}</dd></div>
      </dl>
      <h3 className="detail-subhead">Description</h3>
      <p className="detail-description">{item.description || 'The seller has not added a description.'}</p>
      <div className="detail-actions">
        {mine ? <>
          <button type="button" className="btn btn-primary" onClick={() => onEdit(item)}><Icon name="edit" size={16} />Edit listing</button>
          <button type="button" className="btn btn-secondary" onClick={() => onToggleStatus(item)}><Icon name={sold ? 'undo' : 'check'} size={16} />{sold ? 'Mark as available' : 'Mark as sold'}</button>
        </> : sold
          ? <p className="detail-note">This item has been sold and is no longer available.</p>
          : <>
            <a className="btn btn-primary btn-block" href={contactHref(item)}><Icon name="mail" size={16} />Contact seller</a>
            <p className="detail-hint">Opens your email app with a message to {item.seller}. Messages are not sent through this site.</p>
          </>}
      </div>
    </div>
  </Modal>;
}
