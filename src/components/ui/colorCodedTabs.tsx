import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "@/lib/utils"
import { getTabClasses, getTabIconClasses, TAB_CONFIGURATIONS } from "@/utils/tabColors"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.List>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & {
        colorScheme?: 'default' | 'blue' | 'green' | 'red' | 'yellow' | 'purple';
    }
>(({ className, colorScheme = 'default', ...props }, ref) => (
    <TabsPrimitive.List
        ref={ref}
        className={cn(
            "inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
            className
        )}
        {...props} />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.Trigger>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & {
        colorScheme?: 'default' | 'blue' | 'green' | 'red' | 'yellow' | 'purple';
        icon?: React.ComponentType<{ className?: string }>;
        iconPosition?: 'left' | 'right';
    }
>(({
    className,
    colorScheme = 'default',
    icon: Icon,
    iconPosition = 'left',
    ...props
}, ref) => {
    const isActive = props['data-state'] === 'active'
    const tabClasses = colorScheme !== 'default'
        ? getTabClasses(props.value, isActive, colorScheme)
        : cn(
            "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow",
            className
        )

    return (
        <TabsPrimitive.Trigger
            ref={ref}
            className={tabClasses}
            {...props}
        >
            {Icon && iconPosition === 'left' && (
                <Icon className={cn("h-4 w-4 mr-2", colorScheme !== 'default' ? getTabIconClasses(props.value, colorScheme) : "")} />
            )}
            {props.children}
            {Icon && iconPosition === 'right' && (
                <Icon className={cn("h-4 w-4 ml-2", colorScheme !== 'default' ? getTabIconClasses(props.value, colorScheme) : "")} />
            )}
        </TabsPrimitive.Trigger>
    )
})
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
    <TabsPrimitive.Content
        ref={ref}
        className={cn(
            "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            className
        )}
        {...props} />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

// Enhanced TabsList with color coding support
const ColorCodedTabsList = React.forwardRef(({
    className,
    tabs = [],
    colorScheme = 'auto',
    ...props
}, ref) => (
    <TabsPrimitive.List
        ref={ref}
        className={cn(
            "inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
            className
        )}
        {...props}
    >
        {tabs.map((tab: any) => (
            <TabsPrimitive.Trigger
                key={tab.value}
                value={tab.value}
                className={getTabClasses(tab.value, false, tab.scheme || colorScheme)}
            >
                {tab.icon && (
                    <tab.icon className={getTabIconClasses(tab.value, tab.scheme || colorScheme)} />
                )}
                {tab.label}
            </TabsPrimitive.Trigger>
        ))}
    </TabsPrimitive.List>
))
ColorCodedTabsList.displayName = "ColorCodedTabsList"

// Pre-configured tab components for common use cases
const PatientProfileTabs = React.forwardRef(({ className, ...props }, ref) => (
    <ColorCodedTabsList
        ref={ref}
        className={className}
        tabs={TAB_CONFIGURATIONS.PATIENT_PROFILE.tabs}
        {...props}
    />
))
PatientProfileTabs.displayName = "PatientProfileTabs"

const PrescriptionManagementTabs = React.forwardRef(({ className, ...props }, ref) => (
    <ColorCodedTabsList
        ref={ref}
        className={className}
        tabs={TAB_CONFIGURATIONS.PRESCRIPTION_MANAGEMENT.tabs}
        {...props}
    />
))
PrescriptionManagementTabs.displayName = "PrescriptionManagementTabs"

const BillingTabs = React.forwardRef(({ className, ...props }, ref) => (
    <ColorCodedTabsList
        ref={ref}
        className={className}
        tabs={TAB_CONFIGURATIONS.BILLING.tabs}
        {...props}
    />
))
BillingTabs.displayName = "BillingTabs"

const LabManagementTabs = React.forwardRef(({ className, ...props }, ref) => (
    <ColorCodedTabsList
        ref={ref}
        className={className}
        tabs={TAB_CONFIGURATIONS.LAB_MANAGEMENT.tabs}
        {...props}
    />
))
LabManagementTabs.displayName = "LabManagementTabs"

export {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
    ColorCodedTabsList,
    PatientProfileTabs,
    PrescriptionManagementTabs,
    BillingTabs,
    LabManagementTabs
}
