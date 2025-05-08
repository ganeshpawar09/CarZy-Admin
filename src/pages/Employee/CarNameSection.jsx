import { Star, Heart, Award, Clock, Shield, MapPin } from "lucide-react";

export default function CarNameSection({ car }) {


  
  return (
    <div className="px-4 py-6 bg-white rounded-lg shadow-sm">
      {/* Car Name and Basic Info */}
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            {car.company_name} {car.model_name} {car.manufacture_year}
          </h1>
          <div className="flex flex-wrap items-center text-sm gap-3">
            <span className="bg-gray-100 px-3 py-1.5 rounded-md font-medium">
              {car.transmission || "Manual"}
            </span>
            <span className="bg-gray-100 px-3 py-1.5 rounded-md font-medium capitalize">
              {car.fuel_type}
            </span>
            <span className="bg-gray-100 px-3 py-1.5 rounded-md font-medium">
              {car.seats || "5"} Seats
            </span>
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              <span className="ml-1.5 font-medium">{car.car_rating}</span>
              <span className="text-gray-500 ml-1">
                ({car.no_of_car_rating || "0"} Reviews)
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Car highlights */}
      <div className="flex flex-wrap gap-5 my-4">
        {car.ownership_count === 1 && (
          <div className="flex items-center">
            <Award className="h-5 w-5 text-blue-500 mr-2" />
            <span className="text-sm font-medium">First Owner</span>
          </div>
        )}
        
        {new Date(car.insurance_expiry_date) > new Date() && (
          <div className="flex items-center">
            <Shield className="h-5 w-5 text-green-500 mr-2" />
            <span className="text-sm font-medium">Insured</span>
          </div>
        )}
        
        {new Date() - new Date(car.last_serviced_on) < 90 * 24 * 60 * 60 * 1000 && (
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-purple-500 mr-2" />
            <span className="text-sm font-medium">Recently Serviced</span>
          </div>
        )}
        
        
      </div>
      
      {/* Car specs - moved up for better grouping */}
      <div className="flex flex-wrap gap-2 mb-6">   
        {car.car_type && (
          <span className="bg-black text-white text-xs px-3 py-1.5 rounded-full font-medium">
            {car.car_type.toUpperCase()}
          </span>
        )}
        {car.transmission_type && (
          <span className="bg-black text-white text-xs px-3 py-1.5 rounded-full font-medium">
            {car.transmission_type.toUpperCase()}
          </span>
        )}
      </div>
      
      {/* Location information in separate card */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-start mb-4">
          <MapPin className="h-5 w-5 text-gray-600 mr-3 mt-0.5 flex-shrink-0" />
          <p className="text-gray-700">{car.location.address}</p>
        </div>
        <div className="flex items-center justify-between">
          
          <button 
            className="text-blue-600 hover:text-blue-800 font-medium px-3 py-1 hover:bg-blue-50 rounded-md transition"
            onClick={() => {
              try {
                if (searchParams.coordinates) {
                  const coords = searchParams.coordinates;
                  if (coords && coords.lat && coords.lng) {
                    const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${coords.lat},${coords.lng}&destination=${car.latitude},${car.longitude}&travelmode=driving`;
                    window.open(directionsUrl, '_blank');
                  } else {
                    alert("Your location coordinates are unavailable. Please set your location first.");
                  }
                } else {
                  alert("Your location is not set. Please select your location first.");
                }
              } catch (error) {
                console.error("Error getting directions:", error);
                alert("Unable to get directions. Please try again.");
              }
            }}
          >
            Get Directions
          </button>
        </div>
      </div>
    </div>
  );
}