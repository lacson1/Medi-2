import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface PatientFilters {
  gender: string;
  ageMin: string;
  ageMax: string;
  category: string;
  status: string;
  bloodType: string;
}

interface PatientFilterDrawerProps {
  onApplyFilters: (filters: PatientFilters) => void;
  onReset: () => void;
  currentFilters: PatientFilters;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PatientFilterDrawer({
  onApplyFilters,
  onReset,
  currentFilters,
  open,
  onOpenChange,
}: PatientFilterDrawerProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { register, handleSubmit, reset, watch, setValue } = useForm<PatientFilters>({
    defaultValues: currentFilters,
  });

  // Sync form with URL params on mount
  useEffect(() => {
    const urlFilters: Partial<PatientFilters> = {};
    const gender = searchParams.get('gender');
    const ageMin = searchParams.get('ageMin');
    const ageMax = searchParams.get('ageMax');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const bloodType = searchParams.get('bloodType');

    if (gender) urlFilters.gender = gender;
    if (ageMin) urlFilters.ageMin = ageMin;
    if (ageMax) urlFilters.ageMax = ageMax;
    if (category) urlFilters.category = category;
    if (status) urlFilters.status = status;
    if (bloodType) urlFilters.bloodType = bloodType;

    // Only update if URL has different values than current
    if (Object.keys(urlFilters).length > 0) {
      const updatedFilters = { ...currentFilters, ...urlFilters };
      reset(updatedFilters);
    }
  }, [searchParams, reset, currentFilters]);

  const activeFiltersCount = Object.values(currentFilters).filter(
    (value) => value !== "all" && value !== ""
  ).length;

  // Update URL params when filters are applied
  const onSubmit = (data: PatientFilters) => {
    const newSearchParams = new URLSearchParams(searchParams);
    
    // Set filter params
    if (data.gender && data.gender !== 'all') {
      newSearchParams.set('gender', data.gender);
    } else {
      newSearchParams.delete('gender');
    }
    
    if (data.ageMin) {
      newSearchParams.set('ageMin', data.ageMin);
    } else {
      newSearchParams.delete('ageMin');
    }
    
    if (data.ageMax) {
      newSearchParams.set('ageMax', data.ageMax);
    } else {
      newSearchParams.delete('ageMax');
    }
    
    if (data.category && data.category !== 'all') {
      newSearchParams.set('category', data.category);
    } else {
      newSearchParams.delete('category');
    }
    
    if (data.status && data.status !== 'all') {
      newSearchParams.set('status', data.status);
    } else {
      newSearchParams.delete('status');
    }
    
    if (data.bloodType && data.bloodType !== 'all') {
      newSearchParams.set('bloodType', data.bloodType);
    } else {
      newSearchParams.delete('bloodType');
    }
    
    setSearchParams(newSearchParams);
    onApplyFilters(data);
    onOpenChange(false);
  };

  const handleReset = () => {
    const emptyFilters: PatientFilters = {
      gender: "all",
      ageMin: "",
      ageMax: "",
      category: "all",
      status: "all",
      bloodType: "all",
    };
    reset(emptyFilters);
    
    // Clear URL params
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete('gender');
    newSearchParams.delete('ageMin');
    newSearchParams.delete('ageMax');
    newSearchParams.delete('category');
    newSearchParams.delete('status');
    newSearchParams.delete('bloodType');
    setSearchParams(newSearchParams);
    
    onReset();
    onOpenChange(false);
  };

  const selectedGender = watch("gender");
  const selectedCategory = watch("category");
  const selectedStatus = watch("status");
  const selectedBloodType = watch("bloodType");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 border border-gray-200 hover:bg-gray-50"
        >
          <Filter className="w-4 h-4" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] px-1.5">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-xl font-semibold text-gray-900">Filter Patients</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
          {/* Gender Filter */}
          <div className="space-y-2">
            <Label htmlFor="gender" className="text-sm font-medium text-gray-700">
              Gender
            </Label>
            <Select
              value={selectedGender}
              onValueChange={(value) => setValue("gender", value)}
            >
              <SelectTrigger id="gender" className="h-10">
                <SelectValue placeholder="All Genders" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genders</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Age Range Filter */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Age Range</Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="ageMin" className="text-xs text-gray-500">
                  Minimum
                </Label>
                <Input
                  id="ageMin"
                  type="number"
                  placeholder="0"
                  min="0"
                  max="120"
                  {...register("ageMin")}
                  className="h-10"
                />
              </div>
              <div>
                <Label htmlFor="ageMax" className="text-xs text-gray-500">
                  Maximum
                </Label>
                <Input
                  id="ageMax"
                  type="number"
                  placeholder="120"
                  min="0"
                  max="120"
                  {...register("ageMax")}
                  className="h-10"
                />
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium text-gray-700">
              Category
            </Label>
            <Select
              value={selectedCategory}
              onValueChange={(value) => setValue("category", value)}
            >
              <SelectTrigger id="category" className="h-10">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="adult">Adult</SelectItem>
                <SelectItem value="pediatric">Pediatric</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-medium text-gray-700">
              Status
            </Label>
            <Select
              value={selectedStatus}
              onValueChange={(value) => setValue("status", value)}
            >
              <SelectTrigger id="status" className="h-10">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Blood Type Filter */}
          <div className="space-y-2">
            <Label htmlFor="bloodType" className="text-sm font-medium text-gray-700">
              Blood Type
            </Label>
            <Select
              value={selectedBloodType}
              onValueChange={(value) => setValue("bloodType", value)}
            >
              <SelectTrigger id="bloodType" className="h-10">
                <SelectValue placeholder="All Blood Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Blood Types</SelectItem>
                <SelectItem value="A+">A+</SelectItem>
                <SelectItem value="A-">A-</SelectItem>
                <SelectItem value="B+">B+</SelectItem>
                <SelectItem value="B-">B-</SelectItem>
                <SelectItem value="AB+">AB+</SelectItem>
                <SelectItem value="AB-">AB-</SelectItem>
                <SelectItem value="O+">O+</SelectItem>
                <SelectItem value="O-">O-</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              className="flex-1 border-gray-200 hover:bg-gray-50"
            >
              Reset
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Apply Filters
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
