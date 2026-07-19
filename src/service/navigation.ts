// Thin wrappers around window.location so component tests can mock this
// module — jsdom's Location properties are unforgeable and cannot be spied on.
export function reloadPage(): void {
  window.location.reload();
}

export function redirectTo(url: string): void {
  window.location.assign(url);
}
