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

  if (['admin', 'manager'].includes(user.role)) {
    navigate('/admin/dashboard');
  } else {
    navigate('/');
  }
};

export default handleAuthSuccess;
