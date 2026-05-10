import * as React from "react"
import { cn } from "@/lib/utils"
import { Input } from "./input"
import { countryCodes } from "@/utils/countryCodes"

const PhoneInput = React.forwardRef(({ className, value, onChange, ...props }, ref) => {
  // Extract country code and phone number from value
  // Value is expected to be in format "+XXX..."
  const [selectedCountryCode, setSelectedCountryCode] = React.useState("+256")
  const [phoneNumber, setPhoneNumber] = React.useState("")

  React.useEffect(() => {
    if (value) {
      const match = countryCodes
        .sort((a, b) => b.code.length - a.code.length) // Sort by length descending to match longest code first
        .find(c => value.startsWith(c.code))
      
      if (match) {
        setSelectedCountryCode(match.code)
        setPhoneNumber(value.replace(match.code, ""))
      } else {
        setPhoneNumber(value)
      }
    } else {
      setPhoneNumber("")
    }
  }, [value])

  const handleCountryChange = (e) => {
    const newCode = e.target.value
    setSelectedCountryCode(newCode)
    if (onChange) {
      onChange({
        target: {
          name: props.name,
          value: newCode + phoneNumber
        }
      })
    }
  }

  const handlePhoneChange = (e) => {
    const newPhone = e.target.value.replace(/[^0-9]/g, "") // Only numbers
    setPhoneNumber(newPhone)
    if (onChange) {
      onChange({
        target: {
          name: props.name,
          value: selectedCountryCode + newPhone
        }
      })
    }
  }

  return (
    <div className={cn("flex w-full rounded-md border border-input bg-transparent shadow-sm ring-offset-background focus-within:ring-1 focus-within:ring-ring", className)}>
      <select
        value={selectedCountryCode}
        onChange={handleCountryChange}
        className="h-9 w-[90px] rounded-l-md border-r bg-transparent px-2 py-1 text-sm focus:outline-none"
      >
        {countryCodes.map((c) => (
          <option key={c.code} value={c.code}>
            {c.flag} {c.code}
          </option>
        ))}
      </select>
      <input
        type="tel"
        ref={ref}
        value={phoneNumber}
        onChange={handlePhoneChange}
        className="h-9 w-full rounded-r-md bg-transparent px-3 py-1 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        {...props}
      />
    </div>
  )
})
PhoneInput.displayName = "PhoneInput"

export { PhoneInput }
