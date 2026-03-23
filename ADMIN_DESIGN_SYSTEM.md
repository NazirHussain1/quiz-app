# Admin Panel Design System

## Color Palette

### Primary Colors
- **Blue**: `from-blue-600 to-blue-700` (Primary actions, links)
- **Purple**: `from-purple-600 to-purple-700` (Secondary highlights)
- **Green**: `from-green-500 to-green-600` (Success, create actions)
- **Red**: `from-red-600 to-red-700` (Danger, delete actions)
- **Orange**: `from-orange-500 to-orange-600` (Warnings, stats)

### Neutral Colors
- **Gray**: `bg-gray-50` to `bg-gray-900` (Backgrounds, text)
- **White**: `bg-white` (Cards, modals)

## Typography

### Headings
- **H1**: `text-3xl md:text-4xl font-bold text-gray-900`
- **H2**: `text-2xl font-bold text-gray-900`
- **H3**: `text-xl font-bold`
- **H5**: `text-lg font-bold`

### Body Text
- **Regular**: `text-gray-600` or `text-gray-700`
- **Small**: `text-sm`
- **Extra Small**: `text-xs`

## Buttons

### Primary Button
```jsx
className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-300"
```

### Secondary Button
```jsx
className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-gray-300"
```

### Success Button
```jsx
className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg focus:outline-none focus:ring-4 focus:ring-green-300"
```

### Danger Button
```jsx
className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg focus:outline-none focus:ring-4 focus:ring-red-300"
```

### Icon Button
```jsx
className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
```

## Input Fields

### Text Input
```jsx
className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none"
```

### Input with Error
```jsx
className="w-full px-4 py-3 border-2 border-red-300 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-100 transition-all duration-200 outline-none"
```

### Select Dropdown
```jsx
className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none bg-white"
```

## Cards

### Standard Card
```jsx
className="bg-white rounded-xl shadow-md overflow-hidden"
```

### Stat Card
```jsx
className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md p-6 text-white transform hover:scale-105 transition-transform duration-200"
```

### Card Header
```jsx
className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4"
```

## Tables

### Table Container
```jsx
className="overflow-x-auto"
```

### Table Header
```jsx
className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200"
```

### Table Row
```jsx
className="hover:bg-blue-50 transition-colors duration-200 group"
```

## Modals

### Modal Overlay
```jsx
className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
```

### Modal Content
```jsx
className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
```

## Spacing

- **Small**: `gap-2`, `mb-2`, `p-2`
- **Medium**: `gap-4`, `mb-4`, `p-4`
- **Large**: `gap-6`, `mb-6`, `p-6`
- **Extra Large**: `gap-8`, `mb-8`, `p-8`

## Responsive Grid

### Stats Cards
```jsx
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
```

### Two Column Layout
```jsx
className="grid grid-cols-1 lg:grid-cols-2 gap-6"
```

### Three Column Layout
```jsx
className="grid grid-cols-1 lg:grid-cols-3 gap-6"
```

## Transitions

- **Standard**: `transition-all duration-200`
- **Colors**: `transition-colors duration-200`
- **Transform**: `transition-transform duration-200`

## Shadows

- **Small**: `shadow-sm`
- **Medium**: `shadow-md`
- **Large**: `shadow-lg`
- **Extra Large**: `shadow-xl`
- **2XL**: `shadow-2xl`

## Border Radius

- **Small**: `rounded-lg`
- **Medium**: `rounded-xl`
- **Large**: `rounded-2xl`
- **Full**: `rounded-full`

## Toast Notifications

### Configuration
```jsx
<ToastContainer
  position="top-right"
  autoClose={3000}
  theme="colored"
  style={{ zIndex: 9999 }}
/>
```

### Usage
```jsx
// Success
toast.success("Question created successfully!");

// Error
toast.error("Failed to save question");

// Info
toast.info("Loading data...");

// Warning
toast.warning("Please check your input");
```

## Accessibility

### ARIA Labels
- Always add `aria-label` to icon buttons
- Use `aria-describedby` for error messages
- Add `aria-invalid` for invalid inputs
- Use `aria-current="page"` for active navigation items
- Add `aria-expanded` for collapsible elements
- Use `role="alert"` for error messages
- Add `role="dialog"` and `aria-modal="true"` for modals

### Focus States
- All interactive elements must have `focus:outline-none focus:ring-4`
- Use appropriate ring colors: `focus:ring-blue-300`, `focus:ring-red-300`, etc.

### Keyboard Navigation
- Ensure all buttons and links are keyboard accessible
- Use proper semantic HTML elements
- Add `role` attributes where needed

## Icons

### Icon Library
- Using `lucide-react` for all icons
- Standard size: `w-5 h-5` or `w-6 h-6`
- Icon buttons: `w-4 h-4`

### Common Icons
- **Search**: `<Search />`
- **Edit**: `<Edit2 />`
- **Delete**: `<Trash2 />`
- **Add**: `<Plus />`
- **Close**: `<X />`
- **Navigation**: `<ChevronLeft />`, `<ChevronRight />`
- **Loading**: `<Loader2 className="animate-spin" />`
- **Stats**: `<Users />`, `<FileText />`, `<Target />`, `<Award />`

## Animation

### Framer Motion
```jsx
// Modal entrance
<motion.div
  initial={{ scale: 0.9, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  exit={{ scale: 0.9, opacity: 0 }}
  transition={{ type: "spring", duration: 0.5 }}
>
```

### Hover Effects
- Scale: `hover:scale-105`
- Background: `hover:bg-blue-50`
- Border: `hover:border-blue-300`

## Best Practices

1. **Consistency**: Use the same patterns across all pages
2. **Accessibility**: Always include ARIA labels and focus states
3. **Responsiveness**: Test on mobile, tablet, and desktop
4. **Performance**: Use transitions sparingly
5. **User Feedback**: Always show toast notifications for actions
6. **Error Handling**: Display inline errors with clear messages
7. **Loading States**: Show spinners during async operations
8. **Keyboard Navigation**: Ensure all interactive elements are accessible via keyboard
