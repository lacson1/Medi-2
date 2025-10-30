import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function PatientCardSkeleton() {
    return (
        <Card className="p-6 border border-gray-200 bg-white">
            <div className="flex items-start gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-3">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-36" />
                </div>
                <Skeleton className="h-8 w-8 rounded" />
            </div>
        </Card>
    );
}

export function PatientListSkeleton() {
    return (
        <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
                <Card key={i} className="p-4 border border-gray-200 bg-white">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-3 w-56" />
                        </div>
                        <Skeleton className="h-6 w-20" />
                    </div>
                </Card>
            ))}
        </div>
    );
}

export function PatientGridSkeleton() {
    return (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
                <PatientCardSkeleton key={i} />
            ))}
        </div>
    );
}

