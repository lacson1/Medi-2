import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Search, Plus, Edit, Users, MapPin, Phone, Mail } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import PropTypes from "prop-types";

const typeColors = {
    hospital: "bg-red-100 text-red-800",
    clinic: "bg-blue-100 text-blue-800",
    private_practice: "bg-green-100 text-green-800",
    health_center: "bg-purple-100 text-purple-800",
    specialty_center: "bg-cyan-100 text-cyan-800",
    other: "bg-gray-100 text-gray-800",
};

const statusColors = {
    active: "bg-green-100 text-green-800",
    inactive: "bg-gray-100 text-gray-800",
    suspended: "bg-red-100 text-red-800",
};

export default function OrganizationSelector({
    organizations = [],
    selectedOrganization,
    onSelect,
    onEdit,
    onCreate,
    isLoading = false,
    showActions = true
}) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedType, setSelectedType] = useState("all");
    const [selectedStatus, setSelectedStatus] = useState("all");

    // Filter organizations
    const filteredOrganizations = organizations.filter(org => {
        const matchesSearch =
            org.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            org.type?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesType = selectedType === "all" || org.type === selectedType;
        const matchesStatus = selectedStatus === "all" || org.status === selectedStatus;

        return matchesSearch && matchesType && matchesStatus;
    });

    // Get unique types for filter
    const organizationTypes = [...new Set(organizations.map(org => org.type).filter(Boolean))];

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Building2 className="w-5 h-5" />
                        Organizations
                    </CardTitle>
                    {showActions && onCreate && (
                        <Button onClick={onCreate} size="sm">
                            <Plus className="w-4 h-4 mr-2" />
                            New Organization
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            placeholder="Search organizations..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Select value={selectedType} onValueChange={setSelectedType}>
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Filter by type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            {organizationTypes.map(type => (
                                <SelectItem key={type} value={type}>
                                    {type.replace('_', ' ')}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="suspended">Suspended</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Organizations List */}
                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full" />)}
                    </div>
                ) : filteredOrganizations.length === 0 ? (
                    <div className="text-center py-8">
                        <Building2 className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 mb-2">No organizations found</p>
                        <p className="text-gray-400 text-sm">
                            {searchTerm ? "Try adjusting your search criteria" : "No organizations available"}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredOrganizations.map((org: any) => (
                            <div
                                key={org.id}
                                className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${selectedOrganization === org.id
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                onClick={() => onSelect(org.id)}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        {org.logo_url ? (
                                            <img
                                                src={org.logo_url}
                                                alt={org.name}
                                                className="w-10 h-10 rounded-lg object-cover"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                                                <Building2 className="w-5 h-5 text-white" />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold text-gray-900">{org.name}</h3>
                                                <Badge className={typeColors[org.type] || typeColors.other}>
                                                    {org.type?.replace('_', ' ')}
                                                </Badge>
                                                <Badge className={statusColors[org.status] || statusColors.active}>
                                                    {org.status}
                                                </Badge>
                                            </div>
                                            <div className="space-y-1 text-sm text-gray-600">
                                                {org.contact?.phone && (
                                                    <div className="flex items-center gap-1">
                                                        <Phone className="w-3 h-3" />
                                                        <span>{org.contact.phone}</span>
                                                    </div>
                                                )}
                                                {org.contact?.email && (
                                                    <div className="flex items-center gap-1">
                                                        <Mail className="w-3 h-3" />
                                                        <span>{org.contact.email}</span>
                                                    </div>
                                                )}
                                                {org.address?.city && (
                                                    <div className="flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" />
                                                        <span>{org.address.city}, {org.address.state}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    {showActions && onEdit && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onEdit(org);
                                            }}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>

                                {/* Organization Stats */}
                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                        {org.subscription && (
                                            <div className="flex items-center gap-1">
                                                <Users className="w-3 h-3" />
                                                <span>{org.subscription.user_limit || 'Unlimited'} users max</span>
                                            </div>
                                        )}
                                        {org.created_date && (
                                            <div className="flex items-center gap-1">
                                                <span>Created: {new Date(org.created_date).toLocaleDateString()}</span>
                                            </div>
                                        )}
                                    </div>
                                    {selectedOrganization === org.id && (
                                        <Badge variant="outline" className="text-blue-600 border-blue-600">
                                            Selected
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

OrganizationSelector.propTypes = {
    organizations: PropTypes.array,
    selectedOrganization: PropTypes.string,
    onSelect: PropTypes.func.isRequired,
    onEdit: PropTypes.func,
    onCreate: PropTypes.func,
    isLoading: PropTypes.bool,
    showActions: PropTypes.bool,
};
