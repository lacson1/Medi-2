import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Shield, Users, Building2, Stethoscope, DollarSign, FlaskConical, Calendar, BarChart3 } from "lucide-react";
import PropTypes from "prop-types";

import {
    SYSTEM_ROLES,
    PERMISSION_CATEGORIES,
    canAssignRole,
    getAvailableRoles,
    getPermissionsByCategory
} from "@/utils/enhancedRoleManagement.jsx";

const categoryIcons = {
    SYSTEM: Shield,
    USER_MANAGEMENT: Users,
    ORGANIZATION: Building2,
    CLINICAL: Stethoscope,
    FINANCIAL: DollarSign,
    LAB_PHARMACY: FlaskConical,
    SCHEDULING: Calendar,
    REPORTS: BarChart3
};

const roleColors = {
    super_admin: "bg-purple-100 text-purple-800 border-purple-200",
    org_admin: "bg-blue-100 text-blue-800 border-blue-200",
    doctor: "bg-green-100 text-green-800 border-green-200",
    nurse: "bg-cyan-100 text-cyan-800 border-cyan-200",
    pharmacist: "bg-orange-100 text-orange-800 border-orange-200",
    lab_tech: "bg-indigo-100 text-indigo-800 border-indigo-200",
    billing: "bg-yellow-100 text-yellow-800 border-yellow-200",
    receptionist: "bg-pink-100 text-pink-800 border-pink-200",
    staff: "bg-gray-100 text-gray-800 border-gray-200"
};

export default function RolePermissionEditor({ user, onSave, onCancel, isSubmitting }: any) {
    const [selectedRole, setSelectedRole] = useState(user.role || 'staff');
    const [customPermissions, setCustomPermissions] = useState(user.permissions || []);

    // Get available roles for assignment
    const availableRoles = useMemo(() => {
        return getAvailableRoles('super_admin'); // Assuming super admin is editing
    }, []);

    // Get permissions for selected role
    const rolePermissions = useMemo(() => {
        const role = Object.values(SYSTEM_ROLES).find(r => r.key === selectedRole);
        return role ? role.permissions : [];
    }, [selectedRole]);


    // Handle role change
    const handleRoleChange = (newRole: any) => {
        setSelectedRole(newRole);
        const role = Object.values(SYSTEM_ROLES).find(r => r.key === newRole);
        setCustomPermissions(role ? role.permissions : []);
    };

    // Handle permission toggle
    const togglePermission = (permission: any) => {
        setCustomPermissions(prev =>
            prev.includes(permission)
                ? prev.filter(p => p !== permission)
                : [...prev, permission]
        );
    };

    // Handle category toggle
    const toggleCategory = (categoryKey: any) => {
        const category = PERMISSION_CATEGORIES[categoryKey];
        const categoryPermissions = category.permissions;

        const hasAllPermissions = categoryPermissions.every(p => customPermissions.includes(p));

        if (hasAllPermissions) {
            // Remove all category permissions
            setCustomPermissions(prev =>
                prev.filter(p => !categoryPermissions.includes(p))
            );
        } else {
            // Add all category permissions
            setCustomPermissions(prev => [
                ...prev.filter(p => !categoryPermissions.includes(p)),
                ...categoryPermissions
            ]);
        }
    };

    // Check if category is fully selected
    const isCategorySelected = (categoryKey: any) => {
        const category = PERMISSION_CATEGORIES[categoryKey];
        return category.permissions.every(p => customPermissions.includes(p));
    };

    // Check if category is partially selected
    const isCategoryPartial = (categoryKey: any) => {
        const category = PERMISSION_CATEGORIES[categoryKey];
        const hasSome = category.permissions.some(p => customPermissions.includes(p));
        const hasAll = category.permissions.every(p => customPermissions.includes(p));
        return hasSome && !hasAll;
    };

    // Handle save
    const handleSave = () => {
        onSave(selectedRole, customPermissions);
    };

    // Check if role can be assigned
    const canAssign = canAssignRole('super_admin', selectedRole);

    return (
        <div className="space-y-6">
            {/* Role Selection */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Role Assignment
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                Select Role
                            </label>
                            <Select value={selectedRole} onValueChange={handleRoleChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableRoles.map(role => (
                                        <SelectItem key={role.key} value={role.key}>
                                            <div className="flex items-center gap-2">
                                                <span>{role.color}</span>
                                                <span>{role.name}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex-1">
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                Current User
                            </label>
                            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white font-bold text-sm">
                                    {user.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">{user.full_name}</p>
                                    <p className="text-sm text-gray-600">{user.email}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {selectedRole && (
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <Badge className={roleColors[selectedRole] || roleColors.staff}>
                                    {Object.values(SYSTEM_ROLES).find(r => r.key === selectedRole)?.name}
                                </Badge>
                                {!canAssign && (
                                    <Badge variant="destructive">Cannot Assign</Badge>
                                )}
                            </div>
                            <p className="text-sm text-gray-600">
                                {Object.values(SYSTEM_ROLES).find(r => r.key === selectedRole)?.description}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Permission Categories */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Permission Categories
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {Object.entries(PERMISSION_CATEGORIES).map(([categoryKey, category]) => {
                        const Icon = categoryIcons[categoryKey];
                        const isSelected = isCategorySelected(categoryKey);
                        const isPartial = isCategoryPartial(categoryKey);

                        return (
                            <div key={categoryKey} className="border rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <Icon className="w-4 h-4 text-gray-600" />
                                        <h3 className="font-medium text-gray-900">{category.name}</h3>
                                        <Badge variant="outline" className="text-xs">
                                            {category.permissions.length} permissions
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            checked={isSelected}
                                            ref={(el) => {
                                                if (el) el.indeterminate = isPartial;
                                            }}
                                            onCheckedChange={() => toggleCategory(categoryKey)}
                                        />
                                        <span className="text-sm text-gray-600">
                                            {isSelected ? 'All' : isPartial ? 'Some' : 'None'}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {category.permissions.map(permission => (
                                        <div key={permission} className="flex items-center gap-2">
                                            <Checkbox
                                                checked={customPermissions.includes(permission)}
                                                onCheckedChange={() => togglePermission(permission)}
                                            />
                                            <span className="text-sm text-gray-700">
                                                {permission.replace(/_/g, ' ')}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </CardContent>
            </Card>

            {/* Permission Summary */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Permission Summary
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Total Permissions</span>
                            <Badge variant="outline">{customPermissions.length}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Role Permissions</span>
                            <Badge variant="outline">{rolePermissions.length}</Badge>
                        </div>
                        <Separator />
                        <div className="text-sm text-gray-600">
                            <p className="font-medium mb-2">Selected Permissions:</p>
                            <div className="flex flex-wrap gap-1">
                                {customPermissions.slice(0, 10).map(permission => (
                                    <Badge key={permission} variant="secondary" className="text-xs">
                                        {permission.replace(/_/g, ' ')}
                                    </Badge>
                                ))}
                                {customPermissions.length > 10 && (
                                    <Badge variant="secondary" className="text-xs">
                                        +{customPermissions.length - 10} more
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSave}
                    disabled={isSubmitting || !canAssign}
                    className="bg-gradient-to-r from-blue-500 to-cyan-600"
                >
                    {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
            </div>
        </div>
    );
}

RolePermissionEditor.propTypes = {
    user: PropTypes.object.isRequired,
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    isSubmitting: PropTypes.bool.isRequired,
};
