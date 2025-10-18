/**
 * Security utilities for Bluequee2 application
 * Provides input sanitization, CSRF protection, and security best practices
 */

import DOMPurify from 'dompurify';

// File validation interfaces
export interface FileValidationResult {
    isValid: boolean;
    errors: string[];
}

export interface FileCategory {
    image: string[];
    document: string[];
    medical: string[];
}

export interface FileMaxSizes {
    image: number;
    document: number;
    medical: number;
}

// Input sanitization utilities
export const sanitizer = {
    // Sanitize HTML content
    sanitizeHtml: (html: string): string => {
        return DOMPurify.sanitize(html, {
            ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
            ALLOWED_ATTR: []
        });
    },

    // Sanitize text input
    sanitizeText: (text: unknown): string => {
        if (typeof text !== 'string') return '';
        return text
            .replace(/[<>]/g, '') // Remove potential HTML tags
            .replace(/javascript:/gi, '') // Remove javascript: protocol
            .replace(/on\w+=/gi, '') // Remove event handlers
            .trim();
    },

    // Sanitize file name
    sanitizeFileName: (fileName: unknown): string => {
        if (typeof fileName !== 'string') return '';
        return fileName
            .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars with underscore
            .replace(/\.{2,}/g, '.') // Replace multiple dots with single dot
            .replace(/^\./, '') // Remove leading dot
            .substring(0, 255); // Limit length
    },

    // Sanitize URL
    sanitizeUrl: (url: unknown): string => {
        if (typeof url !== 'string') return '';

        try {
            const urlObj = new URL(url);
            // Only allow http and https protocols
            if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
                return '';
            }
            return urlObj.toString();
        } catch {
            return '';
        }
    },

    // Sanitize email
    sanitizeEmail: (email: unknown): string => {
        if (typeof email !== 'string') return '';
        const sanitized = email.trim().toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(sanitized) ? sanitized : '';
    },

    // Sanitize phone number
    sanitizePhone: (phone: unknown): string => {
        if (typeof phone !== 'string') return '';
        return phone.replace(/[^\d+\-()\s]/g, '').trim();
    }
};

// CSRF protection utilities
export const csrfProtection = {
    // Generate CSRF token
    generateToken: (): string => {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    },

    // Store CSRF token
    storeToken: (token: string): void => {
        sessionStorage.setItem('csrf_token', token);
    },

    // Get CSRF token
    getToken: (): string | null => {
        return sessionStorage.getItem('csrf_token');
    },

    // Validate CSRF token
    validateToken: (token: string): boolean => {
        const storedToken = csrfProtection.getToken();
        return Boolean(storedToken && storedToken === token);
    },

    // Add CSRF token to request headers
    addToHeaders: (headers: Record<string, string> = {}): Record<string, string> => {
        const token = csrfProtection.getToken();
        if (token) {
            headers['X-CSRF-Token'] = token;
        }
        return headers;
    }
};

// File upload validation
export const fileValidator = {
    // Allowed file types
    allowedTypes: {
        image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        document: ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        medical: ['application/dicom', 'application/x-dicom']
    } as FileCategory,

    // Maximum file sizes (in bytes)
    maxSizes: {
        image: 5 * 1024 * 1024, // 5MB
        document: 10 * 1024 * 1024, // 10MB
        medical: 50 * 1024 * 1024 // 50MB
    } as FileMaxSizes,

    // Validate file type
    validateType: (file: File, category: keyof FileCategory = 'document'): boolean => {
        const allowedTypes = fileValidator.allowedTypes[category] || fileValidator.allowedTypes.document;
        return allowedTypes.includes(file.type);
    },

    // Validate file size
    validateSize: (file: File, category: keyof FileMaxSizes = 'document'): boolean => {
        const maxSize = fileValidator.maxSizes[category] || fileValidator.maxSizes.document;
        return file.size <= maxSize;
    },

    // Comprehensive file validation
    validateFile: (file: File, category: keyof FileCategory = 'document'): FileValidationResult => {
        const errors: string[] = [];

        if (!fileValidator.validateType(file, category)) {
            const allowedTypes = fileValidator.allowedTypes[category];
            errors.push(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
        }

        if (!fileValidator.validateSize(file, category)) {
            const maxSizeMB = Math.round(fileValidator.maxSizes[category] / (1024 * 1024));
            errors.push(`File too large. Maximum size: ${maxSizeMB}MB`);
        }

        // Check for malicious file extensions
        const maliciousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.vbs', '.js', '.jar'];
        const fileName = file.name.toLowerCase();
        const hasMaliciousExtension = maliciousExtensions.some(ext => fileName.endsWith(ext));

        if (hasMaliciousExtension) {
            errors.push('File type not allowed for security reasons');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
};

// Session management
export const sessionManager = {
    // Session timeout (30 minutes)
    timeout: 30 * 60 * 1000,

    // Last activity timestamp
    lastActivity: Date.now(),

    // Initialize session monitoring
    init: (): void => {
        // Update last activity on user interaction
        const updateActivity = (): void => {
            sessionManager.lastActivity = Date.now();
        };

        // Add event listeners for user activity
        ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
            document.addEventListener(event, updateActivity, true);
        });

        // Check session timeout periodically
        setInterval(() => {
            const now = Date.now();
            const timeSinceLastActivity = now - sessionManager.lastActivity;

            if (timeSinceLastActivity > sessionManager.timeout) {
                sessionManager.handleTimeout();
            } else if (timeSinceLastActivity > sessionManager.timeout * 0.8) {
                // Warn user 6 minutes before timeout
                sessionManager.showTimeoutWarning();
            }
        }, 60000); // Check every minute
    },

    // Handle session timeout
    handleTimeout: (): void => {
        // Clear sensitive data
        sessionStorage.clear();
        localStorage.removeItem('auth_token');

        // Redirect to login
        window.location.href = '/login?reason=timeout';
    },

    // Show timeout warning
    showTimeoutWarning: (): void => {
        if ((window as any).showTimeoutWarning) return; // Prevent multiple warnings

        (window as any).showTimeoutWarning = true;

        const warning = document.createElement('div');
        warning.className = 'fixed top-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded z-50';
        warning.innerHTML = `
      <div class="flex items-center">
        <div class="flex-1">
          <strong>Session Expiring Soon</strong>
          <p class="text-sm">Your session will expire in 6 minutes. Click anywhere to extend.</p>
        </div>
        <button onclick="this.parentElement.parentElement.remove(); window.showTimeoutWarning = false;" class="ml-4 text-yellow-700 hover:text-yellow-900">
          ×
        </button>
      </div>
    `;

        document.body.appendChild(warning);

        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (warning.parentElement) {
                warning.remove();
                (window as any).showTimeoutWarning = false;
            }
        }, 10000);
    },

    // Extend session
    extend: (): void => {
        sessionManager.lastActivity = Date.now();
        (window as any).showTimeoutWarning = false;

        // Remove any existing warning
        const warning = document.querySelector('.fixed.top-4.right-4');
        if (warning) {
            warning.remove();
        }
    }
};

// Content Security Policy utilities
export const cspUtils = {
    // Generate nonce for inline scripts
    generateNonce: (): string => {
        const array = new Uint8Array(16);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    },

    // Get CSP nonce from meta tag
    getNonce: (): string => {
        const meta = document.querySelector('meta[name="csp-nonce"]');
        return meta ? meta.getAttribute('content') || '' : '';
    },

    // Validate CSP nonce
    validateNonce: (nonce: string): boolean => {
        const expectedNonce = cspUtils.getNonce();
        return Boolean(expectedNonce && expectedNonce === nonce);
    }
};

// XSS protection utilities
export const xssProtection = {
    // Escape HTML entities
    escapeHtml: (text: unknown): string => {
        if (typeof text !== 'string') return '';
        const map: Record<string, string> = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, (m) => map[m] || m);
    },

    // Validate and sanitize user input
    validateInput: (input: unknown, type: 'text' | 'html' | 'url' | 'email' | 'phone' = 'text'): string => {
        if (typeof input !== 'string') return '';

        let sanitized = input.trim();

        switch (type) {
            case 'html':
                sanitized = sanitizer.sanitizeHtml(sanitized);
                break;
            case 'url':
                sanitized = sanitizer.sanitizeUrl(sanitized);
                break;
            case 'email':
                sanitized = sanitizer.sanitizeEmail(sanitized);
                break;
            case 'phone':
                sanitized = sanitizer.sanitizePhone(sanitized);
                break;
            default:
                sanitized = sanitizer.sanitizeText(sanitized);
        }

        return sanitized;
    },

    // Check for potential XSS patterns
    detectXSS: (input: unknown): boolean => {
        if (typeof input !== 'string') return false;

        const xssPatterns = [
            /<script/i,
            /javascript:/i,
            /on\w+\s*=/i,
            /<iframe/i,
            /<object/i,
            /<embed/i,
            /<link/i,
            /<meta/i,
            /<style/i,
            /expression\s*\(/i,
            /vbscript:/i,
            /data:text\/html/i
        ];

        return xssPatterns.some(pattern => pattern.test(input));
    }
};

// Security headers configuration
export const securityHeaders = {
    // Generate security headers for API requests
    getHeaders: (): Record<string, string> => ({
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
        ...csrfProtection.addToHeaders()
    }),

    // Validate response headers
    validateResponseHeaders: (headers: Record<string, string>): boolean => {
        const requiredHeaders = [
            'X-Content-Type-Options',
            'X-Frame-Options',
            'X-XSS-Protection'
        ];

        const missingHeaders = requiredHeaders.filter(header => !headers[header]);

        if (missingHeaders.length > 0) {
            console.warn('Missing security headers:', missingHeaders);
        }

        return missingHeaders.length === 0;
    }
};

// Initialize security features
export const initSecurity = (): void => {
    // Initialize session management
    sessionManager.init();

    // Add click handler to extend session
    document.addEventListener('click', sessionManager.extend);

    // Add CSP nonce to meta tag if not present
    if (!document.querySelector('meta[name="csp-nonce"]')) {
        const meta = document.createElement('meta');
        meta.name = 'csp-nonce';
        meta.content = cspUtils.generateNonce();
        document.head.appendChild(meta);
    }

    // Log security initialization
    console.log('🔒 Security features initialized');
};

export default {
    sanitizer,
    csrfProtection,
    fileValidator,
    sessionManager,
    cspUtils,
    xssProtection,
    securityHeaders,
    initSecurity
};
