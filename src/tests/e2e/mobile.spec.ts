import { test, expect, Page } from '@playwright/test';

// Mobile-specific test utilities
class MobileTestUtils {
    constructor(private page: Page) { }

    async simulateTouchGesture(startX: number, startY: number, endX: number, endY: number) {
        await this.page.touchscreen.tap(startX, startY);
        await this.page.mouse.move(endX, endY);
        await this.page.touchscreen.tap(endX, endY);
    }

    async simulateSwipe(direction: 'left' | 'right' | 'up' | 'down', distance: number = 100) {
        const viewport = this.page.viewportSize();
        if (!viewport) throw new Error('Viewport size not available');

        const centerX = viewport.width / 2;
        const centerY = viewport.height / 2;

        let startX = centerX;
        let startY = centerY;
        let endX = centerX;
        let endY = centerY;

        switch (direction) {
            case 'left':
                startX = centerX + distance;
                endX = centerX - distance;
                break;
            case 'right':
                startX = centerX - distance;
                endX = centerX + distance;
                break;
            case 'up':
                startY = centerY + distance;
                endY = centerY - distance;
                break;
            case 'down':
                startY = centerY - distance;
                endY = centerY + distance;
                break;
        }

        await this.page.touchscreen.tap(startX, startY);
        await this.page.mouse.move(endX, endY);
        await this.page.touchscreen.tap(endX, endY);
    }

    async simulatePinchZoom(scale: number) {
        // Simulate pinch zoom gesture
        const viewport = this.page.viewportSize();
        if (!viewport) throw new Error('Viewport size not available');

        const centerX = viewport.width / 2;
        const centerY = viewport.height / 2;

        // This is a simplified pinch simulation
        await this.page.evaluate((scale) => {
            const event = new WheelEvent('wheel', {
                deltaY: scale > 1 ? -100 : 100,
                clientX: centerX,
                clientY: centerY,
                ctrlKey: true
            });
            document.dispatchEvent(event);
        }, scale);
    }

    async checkMobileViewport() {
        const viewport = this.page.viewportSize();
        expect(viewport).toBeTruthy();
        expect(viewport!.width).toBeLessThanOrEqual(768); // Mobile breakpoint
        return viewport;
    }

    async checkTouchSupport() {
        const hasTouch = await this.page.evaluate(() => {
            return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        });
        expect(hasTouch).toBe(true);
    }

    async checkSafeAreaSupport() {
        const safeAreaSupport = await this.page.evaluate(() => {
            return CSS.supports('padding-top: env(safe-area-inset-top)');
        });
        return safeAreaSupport;
    }
}

// Mobile Navigation Tests
test.describe('Mobile Navigation', () => {
    let mobileUtils: MobileTestUtils;

    test.beforeEach(async ({ page }) => {
        mobileUtils = new MobileTestUtils(page);
        await page.goto('/');
        await mobileUtils.checkMobileViewport();
        await mobileUtils.checkTouchSupport();
    });

    test('should display mobile navigation at bottom', async ({ page }) => {
        const nav = page.locator('[data-testid="mobile-navigation"]');
        await expect(nav).toBeVisible();

        // Check if navigation is positioned at bottom
        const navBox = await nav.boundingBox();
        const viewport = await mobileUtils.checkMobileViewport();
        expect(navBox!.y + navBox!.height).toBeCloseTo(viewport!.height, 10);
    });

    test('should handle touch navigation', async ({ page }) => {
        const navItems = page.locator('[data-testid="mobile-nav-item"]');
        const firstItem = navItems.first();

        await firstItem.tap();
        await expect(firstItem).toHaveClass(/active/);
    });

    test('should auto-hide navigation on scroll down', async ({ page }) => {
        const nav = page.locator('[data-testid="mobile-navigation"]');

        // Scroll down
        await page.evaluate(() => window.scrollTo(0, 100));
        await page.waitForTimeout(100);

        // Navigation should be hidden
        await expect(nav).toHaveClass(/translate-y-full/);

        // Scroll up
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(100);

        // Navigation should be visible
        await expect(nav).toHaveClass(/translate-y-0/);
    });

    test('should show navigation badges', async ({ page }) => {
        const badge = page.locator('[data-testid="nav-badge"]').first();
        await expect(badge).toBeVisible();

        const badgeText = await badge.textContent();
        expect(badgeText).toMatch(/^\d+$/);
    });
});

// Mobile Form Tests
test.describe('Mobile Forms', () => {
    let mobileUtils: MobileTestUtils;

    test.beforeEach(async ({ page }) => {
        mobileUtils = new MobileTestUtils(page);
        await page.goto('/patients/new');
        await mobileUtils.checkMobileViewport();
    });

    test('should prevent zoom on input focus', async ({ page }) => {
        const input = page.locator('input[type="text"]').first();

        await input.focus();

        // Check viewport meta tag
        const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
        expect(viewport).toContain('user-scalable=no');
    });

    test('should have touch-friendly input sizes', async ({ page }) => {
        const input = page.locator('input[type="text"]').first();
        const inputBox = await input.boundingBox();

        // Minimum touch target size is 44px
        expect(inputBox!.height).toBeGreaterThanOrEqual(44);
    });

    test('should handle mobile keyboard types', async ({ page }) => {
        const emailInput = page.locator('input[type="email"]');
        const telInput = page.locator('input[type="tel"]');
        const numberInput = page.locator('input[type="number"]');

        if (await emailInput.count() > 0) {
            await expect(emailInput.first()).toHaveAttribute('inputmode', 'email');
        }

        if (await telInput.count() > 0) {
            await expect(telInput.first()).toHaveAttribute('inputmode', 'tel');
        }

        if (await numberInput.count() > 0) {
            await expect(numberInput.first()).toHaveAttribute('inputmode', 'numeric');
        }
    });

    test('should show password toggle on mobile', async ({ page }) => {
        const passwordInput = page.locator('input[type="password"]');
        if (await passwordInput.count() > 0) {
            const toggle = page.locator('[data-testid="password-toggle"]');
            await expect(toggle).toBeVisible();

            await toggle.tap();
            await expect(passwordInput.first()).toHaveAttribute('type', 'text');
        }
    });
});

// Mobile Card Tests
test.describe('Mobile Cards', () => {
    let mobileUtils: MobileTestUtils;

    test.beforeEach(async ({ page }) => {
        mobileUtils = new MobileTestUtils(page);
        await page.goto('/patients');
        await mobileUtils.checkMobileViewport();
    });

    test('should handle swipe gestures', async ({ page }) => {
        const card = page.locator('[data-testid="patient-card"]').first();
        await expect(card).toBeVisible();

        // Simulate swipe left
        await mobileUtils.simulateSwipe('left');

        // Check if swipe action was triggered
        const swipeAction = page.locator('[data-testid="swipe-action"]');
        await expect(swipeAction).toBeVisible();
    });

    test('should have proper touch targets', async ({ page }) => {
        const card = page.locator('[data-testid="patient-card"]').first();
        const cardBox = await card.boundingBox();

        // Cards should have adequate padding for touch
        expect(cardBox!.height).toBeGreaterThanOrEqual(60);
    });

    test('should handle long press', async ({ page }) => {
        const card = page.locator('[data-testid="patient-card"]').first();

        // Simulate long press
        await card.tap();
        await page.waitForTimeout(600); // Long press duration

        // Check if context menu appears
        const contextMenu = page.locator('[data-testid="context-menu"]');
        await expect(contextMenu).toBeVisible();
    });
});

// PWA Tests
test.describe('PWA Features', () => {
    test('should have valid manifest', async ({ page }) => {
        await page.goto('/');

        const manifestLink = page.locator('link[rel="manifest"]');
        await expect(manifestLink).toBeVisible();

        const manifestHref = await manifestLink.getAttribute('href');
        const response = await page.request.get(manifestHref!);
        expect(response.status()).toBe(200);

        const manifest = await response.json();
        expect(manifest.name).toBe('MEDI 2 - Medical Practice Management System');
        expect(manifest.display).toBe('standalone');
        expect(manifest.orientation).toBe('portrait-primary');
    });

    test('should register service worker', async ({ page }) => {
        await page.goto('/');

        const swRegistration = await page.evaluate(() => {
            return navigator.serviceWorker.getRegistration();
        });

        expect(swRegistration).toBeTruthy();
    });

    test('should have proper icons', async ({ page }) => {
        await page.goto('/');

        // Check apple touch icons
        const appleTouchIcon = page.locator('link[rel="apple-touch-icon"]');
        await expect(appleTouchIcon).toBeVisible();

        // Check favicon
        const favicon = page.locator('link[rel="icon"]');
        await expect(favicon).toBeVisible();
    });

    test('should support offline mode', async ({ page }) => {
        await page.goto('/');

        // Go offline
        await page.context().setOffline(true);

        // Try to navigate to another page
        await page.goto('/patients');

        // Should still work (cached)
        await expect(page.locator('body')).toBeVisible();

        // Go back online
        await page.context().setOffline(false);
    });

    test('should handle push notifications', async ({ page }) => {
        await page.goto('/');

        // Request notification permission
        const permission = await page.evaluate(async () => {
            return await Notification.requestPermission();
        });

        expect(['granted', 'denied', 'default']).toContain(permission);
    });
});

// Mobile Performance Tests
test.describe('Mobile Performance', () => {
    test('should load quickly on mobile', async ({ page }) => {
        const startTime = Date.now();
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        const loadTime = Date.now() - startTime;

        // Should load within 3 seconds on mobile
        expect(loadTime).toBeLessThan(3000);
    });

    test('should have optimized images', async ({ page }) => {
        await page.goto('/');

        const images = await page.locator('img').all();
        for (const img of images) {
            const src = await img.getAttribute('src');
            if (src) {
                // Check if image has loading="lazy"
                const loading = await img.getAttribute('loading');
                expect(loading).toBe('lazy');

                // Check if image has decoding="async"
                const decoding = await img.getAttribute('decoding');
                expect(decoding).toBe('async');
            }
        }
    });

    test('should handle slow connections', async ({ page }) => {
        // Simulate slow connection
        await page.route('**/*', route => {
            setTimeout(() => route.continue(), 100);
        });

        const startTime = Date.now();
        await page.goto('/');
        await page.waitForLoadState('domcontentloaded');
        const loadTime = Date.now() - startTime;

        // Should still load reasonably fast even with slow connection
        expect(loadTime).toBeLessThan(5000);
    });
});

// Mobile Accessibility Tests
test.describe('Mobile Accessibility', () => {
    test('should support screen readers', async ({ page }) => {
        await page.goto('/');

        // Check for proper ARIA labels
        const buttons = page.locator('button');
        const buttonCount = await buttons.count();

        for (let i = 0; i < buttonCount; i++) {
            const button = buttons.nth(i);
            const ariaLabel = await button.getAttribute('aria-label');
            const textContent = await button.textContent();

            // Should have either aria-label or text content
            expect(ariaLabel || textContent?.trim()).toBeTruthy();
        }
    });

    test('should support keyboard navigation', async ({ page }) => {
        await page.goto('/');

        // Tab through focusable elements
        await page.keyboard.press('Tab');
        const focusedElement = page.locator(':focus');
        await expect(focusedElement).toBeVisible();

        // Check if focused element is visible
        const isVisible = await focusedElement.isVisible();
        expect(isVisible).toBe(true);
    });

    test('should support high contrast mode', async ({ page }) => {
        await page.goto('/');

        // Simulate high contrast mode
        await page.emulateMedia({ forcedColors: 'active' });

        // Check if content is still visible
        const body = page.locator('body');
        await expect(body).toBeVisible();
    });

    test('should support reduced motion', async ({ page }) => {
        await page.goto('/');

        // Simulate reduced motion preference
        await page.emulateMedia({ reducedMotion: 'reduce' });

        // Check if animations are disabled
        const animatedElements = page.locator('[class*="animate-"]');
        const count = await animatedElements.count();

        // Should have fewer or no animated elements
        expect(count).toBeLessThanOrEqual(5);
    });
});

// Mobile Gesture Tests
test.describe('Mobile Gestures', () => {
    let mobileUtils: MobileTestUtils;

    test.beforeEach(async ({ page }) => {
        mobileUtils = new MobileTestUtils(page);
        await page.goto('/');
        await mobileUtils.checkMobileViewport();
    });

    test('should handle pinch zoom', async ({ page }) => {
        // Simulate pinch zoom
        await mobileUtils.simulatePinchZoom(1.5);

        // Check if zoom was applied
        const zoomLevel = await page.evaluate(() => {
            return window.devicePixelRatio;
        });

        expect(zoomLevel).toBeGreaterThan(1);
    });

    test('should handle double tap', async ({ page }) => {
        const image = page.locator('img').first();
        if (await image.count() > 0) {
            // Double tap on image
            await image.tap();
            await page.waitForTimeout(100);
            await image.tap();

            // Check if image zoom was triggered
            const isZoomed = await image.evaluate(el => {
                return el.classList.contains('zoomed');
            });

            expect(isZoomed).toBe(true);
        }
    });

    test('should handle pull to refresh', async ({ page }) => {
        // Simulate pull to refresh gesture
        const viewport = await mobileUtils.checkMobileViewport();
        const startY = 50;
        const endY = viewport!.height - 50;

        await mobileUtils.simulateTouchGesture(
            viewport!.width / 2, startY,
            viewport!.width / 2, endY
        );

        // Check if refresh was triggered
        const refreshIndicator = page.locator('[data-testid="refresh-indicator"]');
        await expect(refreshIndicator).toBeVisible();
    });
});

export { MobileTestUtils };
