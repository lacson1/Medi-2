// Comprehensive Data Access Control Component
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { consentManager, CONSENT_TYPES, CONSENT_STATUSES } from '@/utils/consentManager';
import { auditLogger, AUDIT_ACTIONS } from '@/utils/auditLogger.tsx';
import { notificationScheduler, NOTIFICATION_TYPES } from '@/utils/notificationSystem';
import { SYSTEM_ROLES } from '@/utils/enhancedRoleManagement';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Shield,
    AlertTriangle,
    Eye,
    EyeOff,
    Lock,
    Unlock,
    FileText,
    UserCheck,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle
} from 'lucide-react';

// Data Access Control Component
export default function DataAccessControl({
    patientId,
    patientName,
    dataType,
    children,
    onAccessGranted,
    onAccessDenied,
    requireConsent = true,
    showAccessInfo = true
}) {
    const { user } = useAuth();
    const [accessLevel, setAccessLevel] = useState(null);
    const [consentStatus, setConsentStatus] = useState(null);
    const [privacySettings, setPrivacySettings] = useState(null);
    const [emergencyAccess, setEmergencyAccess] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showEmergencyDialog, setShowEmergencyDialog] = useState(false);
    const [emergencyReason, setEmergencyReason] = useState('');
    const [maskedData, setMaskedData] = useState(null);

    // Check access permissions on mount
    useEffect(() => {
        checkAccessPermissions();
    }, [patientId, user, dataType]);

    const checkAccessPermissions = async () => {
        try {
            setIsLoading(true);

            // Check data access level
            const access = await consentManager.checkDataAccess(
                user.id,
                user.role,
                patientId,
                dataType
            );
            setAccessLevel(access);

            // Check consent status if required
            if (requireConsent) {
                const hasConsent = await consentManager.hasConsent(patientId, dataType);
                setConsentStatus(hasConsent);
            }

            // Get privacy settings
            const privacy = await consentManager.getPrivacyPreferences(patientId);
            setPrivacySettings(privacy);

            // Check for active emergency access
            const emergency = await consentManager.checkEmergencyAccess(
                user.id,
                patientId,
                dataType
            );
            setEmergencyAccess(emergency);

            // Apply data masking if needed
            if (access === 'limited' || access === 'masked') {
                const masked = await consentManager.applyDataMasking(
                    children,
                    user.role,
                    patientId,
                    dataType
                );
                setMaskedData(masked);
            }

        } catch (error) {
            console.error('Failed to check access permissions:', error);
            setAccessLevel('none');
        } finally {
            setIsLoading(false);
        }
    };

    const requestEmergencyAccess = async () => {
        try {
            const emergencyRequest = await consentManager.requestEmergencyAccess({
                userId: user.id,
                userName: user.name,
                userRole: user.role,
                patientId,
                patientName,
                reason: emergencyReason,
                dataType,
                urgency: 'high'
            });

            // Log audit event
            await auditLogger.logBreakGlassAccess(
                patientId,
                patientName,
                emergencyReason,
                {
                    userId: user.id,
                    userRole: user.role,
                    dataType,
                    emergencyRequestId: emergencyRequest.id
                }
            );

            setShowEmergencyDialog(false);
            setEmergencyReason('');

            // Show success message
            alert('Emergency access request submitted. Administrators have been notified.');

        } catch (error) {
            console.error('Failed to request emergency access:', error);
            alert('Failed to request emergency access. Please try again.');
        }
    };

    const handleAccessGranted = useCallback(() => {
        if (onAccessGranted) {
            onAccessGranted({
                accessLevel,
                consentStatus,
                emergencyAccess,
                user: user
            });
        }
    }, [accessLevel, consentStatus, emergencyAccess, user, onAccessGranted]);

    const handleAccessDenied = useCallback(() => {
        if (onAccessDenied) {
            onAccessDenied({
                accessLevel,
                consentStatus,
                user: user,
                reason: 'insufficient_permissions'
            });
        }
    }, [accessLevel, consentStatus, user, onAccessDenied]);

    // Render access denied state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (accessLevel === 'none') {
        return (
            <Card className="border-red-200 bg-red-50">
                <CardHeader>
                    <CardTitle className="text-red-800 flex items-center gap-2">
                        <Lock className="w-5 h-5" />
                        Access Denied
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            You don't have permission to access this {dataType} data for {patientName}.
                        </AlertDescription>
                    </Alert>
                    <div className="mt-4">
                        <Button
                            variant="outline"
                            onClick={() => setShowEmergencyDialog(true)}
                            className="text-red-600 border-red-300 hover:bg-red-100"
                        >
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            Request Emergency Access
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (requireConsent && !consentStatus) {
        return (
            <Card className="border-yellow-200 bg-yellow-50">
                <CardHeader>
                    <CardTitle className="text-yellow-800 flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Consent Required
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            Patient consent is required to access this {dataType} data.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    // Render access info if requested
    if (showAccessInfo) {
        return (
            <div className="space-y-4">
                <AccessInfoCard
                    accessLevel={accessLevel}
                    consentStatus={consentStatus}
                    emergencyAccess={emergencyAccess}
                    userRole={user.role}
                    dataType={dataType}
                />
                <div className="relative">
                    {maskedData ? (
                        <div className="relative">
                            <div className="absolute inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center z-10">
                                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                    <EyeOff className="w-3 h-3 mr-1" />
                                    Data Masked
                                </Badge>
                            </div>
                            {children}
                        </div>
                    ) : (
                        children
                    )}
                </div>
            </div>
        );
    }

    return children;
}

// Access Information Card
function AccessInfoCard({ accessLevel, consentStatus, emergencyAccess, userRole, dataType }: any) {
    const getAccessLevelColor = (level: any) => {
        switch (level) {
            case 'full': return 'bg-green-100 text-green-800';
            case 'limited': return 'bg-yellow-100 text-yellow-800';
            case 'emergency': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getAccessLevelIcon = (level: any) => {
        switch (level) {
            case 'full': return <Eye className="w-4 h-4" />;
            case 'limited': return <EyeOff className="w-4 h-4" />;
            case 'emergency': return <AlertTriangle className="w-4 h-4" />;
            default: return <Lock className="w-4 h-4" />;
        }
    };

    return (
        <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-3">
                <CardTitle className="text-blue-800 text-sm flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Data Access Information
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Access Level:</span>
                    <Badge className={getAccessLevelColor(accessLevel)}>
                        {getAccessLevelIcon(accessLevel)}
                        <span className="ml-1 capitalize">{accessLevel}</span>
                    </Badge>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">User Role:</span>
                    <Badge variant="outline">
                        {SYSTEM_ROLES[userRole]?.name || userRole}
                    </Badge>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Data Type:</span>
                    <Badge variant="outline">
                        {dataType}
                    </Badge>
                </div>

                {consentStatus !== null && (
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Consent Status:</span>
                        <Badge className={consentStatus ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {consentStatus ? (
                                <>
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Granted
                                </>
                            ) : (
                                <>
                                    <XCircle className="w-3 h-3 mr-1" />
                                    Required
                                </>
                            )}
                        </Badge>
                    </div>
                )}

                {emergencyAccess && (
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Emergency Access:</span>
                        <Badge className="bg-red-100 text-red-800">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Active
                        </Badge>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

// Emergency Access Dialog
function EmergencyAccessDialog({
    isOpen,
    onClose,
    onRequest,
    patientName,
    dataType
}) {
    const [reason, setReason] = useState('');
    const [urgency, setUrgency] = useState('high');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onRequest(reason, urgency);
        setReason('');
        setUrgency('high');
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="w-5 h-5" />
                        Request Emergency Access
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>{"Patient"}</Label>
                        <Input value={patientName} disabled />
                    </div>

                    <div className="space-y-2">
                        <Label>{"Data Type"}</Label>
                        <Input value={dataType} disabled />
                    </div>

                    <div className="space-y-2">
                        <Label>{"Urgency Level"}</Label>
                        <Select value={urgency} onValueChange={setUrgency}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="critical">Critical</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>{"Reason for Emergency Access *"}</Label>
                        <Textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Please provide a detailed reason for requesting emergency access..."
                            required
                            rows={4}
                        />
                    </div>

                    <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            This request will be logged and reviewed by administrators.
                            Emergency access is granted for a limited time only.
                        </AlertDescription>
                    </Alert>

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="destructive">
                            Request Access
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// Consent Management Component
export function ConsentManagement({ patientId, patientName, onConsentUpdate }: any) {
    const [consents, setConsents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showConsentForm, setShowConsentForm] = useState(false);

    useEffect(() => {
        loadConsents();
    }, [patientId]);

    const loadConsents = async () => {
        try {
            setIsLoading(true);
            const patientConsents = await consentManager.getPatientConsents(patientId);
            setConsents(patientConsents);
        } catch (error) {
            console.error('Failed to load consents:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleConsentUpdate = async (consentId, updates) => {
        try {
            await consentManager.updateConsent(consentId, updates);
            await loadConsents();
            if (onConsentUpdate) {
                onConsentUpdate();
            }
        } catch (error) {
            console.error('Failed to update consent:', error);
        }
    };

    const handleConsentRevoke = async (consentId, reason) => {
        try {
            await consentManager.revokeConsent(consentId, reason, 'current_user');
            await loadConsents();
            if (onConsentUpdate) {
                onConsentUpdate();
            }
        } catch (error) {
            console.error('Failed to revoke consent:', error);
        }
    };

    if (isLoading) {
        return <div className="animate-pulse bg-gray-200 h-32 rounded"></div>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <UserCheck className="w-5 h-5" />
                    Consent Management
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="active" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="active">Active</TabsTrigger>
                        <TabsTrigger value="expired">Expired</TabsTrigger>
                        <TabsTrigger value="revoked">Revoked</TabsTrigger>
                    </TabsList>

                    <TabsContent value="active" className="space-y-3">
                        {consents.filter(c => c.status === CONSENT_STATUSES.OBTAINED).map(consent => (
                            <ConsentCard
                                key={consent.id}
                                consent={consent}
                                onUpdate={handleConsentUpdate}
                                onRevoke={handleConsentRevoke}
                            />
                        ))}
                    </TabsContent>

                    <TabsContent value="expired" className="space-y-3">
                        {consents.filter(c => c.status === CONSENT_STATUSES.EXPIRED).map(consent => (
                            <ConsentCard
                                key={consent.id}
                                consent={consent}
                                onUpdate={handleConsentUpdate}
                                onRevoke={handleConsentRevoke}
                            />
                        ))}
                    </TabsContent>

                    <TabsContent value="revoked" className="space-y-3">
                        {consents.filter(c => c.status === CONSENT_STATUSES.REVOKED).map(consent => (
                            <ConsentCard
                                key={consent.id}
                                consent={consent}
                                onUpdate={handleConsentUpdate}
                                onRevoke={handleConsentRevoke}
                            />
                        ))}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}

// Individual Consent Card
function ConsentCard({ consent, onUpdate, onRevoke }: any) {
    const getStatusColor = (status: any) => {
        switch (status) {
            case CONSENT_STATUSES.OBTAINED: return 'bg-green-100 text-green-800';
            case CONSENT_STATUSES.EXPIRED: return 'bg-yellow-100 text-yellow-800';
            case CONSENT_STATUSES.REVOKED: return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status: any) => {
        switch (status) {
            case CONSENT_STATUSES.OBTAINED: return <CheckCircle className="w-4 h-4" />;
            case CONSENT_STATUSES.EXPIRED: return <Clock className="w-4 h-4" />;
            case CONSENT_STATUSES.REVOKED: return <XCircle className="w-4 h-4" />;
            default: return <AlertCircle className="w-4 h-4" />;
        }
    };

    return (
        <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{consent.consentTitle}</h3>
                            <Badge className={getStatusColor(consent.status)}>
                                {getStatusIcon(consent.status)}
                                <span className="ml-1 capitalize">{consent.status}</span>
                            </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{consent.consentDetails}</p>
                        <div className="text-xs text-gray-500">
                            <p>Obtained by: {consent.obtainedBy}</p>
                            <p>Date: {new Date(consent.obtainedAt).toLocaleDateString()}</p>
                            {consent.expiryDate && (
                                <p>Expires: {new Date(consent.expiryDate).toLocaleDateString()}</p>
                            )}
                        </div>
                    </div>

                    {consent.status === CONSENT_STATUSES.OBTAINED && (
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onUpdate(consent.id, { status: CONSENT_STATUSES.EXPIRED })}
                            >
                                Mark Expired
                            </Button>
                            <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                    const reason = prompt('Reason for revocation:');
                                    if (reason) {
                                        onRevoke(consent.id, reason);
                                    }
                                }}
                            >
                                Revoke
                            </Button>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

// Higher-order component for automatic access control
export function withDataAccessControl(WrappedComponent, options = {}) {
    return function DataAccessControlledComponent(props) {
        const { patientId, patientName, dataType, ...otherProps } = props;

        return (
            <DataAccessControl
                patientId={patientId}
                patientName={patientName}
                dataType={dataType}
                requireConsent={options.requireConsent}
                showAccessInfo={options.showAccessInfo}
                onAccessGranted={options.onAccessGranted}
                onAccessDenied={options.onAccessDenied}
            >
                <WrappedComponent {...otherProps} />
            </DataAccessControl>
        );
    };
}
