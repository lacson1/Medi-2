import PropTypes from "prop-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  AlertTriangle, 
  Info, 
  Package, 
  Factory, 
  DollarSign,
  Calendar,
  Shield,
  Pill,
  Activity
} from "lucide-react";

export default function MedicationInfoCard({ medication, onClose }: any) {
  if (!medication) return null;

  const isLowStock = medication.stockLevel <= medication.lowStockThreshold;
  const stockStatus = isLowStock ? "Low Stock" : "In Stock";
  const stockColor = isLowStock ? "destructive" : "default";

  return (
    <Card className="w-full max-w-2xl mx-auto border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-blue-900 flex items-center gap-2">
            <Pill className="w-5 h-5" />
            {medication.name}
            {medication.generic && (
              <Badge variant="secondary" className="text-xs">
                Generic
              </Badge>
            )}
          </CardTitle>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl font-bold"
          >
            ×
          </button>
        </div>
        {medication.genericName && medication.genericName !== medication.name && (
          <p className="text-sm text-gray-600">
            Generic: {medication.genericName}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Stock Alert */}
        {isLowStock && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Low Stock Alert:</strong> Only {medication.stockLevel} units remaining 
              (threshold: {medication.lowStockThreshold})
            </AlertDescription>
          </Alert>
        )}

        {/* Basic Information */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium">Category:</span>
            </div>
            <Badge variant="outline">{medication.category}</Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium">Stock Status:</span>
            </div>
            <Badge variant={stockColor}>
              {stockStatus} ({medication.stockLevel} units)
            </Badge>
          </div>
        </div>

        {/* Dosage and Frequency */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Pill className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium">Available Dosages:</span>
          </div>
          <p className="text-sm text-gray-700">{medication.dosage}</p>
          
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium">Typical Frequency:</span>
          </div>
          <p className="text-sm text-gray-700">{medication.frequency}</p>
        </div>

        {/* Indication and Route */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium">Indication:</span>
          </div>
          <p className="text-sm text-gray-700">{medication.indication}</p>
          
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium">Route:</span>
          </div>
          <Badge variant="outline" className="capitalize">
            {medication.route}
          </Badge>
        </div>

        {/* Manufacturer and Pricing */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Factory className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium">Manufacturer:</span>
            </div>
            <p className="text-sm text-gray-700">{medication.manufacturer}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium">Unit Price:</span>
            </div>
            <p className="text-sm text-gray-700">${medication.unitPrice}</p>
          </div>
        </div>

        {/* Prescription Requirements */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium">Prescription Requirements:</span>
          </div>
          <div className="flex gap-2">
            <Badge variant={medication.prescriptionRequired ? "destructive" : "default"}>
              {medication.prescriptionRequired ? "Prescription Required" : "Over-the-Counter"}
            </Badge>
            {medication.controlledSubstance && (
              <Badge variant="destructive">Controlled Substance</Badge>
            )}
          </div>
        </div>

        {/* Brand Names */}
        {medication.brandNames && medication.brandNames.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium">Brand Names:</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {medication.brandNames.map((brand, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {brand}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Pregnancy Category */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium">Pregnancy Category:</span>
          </div>
          <Badge 
            variant={
              medication.pregnancyCategory === 'X' ? 'destructive' : 
              medication.pregnancyCategory === 'D' ? 'destructive' :
              medication.pregnancyCategory === 'C' ? 'default' :
              'default'
            }
          >
            Category {medication.pregnancyCategory}
          </Badge>
        </div>

        {/* Monitoring Requirements */}
        {medication.monitoring && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium">Monitoring Required:</span>
            </div>
            <p className="text-sm text-gray-700">{medication.monitoring}</p>
          </div>
        )}

        {/* Last Restocked */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium">Last Restocked:</span>
          </div>
          <p className="text-sm text-gray-700">
            {new Date(medication.lastRestocked).toLocaleDateString()}
          </p>
        </div>

        {/* Side Effects */}
        {medication.sideEffects && medication.sideEffects.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium">Common Side Effects:</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {medication.sideEffects.map((effect, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {effect}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Drug Interactions */}
        {medication.interactions && medication.interactions.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium">Known Interactions:</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {medication.interactions.map((interaction, index) => (
                <Badge key={index} variant="destructive" className="text-xs">
                  {interaction}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Contraindications */}
        {medication.contraindications && medication.contraindications.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium">Contraindications:</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {medication.contraindications.map((contraindication, index) => (
                <Badge key={index} variant="destructive" className="text-xs">
                  {contraindication}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

MedicationInfoCard.propTypes = {
  medication: PropTypes.object,
  onClose: PropTypes.func.isRequired,
};
