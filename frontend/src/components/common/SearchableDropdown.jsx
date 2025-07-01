import React, { useState, useRef, useEffect } from 'react';

export default function SearchableDropdown({
  options = [],
  value,
  onChange,
  placeholder = 'Select...',
  className = '',
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [highlighted, setHighlighted] = useState(0);
  const ref = useRef();

  // Filter options by search
  const filtered = options.filter(opt =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    function handleKey(e) {
      if (e.key === 'ArrowDown') {
        setHighlighted(h => Math.min(h + 1, filtered.length - 1));
      } else if (e.key === 'ArrowUp') {
        setHighlighted(h => Math.max(h - 1, 0));
      } else if (e.key === 'Enter') {
        if (filtered[highlighted]) {
          onChange(filtered[highlighted].value);
          setOpen(false);
        }
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, filtered, highlighted, onChange]);

  // Reset highlight on open/search
  useEffect(() => {
    setHighlighted(0);
  }, [open, search]);

  const selected = options.find(opt => opt.value === value);

  return (
    <div className={`relative w-full ${className}`} ref={ref}>
      <button
        type="button"
        className={`flex items-center w-full px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition text-left ${open ? 'ring-2 ring-primary-500' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {selected?.avatar && (
          <img src={selected.avatar} alt="avatar" className="w-5 h-5 rounded-full mr-2" />
        )}
        <span className={selected ? '' : 'text-gray-400'}>
          {selected ? selected.label : placeholder}
        </span>
        <svg className="ml-auto w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && (
        <div className="absolute z-20 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto animate-fade-in">
          <div className="p-2">
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <ul tabIndex={-1} role="listbox">
            {filtered.length === 0 && (
              <li className="px-4 py-2 text-gray-400">No options</li>
            )}
            {filtered.map((opt, i) => (
              <li
                key={opt.value}
                role="option"
                aria-selected={value === opt.value}
                className={`flex items-center px-4 py-2 cursor-pointer transition-colors rounded-lg ${
                  i === highlighted ? 'bg-primary-100 text-primary-800' : value === opt.value ? 'bg-primary-50' : ''
                }`}
                onMouseEnter={() => setHighlighted(i)}
                onMouseDown={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
              >
                {opt.avatar && (
                  <img src={opt.avatar} alt="avatar" className="w-5 h-5 rounded-full mr-2" />
                )}
                {opt.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 