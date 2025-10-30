import React, { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, AlertTriangle, Clock, X } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface AlertItem {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  count?: number;
  actionLabel?: string;
  onAction?: () => void;
}

interface CollapsibleAlertBannerProps {
  alerts: AlertItem[];
  onDismiss?: (alertId: string) => void;
}

export default function CollapsibleAlertBanner({
  alerts,
  onDismiss,
}: CollapsibleAlertBannerProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  const criticalAlerts = alerts.filter(a => a.type === 'critical' && !dismissedAlerts.has(a.id));
  const warningAlerts = alerts.filter(a => a.type === 'warning' && !dismissedAlerts.has(a.id));
  const infoAlerts = alerts.filter(a => a.type === 'info' && !dismissedAlerts.has(a.id));

  const handleDismiss = (alertId: string) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]));
    if (onDismiss) {
      onDismiss(alertId);
    }
  };

  if (alerts.length === 0 || alerts.every(a => dismissedAlerts.has(a.id))) {
    return null;
  }

  const getAlertVariant = (type: string) => {
    switch (type) {
      case 'critical':
        return 'destructive';
      case 'warning':
        return 'default';
      default:
        return 'default';
    }
  };

  const getAlertStyles = (type: string) => {
    switch (type) {
      case 'critical':
        return 'border-red-200 bg-red-50 text-red-900';
      case 'warning':
        return 'border-orange-200 bg-orange-50 text-orange-900';
      default:
        return 'border-blue-200 bg-blue-50 text-blue-900';
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Alert className={`${criticalAlerts.length > 0 ? getAlertStyles('critical') : getAlertStyles('warning')} border-2`}>
        <div className="flex items-start justify-between w-full">
          <div className="flex items-start gap-3 flex-1">
            <AlertTriangle className="h-5 w-5 mt-0.5" />
            <div className="flex-1">
              <CollapsibleTrigger asChild>
                <div className="cursor-pointer">
                  <AlertTitle className="flex items-center gap-2">
                    {criticalAlerts.length > 0 ? (
                      <>
                        <span className="font-bold">Critical Alerts</span>
                        <span className="text-sm font-normal">
                          ({criticalAlerts.length} requiring immediate attention)
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="font-bold">Alerts</span>
                        <span className="text-sm font-normal">
                          ({warningAlerts.length + infoAlerts.length} notification{warningAlerts.length + infoAlerts.length !== 1 ? 's' : ''})
                        </span>
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 ml-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsOpen(!isOpen);
                      }}
                    >
                      {isOpen ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </AlertTitle>
                  <AlertDescription className="mt-1">
                    {criticalAlerts.length > 0
                      ? `${criticalAlerts[0].message}${criticalAlerts.length > 1 ? ` and ${criticalAlerts.length - 1} more...` : ''}`
                      : `${warningAlerts.length + infoAlerts.length} alert${warningAlerts.length + infoAlerts.length !== 1 ? 's' : ''} requiring attention`}
                  </AlertDescription>
                </div>
              </CollapsibleTrigger>
            </div>
          </div>
          {criticalAlerts.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="ml-4"
              onClick={() => {
                // Action handler - can be passed as prop
                if (criticalAlerts[0]?.onAction) {
                  criticalAlerts[0].onAction();
                }
              }}
            >
              Review Now
            </Button>
          )}
        </div>

        <CollapsibleContent className="mt-4 space-y-2">
          {criticalAlerts.map((alert) => (
            <Alert
              key={alert.id}
              variant={getAlertVariant(alert.type)}
              className={`${getAlertStyles(alert.type)} relative`}
            >
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 h-6 w-6 p-0"
                onClick={() => handleDismiss(alert.id)}
              >
                <X className="h-4 w-4" />
              </Button>
              <AlertTitle className="pr-8">{alert.title}</AlertTitle>
              <AlertDescription className="mt-1 pr-8">
                {alert.message}
                {alert.count && (
                  <span className="ml-2 font-semibold">({alert.count} affected)</span>
                )}
              </AlertDescription>
              {alert.actionLabel && alert.onAction && (
                <div className="mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={alert.onAction}
                  >
                    {alert.actionLabel}
                  </Button>
                </div>
              )}
            </Alert>
          ))}
          {warningAlerts.map((alert) => (
            <Alert
              key={alert.id}
              variant={getAlertVariant(alert.type)}
              className={`${getAlertStyles(alert.type)} relative`}
            >
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 h-6 w-6 p-0"
                onClick={() => handleDismiss(alert.id)}
              >
                <X className="h-4 w-4" />
              </Button>
              <AlertTitle className="pr-8">{alert.title}</AlertTitle>
              <AlertDescription className="mt-1 pr-8">{alert.message}</AlertDescription>
            </Alert>
          ))}
          {infoAlerts.map((alert) => (
            <Alert
              key={alert.id}
              variant={getAlertVariant(alert.type)}
              className={`${getAlertStyles(alert.type)} relative`}
            >
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 h-6 w-6 p-0"
                onClick={() => handleDismiss(alert.id)}
              >
                <X className="h-4 w-4" />
              </Button>
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 mt-0.5" />
                <div className="flex-1">
                  <AlertTitle className="pr-8">{alert.title}</AlertTitle>
                  <AlertDescription className="mt-1 pr-8">{alert.message}</AlertDescription>
                </div>
              </div>
            </Alert>
          ))}
        </CollapsibleContent>
      </Alert>
    </Collapsible>
  );
}


