async register(userData: {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  role?: string;
}) {
  try {
    console.log('Sending registration data:', userData);
    const response = await apiService.post('/api/auth/register', {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      phoneNumber: userData.phoneNumber,
      password: userData.password,
      role: userData.role || 'User'
    });
    console.log('Registration response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Register API error:', error);
    if (axios.isAxiosError(error)) {
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
    }
    throw error;
  }
}, 