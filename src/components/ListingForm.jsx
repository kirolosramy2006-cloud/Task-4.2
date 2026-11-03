import React, { useRef, useState } from 'react';
import { Icon, Modal } from './ui.jsx';
import { cap, categories, conditions, currentUser, findErrors, pickupSuggestions } from '../data.js';

function Field({id, label, required, hint, error, wide, children}) {
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;
  return <div className={`field${wide ? ' wide' : ''}${error ? ' has-error' : ''}`}>
    <label htmlFor={id}>{label}{required ? <span className="req" aria-hidden="true"> *</span> : <span className="optional"> (optional)</span>}</label>
    {children({id, 'aria-invalid': error ? true : undefined, 'aria-describedby': describedBy, 'aria-required': required || undefined})}
    {hint && <small id={`${id}-hint`} className="field-hint">{hint}</small>}
    {error && <small id={`${id}-error`} className="field-error">{error}</small>}
  </div>;
}

export default function ListingForm({editor, onChange, onSubmit, onClose}) {
  const {form} = editor;
  const editing = Boolean(editor.id);
  const [attempted, setAttempted] = useState(false);
  const formRef = useRef(null);
  const errors = attempted ? findErrors(form) : {};
  const errorCount = Object.keys(errors).length;
  const set = key => e => onChange(key, e.target.value);

  function submit(e) {
    e.preventDefault();
    const found = findErrors(form);
    if (Object.keys(found).length) {
      setAttempted(true);
      // Move focus to the first invalid field so keyboard and screen-reader users land on the problem.
      const first = Object.keys(found)[0];
      requestAnimationFrame(() => formRef.current?.querySelector(`#f-${first}`)?.focus());
      return;
    }
    onSubmit();
  }

  return <Modal labelledBy="form-title" onClose={onClose} className="form-modal" initialFocus="#f-title">
    <header className="form-head">
      <p className="eyebrow">{editing ? 'Manage listing' : 'Sell an item'}</p>
      <h2 id="form-title">{editing ? 'Edit your listing' : 'List an item for sale'}</h2>
      <p className="form-sub">{editing ? 'Update the details buyers see. Changes are saved in this browser.' : 'It takes about a minute. Fields marked * are required.'}</p>
    </header>
    <form ref={formRef} onSubmit={submit} noValidate>
      {errorCount > 0 && <div className="form-alert" role="alert">
        <strong>Please fix {errorCount === 1 ? '1 field' : `${errorCount} fields`} before {editing ? 'saving' : 'publishing'}.</strong>
      </div>}
      <fieldset className="form-section">
        <legend>Item details</legend>
        <div className="field-grid">
          <Field id="f-title" label="Title" required wide error={errors.title} hint="Be specific, e.g. “Calculus II textbook, 3rd edition”.">
            {p => <input {...p} type="text" value={form.title} onChange={set('title')} maxLength={120} placeholder="What are you selling?" autoComplete="off" />}
          </Field>
          <Field id="f-price" label="Price" required error={errors.price}>
            {p => <div className="input-affix"><span aria-hidden="true">EGP</span><input {...p} type="number" inputMode="decimal" min="0" step="0.01" value={form.price} onChange={set('price')} placeholder="0" /></div>}
          </Field>
          <Field id="f-category" label="Category" required error={errors.category}>
            {p => <select {...p} value={form.category} onChange={set('category')}>
              <option value="">Choose a category</option>
              {categories.map(c => <option value={c} key={c}>{cap(c)}</option>)}
            </select>}
          </Field>
          <div className={`field wide${errors.condition ? ' has-error' : ''}`}>
            <fieldset className="choice-group" aria-describedby={errors.condition ? 'f-condition-error' : undefined}>
              <legend>Condition<span className="req" aria-hidden="true"> *</span></legend>
              <div className="segmented">
                {conditions.map((c, i) => <label key={c} className={form.condition === c ? 'on' : ''}>
                  <input type="radio" name="condition" id={i === 0 ? 'f-condition' : undefined} value={c} checked={form.condition === c} onChange={set('condition')} />
                  {cap(c)}
                </label>)}
              </div>
            </fieldset>
            {errors.condition && <small id="f-condition-error" className="field-error">{errors.condition}</small>}
          </div>
          <Field id="f-description" label="Description" wide hint="Mention size, edition, defects or what is included.">
            {p => <textarea {...p} value={form.description} onChange={set('description')} rows={4} placeholder="Describe the item for buyers" />}
          </Field>
        </div>
      </fieldset>
      <fieldset className="form-section">
        <legend>Pickup</legend>
        <div className="field-grid">
          <Field id="f-pickup" label="Pickup / meetup location" wide hint="A public spot on or near campus works best.">
            {p => <input {...p} type="text" value={form.pickup} onChange={set('pickup')} placeholder="e.g. GUC library entrance, weekdays after 1 PM" />}
          </Field>
          <div className="suggestions wide" role="group" aria-label="Suggested pickup locations">
            {pickupSuggestions.map(s => <button type="button" key={s} className="chip chip-sm" onClick={() => onChange('pickup', s)}>{s}</button>)}
          </div>
        </div>
      </fieldset>
      {editing && <fieldset className="form-section">
        <legend>Availability</legend>
        <div className="segmented segmented-status">
          {[['active', 'Available'], ['sold', 'Sold']].map(([value, text]) => <label key={value} className={form.status === value ? 'on' : ''}>
            <input type="radio" name="status" value={value} checked={form.status === value} onChange={set('status')} />{text}
          </label>)}
        </div>
      </fieldset>}
      <div className="seller-note">
        <Icon name="mail" size={16} />
        <span>Buyers will contact you at <strong>{currentUser.email}</strong>, your demo account email.</span>
      </div>
      <div className="form-foot">
        <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn btn-primary">{editing ? 'Save changes' : 'Publish listing'}</button>
      </div>
    </form>
  </Modal>;
}
