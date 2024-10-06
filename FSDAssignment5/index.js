const http = require('http');
const fs = require('fs');
const url = require('url');
const path = require('path');

// Helper function to retrieve users from user.json
const getUsers = () => {
    const data = fs.readFileSync('user.json');
    return JSON.parse(data);
};

// Helper function to save a new user to user.json
const saveUser = (user) => {
    const users = getUsers();
    users.push(user);
    fs.writeFileSync('user.json', JSON.stringify(users, null, 2));
};

// Helper function to validate login credentials
const validateLogin = (username, password) => {
    const users = getUsers();
    return users.find(user => user.username === username && user.password === password);
};

// Serve static files like HTML and CSS
const serveFile = (filePath, res, contentType = 'text/html') => {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end('File not found');
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        }
    });
};

// Create the HTTP server
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // Handle GET requests for the pages
    if (pathname === '/login' && req.method === 'GET') {
        serveFile('login.html', res);
    } else if (pathname === '/signup' && req.method === 'GET') {
        serveFile('signup.html', res);
    } else if (pathname === '/home' && req.method === 'GET') {
        serveFile('home.html', res);
    } 
    // Handle POST requests for login
    else if (pathname === '/login' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const params = new URLSearchParams(body);
            const username = params.get('username');
            const password = params.get('password');

            if (validateLogin(username, password)) {
                res.writeHead(302, { 'Location': '/home' });
            } else {
                res.writeHead(302, { 'Location': '/signup' });
            }
            res.end();
        });
    } 
    // Handle POST requests for signup
    else if (pathname === '/signup' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const params = new URLSearchParams(body);
            const username = params.get('username');
            const email = params.get('email');
            const password = params.get('password');

            saveUser({ username, email, password });
            res.writeHead(302, { 'Location': '/login' });
            res.end();
        });
    } 
    // Serve CSS files
    else if (pathname.endsWith('.css')) {
        serveFile(path.join(__dirname, pathname), res, 'text/css');
    } 
    // Default route for 404
    else {
        res.writeHead(404);
        res.end('Page not found');
    }
});

// Start the server on port 3000
server.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
