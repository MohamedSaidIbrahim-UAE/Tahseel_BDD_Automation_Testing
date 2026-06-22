export const mockFilterOptions = {
  gates: ['Zubair', 'Al Madam', 'Al Dhaid'],
  lanes: ['1', '2', '3', '4'],
  dateRanges: ['Today','Yesterday','Last 7 Days','Last 30 Days','This Month','Last Month','Last 6 Months','This Year','Last Year','Custom Range']
};

export const mockOverviewResponse = {
  dashboardStats: {
    paidPasses: 1523,
    unpaidPasses: 477,
    totalPasses: 2000,
    paidAmount: 76150,
    unpaidAmount: 23850,
    totalAmount: 100000
  },
  fareStatistics: {
    manual: { count: 500, amount: 25000 },
    automated: { count: 900, amount: 45000 },
    escalated: { count: 123, amount: 6150 }
  },
  uaeVsNonUae: {
    uaeTrucks: 400,
    nonUaeTrucks: 1600,
    uaeTrucksPercentage: 20,
    nonUaeTrucksPercentage: 80,
    uaeTrafficFlow: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120],
    nonUaeTrafficFlow: [15, 25, 35, 45, 55, 65, 75, 85, 95, 105, 115, 125],
    trafficFlowDetails: [
      { name: 'UAE', value: 400, percentage: 20 },
      { name: 'Non-UAE', value: 1600, percentage: 80 }
    ]
  },
  averageTimePerTruck: 32,
  averageTimeperTruckLabel: 'Average Time per Truck',
  unpaidReasons: {
    inQueue: { count: 200, percentage: 42 },
    notRegistered: { count: 150, percentage: 31 },
    noBalance: { count: 127, percentage: 27 }
  },
  unpaidReasonsBreakdown: {
    inQueue: {
      uae: 100,
      nonUae: 100,
      total: 200
    },
    notRegistered: {
      uae: 75,
      nonUae: 75,
      total: 150
    },
    noBalance: {
      uae: 64,
      nonUae: 63,
      total: 127
    }
  }
};

export const mockPlazaComparisonResponse = [
  {
    id: 1,
    name: 'Al Zubair Toll Plaza',
    totalFare: 125000,
    paidAmountPercentage: 78,
    successPasses: 1000,
    unpaidPasses: 282,
    successAmount: 97500,
    unpaidAmount: 27500,
    status: 'active',
    trend: 'up'
  },
  {
    id: 2,
    name: 'Al Madam Toll Plaza',
    totalFare: 98000,
    paidAmountPercentage: 82,
    successPasses: 800,
    unpaidPasses: 176,
    successAmount: 80360,
    unpaidAmount: 17640,
    status: 'active',
    trend: 'up'
  },
  {
    id: 3,
    name: 'Al Dhaid Toll Plaza 3',
    totalFare: 85000,
    paidAmountPercentage: 65,
    successPasses: 552,
    unpaidPasses: 298,
    successAmount: 55250,
    unpaidAmount: 29750,
    status: 'active',
    trend: 'down'
  }
];

