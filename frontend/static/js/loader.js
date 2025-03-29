export function showLoader(container, message = 'Loading...') {
    // Find container if string selector was provided
    if (typeof container === 'string') {
        container = document.querySelector(container);
    }
    
    if (!container) {
        console.error('Container not found');
        return null;
    }
    
    // Create loader element
    const loader = document.createElement('div');
    loader.classList.add('loader-container');
    
    loader.innerHTML = `
        <div class="loader-spinner"></div>
        <p class="loader-message">${message}</p>
    `;
    
    // Add styles if not already in stylesheet
    if (!document.getElementById('loader-styles')) {
        const style = document.createElement('style');
        style.id = 'loader-styles';
        document.head.appendChild(style);
    }
    
    // Add to container
    container.appendChild(loader);
    
    return loader;
}

export function hideLoader(loader) {
    if (loader && loader.parentNode) {
        loader.parentNode.removeChild(loader);
    }
}

export function showPageLoader(message = 'Loading...') {
    const overlay = document.createElement('div');
    overlay.classList.add('loader-overlay');    
    overlay.innerHTML = `
        <div class="loader-content">
            <div class="loader-spinner"></div>
            <p class="loader-message">${message}</p>
        </div>
    `;
    
    // Add styles if not already in stylesheet
    if (!document.getElementById('loader-overlay-styles')) {
        const style = document.createElement('style');
        style.id = 'loader-overlay-styles';
        document.head.appendChild(style);
    }
    
    document.body.appendChild(overlay);
    
    return overlay;
}

export function hidePageLoader(overlay) {
    if (overlay && overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
    }
}
