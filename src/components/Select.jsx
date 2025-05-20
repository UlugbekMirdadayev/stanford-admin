import React, { useState, useRef, useEffect } from "react";
import "../styles/select.css";
import { ArrowTop } from "../assets/icons";

const Select = ({
  options = [],
  value,
  onChange,
  placeholder = "Выбрать...",
  className = "",
  label = "",
  disabled = false,
  required,
  error,
  multiple = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getSelectedOptions = () => {
    if (!multiple) {
      return options.find((option) => option.value === value);
    }
    return options.filter((option) => value?.includes(option.value));
  };

  const handleOptionClick = (optionValue) => {
    if (!multiple) {
      onChange(optionValue);
      setIsOpen(false);
      return;
    }

    const newValue = value ? [...value] : [];
    const index = newValue.indexOf(optionValue);
    
    if (index === -1) {
      newValue.push(optionValue);
    } else {
      newValue.splice(index, 1);
    }
    
    onChange(newValue);
  };

  const selectedOptions = getSelectedOptions();
  const displayText = multiple
    ? selectedOptions.length
      ? selectedOptions.map(opt => opt.label).join(", ")
      : placeholder
    : selectedOptions
      ? selectedOptions.label
      : placeholder;

  return (
    <div
      ref={selectRef}
      className={`custom-select ${className} ${disabled ? "disabled" : ""} ${error ? "error" : ""}`}
    >
      <div
        className="custom-select-label"
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        {label}
        {required && <span>*</span>}
      </div>
      <div
        className="select-header"
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={`selected-value ${!selectedOptions || (Array.isArray(selectedOptions) && !selectedOptions.length) ? "placeholder-style" : ""}`}>
          {displayText}
        </span>
        <ArrowTop className={`arrow ${isOpen ? "open" : ""}`} />
      </div>

      {isOpen && (
        <div className="select-options">
          {options.map((option) => (
            <div
              key={option.value}
              className={`option ${
                multiple
                  ? value?.includes(option.value) ? "selected" : ""
                  : value === option.value ? "selected" : ""
              }`}
              onClick={() => handleOptionClick(option.value)}
            >
              {option.label}
              {multiple && value?.includes(option.value) && (
                <span className="checkmark">✓</span>
              )}
            </div>
          ))}
        </div>
      )}
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default Select;
