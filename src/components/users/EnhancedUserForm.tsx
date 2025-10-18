import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { User, Phone, MapPin, Building2, Shield, Briefcase } from "lucide-react";
import PropTypes from "prop-types";

import { 
    SYSTEM_ROLES, 
    getAvailableRoles,
    validateRoleAssignment
} from "@/utils/enhancedRoleManagement.jsx";

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

const statusColors = {
    active: "bg-green-100 text-green-800",
    inactive: "bg-gray-100 text-gray-800",
    suspended: "bg-red-100 text-red-800",
    pending: "bg-yellow-100 text-yellow-800"
};

export default function UserForm({ 
    user, 
    onSubmit, 
    onCancel, 
    isSubmitting, 
    availableRoles = [], 
    organizations = [], 
    isSuperAdmin = false,
    currentUserRole = 'staff',
    currentUserOrgId = null
}) {
    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        phone: "",
        job_title: "",
        department: "",
        role: "staff",
        status: "active",
        organization_id: "",
        address: {
            street: "",
            city: "",
            state: "",
            zip_code: "",
            country: ""
        },
        emergency_contact: {
            name: "",
            phone: "",
            relationship: ""
        },
        start_date: "",
        notes: "",
        ...user
    });

    const [errors, setErrors] = useState({});
    const [roleValidation, setRoleValidation] = useState({ isValid: true, errors: [] });

    // Update form data when user prop changes
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                ...user,
                address: { ...prev.address, ...user.address },
                emergency_contact: { ...prev.emergency_contact, ...user.emergency_contact }
            }));
        }
    }, [user]);

    // Validate role assignment
    useEffect(() => {
        if (formData.role && formData.organization_id) {
            const validation = validateRoleAssignment(
                currentUserRole,
                formData.role,
                currentUserOrgId,
                formData.organization_id
            );
            setRoleValidation(validation);
        }
    }, [formData.role, formData.organization_id, currentUserRole, currentUserOrgId]);

    // Get available roles based on current user
    const getAvailableRolesForUser = () => {
        if (availableRoles.length > 0) return availableRoles;
        return getAvailableRoles(currentUserRole);
    };

    // Handle form field changes
    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Clear error when field is updated
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: null
            }));
        }
    };

    // Handle nested object changes
    const handleNestedChange = (parent, field, value) => {
        setFormData(prev => ({
            ...prev,
            [parent]: {
                ...prev[parent],
                [field]: value
            }
        }));
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        if (!formData.full_name?.trim()) {
            newErrors.full_name = "Full name is required";
        }

        if (!formData.email?.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Invalid email format";
        }

        if (formData.phone && !/^[+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/[\s\-()]/g, ''))) {
            newErrors.phone = "Invalid phone number";
        }

        if (!formData.role) {
            newErrors.role = "Role is required";
        }

        if (isSuperAdmin && !formData.organization_id) {
            newErrors.organization_id = "Organization is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0 && roleValidation.isValid;
    };

    // Handle form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (validateForm()) {
            onSubmit(formData);
        }
    };

    // Get role info
    const selectedRoleInfo = Object.values(SYSTEM_ROLES).find(r => r.key === formData.role);

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Basic Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="full_name">Full Name *</Label>
                            <Input
                                id="full_name"
                                value={formData.full_name}
                                onChange={(e) => handleChange('full_name', e.target.value)}
                                placeholder="Enter full name"
                                className={errors.full_name ? 'border-red-500' : ''}
                            />
                            {errors.full_name && (
                                <p className="text-sm text-red-600">{errors.full_name}</p>
                            )}
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="email">Email *</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                                placeholder="Enter email address"
                                className={errors.email ? 'border-red-500' : ''}
                            />
                            {errors.email && (
                                <p className="text-sm text-red-600">{errors.email}</p>
                            )}
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                value={formData.phone}
                                onChange={(e) => handleChange('phone', e.target.value)}
                                placeholder="Enter phone number"
                                className={errors.phone ? 'border-red-500' : ''}
                            />
                            {errors.phone && (
                                <p className="text-sm text-red-600">{errors.phone}</p>
                            )}
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="job_title">Job Title</Label>
                            <Input
                                id="job_title"
                                value={formData.job_title}
                                onChange={(e) => handleChange('job_title', e.target.value)}
                                placeholder="Enter job title"
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="department">Department</Label>
                            <Input
                                id="department"
                                value={formData.department}
                                onChange={(e) => handleChange('department', e.target.value)}
                                placeholder="Enter department"
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="start_date">Start Date</Label>
                            <Input
                                id="start_date"
                                type="date"
                                value={formData.start_date}
                                onChange={(e) => handleChange('start_date', e.target.value)}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Role and Organization */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Role & Organization
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="role">Role *</Label>
                            <Select value={formData.role} onValueChange={(value) => handleChange('role', value)}>
                                <SelectTrigger className={errors.role ? 'border-red-500' : ''}>
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {getAvailableRolesForUser().map(role => (
                                        <SelectItem key={role.key} value={role.key}>
                                            <div className="flex items-center gap-2">
                                                <span>{role.color}</span>
                                                <span>{role.name}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.role && (
                                <p className="text-sm text-red-600">{errors.role}</p>
                            )}
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                    <SelectItem value="suspended">Suspended</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {isSuperAdmin && (
                        <div className="space-y-2">
                            <Label htmlFor="organization_id">Organization *</Label>
                            <Select value={formData.organization_id} onValueChange={(value) => handleChange('organization_id', value)}>
                                <SelectTrigger className={errors.organization_id ? 'border-red-500' : ''}>
                                    <SelectValue placeholder="Select organization" />
                                </SelectTrigger>
                                <SelectContent>
                                    {organizations.map(org => (
                                        <SelectItem key={org.id} value={org.id}>
                                            <div className="flex items-center gap-2">
                                                <Building2 className="w-4 h-4" />
                                                <span>{org.name}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.organization_id && (
                                <p className="text-sm text-red-600">{errors.organization_id}</p>
                            )}
                        </div>
                    )}

                    {/* Role Information */}
                    {selectedRoleInfo && (
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <Badge className={roleColors[formData.role] || roleColors.staff}>
                                    {selectedRoleInfo.name}
                                </Badge>
                                {!roleValidation.isValid && (
                                    <Badge variant="destructive">Cannot Assign</Badge>
                                )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                                {selectedRoleInfo.description}
                            </p>
                            {!roleValidation.isValid && (
                                <div className="text-sm text-red-600">
                                    {roleValidation.errors.map((error, index) => (
                                        <p key={index}>• {error}</p>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Address Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        Address Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="street">Street Address</Label>
                            <Input
                                id="street"
                                value={formData.address?.street || ''}
                                onChange={(e) => handleNestedChange('address', 'street', e.target.value)}
                                placeholder="Enter street address"
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input
                                id="city"
                                value={formData.address?.city || ''}
                                onChange={(e) => handleNestedChange('address', 'city', e.target.value)}
                                placeholder="Enter city"
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="state">State</Label>
                            <Input
                                id="state"
                                value={formData.address?.state || ''}
                                onChange={(e) => handleNestedChange('address', 'state', e.target.value)}
                                placeholder="Enter state"
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="zip_code">ZIP Code</Label>
                            <Input
                                id="zip_code"
                                value={formData.address?.zip_code || ''}
                                onChange={(e) => handleNestedChange('address', 'zip_code', e.target.value)}
                                placeholder="Enter ZIP code"
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="country">Country</Label>
                            <Input
                                id="country"
                                value={formData.address?.country || ''}
                                onChange={(e) => handleNestedChange('address', 'country', e.target.value)}
                                placeholder="Enter country"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Phone className="w-5 h-5" />
                        Emergency Contact
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="emergency_name">Contact Name</Label>
                            <Input
                                id="emergency_name"
                                value={formData.emergency_contact?.name || ''}
                                onChange={(e) => handleNestedChange('emergency_contact', 'name', e.target.value)}
                                placeholder="Enter contact name"
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="emergency_phone">Contact Phone</Label>
                            <Input
                                id="emergency_phone"
                                value={formData.emergency_contact?.phone || ''}
                                onChange={(e) => handleNestedChange('emergency_contact', 'phone', e.target.value)}
                                placeholder="Enter contact phone"
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="emergency_relationship">Relationship</Label>
                            <Input
                                id="emergency_relationship"
                                value={formData.emergency_contact?.relationship || ''}
                                onChange={(e) => handleNestedChange('emergency_contact', 'relationship', e.target.value)}
                                placeholder="Enter relationship"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Additional Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Briefcase className="w-5 h-5" />
                        Additional Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            value={formData.notes || ''}
                            onChange={(e) => handleChange('notes', e.target.value)}
                            placeholder="Enter any additional notes..."
                            rows={3}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button 
                    type="submit" 
                    disabled={isSubmitting || !roleValidation.isValid}
                    className="bg-gradient-to-r from-blue-500 to-cyan-600"
                >
                    {isSubmitting ? "Saving..." : "Save User"}
                </Button>
            </div>
        </form>
    );
}

UserForm.propTypes = {
    user: PropTypes.object,
    onSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    isSubmitting: PropTypes.bool.isRequired,
    availableRoles: PropTypes.array,
    organizations: PropTypes.array,
    isSuperAdmin: PropTypes.bool,
    currentUserRole: PropTypes.string,
    currentUserOrgId: PropTypes.string,
};
