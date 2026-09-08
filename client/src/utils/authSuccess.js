import useAuthStore from '../admin/store/authStore';

export const handleAuthSuccess = (user, navigate, login) => {
  if (!user) return;

  login(user);

  useAuthStore.setState({
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: user.role,
      avatar: user.avatar?.url || null,
      phone: user.phone || "",
    },
    isAuthenticated: true,
  });

  if (user.role !== 'customer') {
    const rolePaths = {
      super_admin: '/admin/dashboard',
      admin: '/admin/dashboard',
      product_manager: '/admin/products',
      order_manager: '/admin/orders',
      support_executive: '/admin/support',
    };
    
    // Normalize user role locally just in case it has spaces before sending it for lookup
    const normalizedRole = user.role ? user.role.replace(" ", "_") : "customer";
    navigate(rolePaths[normalizedRole] || '/admin/dashboard');
  } else {
    navigate('/');
  }
};

export default handleAuthSuccess;
