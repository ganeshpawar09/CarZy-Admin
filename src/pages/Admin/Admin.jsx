import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  Users, Car, Calendar, CreditCard, Star, 
  TrendingUp, Percent, AlertCircle, CheckCircle,
  FileText, DollarSign, UserCheck, Award
} from 'lucide-react';
import { API_ENDPOINTS } from '../../API_ENDPOINTS';
import Navbar from '../../components/NavBar';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Format functions
  const formatCurrency = (amount) => {
    amount = Math.round(amount);
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const capitalizeFirstLetter = (string) => {
    if (!string) return "";
    string = string.replace(/_/g, ' ');
    return string.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };
  
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
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
        <p className="mt-4 text-gray-700">Loading dashboard data...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="text-center p-6 bg-red-50 rounded-lg shadow">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <p className="mt-4 text-red-700">Error: {error}</p>
        <button 
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
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

  // Prepare booking status data with better labels
  const bookingStatusData = Object.entries(dashboardData.bookings.status_counts).map(([name, value]) => ({
    name: capitalizeFirstLetter(name), 
    value
  }));

  // Prepare review data
  const reviewData = Object.entries(dashboardData.reviews).map(([name, value]) => ({
    name: name.replace('_star', '★'), value
  }));
  
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  // Custom tooltip formatter for currency values
  const currencyTooltipFormatter = (value) => formatCurrency(value);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Navbar/>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <FileText className="mr-2" size={24} />
          Dashboard Overview
        </h1>
        
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          <SummaryCard 
            title="Total Users" 
            value={dashboardData.users.total_users} 
            subtitle={`${dashboardData.users.total_verified_users} verified`}
            icon={<Users size={24} />} 
            color="bg-blue-100 text-blue-600"
            trend="+5% this month"
          />
          <SummaryCard 
            title="Total Cars" 
            value={dashboardData.cars.total_cars} 
            subtitle={`${dashboardData.cars.verified_cars} verified`}
            icon={<Car size={24} />} 
            color="bg-green-100 text-green-600"
          />
          <SummaryCard 
            title="Total Bookings" 
            value={dashboardData.bookings.total_bookings} 
            subtitle={`${dashboardData.bookings.status_counts.completed || 0} completed`}
            icon={<Calendar size={24} />} 
            color="bg-yellow-100 text-yellow-600"
          />
          <SummaryCard 
            title="Total Revenue" 
            value={formatCurrency(dashboardData.financials.total_transaction_amount)} 
            subtitle="All time earnings"
            icon={<DollarSign size={24} />} 
            color="bg-purple-100 text-purple-600"
          />
        </div>
        
        {/* Chart Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* User Growth Chart */}
          <div className="bg-white p-5 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
              <TrendingUp className="mr-2" size={20} />
              User Growth (Last 6 Months)
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month" 
                  tick={{fill: '#6b7280'}}
                  axisLine={{stroke: '#e5e7eb'}}
                />
                <YAxis 
                  tick={{fill: '#6b7280'}}
                  axisLine={{stroke: '#e5e7eb'}}
                />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  name="New Users"
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  activeDot={{ r: 8 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          {/* Booking Status Chart */}
          <div className="bg-white p-5 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
              <Calendar className="mr-2" size={20} />
              Booking Status
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={bookingStatusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  tick={{fill: '#6b7280'}}
                  axisLine={{stroke: '#e5e7eb'}}
                />
                <YAxis 
                  tick={{fill: '#6b7280'}}
                  axisLine={{stroke: '#e5e7eb'}}
                />
                <Tooltip />
                <Bar 
                  dataKey="value" 
                  name="Bookings"
                  fill="#8884d8" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Car Statistics Section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
            <Car className="mr-2" size={20} />
            Car Distribution
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-lg shadow">
              <h3 className="text-lg font-medium mb-4 text-gray-700">Fuel Types</h3>
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
            
            <div className="bg-white p-5 rounded-lg shadow">
              <h3 className="text-lg font-medium mb-4 text-gray-700">Transmission Types</h3>
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
            
            <div className="bg-white p-5 rounded-lg shadow">
              <h3 className="text-lg font-medium mb-4 text-gray-700">Car Types</h3>
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
        </div>
        
        {/* Financial Summary Section */}
        <div className="bg-white p-5 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-5 text-gray-800 flex items-center">
            <DollarSign className="mr-2" size={20} />
            Financial Summary
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard 
              title="Total Revenue" 
              value={formatCurrency(dashboardData.financials.total_transaction_amount)} 
              icon={<DollarSign size={20} className="text-green-600" />} 
              iconBg="bg-green-100"
            />
            <MetricCard 
              title="Refunded Amount" 
              value={formatCurrency(dashboardData.financials.refunded_amount)} 
              icon={<Percent size={20} className="text-red-600" />} 
              iconBg="bg-red-100"
            />
            <MetricCard 
              title="Penalty Amount" 
              value={formatCurrency(dashboardData.financials.penalty_amount)} 
              icon={<AlertCircle size={20} className="text-amber-600" />} 
              iconBg="bg-amber-100"
            />
            <MetricCard 
              title="Total Payout" 
              value={formatCurrency(dashboardData.financials.total_payout)} 
              icon={<CreditCard size={20} className="text-blue-600" />} 
              iconBg="bg-blue-100"
            />
          </div>
        </div>
        
        {/* Booking & Reviews Metrics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Booking Metrics */}
          <div className="bg-white p-5 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
              <Calendar className="mr-2" size={20} />
              Booking Metrics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MetricCard 
                title="Total Booking Time" 
                value={`${Math.round(dashboardData.bookings.total_booking_time_hours)} hours`} 
                icon={<Calendar size={20} className="text-indigo-600" />} 
                iconBg="bg-indigo-100"
              />
              <MetricCard 
                title="Avg Booking Time" 
                value={`${dashboardData.bookings.average_booking_time_hours.toFixed(1)} hours`} 
                icon={<TrendingUp size={20} className="text-indigo-600" />} 
                iconBg="bg-indigo-100"
              />
              <MetricCard 
                title="Total Booking Amount" 
                value={formatCurrency(dashboardData.bookings.total_booking_amount)} 
                icon={<DollarSign size={20} className="text-green-600" />} 
                iconBg="bg-green-100"
              />
              <MetricCard 
                title="Avg Booking Amount" 
                value={formatCurrency(dashboardData.bookings.average_booking_amount)} 
                icon={<CreditCard size={20} className="text-green-600" />} 
                iconBg="bg-green-100"
              />
            </div>
          </div>
          
          {/* Review Distribution */}
          <div className="bg-white p-5 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
              <Star className="mr-2" size={20} />
              Review Distribution
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={reviewData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false}
                  width={40}
                />
                <Tooltip />
                <Bar 
                  dataKey="value" 
                  name="Reviews"
                  fill="#FFBB28" 
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* User & Coupons Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
              <Users className="mr-2" size={20} />
              User Distribution
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricCard 
                title="Regular Users" 
                value={dashboardData.users.total_verified_users} 
                icon={<UserCheck size={20} className="text-blue-600" />} 
                iconBg="bg-blue-100"
              />
              <MetricCard 
                title="Car Owners" 
                value={dashboardData.users.total_owners} 
                icon={<Car size={20} className="text-emerald-600" />} 
                iconBg="bg-emerald-100"
              />
              <MetricCard 
                title="Employees" 
                value={dashboardData.users.total_employees} 
                icon={<Award size={20} className="text-violet-600" />} 
                iconBg="bg-violet-100"
              />
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
              <Percent className="mr-2" size={20} />
              Promotions
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <MetricCard 
                title="Coupons Given" 
                value={dashboardData.financials.coupons_given} 
                subtitle="Total coupons distributed"
                icon={<CheckCircle size={20} className="text-teal-600" />} 
                iconBg="bg-teal-100"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable components
const SummaryCard = ({ title, value, subtitle, icon, color, trend }) => (
  <div className="bg-white p-5 rounded-lg shadow hover:shadow-md transition">
    <div className="flex items-center">
      <div className={`rounded-full p-3 mr-4 ${color}`}>
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="text-2xl font-semibold text-gray-800">{value}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        {trend && <p className="text-xs font-medium text-green-600 mt-1">{trend}</p>}
      </div>
    </div>
  </div>
);

const MetricCard = ({ title, value, subtitle, icon, iconBg }) => (
  <div className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition">
    <div className="flex items-center mb-2">
      <div className={`${iconBg} p-2 rounded-full mr-2`}>{icon}</div>
      <h3 className="text-sm font-medium text-gray-700">{title}</h3>
    </div>
    <p className="text-lg font-semibold text-gray-800">{value}</p>
    {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
  </div>
);

export default Dashboard;