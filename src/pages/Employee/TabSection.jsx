import { MapPin, Star, Check, X, Calendar, Clock, Info, Shield, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";

export default function TabSection({ car }) {
  const [activeTab, setActiveTab] = useState("features");

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short", 
      year: "numeric"
    });
  };

 


  


  // Process features into categories
  const featureCategories = {
    safety: ['Airbags', 'ABS', 'Parking Sensors', 'Rear Camera', 'Child Safety Locks'],
    comfort: ['AC', 'Power Steering', 'Power Windows', 'Automatic Climate Control', 'Heated Seats'],
    entertainment: ['Music System', 'Bluetooth Connectivity', 'USB Ports', 'Touchscreen Display', 'Speaker System'],
    convenience: ['Keyless Entry', 'Push Button Start', 'Cruise Control', 'Rain Sensing Wipers', 'Auto Headlamps']
  };

  // Sort features by category
  const categorizedFeatures = {};
  const otherFeatures = [];

  car.features.forEach(feature => {
    let categorized = false;
    
    for (const [category, keywords] of Object.entries(featureCategories)) {
      if (keywords.some(keyword => feature.name.toLowerCase().includes(keyword.toLowerCase()))) {
        if (!categorizedFeatures[category]) {
          categorizedFeatures[category] = [];
        }
        categorizedFeatures[category].push(feature);
        categorized = true;
        break;
      }
    }
    
    if (!categorized) {
      otherFeatures.push(feature);
    }
  });

  return (
    <>
      {/* Tabs */}
      <div className="border-b mb-6">
        <div className="flex space-x-8 overflow-x-auto scrollbar-hide">
          {[
            "features",
            "dates",
          ].map((tab) => (
            <button
              key={tab}
              className={`py-2 px-1 font-medium capitalize whitespace-nowrap ${
                activeTab === tab
                  ? "text-black border-b-2 border-black"
                  : "text-gray-500 hover:text-black"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "dates" ? "Important Dates" : tab}
            </button>
          ))}
        </div>
      </div>
   

      {/* Tab Content */}
      <div className="mb-8">
        {activeTab === "features" && (
          <div>
            <h3 className="text-xl font-semibold mb-4">Features & Specifications</h3>
            
            {/* Car Specifications */}
            <div className="mb-6">
              <h4 className="font-medium text-lg mb-3">Specifications</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-sm text-gray-500">Fuel Type</div>
                  <div className="font-medium capitalize">{car.fuel_type}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-sm text-gray-500">Year</div>
                  <div className="font-medium">{car.manufacture_year}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-sm text-gray-500">Seats</div>
                  <div className="font-medium">{car.seats}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-sm text-gray-500">Ownership</div>
                  <div className="font-medium">{car.ownership_count === 1 ? "1st Owner" : `${car.ownership_count}${car.ownership_count === 2 ? 'nd' : car.ownership_count === 3 ? 'rd' : 'th'} Owner`}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-sm text-gray-500">Transmission</div>
                  <div className="font-medium capitalize">{car.transmission}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-sm text-gray-500">Purchase Type</div>
                  <div className="font-medium capitalize">{car.purchase_type}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-sm text-gray-500">Hourly Rate</div>
                  <div className="font-medium">₹ {car.price_per_hour}</div>
                </div>
              </div>
            </div>
            
            {/* Features by Category */}
            <div>
              <h4 className="font-medium text-lg mb-3">Features</h4>
              
              {/* First show categorized features */}
              {Object.entries(categorizedFeatures).map(([category, features]) => (
                <div key={category} className="mb-4">
                  <h5 className="font-medium text-gray-700 capitalize mb-2">{category} Features</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {features.map((feature, index) => (
                      <div key={index} className="flex items-center">
                        {feature.available ? (
                          <Check className="h-5 w-5 text-green-500 mr-2" />
                        ) : (
                          <X className="h-5 w-5 text-red-500 mr-2" />
                        )}
                        <span
                          className={
                            feature.available ? "text-gray-800" : "text-gray-400"
                          }
                        >
                          {feature.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              {/* Then show other uncategorized features if any */}
              {otherFeatures.length > 0 && (
                <div className="mb-4">
                  <h5 className="font-medium text-gray-700 mb-2">Other Features</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {otherFeatures.map((feature, index) => (
                      <div key={index} className="flex items-center">
                        {feature.available ? (
                          <Check className="h-5 w-5 text-green-500 mr-2" />
                        ) : (
                          <X className="h-5 w-5 text-red-500 mr-2" />
                        )}
                        <span
                          className={
                            feature.available ? "text-gray-800" : "text-gray-400"
                          }
                        >
                          {feature.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Car Rating Section */}
            <div className="mt-6 bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="mr-4">
                  <div className="text-4xl font-bold">{car.car_rating}</div>
                  <div className="flex mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-4 w-4 ${i < Math.floor(car.car_rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} 
                      />
                    ))}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">{car.no_of_car_rating} ratings</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "dates" && (
          <div>
            <h3 className="text-xl font-semibold mb-4">Important Dates</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                    <h4 className="font-medium">Insurance Expiry</h4>
                  </div>
                  <p className="text-gray-700">{formatDate(car.insurance_expiry_date)}</p>
                  
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                    <h4 className="font-medium">PUC Expiry</h4>
                  </div>
                  <p className="text-gray-700">{formatDate(car.puc_expiry_date)}</p>
                  
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                    <h4 className="font-medium">RC Expiry</h4>
                  </div>
                  <p className="text-gray-700">{formatDate(car.rc_expiry_date)}</p>
                  
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Clock className="h-5 w-5 text-gray-500 mr-2" />
                    <h4 className="font-medium">Last Serviced On</h4>
                  </div>
                  <p className="text-gray-700">{formatDate(car.last_serviced_on)}</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-100 p-4 rounded-lg">
                <div className="flex items-start">
                  <Shield className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <div>
                    <h4 className="font-medium mb-1">Verification Status</h4>
                    <p className="text-gray-700 text-sm capitalize">
                      This car's verification status is <span className="font-medium">{car.verification_status?.replace(/_/g, ' ') || 'in process'}</span>.
                      {car.verification_status === 'verified' && ' All documents have been verified and the car is ready for rental.'}
                      {car.verification_status === 'rejected' && car.rejection_reason && ` Reason: ${car.rejection_reason}`}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <div className="flex items-start">
                  <Info className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
                  <div>
                    <h4 className="font-medium mb-1">Maintenance Status</h4>
                    <p className="text-gray-700 text-sm">
                      This car is well-maintained with all documentation up to date. The vehicle underwent its last service on {formatDate(car.last_serviced_on)} and is in excellent condition.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}