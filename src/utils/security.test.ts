/**
 * Comprehensive tests for security utilities
 * Tests all sanitization, validation, and security features
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    sanitizer,
    csrfProtection,
    fileValidator,
    sessionManager,
    cspUtils,
    xssProtection,
    securityHeaders,
    initSecurity,
} from './security';

describe('sanitizer', () => {
    describe('sanitizeHtml', () => {
        it('should allow basic formatting tags', () => {
            const input = '<p><strong>Bold</strong> and <em>italic</em> text</p>';
            const result = sanitizer.sanitizeHtml(input);
            expect(result).toContain('strong');
            expect(result).toContain('em');
        });

        it('should remove dangerous tags', () => {
            const input = '<script>alert("xss")</script><p>Safe text</p>';
            const result = sanitizer.sanitizeHtml(input);
            expect(result).not.toContain('script');
            expect(result).toContain('Safe text');
        });

        it('should remove event handlers', () => {
            const input = '<p onclick="alert(1)">Text</p>';
            const result = sanitizer.sanitizeHtml(input);
            expect(result).not.toContain('onclick');
        });

        it('should remove dangerous attributes', () => {
            const input = '<img src="x" onerror="alert(1)">';
            const result = sanitizer.sanitizeHtml(input);
            expect(result).not.toContain('onerror');
        });
    });

    describe('sanitizeText', () => {
        it('should remove HTML tags', () => {
            const result = sanitizer.sanitizeText('<script>alert(1)</script>');
            expect(result).not.toContain('<');
            expect(result).not.toContain('>');
        });

        it('should remove javascript: protocol', () => {
            const result = sanitizer.sanitizeText('javascript:alert(1)');
            expect(result).not.toContain('javascript:');
        });

        it('should remove event handlers', () => {
            const result = sanitizer.sanitizeText('onclick=alert(1)');
            expect(result).not.toContain('onclick=');
        });

        it('should handle non-string input', () => {
            expect(sanitizer.sanitizeText(null)).toBe('');
            expect(sanitizer.sanitizeText(undefined)).toBe('');
            expect(sanitizer.sanitizeText(123)).toBe('');
            expect(sanitizer.sanitizeText({})).toBe('');
        });

        it('should trim whitespace', () => {
            const result = sanitizer.sanitizeText('  test  ');
            expect(result).toBe('test');
        });
    });

    describe('sanitizeFileName', () => {
        it('should replace special characters with underscore', () => {
            const result = sanitizer.sanitizeFileName('file@#$%name.pdf');
            expect(result).toBe('file____name.pdf');
        });

        it('should remove multiple consecutive dots', () => {
            const result = sanitizer.sanitizeFileName('file...name.pdf');
            expect(result).toBe('file.name.pdf');
        });

        it('should remove leading dots', () => {
            const result = sanitizer.sanitizeFileName('.hidden_file.txt');
            expect(result).toBe('hidden_file.txt');
        });

        it('should limit length to 255 characters', () => {
            const longName = 'a'.repeat(300) + '.txt';
            const result = sanitizer.sanitizeFileName(longName);
            expect(result.length).toBeLessThanOrEqual(255);
        });

        it('should handle non-string input', () => {
            expect(sanitizer.sanitizeFileName(null)).toBe('');
            expect(sanitizer.sanitizeFileName(123)).toBe('');
        });
    });

    describe('sanitizeUrl', () => {
        it('should allow valid HTTP URLs', () => {
            const url = 'http://example.com/path';
            const result = sanitizer.sanitizeUrl(url);
            expect(result).toBe(url);
        });

        it('should allow valid HTTPS URLs', () => {
            const url = 'https://example.com/path';
            const result = sanitizer.sanitizeUrl(url);
            expect(result).toBe(url);
        });

        it('should reject javascript: protocol', () => {
            const result = sanitizer.sanitizeUrl('javascript:alert(1)');
            expect(result).toBe('');
        });

        it('should reject data: URLs', () => {
            const result = sanitizer.sanitizeUrl('data:text/html,<script>alert(1)</script>');
            expect(result).toBe('');
        });

        it('should reject file: protocol', () => {
            const result = sanitizer.sanitizeUrl('file:///etc/passwd');
            expect(result).toBe('');
        });

        it('should handle invalid URLs', () => {
            expect(sanitizer.sanitizeUrl('not a url')).toBe('');
            expect(sanitizer.sanitizeUrl('')).toBe('');
        });

        it('should handle non-string input', () => {
            expect(sanitizer.sanitizeUrl(null)).toBe('');
            expect(sanitizer.sanitizeUrl(123)).toBe('');
        });
    });

    describe('sanitizeEmail', () => {
        it('should accept valid email addresses', () => {
            expect(sanitizer.sanitizeEmail('user@example.com')).toBe('user@example.com');
            expect(sanitizer.sanitizeEmail('test.user+tag@domain.co.uk')).toBe('test.user+tag@domain.co.uk');
        });

        it('should convert to lowercase', () => {
            expect(sanitizer.sanitizeEmail('User@Example.COM')).toBe('user@example.com');
        });

        it('should trim whitespace', () => {
            expect(sanitizer.sanitizeEmail('  user@example.com  ')).toBe('user@example.com');
        });

        it('should reject invalid emails', () => {
            expect(sanitizer.sanitizeEmail('notanemail')).toBe('');
            expect(sanitizer.sanitizeEmail('@example.com')).toBe('');
            expect(sanitizer.sanitizeEmail('user@')).toBe('');
            expect(sanitizer.sanitizeEmail('user @example.com')).toBe('');
        });

        it('should handle non-string input', () => {
            expect(sanitizer.sanitizeEmail(null)).toBe('');
            expect(sanitizer.sanitizeEmail(123)).toBe('');
        });
    });

    describe('sanitizePhone', () => {
        it('should allow digits and common phone characters', () => {
            expect(sanitizer.sanitizePhone('(123) 456-7890')).toBe('(123) 456-7890');
            expect(sanitizer.sanitizePhone('+1-123-456-7890')).toBe('+1-123-456-7890');
        });

        it('should remove letters and special characters', () => {
            expect(sanitizer.sanitizePhone('123-ABC-4567')).toBe('123--4567');
            expect(sanitizer.sanitizePhone('123#456*7890')).toBe('1234567890');
        });

        it('should trim whitespace', () => {
            expect(sanitizer.sanitizePhone('  123-456-7890  ')).toBe('123-456-7890');
        });

        it('should handle non-string input', () => {
            expect(sanitizer.sanitizePhone(null)).toBe('');
            expect(sanitizer.sanitizePhone(123)).toBe('');
        });
    });
});

describe('csrfProtection', () => {
    beforeEach(() => {
        sessionStorage.clear();
    });

    describe('generateToken', () => {
        it('should generate a 64-character hex string', () => {
            const token = csrfProtection.generateToken();
            expect(token).toMatch(/^[0-9a-f]{64}$/);
        });

        it('should generate unique tokens', () => {
            const token1 = csrfProtection.generateToken();
            const token2 = csrfProtection.generateToken();
            expect(token1).not.toBe(token2);
        });
    });

    describe('storeToken and getToken', () => {
        it('should store and retrieve token', () => {
            const token = 'test-token-123';
            csrfProtection.storeToken(token);
            expect(csrfProtection.getToken()).toBe(token);
        });

        it('should return null when no token is stored', () => {
            expect(csrfProtection.getToken()).toBeNull();
        });
    });

    describe('validateToken', () => {
        it('should validate matching tokens', () => {
            const token = csrfProtection.generateToken();
            csrfProtection.storeToken(token);
            expect(csrfProtection.validateToken(token)).toBe(true);
        });

        it('should reject non-matching tokens', () => {
            csrfProtection.storeToken('token1');
            expect(csrfProtection.validateToken('token2')).toBe(false);
        });

        it('should reject when no token is stored', () => {
            expect(csrfProtection.validateToken('any-token')).toBe(false);
        });
    });

    describe('addToHeaders', () => {
        it('should add CSRF token to headers', () => {
            const token = 'test-csrf-token';
            csrfProtection.storeToken(token);
            const headers = csrfProtection.addToHeaders();
            expect(headers['X-CSRF-Token']).toBe(token);
        });

        it('should preserve existing headers', () => {
            const token = 'test-csrf-token';
            csrfProtection.storeToken(token);
            const existing = { 'Content-Type': 'application/json' };
            const headers = csrfProtection.addToHeaders(existing);
            expect(headers['Content-Type']).toBe('application/json');
            expect(headers['X-CSRF-Token']).toBe(token);
        });

        it('should not add header when no token exists', () => {
            const headers = csrfProtection.addToHeaders();
            expect(headers['X-CSRF-Token']).toBeUndefined();
        });
    });
});

describe('fileValidator', () => {
    describe('validateType', () => {
        it('should accept valid image types', () => {
            const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
            expect(fileValidator.validateType(file, 'image')).toBe(true);
        });

        it('should accept valid document types', () => {
            const file = new File([''], 'test.pdf', { type: 'application/pdf' });
            expect(fileValidator.validateType(file, 'document')).toBe(true);
        });

        it('should reject invalid types', () => {
            const file = new File([''], 'test.exe', { type: 'application/x-msdownload' });
            expect(fileValidator.validateType(file, 'image')).toBe(false);
        });
    });

    describe('validateSize', () => {
        it('should accept files within size limit', () => {
            const file = new File(['a'.repeat(1024 * 1024)], 'test.jpg', { type: 'image/jpeg' });
            expect(fileValidator.validateSize(file, 'image')).toBe(true);
        });

        it('should reject files exceeding size limit', () => {
            const file = new File(['a'.repeat(10 * 1024 * 1024)], 'test.jpg', { type: 'image/jpeg' });
            expect(fileValidator.validateSize(file, 'image')).toBe(false);
        });
    });

    describe('validateFile', () => {
        it('should pass valid files', () => {
            const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
            const result = fileValidator.validateFile(file, 'document');
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should detect invalid file type', () => {
            const file = new File(['test'], 'test.txt', { type: 'text/plain' });
            const result = fileValidator.validateFile(file, 'image');
            expect(result.isValid).toBe(false);
            expect(result.errors.some(e => e.includes('Invalid file type'))).toBe(true);
        });

        it('should detect file size violations', () => {
            const file = new File(['a'.repeat(20 * 1024 * 1024)], 'test.pdf', { type: 'application/pdf' });
            const result = fileValidator.validateFile(file, 'document');
            expect(result.isValid).toBe(false);
            expect(result.errors.some(e => e.includes('too large'))).toBe(true);
        });

        it('should detect malicious file extensions', () => {
            const file = new File(['test'], 'malware.exe', { type: 'application/pdf' });
            const result = fileValidator.validateFile(file, 'document');
            expect(result.isValid).toBe(false);
            expect(result.errors.some(e => e.includes('security reasons'))).toBe(true);
        });

        it('should detect all violations at once', () => {
            const file = new File(['a'.repeat(20 * 1024 * 1024)], 'bad.exe', { type: 'application/x-msdownload' });
            const result = fileValidator.validateFile(file, 'image');
            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(1);
        });
    });
});

describe('sessionManager', () => {
    beforeEach(() => {
        vi.clearAllTimers();
        vi.useFakeTimers();
        sessionStorage.clear();
        localStorage.clear();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('extend', () => {
        it('should update last activity timestamp', () => {
            const initialTime = sessionManager.lastActivity;
            vi.advanceTimersByTime(1000);
            sessionManager.extend();
            expect(sessionManager.lastActivity).toBeGreaterThan(initialTime);
        });
    });
});

describe('cspUtils', () => {
    describe('generateNonce', () => {
        it('should generate a 32-character hex string', () => {
            const nonce = cspUtils.generateNonce();
            expect(nonce).toMatch(/^[0-9a-f]{32}$/);
        });

        it('should generate unique nonces', () => {
            const nonce1 = cspUtils.generateNonce();
            const nonce2 = cspUtils.generateNonce();
            expect(nonce1).not.toBe(nonce2);
        });
    });

    describe('getNonce', () => {
        beforeEach(() => {
            // Clean up any existing meta tags
            document.querySelectorAll('meta[name="csp-nonce"]').forEach(el => el.remove());
        });

        it('should return empty string when no nonce meta tag exists', () => {
            expect(cspUtils.getNonce()).toBe('');
        });

        it('should retrieve nonce from meta tag', () => {
            const meta = document.createElement('meta');
            meta.name = 'csp-nonce';
            meta.content = 'test-nonce-123';
            document.head.appendChild(meta);

            expect(cspUtils.getNonce()).toBe('test-nonce-123');

            // Cleanup
            meta.remove();
        });
    });

    describe('validateNonce', () => {
        beforeEach(() => {
            document.querySelectorAll('meta[name="csp-nonce"]').forEach(el => el.remove());
        });

        it('should validate matching nonce', () => {
            const meta = document.createElement('meta');
            meta.name = 'csp-nonce';
            meta.content = 'test-nonce';
            document.head.appendChild(meta);

            expect(cspUtils.validateNonce('test-nonce')).toBe(true);

            meta.remove();
        });

        it('should reject non-matching nonce', () => {
            const meta = document.createElement('meta');
            meta.name = 'csp-nonce';
            meta.content = 'test-nonce';
            document.head.appendChild(meta);

            expect(cspUtils.validateNonce('wrong-nonce')).toBe(false);

            meta.remove();
        });

        it('should return false when no nonce exists', () => {
            expect(cspUtils.validateNonce('any-nonce')).toBe(false);
        });
    });
});

describe('xssProtection', () => {
    describe('escapeHtml', () => {
        it('should escape HTML entities', () => {
            expect(xssProtection.escapeHtml('&')).toBe('&amp;');
            expect(xssProtection.escapeHtml('<')).toBe('&lt;');
            expect(xssProtection.escapeHtml('>')).toBe('&gt;');
            expect(xssProtection.escapeHtml('"')).toBe('&quot;');
            expect(xssProtection.escapeHtml("'")).toBe('&#039;');
        });

        it('should escape multiple entities', () => {
            const input = '<script>alert("XSS")</script>';
            const expected = '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;';
            expect(xssProtection.escapeHtml(input)).toBe(expected);
        });

        it('should handle non-string input', () => {
            expect(xssProtection.escapeHtml(null)).toBe('');
            expect(xssProtection.escapeHtml(123)).toBe('');
        });
    });

    describe('validateInput', () => {
        it('should sanitize text input by default', () => {
            const result = xssProtection.validateInput('<script>test</script>');
            expect(result).not.toContain('<');
        });

        it('should sanitize HTML input', () => {
            const result = xssProtection.validateInput('<p>Safe</p><script>Bad</script>', 'html');
            expect(result).toContain('Safe');
            expect(result).not.toContain('script');
        });

        it('should validate URLs', () => {
            expect(xssProtection.validateInput('https://example.com', 'url')).toBe('https://example.com');
            expect(xssProtection.validateInput('javascript:alert(1)', 'url')).toBe('');
        });

        it('should validate emails', () => {
            expect(xssProtection.validateInput('user@example.com', 'email')).toBe('user@example.com');
            expect(xssProtection.validateInput('not-an-email', 'email')).toBe('');
        });

        it('should validate phone numbers', () => {
            const result = xssProtection.validateInput('123-456-7890', 'phone');
            expect(result).toBe('123-456-7890');
        });
    });

    describe('detectXSS', () => {
        it('should detect script tags', () => {
            expect(xssProtection.detectXSS('<script>alert(1)</script>')).toBe(true);
            expect(xssProtection.detectXSS('<SCRIPT>alert(1)</SCRIPT>')).toBe(true);
        });

        it('should detect javascript: protocol', () => {
            expect(xssProtection.detectXSS('javascript:alert(1)')).toBe(true);
            expect(xssProtection.detectXSS('JAVASCRIPT:alert(1)')).toBe(true);
        });

        it('should detect event handlers', () => {
            expect(xssProtection.detectXSS('onclick=alert(1)')).toBe(true);
            expect(xssProtection.detectXSS('onload=bad()')).toBe(true);
            expect(xssProtection.detectXSS('onerror=evil()')).toBe(true);
        });

        it('should detect iframe tags', () => {
            expect(xssProtection.detectXSS('<iframe src="evil.com"></iframe>')).toBe(true);
        });

        it('should detect object/embed tags', () => {
            expect(xssProtection.detectXSS('<object data="evil"></object>')).toBe(true);
            expect(xssProtection.detectXSS('<embed src="bad">')).toBe(true);
        });

        it('should detect vbscript protocol', () => {
            expect(xssProtection.detectXSS('vbscript:msgbox(1)')).toBe(true);
        });

        it('should detect data URLs with HTML', () => {
            expect(xssProtection.detectXSS('data:text/html,<script>alert(1)</script>')).toBe(true);
        });

        it('should return false for safe input', () => {
            expect(xssProtection.detectXSS('This is safe text')).toBe(false);
            expect(xssProtection.detectXSS('user@example.com')).toBe(false);
            expect(xssProtection.detectXSS('https://example.com')).toBe(false);
        });

        it('should handle non-string input', () => {
            expect(xssProtection.detectXSS(null)).toBe(false);
            expect(xssProtection.detectXSS(123)).toBe(false);
        });
    });
});

describe('securityHeaders', () => {
    beforeEach(() => {
        sessionStorage.clear();
    });

    describe('getHeaders', () => {
        it('should include all security headers', () => {
            const headers = securityHeaders.getHeaders();
            expect(headers['X-Content-Type-Options']).toBe('nosniff');
            expect(headers['X-Frame-Options']).toBe('DENY');
            expect(headers['X-XSS-Protection']).toBe('1; mode=block');
            expect(headers['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
            expect(headers['Permissions-Policy']).toContain('geolocation=()');
        });

        it('should include CSRF token when available', () => {
            const token = 'test-csrf-token';
            csrfProtection.storeToken(token);
            const headers = securityHeaders.getHeaders();
            expect(headers['X-CSRF-Token']).toBe(token);
        });
    });

    describe('validateResponseHeaders', () => {
        it('should pass when all required headers are present', () => {
            const headers = {
                'X-Content-Type-Options': 'nosniff',
                'X-Frame-Options': 'DENY',
                'X-XSS-Protection': '1; mode=block'
            };
            expect(securityHeaders.validateResponseHeaders(headers)).toBe(true);
        });

        it('should fail when headers are missing', () => {
            const headers = {
                'X-Content-Type-Options': 'nosniff'
            };
            const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
            expect(securityHeaders.validateResponseHeaders(headers)).toBe(false);
            expect(consoleSpy).toHaveBeenCalled();
            consoleSpy.mockRestore();
        });

        it('should warn about missing headers', () => {
            const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
            securityHeaders.validateResponseHeaders({});
            expect(consoleSpy).toHaveBeenCalledWith(
                'Missing security headers:',
                expect.arrayContaining(['X-Content-Type-Options', 'X-Frame-Options', 'X-XSS-Protection'])
            );
            consoleSpy.mockRestore();
        });
    });
});

describe('initSecurity', () => {
    beforeEach(() => {
        document.querySelectorAll('meta[name="csp-nonce"]').forEach(el => el.remove());
    });

    it('should create CSP nonce meta tag', () => {
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
        initSecurity();

        const meta = document.querySelector('meta[name="csp-nonce"]');
        expect(meta).toBeTruthy();
        expect(meta?.getAttribute('content')).toMatch(/^[0-9a-f]{32}$/);

        consoleSpy.mockRestore();
    });

    it('should not duplicate CSP nonce meta tag', () => {
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

        // Add existing meta tag
        const existing = document.createElement('meta');
        existing.name = 'csp-nonce';
        existing.content = 'existing-nonce';
        document.head.appendChild(existing);

        initSecurity();

        const metas = document.querySelectorAll('meta[name="csp-nonce"]');
        expect(metas.length).toBe(1);
        expect(metas[0].getAttribute('content')).toBe('existing-nonce');

        consoleSpy.mockRestore();
    });
});
