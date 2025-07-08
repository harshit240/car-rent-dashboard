
let listings = [
  {
    id: 1,
    title: "Toyota Camry 2020",
    description: "Comfortable sedan for city driving",
    price: 50,
    location: "New York",
    status: "pending",
    submittedBy: "user1@example.com",
    submittedAt: new Date('2024-01-15'),
    images: ["car1.jpg"]
  },
  {
    id: 2,
    title: "BMW X5 2021",
    description: "Luxury SUV perfect for family trips",
    price: 120,
    location: "Los Angeles",
    status: "approved",
    submittedBy: "user2@example.com",
    submittedAt: new Date('2024-01-10'),
    images: ["car2.jpg"]
  },
  {
    id: 3,
    title: "Honda Civic 2019",
    description: "Fuel efficient compact car",
    price: 35,
    location: "Chicago",
    status: "rejected",
    submittedBy: "user3@example.com",
    submittedAt: new Date('2024-01-20'),
    images: ["car3.jpg"]
  },
  {
    id: 4,
    title: "Ford Mustang 2022",
    description: "Sports car for weekend adventures",
    price: 95,
    location: "Miami",
    status: "pending",
    submittedBy: "user4@example.com",
    submittedAt: new Date('2024-01-25'),
    images: ["car4.jpg"]
  },
  {
    id: 5,
    title: "Tesla Model 3 2023",
    description: "Electric vehicle with autopilot",
    price: 80,
    location: "San Francisco",
    status: "approved",
    submittedBy: "user5@example.com",
    submittedAt: new Date('2024-01-18'),
    images: ["car5.jpg"]
  }
];

let auditLogs = [];

let users = [
  {
    id: 1,
    email: "admin@dashboard.com",
    password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
    role: "admin"
  }
];

export const getListings = (page = 1, limit = 10, status = null) => {
  let filteredListings = [...listings];
  
  if (status && status !== 'all') {
    filteredListings = listings.filter(listing => listing.status === status);
  }
  
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  return {
    listings: filteredListings.slice(startIndex, endIndex),
    total: filteredListings.length,
    page,
    totalPages: Math.ceil(filteredListings.length / limit)
  };
};

export const getListingById = (id) => {
  return listings.find(listing => listing.id === parseInt(id));
};

export const updateListingStatus = (id, status, adminEmail) => {
  const listingIndex = listings.findIndex(listing => listing.id === parseInt(id));
  if (listingIndex !== -1) {
    listings[listingIndex].status = status;
    
    auditLogs.push({
      id: Date.now(),
      listingId: parseInt(id),
      action: `Status changed to ${status}`,
      adminEmail,
      timestamp: new Date()
    });
    
    return listings[listingIndex];
  }
  return null;
};

export const updateListing = (id, updates, adminEmail) => {
  const listingIndex = listings.findIndex(listing => listing.id === parseInt(id));
  if (listingIndex !== -1) {
    listings[listingIndex] = { ...listings[listingIndex], ...updates };

    auditLogs.push({
      id: Date.now(),
      listingId: parseInt(id),
      action: `Listing updated`,
      adminEmail,
      timestamp: new Date()
    });
    
    return listings[listingIndex];
  }
  return null;
};

export const getUserByEmail = (email) => {
  return users.find(user => user.email === email);
};

export const getAuditLogs = () => {
  return auditLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};