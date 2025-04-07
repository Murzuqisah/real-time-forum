export const CONSTANTS = {
    WEBSOCKET_URL: 'ws://localhost:9000/ws',
    RECONNECT_DELAY: 3000,
    MESSAGE_TYPES: {
        REGISTER: 'register',
        MESSAGING: 'messaging',
        CONVERSATION: 'conversation',
        GET_USERS: 'getusers'
    }
};

export const CHAT_HEADER_STYLES = {
    color: 'white',
    display: 'flex',
    position: 'relative',
    alignItems: 'center',
    padding: '0 15px',
    marginRight: '150px',
    flexDirection: 'column',
    justifyContent: 'spacebetween',
    textAlign: 'center',
    whitespace: 'nowrap'
};

export function applyStyles(element, styles) {
    Object.assign(element.style, styles);
}