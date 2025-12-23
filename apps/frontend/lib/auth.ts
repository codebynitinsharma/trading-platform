export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

export function logout() {
  localStorage.removeItem("token");
  window.location.href = "/login";
}
