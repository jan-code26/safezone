import L from "leaflet"

// Create custom HTML-based icons instead of using image files
const createCustomIcon = (color: string, icon: string, size = 25) => {
  return L.divIcon({
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background-color: ${color};
        border: 3px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${size * 0.5}px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        position: relative;
      ">
        ${icon}
      </div>
    `,
    className: "custom-div-icon",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  })
}

// Create status-based icons
export const createStatusIcon = (status: string, type = "person") => {
  let color: string
  let icon: string

  // Determine color based on status
  switch (status) {
    case "safe":
      color = "#10B981" // green
      break
    case "caution":
      color = "#F59E0B" // amber
      break
    case "danger":
      color = "#EF4444" // red
      break
    case "at_risk":
      color = "#F59E0B" // amber
      break
    case "unknown":
      color = "#6B7280" // gray
      break
    default:
      color = "#6B7280" // gray
  }

  // Determine icon based on type
  switch (type) {
    case "person":
      icon = "👤"
      break
    case "school":
      icon = "🏫"
      break
    case "home":
      icon = "🏠"
      break
    case "work":
      icon = "🏢"
      break
    case "emergency":
      icon = "🚨"
      break
    case "property":
      icon = "🏠"
      break
    default:
      icon = "📍"
  }

  return createCustomIcon(color, icon)
}

// Create alert zone icon
export const createAlertIcon = (severity: string) => {
  let color: string

  switch (severity) {
    case "low":
      color = "#3B82F6" // blue
      break
    case "medium":
      color = "#F59E0B" // amber
      break
    case "high":
      color = "#EF4444" // red
      break
    default:
      color = "#6B7280" // gray
  }

  return createCustomIcon(color, "⚠️", 30)
}

// Fix for default markers - completely override the default icon system
delete (L.Icon.Default.prototype as any)._getIconUrl

// Set a fallback default icon using our custom system
L.Icon.Default.mergeOptions({
  iconUrl:
    "data:image/svg+xml;base64," +
    btoa(`
    <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
      <path fill="#3388ff" stroke="#fff" stroke-width="2" d="M12.5 0C5.6 0 0 5.6 0 12.5c0 12.5 12.5 28.5 12.5 28.5s12.5-16 12.5-28.5C25 5.6 19.4 0 12.5 0z"/>
      <circle fill="#fff" cx="12.5" cy="12.5" r="6"/>
    </svg>
  `),
  iconRetinaUrl:
    "data:image/svg+xml;base64," +
    btoa(`
    <svg width="50" height="82" viewBox="0 0 50 82" xmlns="http://www.w3.org/2000/svg">
      <path fill="#3388ff" stroke="#fff" stroke-width="4" d="M25 0C11.2 0 0 11.2 0 25c0 25 25 57 25 57s25-32 25-57C50 11.2 38.8 0 25 0z"/>
      <circle fill="#fff" cx="25" cy="25" r="12"/>
    </svg>
  `),
  shadowUrl:
    "data:image/svg+xml;base64," +
    btoa(`
    <svg width="41" height="41" viewBox="0 0 41 41" xmlns="http://www.w3.org/2000/svg">
      <ellipse fill="rgba(0,0,0,0.2)" cx="20.5" cy="37" rx="18" ry="4"/>
    </svg>
  `),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

export default L
