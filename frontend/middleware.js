export function middleware(request) {
  const basicAuth = request.headers.get('authorization');

  // Usuarios permitidos con usuario y clave sacados del .env
  const users = {
    [process.env.BASIC_AUTH_USER_ADMIN]: process.env.BASIC_AUTH_PASS_ADMIN,
    [process.env.BASIC_AUTH_USER_USER2]: process.env.BASIC_AUTH_PASS_USER2,
  };

  if (!basicAuth) {
    return new Response('Auth required', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Protected Area"' },
    });
  }

  const authValue = basicAuth.split(' ')[1];
  const [user, pass] = atob(authValue).split(':');

  if (users[user] && pass === users[user]) {
    return; // acceso permitido
  }

  return new Response('Access denied', { status: 403 });
}
