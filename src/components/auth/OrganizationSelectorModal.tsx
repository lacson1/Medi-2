import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockApiClient } from '@/api/mockApiClient';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Building2, Search, Check, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Organization, AuthUser } from '@/types';

interface OrganizationSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    userOrganizations?: Organization[];
    onOrganizationSelect: (user: AuthUser) => void;
}

export default function OrganizationSelectorModal({
    isOpen,
    onClose,
    userOrganizations = [],
    onOrganizationSelect
}: OrganizationSelectorModalProps) {
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
    const [isSelecting, setIsSelecting] = useState<boolean>(false);
    const queryClient = useQueryClient();
    const { user } = useAuth();

    // Fetch all organizations if user is super admin or has multiple orgs
    const { data: allOrganizations = [], isLoading } = useQuery({
        queryKey: ['all_organizations'],
        queryFn: async () => {
            try {
                const result = await mockApiClient.entities?.['Organization']?.list({});
                return result || [];
            } catch (error) {
                console.error('Failed to fetch organizations:', error);
                return [];
            }
        },
        enabled: isOpen && (user?.role === 'SuperAdmin' || userOrganizations.length === 0),
        initialData: [],
    });

    // Update user's current organization
    const updateUserOrgMutation = useMutation({
        mutationFn: async ({ orgId, orgName }: { orgId: string; orgName: string }) => {
            try {
                const result = await mockApiClient.entities?.['User']?.update(user?.id || '', {
                    organization_id: orgId,
                    organization_name: orgName
                });
                return result as AuthUser;
            } catch (error) {
                console.error('Failed to update user organization:', error);
                throw error;
            }
        },
        onSuccess: (updatedUser: AuthUser) => {
            void queryClient.invalidateQueries({ queryKey: ['current_user'] });
            void queryClient.invalidateQueries({ queryKey: ['organization'] });
            toast.success(`Switched to ${updatedUser.organization_name || updatedUser.organization_id}`);
            onOrganizationSelect(updatedUser);
            onClose();
        },
        onError: (error: Error) => {
            toast.error('Failed to switch organization');
            console.error('Organization switch error:', error);
        }
    });

    // Determine which organizations to show
    const availableOrganizations = user?.role === 'SuperAdmin'
        ? allOrganizations
        : userOrganizations.length > 0
            ? userOrganizations
            : allOrganizations;

    // Filter organizations based on search
    const filteredOrganizations = (availableOrganizations as Organization[]).filter((org: Organization) =>
        org.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOrganizationSelect = async (org: Organization): Promise<void> => {
        if (isSelecting) return;

        setIsSelecting(true);
        setSelectedOrgId(org.id);

        try {
            await updateUserOrgMutation.mutateAsync({
                orgId: org.id,
                orgName: org.name
            });
        } catch (error) {
            // Error handling is done in the mutation
            console.error('Organization selection error:', error);
        } finally {
            setIsSelecting(false);
            setSelectedOrgId(null);
        }
    };

    const handleSkip = (): void => {
        onClose();
    };

    // Auto-select if only one organization
    useEffect(() => {
        if (isOpen && filteredOrganizations.length === 1 && !isSelecting) {
            const singleOrg = filteredOrganizations[0];
            if (singleOrg && singleOrg.id !== user?.organization_id) {
                void handleOrganizationSelect(singleOrg);
            } else {
                onClose();
            }
        }
    }, [isOpen, filteredOrganizations.length, user?.organization_id, isSelecting, onClose]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
                <DialogHeader className="pb-4">
                    <DialogTitle className="flex items-center gap-3 text-xl">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                            <Building2 className="w-4 h-4 text-white" />
                        </div>
                        Select Your Organization
                    </DialogTitle>
                    <p className="text-sm text-gray-600 mt-2">
                        Choose which organization you&apos;d like to work with today
                    </p>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            placeholder="Search organizations..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    {/* Organizations List */}
                    <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                                <span className="ml-2 text-gray-600">Loading organizations...</span>
                            </div>
                        ) : filteredOrganizations.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                <p>No organizations found</p>
                                {searchTerm && (
                                    <p className="text-sm mt-2">Try adjusting your search terms</p>
                                )}
                            </div>
                        ) : (
                            filteredOrganizations.map((org: Organization) => (
                                <Card
                                    key={org.id}
                                    className={cn(
                                        "cursor-pointer transition-all hover:shadow-md border-2",
                                        selectedOrgId === org.id
                                            ? "border-blue-500 bg-blue-50"
                                            : "border-gray-200 hover:border-gray-300",
                                        org.id === user?.organization_id && "ring-2 ring-blue-200"
                                    )}
                                    onClick={() => void handleOrganizationSelect(org)}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4 flex-1">
                                                {/* Organization Logo */}
                                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center flex-shrink-0">
                                                    {org.logo_url ? (
                                                        <img
                                                            src={org.logo_url}
                                                            alt={org.name}
                                                            className="w-full h-full rounded-lg object-cover"
                                                        />
                                                    ) : (
                                                        <Building2 className="w-6 h-6 text-white" />
                                                    )}
                                                </div>

                                                {/* Organization Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="font-semibold text-gray-900 truncate">
                                                            {org.name}
                                                        </h3>
                                                        {org.id === user?.organization_id && (
                                                            <Badge variant="secondary" className="text-xs">
                                                                <Check className="w-3 h-3 mr-1" />
                                                                Current
                                                            </Badge>
                                                        )}
                                                    </div>

                                                    {org.description && (
                                                        <p className="text-sm text-gray-600 line-clamp-2">
                                                            {org.description}
                                                        </p>
                                                    )}

                                                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                                        {org.address && (
                                                            <span className="truncate">{org.address}</span>
                                                        )}
                                                        {org.phone && (
                                                            <span>{org.phone}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Selection Indicator */}
                                            <div className="flex items-center gap-2">
                                                {selectedOrgId === org.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                                                ) : (
                                                    <ArrowRight className="w-4 h-4 text-gray-400" />
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-4 border-t">
                        <div className="text-sm text-gray-500">
                            {filteredOrganizations.length} organization{filteredOrganizations.length !== 1 ? 's' : ''} available
                        </div>

                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                onClick={handleSkip}
                                disabled={isSelecting}
                            >
                                Skip for now
                            </Button>

                            {user?.role === 'SuperAdmin' && (
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        // Navigate to organizations management
                                        window.location.href = '/Organizations';
                                    }}
                                >
                                    Manage Organizations
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
