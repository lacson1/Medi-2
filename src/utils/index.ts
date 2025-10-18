
// Export all utility functions and types
export * from './validationSchemas';
export * from './security';
export * from './accessibility.tsx';

// Utility functions
export function createPageUrl(pageName: string): string {
    const normalized = pageName
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2') // convert camelCase/PascalCase to kebab
        .replace(/[\s_]+/g, '-') // convert spaces/underscores to hyphen
        .replace(/-+/g, '-') // collapse multiple hyphens
        .replace(/^-|-$/g, '') // trim leading/trailing hyphen
        .toLowerCase();
    return `/${normalized}`;
}
