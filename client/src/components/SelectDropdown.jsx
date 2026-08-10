import { useState, useRef, useEffect } from 'react'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import CheckIcon from '@mui/icons-material/Check'

const SelectDropdown = ({ value, onChange, placeholder, options }) => {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const handleClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false)
    }
    const handleKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  const selected = options.find((opt) => opt.value === value)

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="w-full h-10 bg-white text-gray-900 border border-gray-300 px-4 rounded-sm font-medium text-left flex items-center justify-between gap-2 hover:border-blue-400 cursor-pointer"
      >
        <span className={`truncate ${selected ? 'text-gray-900' : 'text-gray-500'}`}>
          {selected ? selected.label : placeholder}
        </span>
        <ExpandMoreIcon sx={{ fontSize: 18 }} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div role="listbox" className="absolute z-20 left-0 right-0 mt-1 bg-white border border-gray-200 shadow-lg rounded-sm max-h-56 overflow-auto">
          {options.map((opt) => (
            <button
              type="button"
              key={opt.value}
              role="option"
              aria-selected={opt.value === value}
              onClick={() => {
                onChange(opt.value)
                setOpen(false)
              }}
              className={`w-full text-left px-4 py-2.5 text-[14px] font-medium cursor-pointer flex items-center justify-between gap-2 ${
                opt.value === value ? 'bg-blue-50 text-blue-600' : 'text-gray-800 hover:bg-gray-50'
              }`}
            >
              <span className="truncate">{opt.label}</span>
              {opt.value === value && <CheckIcon sx={{ fontSize: 16 }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default SelectDropdown
