export function getApiUrl(): string {
  if (
    typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && 
    window.location.port === '4200'
  ) {
    return 'http://127.0.0.1:8001/api';
  }
  return '/api';
}
