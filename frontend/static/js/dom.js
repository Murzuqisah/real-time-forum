import { HomePage } from './homepage.js';
import { SignInPage } from './sign-in.js';

document.addEventListener('DOMContentLoaded', () => {
    const previousState = sessionStorage.getItem('pageState');
    if (previousState === 'home') {
        sessionStorage.setItem('pageState', '');
        const session = sessionStorage.getItem('session');
        checksession(session);
    } else {
        SignInPage();
    }
});

async function checksession(session) {
    try {
        const response = await fetch('/check', {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session })
        });
        if (!response.ok) throw new Error('Unexpected error occurred');
        const data = await response.json();
        if (data.error === 'ok') {
            HomePage(data)
            RealTime("", session);
        } else {
            sessionStorage.setItem('pageState', '');
            SignInPage();
        }
    } catch (error) {
        console.error(error);
        SignInPage();
    }
}

function arrangemessage(messageDiv, elem) {
    const rawTimestamp = elem.sent_on;
    const parsedTimestamp = new Date(rawTimestamp.replace(' +0000 UTC', 'Z'));

    const options = {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    };

    elem.sent_on = parsedTimestamp.toLocaleString('en-US', options)
        .replace(/,/, ', ')
        .replace(/(\d{1,2}:\d{2})\s/, '$1 ');
    let puser = document.createElement('span')
    puser.classList.add('message-author')
    let content = document.createElement('p')
    content.classList.add("message-content")
    content.textContent = decodeHTML(elem.body)
    puser.textContent = elem.username
    
    let p = document.createElement('p');
    p.classList.add('message-time')
    p.innerHTML = `
    <time datetime="${elem.sent_on || ''}">${elem.sent_on || 'Unknown'}</time>
    `
    messageDiv.appendChild(puser)
    messageDiv.appendChild(content)
    messageDiv.appendChild(p)
    return messageDiv
}

function decodeHTML(html) {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}