# Builder Components Architecture

This directory contains the refactored components for the 3D kit builder, organized following clean architecture principles.

## Directory Structure

```
components/
├── 3d/              # 3D rendering components
├── ui/              # UI interface components  
├── layout/          # Layout composition components
├── hooks/           # Custom React hooks
└── index.ts         # Barrel exports
```

## Component Organization

### 3D Components (`3d/`)
- **GLBModel**: Handles GLB file loading with Leva controls
- **BasicModel**: Fallback geometry model for when GLB fails
- **Model**: Smart component that switches between GLB and basic models
- **Scene**: 3D scene setup with lighting and camera controls
- **SafeCanvas**: Canvas wrapper with WebGL context recovery
- **ErrorBoundary**: Error boundary for 3D component failures

### UI Components (`ui/`)
- **HudHeader**: Header with title and subtitle
- **ToggleButton**: Show/hide controls toggle
- **GlassColorPicker**: Glassmorphic color picker with hex display
- **GlassDropdown**: Glassmorphic dropdown with custom styling
- **GlassButton**: Glassmorphic button with variants and sizes
- **ColorControlsPanel**: Color and pattern controls using glass components
- **AIAssistantPanel**: Natural language prompt for AI design generation
- **ActionsBar**: Save/share/export actions
- **LevaControls**: Leva controls wrapper

### Layout Components (`layout/`)
- **ControlsPanels**: Container for all control panels
- **BuilderLayout**: Main layout that composes all components

### Hooks (`hooks/`)
- **useKeyboardShortcuts**: Keyboard interaction management
- **useModelLoader**: Model file checking and preloading

## Glass Design System

The builder uses a consistent glassmorphic design system for all UI components:

### GlassColorPicker
- Modern color picker with backdrop blur
- Displays color hex value
- Smooth hover animations
- Integrated color preview

### GlassDropdown
- Custom styled select with glassmorphic background
- Animated chevron icon
- Focus states with accent colors
- Consistent with overall glass aesthetic

### GlassTextarea
- Multi-line text input with glass styling
- Maintains consistent backdrop blur
- Responsive sizing and focus states

### GlassButton
- Interactive button with glassmorphic styling
- Multiple variants (primary, secondary)
- Three sizes (sm, md, lg)
- Smooth hover and active states
- Disabled state handling

All glass components feature:
- Consistent backdrop blur effects
- Smooth transitions and animations
- Focus states with accent colors
- Dark/light mode compatibility
- Responsive design

## Design Principles

### Atomicity
Each component has a single responsibility and minimal dependencies.

### Composition
Components are composed together in layout components rather than being tightly coupled.

### Performance
- Memoized components with `React.memo`
- Optimized re-rendering
- Efficient WebGL context management

### Reusability
Components are designed to be reusable and configurable through props.

### Clean Architecture
- Clear separation of concerns
- Dependencies point inward
- UI components are independent of 3D logic

## Usage

Import components directly or use the barrel export:

```tsx
// Direct import
import { GlassColorPicker, GlassDropdown, GlassButton } from './ui/GlassColorPicker';

// Barrel export
import { GLBModel, Scene, BuilderLayout, GlassButton } from './components';

// Glass component usage
<GlassButton variant="primary" size="lg" onClick={handleClick}>
  <Icon size={16} />
  Button Text
</GlassButton>

// Main usage
export default function BuilderPage() {
  return <BuilderLayout modelPath="/models/BoxTextured.glb" />;
}
```

## Benefits of This Architecture

1. **Maintainability**: Each component is focused and easy to understand
2. **Testability**: Components can be tested in isolation
3. **Reusability**: Components can be used in different contexts
4. **Performance**: Optimized rendering and memory usage
5. **Developer Experience**: Clear structure and easy navigation
6. **Design Consistency**: Complete glass design system ensures visual cohesion 