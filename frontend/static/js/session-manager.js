export class SessionManager {
    static async validateSession(session) {
        try {
            const response = await fetch('/check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ session })
            });
            
            if (!response.ok) {
                throw new Error('Unexpected error occurred');
            }
            
            const data = await response.json();
            return data.error === 'ok';
        } catch (error) {
            console.error('Session validation failed:', error);
            return false;
        }
    }
    
    static saveState(state = 'home') {
        sessionStorage.setItem('pageState', state);
    }
    
    static getState() {
        return sessionStorage.getItem('pageState');
    }
}