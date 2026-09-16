---
# WooCommerce Dashboard - Component Library Reference
# Complete component specifications, props, usage examples
---

# Component Library Detailed Reference

## Table of Contents
1. [Navigation Components](#navigation-components)
2. [Table Components](#table-components)
3. [Form Components](#form-components)
4. [Card Components](#card-components)
5. [Modal & Dialog Components](#modal--dialog-components)
6. [Button Components](#button-components)
7. [Badge & Status Components](#badge--status-components)
8. [Chart Components](#chart-components)
9. [Utility Components](#utility-components)
10. [Layout Components](#layout-components)

---

## Navigation Components

### Sidebar Component

**File:** `components/Navigation/Sidebar.jsx`

**Props:**
```typescript
interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  items: NavigationItem[];
  activeItem?: string;
  onItemClick?: (itemId: string) => void;
}

interface NavigationItem {
  id: string;
  label: string;
  icon: ReactNode;
  path: string;
  badge?: { count: number; variant: 'primary' | 'success' | 'warning' | 'danger' };
  submenu?: NavigationItem[];
  disabled?: boolean;
}
```

**Features:**
- Collapsible navigation
- Submenu expansion
- Active state highlighting
- Badge display
- Smooth animations
- Icon + label layout
- Dividers between sections

**Usage:**
```jsx
<Sidebar
  isOpen={sidebarOpen}
  onToggle={() => setSidebarOpen(!sidebarOpen)}
  collapsed={collapsed}
  onCollapse={setCollapsed}
  items={navigationItems}
  activeItem={currentPath}
  onItemClick={handleNavigation}
/>
```

---

### SidebarItem Component

**File:** `components/Navigation/SidebarItem.jsx`

**Props:**
```typescript
interface SidebarItemProps {
  label: string;
  icon: ReactNode;
  path: string;
  isActive?: boolean;
  badge?: { count: number; variant: string };
  submenu?: NavigationItem[];
  collapsed?: boolean;
  hasSubmenu?: boolean;
  onClick?: () => void;
}
```

**Render States:**
- Collapsed (icon only)
- Expanded (icon + label)
- Active (highlighted background)
- With badge
- With submenu indicator
- Hover state

---

### TopHeader Component

**File:** `components/Navigation/TopHeader.jsx`

**Props:**
```typescript
interface TopHeaderProps {
  onMenuClick?: () => void;
  user?: UserInfo;
  onLogout?: () => void;
  notifications?: Notification[];
  onNotificationClick?: (id: string) => void;
  onSearchSubmit?: (query: string) => void;
}

interface UserInfo {
  name: string;
  email: string;
  avatar?: string;
  role: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: Date;
}
```

**Sections:**
- Left: Menu toggle button, logo/brand
- Center: Search bar
- Right: Notifications, user dropdown

**Features:**
- Global search
- Notification bell with unread count
- User profile dropdown
- Responsive layout
- Sticky positioning

---

### Breadcrumb Component

**File:** `components/Navigation/Breadcrumb.jsx`

**Props:**
```typescript
interface BreadcrumbProps {
  items: BreadcrumbItem[];
  onItemClick?: (path: string) => void;
  separator?: ReactNode;
}

interface BreadcrumbItem {
  label: string;
  path?: string;
  icon?: ReactNode;
  active?: boolean;
}
```

**Usage:**
```jsx
<Breadcrumb
  items={[
    { label: 'Dashboard', path: '/' },
    { label: 'Products', path: '/products' },
    { label: 'Category A', path: '/products/categories/1' },
    { label: 'Edit', active: true }
  ]}
  onItemClick={handleNavigate}
/>
```

---

## Table Components

### DataTable Component

**File:** `components/Table/DataTable.jsx`

**Props:**
```typescript
interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  error?: string;
  pagination?: PaginationConfig;
  onPaginationChange?: (page: number, pageSize: number) => void;
  selection?: SelectionConfig;
  onSelectionChange?: (selectedIds: string[]) => void;
  sorting?: SortingConfig;
  onSortingChange?: (column: string, direction: 'asc' | 'desc') => void;
  onRowClick?: (row: T) => void;
  rowActions?: RowAction<T>[];
  emptyState?: ReactNode;
  toolbar?: ReactNode;
}

interface Column<T> {
  id: string;
  header: string | ReactNode;
  accessorKey?: string;
  cell?: (row: T) => ReactNode;
  width?: string | number;
  sortable?: boolean;
  filterable?: boolean;
  align?: 'left' | 'center' | 'right';
}

interface RowAction<T> {
  label: string;
  icon?: ReactNode;
  onClick: (row: T) => void;
  hidden?: (row: T) => boolean;
  color?: 'primary' | 'danger' | 'warning';
}
```

**Features:**
- Sortable columns
- Filterable columns
- Row selection (single, multiple)
- Pagination
- Row actions (edit, delete, view)
- Loading state
- Empty state
- Responsive layout
- Sticky header
- Row hover effects

**Column Definition Example:**
```javascript
const columns = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllRowsSelected()}
        onChange={table.getToggleAllRowsSelectedHandler()}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onChange={row.getToggleSelectedHandler()}
      />
    ),
    width: 40
  },
  {
    id: 'name',
    header: 'Product Name',
    accessorKey: 'name',
    sortable: true,
    filterable: true,
    cell: (row) => (
      <div className="flex items-center gap-3">
        <img src={row.image} alt={row.name} className="w-8 h-8 rounded" />
        <span className="font-medium">{row.name}</span>
      </div>
    )
  },
  {
    id: 'sku',
    header: 'SKU',
    accessorKey: 'sku'
  },
  {
    id: 'status',
    header: 'Status',
    cell: (row) => <StatusBadge status={row.status} />
  },
  {
    id: 'actions',
    header: '',
    cell: (row) => (
      <DropdownMenu
        items={[
          { label: 'Edit', onClick: () => handleEdit(row) },
          { label: 'Delete', onClick: () => handleDelete(row), color: 'danger' }
        ]}
      />
    ),
    width: 50
  }
];
```

---

### TableToolbar Component

**File:** `components/Table/TableToolbar.jsx`

**Props:**
```typescript
interface TableToolbarProps {
  searchPlaceholder?: string;
  onSearchChange?: (query: string) => void;
  filters?: FilterDefinition[];
  onFilterChange?: (filters: Record<string, any>) => void;
  bulkActions?: BulkAction[];
  selectedCount?: number;
  showDensity?: boolean;
  onDensityChange?: (density: 'compact' | 'comfortable' | 'spacious') => void;
}

interface FilterDefinition {
  id: string;
  label: string;
  type: 'select' | 'date' | 'range' | 'search';
  options?: Array<{ label: string; value: any }>;
}

interface BulkAction {
  id: string;
  label: string;
  icon?: ReactNode;
  onClick: (selectedIds: string[]) => void;
  color?: 'primary' | 'danger' | 'warning';
  confirm?: boolean;
}
```

**Features:**
- Search input
- Filter dropdowns
- Bulk action buttons
- Table density control
- Reset filters button
- Active filter count display

---

### TablePagination Component

**File:** `components/Table/TablePagination.jsx`

**Props:**
```typescript
interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
  showFirst?: boolean;
  showLast?: boolean;
}
```

**Features:**
- Page navigation buttons
- Page size selector
- Jump to page input
- Item count display
- Previous/Next/First/Last buttons

---

## Form Components

### FormField Component

**File:** `components/Form/FormField.jsx`

**Props:**
```typescript
interface FormFieldProps {
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  children: ReactNode;
  hint?: ReactNode;
  layout?: 'vertical' | 'horizontal';
}
```

**Features:**
- Label above/beside input
- Error message display
- Helper text
- Required indicator
- Hint/tooltip
- Field-level validation visual feedback

**Usage:**
```jsx
<FormField
  label="Product Name"
  error={errors.name?.message}
  helperText="Give your product a clear, descriptive name"
  required
>
  <Input
    {...register('name')}
    placeholder="Enter product name"
  />
</FormField>
```

---

### Input Component

**File:** `components/Form/Input.jsx`

**Props:**
```typescript
interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'flushed';
  error?: boolean;
  icon?: ReactNode;
  suffix?: ReactNode;
  prefix?: ReactNode;
  clearable?: boolean;
}
```

**Variants:**
- Default (border bottom)
- Filled (background fill)
- Flushed (underline only)

**Features:**
- Size variants (sm, md, lg)
- Icon support (left, right)
- Clear button
- Prefix/suffix text
- Error state styling
- Focus state animation

---

### Select Component

**File:** `components/Form/Select.jsx`

**Props:**
```typescript
interface SelectProps {
  options: SelectOption[];
  value?: any;
  onChange?: (value: any) => void;
  placeholder?: string;
  searchable?: boolean;
  multiselect?: boolean;
  clearable?: boolean;
  disabled?: boolean;
  error?: boolean;
  icon?: ReactNode;
}

interface SelectOption {
  label: string;
  value: any;
  disabled?: boolean;
  group?: string;
}
```

**Features:**
- Single & multi-select
- Searchable options
- Option grouping
- Custom option rendering
- Clear button
- Keyboard navigation

---

### Checkbox Component

**File:** `components/Form/Checkbox.jsx`

**Props:**
```typescript
interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  indeterminate?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'warning' | 'danger';
}
```

**Features:**
- Standard checked/unchecked
- Indeterminate state (for "select all")
- Label support
- Size variants
- Color variants
- Disabled state

---

### Textarea Component

**File:** `components/Form/Textarea.jsx`

**Props:**
```typescript
interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'flushed';
  error?: boolean;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
  showCount?: boolean;
  maxLength?: number;
}
```

**Features:**
- Auto-resize option
- Character count display
- Size variants
- Resize control
- Error state

---

### DatePicker Component

**File:** `components/Form/DatePicker.jsx`

**Props:**
```typescript
interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  format?: string;
  placeholder?: string;
  clearable?: boolean;
  disabled?: boolean;
  error?: boolean;
}
```

**Features:**
- Calendar UI
- Date range selection
- Min/max date restrictions
- Disabled dates
- Keyboard navigation
- Custom date format

---

### FileUpload Component

**File:** `components/Form/FileUpload.jsx`

**Props:**
```typescript
interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  maxFiles?: number;
  onUpload?: (files: File[]) => Promise<void>;
  onError?: (error: string) => void;
  preview?: boolean;
  uploadedFiles?: UploadedFile[];
  disabled?: boolean;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  url?: string;
  progress?: number;
  error?: string;
}
```

**Features:**
- Drag & drop
- File preview
- File size validation
- Multiple file upload
- Upload progress
- Error handling
- Delete uploaded file

---

### RichTextEditor Component

**File:** `components/Form/RichTextEditor.jsx`

**Props:**
```typescript
interface RichTextEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  toolbar?: ToolbarItem[];
  disabled?: boolean;
  height?: string | number;
}

interface ToolbarItem {
  type: 'bold' | 'italic' | 'underline' | 'heading' | 'list' | 'link' | 'image' | 'code';
  label: string;
  icon?: ReactNode;
}
```

**Features:**
- Bold, italic, underline
- Headings
- Lists (ordered, unordered)
- Links
- Code blocks
- Image insertion
- Color picker
- HTML view toggle

---

## Card Components

### Card Component

**File:** `components/Card/Card.jsx`

**Props:**
```typescript
interface CardProps {
  children: ReactNode;
  title?: string | ReactNode;
  subtitle?: string;
  footer?: ReactNode;
  header?: ReactNode;
  actions?: ReactNode;
  noPadding?: boolean;
  border?: boolean;
  shadow?: 'sm' | 'md' | 'lg' | 'xl' | 'none';
  className?: string;
  hoverable?: boolean;
}
```

**Structure:**
```
Card
├── Card.Header (optional)
│   ├── Card.Title
│   ├── Card.Subtitle
│   └── Card.Actions
├── Card.Body
└── Card.Footer (optional)
```

**Features:**
- Optional header with title/actions
- Optional footer
- Flexible padding
- Border & shadow options
- Hover effects

---

### StatCard Component

**File:** `components/Card/StatCard.jsx`

**Props:**
```typescript
interface StatCardProps {
  label: string;
  value: string | number;
  change?: {
    value: number;
    direction: 'up' | 'down';
    percentage: boolean;
  };
  icon?: ReactNode;
  color?: 'primary' | 'success' | 'warning' | 'danger';
  loading?: boolean;
  onClick?: () => void;
}
```

**Features:**
- Metric display
- Change indicator (up/down arrow)
- Icon support
- Color variants
- Loading state
- Clickable

**Example:**
```jsx
<StatCard
  label="Total Revenue"
  value="$124,500"
  change={{ value: 12.5, direction: 'up', percentage: true }}
  icon={<DollarSign />}
  color="primary"
/>
```

---

### ChartCard Component

**File:** `components/Card/ChartCard.jsx`

**Props:**
```typescript
interface ChartCardProps {
  title: string;
  chart: ReactNode;
  footer?: ReactNode;
  dateRange?: { from: Date; to: Date };
  onDateRangeChange?: (from: Date, to: Date) => void;
  loading?: boolean;
}
```

**Features:**
- Title with optional chart selector
- Date range filter
- Loading state
- Footer for legend/summary
- Responsive sizing

---

### CustomerCard Component

**File:** `components/Card/CustomerCard.jsx`

**Props:**
```typescript
interface CustomerCardProps {
  customer: Customer;
  onEdit?: () => void;
  onDelete?: () => void;
  showStats?: boolean;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  totalOrders?: number;
  totalSpent?: number;
  lastOrder?: Date;
}
```

**Features:**
- Customer info display
- Avatar
- Quick stats
- Action buttons

---

## Modal & Dialog Components

### Modal Component

**File:** `components/Modal/Modal.jsx`

**Props:**
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string | ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  closeButton?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  centered?: boolean;
  loading?: boolean;
}
```

**Compound Components:**
```jsx
<Modal isOpen={true} onClose={handleClose}>
  <Modal.Header title="Edit Product" />
  <Modal.Body>
    {/* Content */}
  </Modal.Body>
  <Modal.Footer>
    <Button onClick={handleClose}>Cancel</Button>
    <Button onClick={handleSave} color="primary">Save</Button>
  </Modal.Footer>
</Modal>
```

**Features:**
- Centered positioning
- Backdrop click to close
- Escape key to close
- Size variants
- Loading state
- Scroll lock

---

### ConfirmDialog Component

**File:** `components/Modal/ConfirmDialog.jsx`

**Props:**
```typescript
interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}
```

**Features:**
- Title & message
- Confirm/Cancel buttons
- Danger state (red button)
- Loading state during action
- Keyboard support (Enter to confirm, Esc to cancel)

---

### Drawer Component

**File:** `components/Modal/Drawer.jsx`

**Props:**
```typescript
interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  position?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
  footer?: ReactNode;
  closeButton?: boolean;
}
```

**Features:**
- Slide-in from side
- Left/right positioning
- Full-height
- Header with title & close
- Optional footer
- Backdrop overlay

---

## Button Components

### Button Component

**File:** `components/Button/Button.jsx`

**Props:**
```typescript
interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'solid' | 'outline' | 'ghost';
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'secondary';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
  rounded?: boolean;
}
```

**Variants:**
- **Solid:** Filled background
- **Outline:** Border with transparent background
- **Ghost:** Text only, no background

**Colors:**
- Primary (blue)
- Success (green)
- Warning (amber)
- Danger (red)
- Secondary (gray)

**Sizes:**
- xs: Compact buttons
- sm: Small buttons
- md: Standard buttons
- lg: Large buttons
- xl: Extra large buttons

**Features:**
- Loading spinner
- Icon support
- Full width option
- Rounded variant
- Disabled state
- Hover/focus states

---

### IconButton Component

**File:** `components/Button/IconButton.jsx`

**Props:**
```typescript
interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'solid' | 'outline' | 'ghost';
  tooltip?: string;
}
```

**Features:**
- Icon-only button
- Tooltip on hover
- Size variants
- Color variants
- Rounded by default
- Hover effects

---

### DropdownMenu Component

**File:** `components/Button/DropdownMenu.jsx`

**Props:**
```typescript
interface DropdownMenuProps {
  trigger?: ReactNode;
  items: MenuItem[];
  placement?: 'top' | 'bottom' | 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
}

interface MenuItem {
  id?: string;
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  color?: 'primary' | 'danger' | 'warning';
  divider?: boolean;
  disabled?: boolean;
}
```

**Features:**
- Keyboard navigation
- Click outside to close
- Menu items with icons
- Dividers between groups
- Color variants
- Disabled items
- Tooltips on hover

---

## Badge & Status Components

### Badge Component

**File:** `components/Badge/Badge.jsx`

**Props:**
```typescript
interface BadgeProps {
  children: ReactNode;
  variant?: 'solid' | 'outline' | 'subtle';
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  rounded?: boolean;
  icon?: ReactNode;
  onRemove?: () => void;
}
```

**Features:**
- Multiple variants
- Color options
- Removable badge
- Icon support
- Rounded variant

---

### StatusBadge Component

**File:** `components/Badge/StatusBadge.jsx`

**Props:**
```typescript
interface StatusBadgeProps {
  status: string;
  variant?: 'solid' | 'outline' | 'dot';
  size?: 'sm' | 'md' | 'lg';
  customColors?: Record<string, string>;
}

// Predefined statuses
type OrderStatus = 
  | 'pending' 
  | 'processing' 
  | 'on-hold' 
  | 'completed' 
  | 'cancelled' 
  | 'refunded';

type ProductStatus = 
  | 'publish' 
  | 'draft' 
  | 'pending';

type InventoryStatus = 
  | 'in-stock' 
  | 'low-stock' 
  | 'out-of-stock' 
  | 'on-backorder';
```

**Status Color Mapping:**
```javascript
const statusColors = {
  // Orders
  'pending': 'warning',
  'processing': 'info',
  'on-hold': 'warning',
  'completed': 'success',
  'cancelled': 'danger',
  'refunded': 'danger',
  
  // Products
  'publish': 'success',
  'draft': 'secondary',
  'pending': 'warning',
  
  // Inventory
  'in-stock': 'success',
  'low-stock': 'warning',
  'out-of-stock': 'danger',
  'on-backorder': 'info'
};
```

---

### TagBadge Component

**File:** `components/Badge/TagBadge.jsx`

**Props:**
```typescript
interface TagBadgeProps {
  tags: string[];
  onRemove?: (tag: string) => void;
  onAdd?: (tag: string) => void;
  editable?: boolean;
  showInput?: boolean;
  maxTags?: number;
}
```

**Features:**
- Display multiple tags
- Removable tags
- Add new tag input
- Max tag limit
- Different colors per tag

---

## Chart Components

### LineChart Component

**File:** `components/Chart/LineChart.jsx`

**Props:**
```typescript
interface LineChartProps {
  data: ChartData[];
  xAxis: string;
  yAxis: string[];
  title?: string;
  height?: number | string;
  loading?: boolean;
  colors?: string[];
  showLegend?: boolean;
  showGrid?: boolean;
  showTooltip?: boolean;
}

interface ChartData {
  [key: string]: any;
}
```

**Features:**
- Multiple lines
- Custom colors
- Legend
- Tooltips
- Responsive sizing
- Smooth animations

---

### BarChart Component

**Props:** Similar to LineChart

**Features:**
- Vertical/horizontal bars
- Grouped/stacked bars
- Custom colors
- Responsive

---

### PieChart Component

**File:** `components/Chart/PieChart.jsx`

**Props:**
```typescript
interface PieChartProps {
  data: PieData[];
  title?: string;
  height?: number | string;
  loading?: boolean;
  colors?: string[];
  showLegend?: boolean;
  showTooltip?: boolean;
  innerRadius?: number;
}

interface PieData {
  name: string;
  value: number;
  color?: string;
}
```

---

## Utility Components

### Loading Component

**File:** `components/Utility/Loading.jsx`

**Props:**
```typescript
interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'dots' | 'pulse';
  color?: 'primary' | 'secondary';
  text?: string;
  fullScreen?: boolean;
}
```

**Variants:**
- Spinner (rotating circle)
- Dots (animated dots)
- Pulse (fading pulse)

---

### Skeleton Component

**File:** `components/Utility/Skeleton.jsx`

**Props:**
```typescript
interface SkeletonProps {
  count?: number;
  height?: number | string;
  width?: number | string;
  circle?: boolean;
  variant?: 'text' | 'rect';
  animation?: 'pulse' | 'wave';
  className?: string;
}
```

**Features:**
- Placeholder for loading
- Pulse/wave animation
- Flexible sizing
- Grouped skeletons

---

### NoData Component

**File:** `components/Utility/NoData.jsx`

**Props:**
```typescript
interface NoDataProps {
  icon?: ReactNode;
  title: string;
  message?: string;
  action?: { label: string; onClick: () => void };
}
```

**Example:**
```jsx
<NoData
  icon={<Package />}
  title="No Products Found"
  message="Create your first product to get started"
  action={{ label: 'Create Product', onClick: handleCreate }}
/>
```

---

### Toast Component

**File:** `components/Toast/Toast.jsx`

**Props:**
```typescript
interface ToastProps {
  id: string;
  title?: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  action?: { label: string; onClick: () => void };
  onClose?: () => void;
}
```

**Usage:**
```javascript
// Hook-based API
const { addToast } = useToast();

addToast({
  message: 'Product saved successfully',
  type: 'success',
  duration: 3000
});
```

**Features:**
- Multiple types (info, success, warning, error)
- Auto-dismiss
- Action button
- Stack management
- Icon for each type

---

### Alert Component

**File:** `components/Alert/Alert.jsx`

**Props:**
```typescript
interface AlertProps {
  type: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  closeable?: boolean;
  onClose?: () => void;
}
```

**Variants:**
- Info (blue)
- Success (green)
- Warning (amber)
- Error (red)

---

### Tooltip Component

**File:** `components/Tooltip/Tooltip.jsx`

**Props:**
```typescript
interface TooltipProps {
  children: ReactNode;
  title: string | ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  disabled?: boolean;
}
```

**Features:**
- Placement options
- Delay before show
- Arrow indicator
- Click to show (if disabled)
- Dark/light variants

---

## Layout Components

### PageHeader Component

**File:** `components/Layout/PageHeader.jsx`

**Props:**
```typescript
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumb?: BreadcrumbItem[];
  actions?: ReactNode;
  description?: string;
}
```

**Example:**
```jsx
<PageHeader
  title="Products"
  subtitle="Manage your product catalog"
  breadcrumb={[
    { label: 'Dashboard', path: '/' },
    { label: 'Products', active: true }
  ]}
  actions={
    <Button color="primary" onClick={handleAddProduct}>
      <Plus /> Add Product
    </Button>
  }
/>
```

---

### Grid Component

**File:** `components/Layout/Grid.jsx`

**Props:**
```typescript
interface GridProps {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4 | 6 | 12;
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  responsive?: boolean;
  autoFit?: boolean;
}
```

**Features:**
- Responsive columns
- Auto-fit cards
- Customizable gap
- Easy nesting

---

### Tabs Component

**File:** `components/Layout/Tabs.jsx`

**Props:**
```typescript
interface TabsProps {
  items: TabItem[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  variant?: 'underline' | 'pills' | 'enclosed';
}

interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
}
```

**Features:**
- Multiple tab variants
- Icon support
- Disabled tabs
- Swipeable on mobile

---

This component library provides a solid foundation for building a professional WooCommerce dashboard. Implement these components using your preferred styling solution (Tailwind CSS, styled-components, or CSS modules) for a consistent, scalable interface.
