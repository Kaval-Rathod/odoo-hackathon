// Simple script to create an admin user
// Run this in your browser console or create a simple HTML file

const createAdminUser = async () => {
  const adminData = {
    name: "Admin User",
    email: "admin@myshop.com",
    password: "admin123",
    phone: "1234567890"
  };

  try {
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(adminData)
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Admin user created successfully!');
      console.log('Email:', adminData.email);
      console.log('Password:', adminData.password);
      console.log('Token:', data.token);
      
      // Note: You'll need to manually set isAdmin: true in your database
      console.log('⚠️  IMPORTANT: Set isAdmin: true in your database for this user');
    } else {
      console.error('❌ Failed to create admin user:', data.message);
    }
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  }
};

// Instructions for creating admin user:
console.log(`
🚀 ADMIN USER CREATION INSTRUCTIONS:

1. Make sure your backend server is running on port 5000
2. Open browser console and run: createAdminUser()
3. Or create a simple HTML file with this script
4. After creating the user, manually update your database:

   In MongoDB Compass or your database tool:
   - Find the user with email: admin@myshop.com
   - Add field: isAdmin: true
   - Save the document

5. Login with:
   - Email: admin@myshop.com
   - Password: admin123

6. You'll see "Admin" badge in navbar and access to admin dashboard
`);

// Export for use in HTML file
if (typeof window !== 'undefined') {
  window.createAdminUser = createAdminUser;
} 