import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Clock, TrendingUp, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface SearchSuggestion {
    id: string;
    text: string;
    type: 'recent' | 'trending' | 'suggestion';
    category?: string;
    icon?: React.ReactNode;
}

interface EnhancedSearchProps {
    placeholder?: string;
    suggestions?: SearchSuggestion[];
    recentSearches?: string[];
    trendingSearches?: string[];
    onSearch: (query: string) => void;
    onSuggestionClick?: (suggestion: SearchSuggestion) => void;
    className?: string;
    showFilters?: boolean;
    filters?: Array<{
        key: string;
        label: string;
        options: Array<{ value: string; label: string }>;
    }>;
    onFilterChange?: (filters: Record<string, string>) => void;
}

export default function EnhancedSearch({
    placeholder = "Search...",
    suggestions = [],
    recentSearches = [],
    trendingSearches = [],
    onSearch,
    onSuggestionClick,
    className,
    showFilters = false,
    filters = [],
    onFilterChange
}: EnhancedSearchProps) {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
    const [showFilterPanel, setShowFilterPanel] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setShowFilterPanel(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);
        setIsOpen(value.length > 0);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSearch();
        } else if (e.key === 'Escape') {
            setIsOpen(false);
            setShowFilterPanel(false);
        }
    };

    const handleSearch = () => {
        if (query.trim()) {
            onSearch(query.trim());
            setIsOpen(false);
        }
    };

    const handleSuggestionClick = (suggestion: SearchSuggestion) => {
        setQuery(suggestion.text);
        onSuggestionClick?.(suggestion);
        setIsOpen(false);
    };

    const clearSearch = () => {
        setQuery('');
        setIsOpen(false);
        inputRef.current?.focus();
    };

    const handleFilterChange = (filterKey: string, value: string) => {
        const newFilters = { ...activeFilters, [filterKey]: value };
        setActiveFilters(newFilters);
        onFilterChange?.(newFilters);
    };

    const clearFilters = () => {
        setActiveFilters({});
        onFilterChange?.({});
    };

    const getFilteredSuggestions = () => {
        if (!query) return [];

        return suggestions.filter(suggestion =>
            suggestion.text.toLowerCase().includes(query.toLowerCase())
        );
    };

    const getRecentSuggestions = (): SearchSuggestion[] => {
        return recentSearches.slice(0, 5).map((search, index) => ({
            id: `recent-${index}`,
            text: search,
            type: 'recent',
            icon: <Clock className="w-4 h-4" />
        }));
    };

    const getTrendingSuggestions = (): SearchSuggestion[] => {
        return trendingSearches.slice(0, 3).map((search, index) => ({
            id: `trending-${index}`,
            text: search,
            type: 'trending',
            icon: <TrendingUp className="w-4 h-4" />
        }));
    };

    const activeFilterCount = Object.values(activeFilters).filter(Boolean).length;

    return (
        <div ref={containerRef} className={cn('relative', className)}>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                </div>

                <Input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsOpen(true)}
                    placeholder={placeholder}
                    className="pl-10 pr-20"
                />

                <div className="absolute inset-y-0 right-0 flex items-center space-x-1 pr-2">
                    {showFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowFilterPanel(!showFilterPanel)}
                            className={cn(
                                'h-6 px-2',
                                activeFilterCount > 0 && 'bg-blue-100 text-blue-700'
                            )}
                        >
                            <Filter className="w-3 h-3 mr-1" />
                            {activeFilterCount > 0 && (
                                <Badge variant="secondary" className="ml-1 h-4 px-1 text-xs">
                                    {activeFilterCount}
                                </Badge>
                            )}
                        </Button>
                    )}

                    {query && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearSearch}
                            className="h-6 w-6 p-0"
                        >
                            <X className="w-3 h-3" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Filter Panel */}
            <AnimatePresence>
                {showFilterPanel && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50"
                    >
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="font-medium text-gray-900">Filters</h3>
                                {activeFilterCount > 0 && (
                                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                                        Clear all
                                    </Button>
                                )}
                            </div>

                            {filters.map((filter) => (
                                <div key={filter.key}>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {filter.label}
                                    </label>
                                    <select
                                        value={activeFilters[filter.key] || ''}
                                        onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">All</option>
                                        {filter.options.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Suggestions Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-40"
                    >
                        <div className="py-2">
                            {/* Recent Searches */}
                            {query === '' && recentSearches.length > 0 && (
                                <div className="px-3 py-2">
                                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                                        Recent Searches
                                    </h4>
                                    {getRecentSuggestions().map((suggestion) => (
                                        <button
                                            key={suggestion.id}
                                            onClick={() => handleSuggestionClick(suggestion)}
                                            className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                                        >
                                            {suggestion.icon}
                                            <span className="ml-2">{suggestion.text}</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Trending Searches */}
                            {query === '' && trendingSearches.length > 0 && (
                                <div className="px-3 py-2 border-t border-gray-100">
                                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                                        Trending
                                    </h4>
                                    {getTrendingSuggestions().map((suggestion) => (
                                        <button
                                            key={suggestion.id}
                                            onClick={() => handleSuggestionClick(suggestion)}
                                            className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                                        >
                                            {suggestion.icon}
                                            <span className="ml-2">{suggestion.text}</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Search Suggestions */}
                            {query && (
                                <div className="px-3 py-2">
                                    {getFilteredSuggestions().length > 0 ? (
                                        getFilteredSuggestions().map((suggestion) => (
                                            <button
                                                key={suggestion.id}
                                                onClick={() => handleSuggestionClick(suggestion)}
                                                className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                                            >
                                                <Search className="w-4 h-4 text-gray-400" />
                                                <span className="ml-2">{suggestion.text}</span>
                                                {suggestion.category && (
                                                    <Badge variant="outline" className="ml-auto text-xs">
                                                        {suggestion.category}
                                                    </Badge>
                                                )}
                                            </button>
                                        ))
                                    ) : (
                                        <div className="px-3 py-2 text-sm text-gray-500">
                                            No suggestions found for "{query}"
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
