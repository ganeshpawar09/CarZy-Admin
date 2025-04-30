import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  Users, Car, Calendar, CreditCard, Star, 
  TrendingUp, Percent, AlertCircle, CheckCircle 
} from 'lucide-react';
import Navbar from '../../components/NavBar'; 
import { API_ENDPOINTS } from '../../API_ENDPOINTS';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  function capitalizeFirstLetter(string) {
    if (!string) return "";
    string = string.replace(/_/g, ' ');
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await fetch(API_ENDPOINTS.ADMIN, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        
        const data = await response.json();
        setDashboardData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);
  

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
        <p className="mt-4 text-gray-700">Loading dashboard data...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center p-6 bg-red-50 rounded-lg">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <p className="mt-4 text-red-700">Error: {error}</p>
        <button 
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    </div>
  );

  if (!dashboardData) return null;

  // Format data for charts
  const userGrowthData = dashboardData.users.user_growth_last_six_months;
  
  // Prepare car data for pie charts
  const carFuelData = Object.entries(dashboardData.cars.cars_by_fuel_type).map(([name, value]) => ({
    name, value
  }));
  
  const carTransmissionData = Object.entries(dashboardData.cars.cars_by_transmission).map(([name, value]) => ({
    name, value
  }));
  
  const carTypeData = Object.entries(dashboardData.cars.cars_by_type).map(([name, value]) => ({
    name, value
  }));

  // Prepare booking status data
  const bookingStatusData = Object.entries(dashboardData.bookings.status_counts).map(([name, value]) => ({
    name, value
  }));

  // Prepare review data
  const reviewData = Object.entries(dashboardData.reviews).map(([name, value]) => ({
    name: name.replace('_star', '★'), value
  }));
  
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Navbar />
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Admin Dashboard</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <SummaryCard 
          title="Total Users" 
          value={dashboardData.users.total_users} 
          icon={<Users size={24} />} 
          color="bg-blue-100 text-blue-600"
        />
        <SummaryCard 
          title="Total Cars" 
          value={dashboardData.cars.total_cars} 
          icon={<Car size={24} />} 
          color="bg-green-100 text-green-600"
        />
        <SummaryCard 
          title="Total Bookings" 
          value={dashboardData.bookings.total_bookings} 
          icon={<Calendar size={24} />} 
          color="bg-yellow-100 text-yellow-600"
        />
        <SummaryCard 
          title="Total Revenue" 
          value={`$${dashboardData.financials.total_transaction_amount.toLocaleString()}`} 
          icon={<CreditCard size={24} />} 
          color="bg-purple-100 text-purple-600"
        />
      </div>
      
      {/* User Growth Section */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
          <TrendingUp className="mr-2" size={20} />
          User Growth (Last 6 Months)
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={userGrowthData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="count" stroke="#0088FE" activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* Car Statistics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Car Fuel Types</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={carFuelData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${capitalizeFirstLetter(name)}: ${(percent * 100).toFixed(0)}%`}
              >
                {carFuelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Transmission Types</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={carTransmissionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${capitalizeFirstLetter(name)}: ${(percent * 100).toFixed(0)}%`}
              >
                {carTransmissionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Car Types</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={carTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${capitalizeFirstLetter(name)}: ${(percent * 100).toFixed(0)}%`}
              >
                {carTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Booking Status and Reviews Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Booking Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={bookingStatusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" 
              tickFormatter={(name) => capitalizeFirstLetter(name)}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
            <Star className="mr-2" size={20} />
            Review Distribution
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reviewData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" 
              tickFormatter={(name) => capitalizeFirstLetter(name)}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#FFBB28" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Financial Summary Section */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Financial Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard 
            title="Total Revenue" 
            value={`$${dashboardData.financials.total_transaction_amount.toLocaleString()}`} 
            icon={<CreditCard size={20} />} 
          />
          <MetricCard 
            title="Refunded Amount" 
            value={`$${dashboardData.financials.refunded_amount.toLocaleString()}`} 
            icon={<Percent size={20} />} 
          />
          <MetricCard 
            title="Penalty Amount" 
            value={`$${dashboardData.financials.penalty_amount.toLocaleString()}`} 
            icon={<AlertCircle size={20} />} 
          />
          <MetricCard 
            title="Coupons Given" 
            value={dashboardData.financials.coupons_given} 
            icon={<CheckCircle size={20} />} 
          />
        </div>
      </div>
      
      {/* Booking Metrics Section */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Booking Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard 
            title="Total Booking Time" 
            value={`${Math.round(dashboardData.bookings.total_booking_time_hours)} hours`} 
            icon={<Calendar size={20} />} 
          />
          <MetricCard 
            title="Avg Booking Time" 
            value={`${dashboardData.bookings.average_booking_time_hours.toFixed(1)} hours`} 
            icon={<Calendar size={20} />} 
          />
          <MetricCard 
            title="Total Booking Amount" 
            value={`$${dashboardData.bookings.total_booking_amount.toLocaleString()}`} 
            icon={<CreditCard size={20} />} 
          />
          <MetricCard 
            title="Avg Booking Amount" 
            value={`$${dashboardData.bookings.average_booking_amount.toFixed(2)}`} 
            icon={<CreditCard size={20} />} 
          />
        </div>
      </div>
    </div>
  );
};

// Reusable components
const SummaryCard = ({ title, value, icon, color }) => (
  <div className="bg-white p-4 rounded-lg shadow">
    <div className="flex items-center">
      <div className={`rounded-full p-3 mr-4 ${color}`}>
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="text-xl font-semibold text-gray-800">{value}</p>
      </div>
    </div>
  </div>
);

const MetricCard = ({ title, value, icon }) => (
  <div className="bg-gray-50 p-4 rounded-lg">
    <div className="flex items-center mb-2">
      {icon}
      <h3 className="text-sm font-medium text-gray-500 ml-2">{title}</h3>
    </div>
    <p className="text-lg font-semibold text-gray-800">{value}</p>
  </div>
);

export default Dashboard;