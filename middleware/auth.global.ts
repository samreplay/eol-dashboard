export default defineNuxtRouteMiddleware(async (to) => {
  const user = useSupabaseUser();

  // Public routes that don't require authentication
  const publicRoutes = ['/login'];

  // If user is not authenticated and trying to access protected route
  if (!user.value && !publicRoutes.includes(to.path)) {
    return navigateTo('/login');
  }

  // If user is authenticated and trying to access login page, redirect to dashboard
  if (user.value && to.path === '/login') {
    return navigateTo('/');
  }
});
