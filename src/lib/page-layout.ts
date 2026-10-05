const publicRoots = ["/pricing", "/features", "/demo", "/why-vitros", "/blog", "/unsubscribed", "/offline", "/studio"];
const authRoots = ["/login", "/signup", "/forgot-password", "/reset-password"];
export function hasWorkspaceShell(pathname: string, authenticated: boolean): boolean {
  if (authRoots.some(root => pathname === root || pathname.startsWith(`${root}/`))) return false;
  if (publicRoots.some(root => pathname === root || pathname.startsWith(`${root}/`))) return false;
  return pathname === "/" ? authenticated : true;
}
