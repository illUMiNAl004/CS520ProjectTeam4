import React, { useState, useEffect, useRef } from "react";

// Fetch address suggestions from Nominatim as the user types
async function fetchSuggestions(query) {
    if (query.length < 3) return [];
  
    // Bounding box around the Five College / Pioneer Valley area
    // Format: west longitude, north latitude, east longitude, south latitude
    const fiveCollegeArea = "-73.0,42.6,-72.0,42.1";
  
    const params = new URLSearchParams({
      q: query,
      format: "json",
      limit: 5,
      addressdetails: 1,
      viewbox: fiveCollegeArea,
      bounded: 0,  // 0 = prefer this area but don't restrict results to it
    });
  
    const response = await fetch("https://nominatim.openstreetmap.org/search?" + params);
    const results = await response.json();
    return results;
  }

export default function AddressInput({ label, value, onChange, placeholder }) {
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [inputText, setInputText] = useState(value || "");
  const debounceTimer = useRef(null);
  const wrapperRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleTyping(e) {
    const text = e.target.value;
    setInputText(text);
    onChange(text);

    // Wait 400ms after user stops typing before searching
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(async () => {
      const results = await fetchSuggestions(text);
      setSuggestions(results);
      setShowDropdown(results.length > 0);
    }, 400);
  }

  function handleSelect(suggestion) {
    const displayName = suggestion.display_name;
    setInputText(displayName);
    onChange(displayName);
    setSuggestions([]);
    setShowDropdown(false);
  }

  return (
    <div ref={wrapperRef} style={styles.wrapper}>
      <div style={styles.labelText}>{label}</div>
      <input
        style={styles.input}
        placeholder={placeholder}
        value={inputText}
        onChange={handleTyping}
        onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
        autoComplete="off"
      />
      {showDropdown && (
        <div style={styles.dropdown}>
          {suggestions.map((s, index) => (
            <div
              key={index}
              style={styles.suggestionItem}
              onMouseDown={() => handleSelect(s)}
            >
              <span style={styles.pin}>📍</span>
              <span style={styles.suggestionText}>{s.display_name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  wrapper: {
    position: "relative",
    flex: 1,
  },
  labelText: {
    fontSize: 10,
    color: "#C9A84C",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.6px",
    marginBottom: 4,
  },
  input: {
    width: "100%",
    border: "none",
    background: "transparent",
    padding: "4px 0",
    fontSize: 15,
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box",
  },
  dropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    background: "#fff",
    border: "1.5px solid #e5e5e5",
    borderRadius: 8,
    zIndex: 1000,
    boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
    maxHeight: 220,
    overflowY: "auto",
  },
  suggestionItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    padding: "10px 14px",
    cursor: "pointer",
    borderBottom: "0.5px solid #f0f0f0",
  },
  pin: {
    fontSize: 14,
    flexShrink: 0,
    marginTop: 1,
  },
  suggestionText: {
    fontSize: 13,
    color: "#333",
    lineHeight: 1.4,
  },
};