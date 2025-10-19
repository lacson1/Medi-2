// Mobile Accessibility Enhancements
export class MobileAccessibilityManager {
    private static instance: MobileAccessibilityManager;
    private isEnabled: boolean = false;
    private currentFocusIndex: number = -1;
    private focusableElements: HTMLElement[] = [];
    private touchStartTime: number = 0;
    private touchEndTime: number = 0;

    constructor() {
        this.initializeAccessibility();
    }

    static getInstance(): MobileAccessibilityManager {
        if (!MobileAccessibilityManager.instance) {
            MobileAccessibilityManager.instance = new MobileAccessibilityManager();
        }
        return MobileAccessibilityManager.instance;
    }

    private initializeAccessibility(): void {
        // Check if accessibility features should be enabled
        this.isEnabled = this.shouldEnableAccessibility();

        if (this.isEnabled) {
            this.setupKeyboardNavigation();
            this.setupTouchAccessibility();
            this.setupScreenReaderSupport();
            this.setupHighContrastMode();
            this.setupReducedMotion();
        }
    }

    private shouldEnableAccessibility(): boolean {
        // Check for accessibility preferences
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
        const prefersColorScheme = window.matchMedia('(prefers-color-scheme: dark)').matches;

        // Check for assistive technologies
        const hasScreenReader = this.detectScreenReader();
        const hasVoiceOver = this.detectVoiceOver();

        return prefersReducedMotion || prefersHighContrast || hasScreenReader || hasVoiceOver;
    }

    private detectScreenReader(): boolean {
        // Basic screen reader detection
        return window.speechSynthesis !== undefined ||
            'speechSynthesis' in window ||
            navigator.userAgent.includes('NVDA') ||
            navigator.userAgent.includes('JAWS');
    }

    private detectVoiceOver(): boolean {
        // VoiceOver detection for iOS
        return /iPad|iPhone|iPod/.test(navigator.userAgent) &&
            'ontouchstart' in window;
    }

    private setupKeyboardNavigation(): void {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                this.handleTabNavigation(e);
            } else if (e.key === 'Enter' || e.key === ' ') {
                this.handleActivation(e);
            } else if (e.key === 'Escape') {
                this.handleEscape(e);
            }
        });

        // Update focusable elements when DOM changes
        this.updateFocusableElements();
    }

    private setupTouchAccessibility(): void {
        // Enhanced touch interactions for accessibility
        document.addEventListener('touchstart', (e) => {
            this.touchStartTime = Date.now();
            this.handleTouchStart(e);
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            this.touchEndTime = Date.now();
            this.handleTouchEnd(e);
        }, { passive: true });

        // Long press detection for context menus
        let longPressTimer: NodeJS.Timeout;

        document.addEventListener('touchstart', (e) => {
            longPressTimer = setTimeout(() => {
                this.handleLongPress(e);
            }, 500);
        });

        document.addEventListener('touchend', () => {
            clearTimeout(longPressTimer);
        });

        document.addEventListener('touchmove', () => {
            clearTimeout(longPressTimer);
        });
    }

    private setupScreenReaderSupport(): void {
        // Announce dynamic content changes
        this.createLiveRegion();

        // Enhance form labels
        this.enhanceFormLabels();

        // Add ARIA landmarks
        this.addAriaLandmarks();
    }

    private setupHighContrastMode(): void {
        const mediaQuery = window.matchMedia('(prefers-contrast: high)');

        const handleContrastChange = (e: MediaQueryListEvent) => {
            if (e.matches) {
                document.body.classList.add('high-contrast');
            } else {
                document.body.classList.remove('high-contrast');
            }
        };

        mediaQuery.addEventListener('change', handleContrastChange);
        handleContrastChange(mediaQuery);
    }

    private setupReducedMotion(): void {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

        const handleMotionChange = (e: MediaQueryListEvent) => {
            if (e.matches) {
                document.body.classList.add('reduced-motion');
            } else {
                document.body.classList.remove('reduced-motion');
            }
        };

        mediaQuery.addEventListener('change', handleMotionChange);
        handleMotionChange(mediaQuery);
    }

    private handleTabNavigation(e: KeyboardEvent): void {
        this.updateFocusableElements();

        if (e.shiftKey) {
            // Shift + Tab (backward)
            this.currentFocusIndex = Math.max(0, this.currentFocusIndex - 1);
        } else {
            // Tab (forward)
            this.currentFocusIndex = Math.min(this.focusableElements.length - 1, this.currentFocusIndex + 1);
        }

        if (this.focusableElements[this.currentFocusIndex]) {
            this.focusableElements[this.currentFocusIndex].focus();
            e.preventDefault();
        }
    }

    private handleActivation(e: KeyboardEvent): void {
        const target = e.target as HTMLElement;

        if (target.tagName === 'BUTTON' || target.getAttribute('role') === 'button') {
            // Button activation
            target.click();
        } else if (target.tagName === 'A') {
            // Link activation
            (target as HTMLAnchorElement).click();
        }
    }

    private handleEscape(e: KeyboardEvent): void {
        // Close modals, dropdowns, etc.
        const modals = document.querySelectorAll('[role="dialog"]');
        modals.forEach(modal => {
            if (modal.getAttribute('aria-hidden') === 'false') {
                const closeButton = modal.querySelector('[aria-label*="close"], [aria-label*="Close"]');
                if (closeButton) {
                    (closeButton as HTMLElement).click();
                }
            }
        });
    }

    private handleTouchStart(e: TouchEvent): void {
        const target = e.target as HTMLElement;

        // Add visual feedback for touch
        target.classList.add('touch-active');

        // Announce touch target if it's interactive
        if (this.isInteractiveElement(target)) {
            this.announceToScreenReader(`Touched ${this.getElementDescription(target)}`);
        }
    }

    private handleTouchEnd(e: TouchEvent): void {
        const target = e.target as HTMLElement;

        // Remove visual feedback
        target.classList.remove('touch-active');

        // Handle double tap for zoom
        const touchDuration = this.touchEndTime - this.touchStartTime;
        if (touchDuration < 300) {
            this.handleDoubleTap(e);
        }
    }

    private handleLongPress(e: TouchEvent): void {
        const target = e.target as HTMLElement;

        // Show context menu or additional options
        this.showContextMenu(target, e);
    }

    private handleDoubleTap(e: TouchEvent): void {
        const target = e.target as HTMLElement;

        // Handle double tap zoom for images
        if (target.tagName === 'IMG') {
            this.toggleImageZoom(target as HTMLImageElement);
        }
    }

    private updateFocusableElements(): void {
        this.focusableElements = Array.from(document.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ));
    }

    private isInteractiveElement(element: HTMLElement): boolean {
        const interactiveTags = ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'];
        const interactiveRoles = ['button', 'link', 'menuitem', 'tab'];

        return interactiveTags.includes(element.tagName) ||
            interactiveRoles.includes(element.getAttribute('role') || '');
    }

    private getElementDescription(element: HTMLElement): string {
        // Get accessible name for element
        const ariaLabel = element.getAttribute('aria-label');
        const ariaLabelledBy = element.getAttribute('aria-labelledby');
        const title = element.getAttribute('title');
        const textContent = element.textContent?.trim();

        return ariaLabel ||
            (ariaLabelledBy ? document.getElementById(ariaLabelledBy)?.textContent : '') ||
            title ||
            textContent ||
            element.tagName.toLowerCase();
    }

    private createLiveRegion(): void {
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        liveRegion.id = 'live-region';
        document.body.appendChild(liveRegion);
    }

    private announceToScreenReader(message: string): void {
        const liveRegion = document.getElementById('live-region');
        if (liveRegion) {
            liveRegion.textContent = message;

            // Clear after announcement
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 1000);
        }
    }

    private enhanceFormLabels(): void {
        const inputs = document.querySelectorAll('input, select, textarea');

        inputs.forEach(input => {
            const inputElement = input as HTMLInputElement;

            // Ensure proper labeling
            if (!inputElement.getAttribute('aria-label') &&
                !inputElement.getAttribute('aria-labelledby') &&
                !inputElement.id) {

                // Generate unique ID
                const id = `input-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                inputElement.id = id;

                // Find associated label
                const label = inputElement.closest('label') ||
                    document.querySelector(`label[for="${id}"]`);

                if (label) {
                    label.setAttribute('for', id);
                }
            }

            // Add error handling
            if (inputElement.hasAttribute('required')) {
                inputElement.setAttribute('aria-required', 'true');
            }

            if (inputElement.hasAttribute('aria-invalid')) {
                this.setupErrorAnnouncement(inputElement);
            }
        });
    }

    private setupErrorAnnouncement(input: HTMLInputElement): void {
        const errorElement = input.closest('.form-field')?.querySelector('.error-message');

        if (errorElement) {
            const errorId = `error-${input.id}`;
            errorElement.id = errorId;
            input.setAttribute('aria-describedby', errorId);
        }
    }

    private addAriaLandmarks(): void {
        // Add main landmark
        const main = document.querySelector('main') || document.querySelector('[role="main"]');
        if (!main) {
            const content = document.querySelector('#root > div');
            if (content) {
                content.setAttribute('role', 'main');
            }
        }

        // Add navigation landmarks
        const navs = document.querySelectorAll('nav');
        navs.forEach((nav, index) => {
            if (!nav.getAttribute('aria-label') && !nav.getAttribute('aria-labelledby')) {
                nav.setAttribute('aria-label', `Navigation ${index + 1}`);
            }
        });
    }

    private showContextMenu(element: HTMLElement, event: TouchEvent): void {
        // Create context menu for long press
        const contextMenu = document.createElement('div');
        contextMenu.className = 'mobile-context-menu';
        contextMenu.setAttribute('role', 'menu');
        contextMenu.setAttribute('aria-label', 'Context menu');

        // Add context menu items based on element type
        const menuItems = this.getContextMenuItems(element);

        menuItems.forEach(item => {
            const menuItem = document.createElement('button');
            menuItem.textContent = item.label;
            menuItem.setAttribute('role', 'menuitem');
            menuItem.onclick = item.action;
            contextMenu.appendChild(menuItem);
        });

        // Position and show context menu
        const rect = element.getBoundingClientRect();
        contextMenu.style.position = 'fixed';
        contextMenu.style.left = `${event.touches[0].clientX}px`;
        contextMenu.style.top = `${event.touches[0].clientY}px`;
        contextMenu.style.zIndex = '9999';

        document.body.appendChild(contextMenu);

        // Remove context menu on outside touch
        const removeMenu = () => {
            document.body.removeChild(contextMenu);
            document.removeEventListener('touchstart', removeMenu);
        };

        setTimeout(() => {
            document.addEventListener('touchstart', removeMenu);
        }, 100);
    }

    private getContextMenuItems(element: HTMLElement): Array<{ label: string, action: () => void }> {
        const items = [];

        if (element.tagName === 'IMG') {
            items.push({
                label: 'Save Image',
                action: () => this.saveImage(element as HTMLImageElement)
            });
            items.push({
                label: 'Copy Image',
                action: () => this.copyImage(element as HTMLImageElement)
            });
        }

        if (element.tagName === 'A') {
            items.push({
                label: 'Open in New Tab',
                action: () => window.open((element as HTMLAnchorElement).href, '_blank')
            });
            items.push({
                label: 'Copy Link',
                action: () => this.copyLink(element as HTMLAnchorElement)
            });
        }

        items.push({
            label: 'Close',
            action: () => { }
        });

        return items;
    }

    private toggleImageZoom(img: HTMLImageElement): void {
        if (img.classList.contains('zoomed')) {
            img.classList.remove('zoomed');
            img.style.transform = '';
        } else {
            img.classList.add('zoomed');
            img.style.transform = 'scale(2)';
        }
    }

    private saveImage(img: HTMLImageElement): void {
        // Implement image saving
        const link = document.createElement('a');
        link.download = 'image.png';
        link.href = img.src;
        link.click();
    }

    private copyImage(img: HTMLImageElement): void {
        // Implement image copying
        navigator.clipboard.writeText(img.src);
    }

    private copyLink(link: HTMLAnchorElement): void {
        navigator.clipboard.writeText(link.href);
    }

    // Public methods
    public enableAccessibility(): void {
        this.isEnabled = true;
        this.initializeAccessibility();
    }

    public disableAccessibility(): void {
        this.isEnabled = false;
        // Remove accessibility enhancements
    }

    public announce(message: string): void {
        this.announceToScreenReader(message);
    }

    public setFocus(element: HTMLElement): void {
        element.focus();
        this.currentFocusIndex = this.focusableElements.indexOf(element);
    }

    public getAccessibilityInfo(): any {
        return {
            isEnabled: this.isEnabled,
            hasScreenReader: this.detectScreenReader(),
            hasVoiceOver: this.detectVoiceOver(),
            prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
            prefersHighContrast: window.matchMedia('(prefers-contrast: high)').matches,
            focusableElementsCount: this.focusableElements.length,
            currentFocusIndex: this.currentFocusIndex
        };
    }
}

// Initialize mobile accessibility
export const initializeMobileAccessibility = (): MobileAccessibilityManager => {
    return MobileAccessibilityManager.getInstance();
};

// Accessibility utility functions
export const accessibilityUtils = {
    // Create accessible button
    createAccessibleButton: (text: string, onClick: () => void, options: any = {}) => {
        const button = document.createElement('button');
        button.textContent = text;
        button.onclick = onClick;

        if (options.ariaLabel) button.setAttribute('aria-label', options.ariaLabel);
        if (options.ariaDescribedBy) button.setAttribute('aria-describedby', options.ariaDescribedBy);
        if (options.disabled) button.disabled = options.disabled;

        return button;
    },

    // Create accessible link
    createAccessibleLink: (text: string, href: string, options: any = {}) => {
        const link = document.createElement('a');
        link.textContent = text;
        link.href = href;

        if (options.ariaLabel) link.setAttribute('aria-label', options.ariaLabel);
        if (options.target) link.target = options.target;
        if (options.rel) link.rel = options.rel;

        return link;
    },

    // Create accessible form field
    createAccessibleFormField: (label: string, type: string = 'text', options: any = {}) => {
        const fieldset = document.createElement('fieldset');
        const labelElement = document.createElement('label');
        const input = document.createElement('input');

        const id = `field-${Date.now()}`;
        input.id = id;
        input.type = type;
        labelElement.setAttribute('for', id);
        labelElement.textContent = label;

        if (options.required) {
            input.required = true;
            input.setAttribute('aria-required', 'true');
        }

        if (options.placeholder) input.placeholder = options.placeholder;
        if (options.value) input.value = options.value;

        fieldset.appendChild(labelElement);
        fieldset.appendChild(input);

        return fieldset;
    },

    // Check if element is visible to screen readers
    isVisibleToScreenReader: (element: HTMLElement): boolean => {
        const style = window.getComputedStyle(element);
        return style.display !== 'none' &&
            style.visibility !== 'hidden' &&
            element.getAttribute('aria-hidden') !== 'true';
    },

    // Get accessible name for element
    getAccessibleName: (element: HTMLElement): string => {
        const ariaLabel = element.getAttribute('aria-label');
        const ariaLabelledBy = element.getAttribute('aria-labelledby');
        const title = element.getAttribute('title');
        const textContent = element.textContent?.trim();

        return ariaLabel ||
            (ariaLabelledBy ? document.getElementById(ariaLabelledBy)?.textContent : '') ||
            title ||
            textContent ||
            element.tagName.toLowerCase();
    }
};

export default MobileAccessibilityManager;
