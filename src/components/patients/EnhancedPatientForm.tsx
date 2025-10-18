import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { X, Plus, Trash2, MapPin, AlertTriangle, Stethoscope, Scissors, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getAddressSuggestions,
  getAllergySuggestions,
  getMedicalConditionSuggestions,
  getSurgicalHistorySuggestions,
  getAISuggestions,
  getPreviousPatientData,
  debounce
} from "@/utils/autopopulateUtils";

export default function EnhancedPatientForm({ patient, onSubmit, onCancel, isSubmitting }: any) {
  const [formData, setFormData] = useState(patient || {
    first_name: "",
    last_name: "",
    date_of_birth: "",
    gender: "",
    phone: "",
    email: "",
    address: "",
    blood_type: "unknown",
    allergies: [],
    medical_conditions: [],
    surgical_history: [],
    medications: [],
    emergency_contact: {},
    insurance_provider: "",
    insurance_id: "",
    status: "active"
  });

  const [newAllergy, setNewAllergy] = useState("");
  const [newCondition, setNewCondition] = useState("");
  const [newSurgicalHistory, setNewSurgicalHistory] = useState("");

  // Autopopulation states
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [allergySuggestions, setAllergySuggestions] = useState([]);
  const [conditionSuggestions, setConditionSuggestions] = useState([]);
  const [surgicalSuggestions, setSurgicalSuggestions] = useState([]);
  const [showAddressPopover, setShowAddressPopover] = useState(false);
  const [showAllergyPopover, setShowAllergyPopover] = useState(false);
  const [showConditionPopover, setShowConditionPopover] = useState(false);
  const [showSurgicalPopover, setShowSurgicalPopover] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  // Debounced functions for API calls
  const debouncedAddressSearch = useCallback(
    debounce(async (query) => {
      if (query.length < 3) return;
      setIsLoadingSuggestions(true);
      try {
        const suggestions = await getAddressSuggestions(query);
        setAddressSuggestions(suggestions);
      } catch (error) {
        console.error('Error fetching address suggestions:', error);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 300),
    []
  );

  const debouncedAllergySearch = useCallback(
    debounce(async (query) => {
      const suggestions = await getAllergySuggestions(query);
      setAllergySuggestions(suggestions);
    }, 200),
    []
  );

  const debouncedConditionSearch = useCallback(
    debounce(async (query) => {
      const suggestions = await getMedicalConditionSuggestions(query);
      setConditionSuggestions(suggestions);
    }, 200),
    []
  );

  const debouncedSurgicalSearch = useCallback(
    debounce(async (query) => {
      const suggestions = await getSurgicalHistorySuggestions(query);
      setSurgicalSuggestions(suggestions);
    }, 200),
    []
  );

  // Load AI suggestions when patient data changes
  useEffect(() => {
    if (patient?.id) {
      loadAISuggestions();
    }
  }, [patient?.id]);

  const loadAISuggestions = async () => {
    try {
      const previousData = await getPreviousPatientData(patient.id);
      const aiSuggestions = await getAISuggestions(previousData, 'medical_history');

      if (aiSuggestions.length > 0) {
        // Pre-populate with AI suggestions
        setFormData(prev => ({
          ...prev,
          medical_conditions: [...(prev.medical_conditions || []), ...aiSuggestions]
        }));
      }
    } catch (error) {
      console.error('Error loading AI suggestions:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.first_name || !formData.last_name) {
      alert("First name and last name are required");
      return;
    }

    if (!formData.date_of_birth) {
      alert("Date of birth is required");
      return;
    }

    onSubmit(formData);
  };

  const addAllergy = () => {
    if (newAllergy.trim()) {
      setFormData(prev => ({
        ...prev,
        allergies: [...(prev.allergies || []), newAllergy.trim()]
      }));
      setNewAllergy("");
      setShowAllergyPopover(false);
    }
  };

  const removeAllergy = (index: any) => {
    setFormData(prev => ({
      ...prev,
      allergies: prev.allergies.filter((_, i) => i !== index)
    }));
  };

  const addCondition = () => {
    if (newCondition.trim()) {
      setFormData(prev => ({
        ...prev,
        medical_conditions: [...(prev.medical_conditions || []), newCondition.trim()]
      }));
      setNewCondition("");
      setShowConditionPopover(false);
    }
  };

  const removeCondition = (index: any) => {
    setFormData(prev => ({
      ...prev,
      medical_conditions: prev.medical_conditions.filter((_, i) => i !== index)
    }));
  };

  const addSurgicalHistory = () => {
    if (newSurgicalHistory.trim()) {
      setFormData(prev => ({
        ...prev,
        surgical_history: [...(prev.surgical_history || []), newSurgicalHistory.trim()]
      }));
      setNewSurgicalHistory("");
      setShowSurgicalPopover(false);
    }
  };

  const removeSurgicalHistory = (index: any) => {
    setFormData(prev => ({
      ...prev,
      surgical_history: prev.surgical_history.filter((_, i) => i !== index)
    }));
  };

  const handleAddressChange = (value: any) => {
    setFormData(prev => ({ ...prev, address: value }));
    if (value.length >= 3) {
      debouncedAddressSearch(value);
      setShowAddressPopover(true);
    } else {
      setShowAddressPopover(false);
    }
  };

  const handleAllergyChange = (value: any) => {
    setNewAllergy(value);
    if (value.length >= 1) {
      debouncedAllergySearch(value);
      setShowAllergyPopover(true);
    } else {
      setShowAllergyPopover(false);
    }
  };

  const handleConditionChange = (value: any) => {
    setNewCondition(value);
    if (value.length >= 1) {
      debouncedConditionSearch(value);
      setShowConditionPopover(true);
    } else {
      setShowConditionPopover(false);
    }
  };

  const handleSurgicalChange = (value: any) => {
    setNewSurgicalHistory(value);
    if (value.length >= 1) {
      debouncedSurgicalSearch(value);
      setShowSurgicalPopover(true);
    } else {
      setShowSurgicalPopover(false);
    }
  };

  const selectAddressSuggestion = (suggestion: any) => {
    setFormData(prev => ({ ...prev, address: suggestion.address }));
    setShowAddressPopover(false);
  };

  const selectAllergySuggestion = (suggestion: any) => {
    setNewAllergy(suggestion);
    setShowAllergyPopover(false);
  };

  const selectConditionSuggestion = (suggestion: any) => {
    setNewCondition(suggestion);
    setShowConditionPopover(false);
  };

  const selectSurgicalSuggestion = (suggestion: any) => {
    setNewSurgicalHistory(suggestion);
    setShowSurgicalPopover(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="border-none shadow-xl mb-8">
        <CardHeader className="border-b border-gray-100">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {patient ? "Edit Patient" : "New Patient"}
              <Sparkles className="w-4 h-4 text-blue-500" />
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onCancel} type="button">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{"First Name *"}</Label>
                <Input
                  required
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  placeholder="Enter first name"
                />
              </div>
              <div className="space-y-2">
                <Label>{"Last Name *"}</Label>
                <Input
                  required
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  placeholder="Enter last name"
                />
              </div>
              <div className="space-y-2">
                <Label>{"Date of Birth *"}</Label>
                <Input
                  required
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{"Gender"}</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => setFormData({ ...formData, gender: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{"Phone"}</Label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(123) 456-7890"
                />
              </div>
              <div className="space-y-2">
                <Label>{"Email"}</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label>{"Blood Type"}</Label>
                <Select
                  value={formData.blood_type}
                  onValueChange={(value) => setFormData({ ...formData, blood_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{"Status"}</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Address with Autopopulation */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Address
              </Label>
              <Popover open={showAddressPopover} onOpenChange={setShowAddressPopover}>
                <PopoverTrigger asChild>
                  <div className="relative">
                    <Textarea
                      value={formData.address}
                      onChange={(e) => handleAddressChange(e.target.value)}
                      rows={2}
                      placeholder="Enter full address (autopopulates from online database)"
                      className="pr-8"
                    />
                    {isLoadingSuggestions && (
                      <div className="absolute right-2 top-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      </div>
                    )}
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search addresses..." />
                    <CommandList>
                      <CommandEmpty>{"No addresses found."}</CommandEmpty>
                      <CommandGroup>
                        {addressSuggestions.map((suggestion, index) => (
                          <CommandItem
                            key={index}
                            onSelect={() => selectAddressSuggestion(suggestion)}
                            className="cursor-pointer"
                          >
                            <MapPin className="mr-2 h-4 w-4" />
                            <span className="truncate">{suggestion.display}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Allergies with Autopopulation */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Allergies
              </Label>
              <Popover open={showAllergyPopover} onOpenChange={setShowAllergyPopover}>
                <PopoverTrigger asChild>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add allergy (autopopulates from medical database)"
                      value={newAllergy}
                      onChange={(e) => handleAllergyChange(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addAllergy();
                        }
                      }}
                    />
                    <Button type="button" onClick={addAllergy} size="icon">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search allergies..." />
                    <CommandList>
                      <CommandEmpty>{"No allergies found."}</CommandEmpty>
                      <CommandGroup>
                        {allergySuggestions.map((suggestion, index) => (
                          <CommandItem
                            key={index}
                            onSelect={() => selectAllergySuggestion(suggestion)}
                            className="cursor-pointer"
                          >
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            <span>{suggestion}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.allergies?.map((allergy, idx) => (
                  <Badge key={idx} variant="secondary" className="bg-orange-50 text-orange-700 gap-1">
                    {allergy}
                    <button type="button" onClick={() => removeAllergy(idx)}>
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Medical Conditions with Autopopulation */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4" />
                Medical History
              </Label>
              <Popover open={showConditionPopover} onOpenChange={setShowConditionPopover}>
                <PopoverTrigger asChild>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add medical condition (autopopulates from medical database + AI)"
                      value={newCondition}
                      onChange={(e) => handleConditionChange(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addCondition();
                        }
                      }}
                    />
                    <Button type="button" onClick={addCondition} size="icon">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search medical conditions..." />
                    <CommandList>
                      <CommandEmpty>{"No conditions found."}</CommandEmpty>
                      <CommandGroup>
                        {conditionSuggestions.map((suggestion, index) => (
                          <CommandItem
                            key={index}
                            onSelect={() => selectConditionSuggestion(suggestion)}
                            className="cursor-pointer"
                          >
                            <Stethoscope className="mr-2 h-4 w-4" />
                            <span>{suggestion}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.medical_conditions?.map((condition, idx) => (
                  <Badge key={idx} variant="secondary" className="gap-1">
                    {condition}
                    <button type="button" onClick={() => removeCondition(idx)}>
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Surgical History with Autopopulation */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Scissors className="w-4 h-4" />
                Surgical History
              </Label>
              <Popover open={showSurgicalPopover} onOpenChange={setShowSurgicalPopover}>
                <PopoverTrigger asChild>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add surgical procedure (autopopulates from medical database + AI)"
                      value={newSurgicalHistory}
                      onChange={(e) => handleSurgicalChange(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSurgicalHistory();
                        }
                      }}
                    />
                    <Button type="button" onClick={addSurgicalHistory} size="icon">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search surgical procedures..." />
                    <CommandList>
                      <CommandEmpty>{"No procedures found."}</CommandEmpty>
                      <CommandGroup>
                        {surgicalSuggestions.map((suggestion, index) => (
                          <CommandItem
                            key={index}
                            onSelect={() => selectSurgicalSuggestion(suggestion)}
                            className="cursor-pointer"
                          >
                            <Scissors className="mr-2 h-4 w-4" />
                            <span>{suggestion}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.surgical_history?.map((procedure, idx) => (
                  <Badge key={idx} variant="secondary" className="bg-purple-50 text-purple-700 gap-1">
                    {procedure}
                    <button type="button" onClick={() => removeSurgicalHistory(idx)}>
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
              >
                {isSubmitting ? "Saving..." : patient ? "Update Patient" : "Add Patient"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
