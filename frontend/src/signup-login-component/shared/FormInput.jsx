// components/Shared/FormInput.jsx
import { useState } from 'react'

const FormInput = ({
  type = 'text',
  name,
  placeholder,
  value,
  onChange,
  error,
  label,
  required = false,
  validationRules
}) => {
  const [touched, setTouched] = useState(false)

  const handleBlur = () => {
    setTouched(true)
  }

  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        type={type}
        id={name}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={handleBlur}
        className={`w-full bg-slate-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error && touched ? 'border border-red-500' : ''
        }`}
      />
      {error && touched && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  )
}

export default FormInput