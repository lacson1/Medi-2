# Dropdown Text Field Debugging Guide

## Common Issues and Solutions

### 1. **Dropdown Not Opening**

**Symptoms:**
- Clicking on input field doesn't show options
- Focus doesn't trigger dropdown
- No visual feedback when interacting

**Debug Steps:**
```typescript
// Test if dropdown opens on focus
it('should open dropdown when input is focused', async () => {
    const input = screen.getByTestId('dropdown-input');
    await userEvent.click(input);
    
    // Check if dropdown container exists
    expect(screen.getByTestId('dropdown-options')).toBeInTheDocument();
    
    // Check if options are rendered
    expect(screen.getAllByRole('option')).toHaveLength(expectedCount);
});
```

**Common Causes:**
- Missing `onFocus` handler
- CSS `z-index` issues hiding dropdown
- Event propagation being stopped
- State not updating properly

**Solutions:**
```typescript
// Ensure proper focus handling
const handleFocus = () => {
    setIsOpen(true);
    onFocus?.();
};

// Check CSS z-index
.dropdown-options {
    z-index: 1000; /* Ensure dropdown appears above other elements */
    position: absolute;
}
```

### 2. **Options Not Filtering**

**Symptoms:**
- Typing doesn't filter options
- All options always visible
- Search functionality not working

**Debug Steps:**
```typescript
// Test filtering functionality
it('should filter options based on input', async () => {
    const input = screen.getByTestId('dropdown-input');
    await userEvent.type(input, 'search term');
    
    // Check if filtered options are shown
    const visibleOptions = screen.getAllByRole('option');
    expect(visibleOptions).toHaveLength(expectedFilteredCount);
    
    // Check if correct options are visible
    expect(screen.getByText('Expected Option')).toBeInTheDocument();
    expect(screen.queryByText('Unwanted Option')).not.toBeInTheDocument();
});
```

**Common Causes:**
- Filter logic not implemented
- Case sensitivity issues
- Debouncing problems
- State not updating

**Solutions:**
```typescript
// Implement proper filtering
const filterOptions = (searchTerm: string) => {
    return options.filter(option => 
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
};

// Add debouncing for performance
const debouncedFilter = useMemo(
    () => debounce(filterOptions, 300),
    [options]
);
```

### 3. **Option Selection Not Working**

**Symptoms:**
- Clicking options doesn't select them
- Value doesn't update
- onChange not triggered

**Debug Steps:**
```typescript
// Test option selection
it('should select option when clicked', async () => {
    const mockOnChange = vi.fn();
    const input = screen.getByTestId('dropdown-input');
    
    await userEvent.click(input);
    const option = screen.getByTestId('option-1');
    await userEvent.click(option);
    
    // Check if onChange was called
    expect(mockOnChange).toHaveBeenCalledWith('expected-value');
    
    // Check if input value updated
    expect(input).toHaveValue('Expected Label');
});
```

**Common Causes:**
- Click event not handled
- Event bubbling issues
- State not updating
- Option disabled

**Solutions:**
```typescript
// Proper click handling
const handleOptionClick = (optionValue: string) => {
    const selectedOption = options.find(opt => opt.value === optionValue);
    if (selectedOption && !selectedOption.disabled) {
        setValue(selectedOption.value);
        setInputValue(selectedOption.label);
        onChange(optionValue);
        setIsOpen(false);
    }
};

// Prevent event bubbling issues
const handleOptionClick = (e: React.MouseEvent, optionValue: string) => {
    e.preventDefault();
    e.stopPropagation();
    // ... selection logic
};
```

### 4. **Dropdown Not Closing**

**Symptoms:**
- Dropdown stays open after selection
- Clicking outside doesn't close
- Escape key doesn't work

**Debug Steps:**
```typescript
// Test dropdown closing
it('should close dropdown after selection', async () => {
    const input = screen.getByTestId('dropdown-input');
    await userEvent.click(input);
    
    const option = screen.getByTestId('option-1');
    await userEvent.click(option);
    
    // Check if dropdown closed
    await waitFor(() => {
        expect(screen.queryByTestId('dropdown-options')).not.toBeInTheDocument();
    });
});

// Test outside click
it('should close dropdown when clicking outside', async () => {
    const input = screen.getByTestId('dropdown-input');
    await userEvent.click(input);
    
    await userEvent.click(document.body);
    
    await waitFor(() => {
        expect(screen.queryByTestId('dropdown-options')).not.toBeInTheDocument();
    });
});
```

**Common Causes:**
- Missing blur handler
- Event listener not attached
- State not updating
- Timing issues

**Solutions:**
```typescript
// Proper outside click handling
useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setIsOpen(false);
        }
    };

    if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
}, [isOpen]);

// Proper escape key handling
const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
        setIsOpen(false);
    }
};
```

### 5. **Performance Issues**

**Symptoms:**
- Slow rendering with many options
- Laggy typing
- Memory leaks

**Debug Steps:**
```typescript
// Test performance with large datasets
it('should handle large number of options', () => {
    const largeOptions = Array.from({ length: 1000 }, (_, i) => ({
        value: `option-${i}`,
        label: `Option ${i}`
    }));
    
    const startTime = performance.now();
    render(<DropdownTextField options={largeOptions} />);
    const endTime = performance.now();
    
    // Should render within reasonable time
    expect(endTime - startTime).toBeLessThan(100);
});
```

**Solutions:**
```typescript
// Virtual scrolling for large lists
import { FixedSizeList as List } from 'react-window';

const VirtualizedOptions = ({ options, onSelect }) => (
    <List
        height={200}
        itemCount={options.length}
        itemSize={35}
        itemData={options}
    >
        {({ index, style, data }) => (
            <div style={style} onClick={() => onSelect(data[index])}>
                {data[index].label}
            </div>
        )}
    </List>
);

// Debounced filtering
const debouncedFilter = useMemo(
    () => debounce((searchTerm: string) => {
        setFilteredOptions(filterOptions(searchTerm));
    }, 300),
    [options]
);
```

### 6. **Accessibility Issues**

**Symptoms:**
- Screen reader not announcing options
- Keyboard navigation not working
- Missing ARIA attributes

**Debug Steps:**
```typescript
// Test accessibility
it('should have proper ARIA attributes', () => {
    const input = screen.getByRole('combobox');
    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(input).toHaveAttribute('aria-haspopup', 'listbox');
});

// Test keyboard navigation
it('should navigate with arrow keys', async () => {
    const input = screen.getByRole('combobox');
    await userEvent.click(input);
    
    await userEvent.keyboard('{ArrowDown}');
    // Check if first option is highlighted
    
    await userEvent.keyboard('{ArrowDown}');
    // Check if second option is highlighted
});
```

**Solutions:**
```typescript
// Proper ARIA attributes
<input
    role="combobox"
    aria-expanded={isOpen}
    aria-haspopup="listbox"
    aria-activedescendant={activeOptionId}
    aria-autocomplete="list"
/>

<ul role="listbox" aria-label="Options">
    {options.map((option, index) => (
        <li
            key={option.value}
            role="option"
            aria-selected={selectedIndex === index}
            id={`option-${index}`}
        >
            {option.label}
        </li>
    ))}
</ul>

// Keyboard navigation
const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
        case 'ArrowDown':
            e.preventDefault();
            setSelectedIndex(prev => 
                prev < options.length - 1 ? prev + 1 : 0
            );
            break;
        case 'ArrowUp':
            e.preventDefault();
            setSelectedIndex(prev => 
                prev > 0 ? prev - 1 : options.length - 1
            );
            break;
        case 'Enter':
            e.preventDefault();
            if (selectedIndex >= 0) {
                handleOptionSelect(options[selectedIndex].value);
            }
            break;
        case 'Escape':
            setIsOpen(false);
            break;
    }
};
```

### 7. **State Management Issues**

**Symptoms:**
- Value not syncing with parent component
- Multiple dropdowns interfering
- State not persisting

**Debug Steps:**
```typescript
// Test state synchronization
it('should sync value with parent component', () => {
    const { rerender } = render(
        <DropdownTextField value="" onChange={mockOnChange} options={options} />
    );
    
    // Update parent value
    rerender(
        <DropdownTextField value="new-value" onChange={mockOnChange} options={options} />
    );
    
    // Check if input reflects new value
    expect(screen.getByDisplayValue('New Label')).toBeInTheDocument();
});
```

**Solutions:**
```typescript
// Proper state management
const DropdownTextField = ({ value, onChange, options }) => {
    const [internalValue, setInternalValue] = useState(value);
    const [isOpen, setIsOpen] = useState(false);
    
    // Sync with external value changes
    useEffect(() => {
        setInternalValue(value);
    }, [value]);
    
    // Update parent when internal value changes
    const handleInternalChange = (newValue: string) => {
        setInternalValue(newValue);
        onChange(newValue);
    };
    
    return (
        // ... component JSX
    );
};
```

## Testing Checklist

### Basic Functionality
- [ ] Dropdown opens on focus/click
- [ ] Options are displayed correctly
- [ ] Option selection works
- [ ] Dropdown closes after selection
- [ ] Input value updates correctly

### Filtering
- [ ] Options filter based on input
- [ ] Case insensitive filtering
- [ ] No results message shown
- [ ] Performance with large datasets

### Keyboard Navigation
- [ ] Arrow keys navigate options
- [ ] Enter selects option
- [ ] Escape closes dropdown
- [ ] Tab moves focus

### Accessibility
- [ ] Proper ARIA attributes
- [ ] Screen reader compatibility
- [ ] Keyboard navigation
- [ ] Focus management

### Edge Cases
- [ ] Empty options array
- [ ] Disabled options
- [ ] Very long option labels
- [ ] Rapid typing
- [ ] Multiple dropdowns

### Error Handling
- [ ] Invalid input handling
- [ ] Network errors
- [ ] Component unmounting
- [ ] Memory leaks

## Debugging Tools

### Browser DevTools
```javascript
// Check if dropdown is rendered
console.log(document.querySelector('[data-testid="dropdown-options"]'));

// Check event listeners
getEventListeners(document.querySelector('[data-testid="dropdown-input"]'));

// Check CSS styles
const dropdown = document.querySelector('[data-testid="dropdown-options"]');
console.log(getComputedStyle(dropdown));
```

### React DevTools
- Check component state
- Monitor re-renders
- Inspect props
- Check hooks state

### Testing Utilities
```typescript
// Debug test failures
import { screen, debug } from '@testing-library/react';

// Print current DOM state
debug();

// Check specific elements
console.log(screen.getByTestId('dropdown-input').outerHTML);
```

## Common Fixes

### Quick Fixes
1. **Add missing event handlers**
2. **Fix CSS z-index issues**
3. **Implement proper state management**
4. **Add accessibility attributes**
5. **Handle edge cases**

### Performance Optimizations
1. **Implement virtual scrolling**
2. **Add debouncing**
3. **Memoize expensive calculations**
4. **Optimize re-renders**

### Accessibility Improvements
1. **Add ARIA attributes**
2. **Implement keyboard navigation**
3. **Ensure proper focus management**
4. **Test with screen readers**
