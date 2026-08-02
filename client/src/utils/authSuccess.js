import useAuthStore from '../admin/store/authStore';

export const handleAuthSuccess = (user, accessToken, navigate, login) => {
  localStorage.setItem("accessToken", accessToken);

  if (!user) return;

  login(user);

  useAuthStore.setState({
    user: {
      id: user._id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: user.role,
      avatar: user.avatar?.url || null,
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
