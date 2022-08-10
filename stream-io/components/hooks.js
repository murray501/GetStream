import React, { useState, useReducer } from "react";

export const useInput = initialValue => {
    const [value, setValue] = useState(initialValue);
    return [
      { value, onChange: e => setValue(e.target.value) },
      () => setValue(initialValue)
    ];
};
  
export function Form({ title, onSubmit = f => f }) {
  const [textProps, resetText] = useInput("");

  const submit = e => {
    e.preventDefault();
    onSubmit(textProps.value);
    resetText();
  };

  return (
    <form onSubmit={submit}>
      <input
        {...textProps}
        type="text"
        placeholder={title}
        required
      />
      <button>Submit</button>
    </form>
  );
}

export function Checkbox(label, init_value=false) {
  const [checked, setChecked] = useReducer(
    checked => !checked,
    init_value
  );

  return [
      () => 
      <>
          <label>
          {label}
          <input
              type="checkbox"
              checked={checked}
              onChange={setChecked}
          />
          </label>
      </>,
      checked
  ];
}

