// A simple navigation helper to enable client-side routing
// This avoids full page reloads and allows App.tsx to listen for URL changes.
export const navigate = (href: string) => {
    window.history.pushState({}, '', href);
    // Dispatch a popstate event to make sure our root component re-renders
    window.dispatchEvent(new PopStateEvent('popstate'));
};
