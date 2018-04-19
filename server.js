const express = require('express');
const hbs = require('hbs');
const fs = require('fs');

var app = express();

hbs.registerPartials(__dirname + '/views/partials');
app.set('view engine', 'hbs');

app.use((req, res, next) => {
    var now = new Date().toString();
    var log = `${now}: ${req.method} ${req.url}}`;

    console.log(log);
    fs.appendFile('server.log', log + '\n', (err) => {
        if(err) {
            console.log('Unable to append to server.log file.');
        }
    });
    next();
});

app.use((req, res, next) => {
    res.render(('maintenance.hbs'), {
        pageTitle: 'Maintenance Page',
        welcomeMessage: 'Website under maintenance! Please come back later.'
    });
});

app.use(express.static(__dirname + '/public'));

hbs.registerHelper('getCurrentYear', () => {
    return new Date().getFullYear();
});

hbs.registerHelper('screamIt', (text) => {
    return text.toUpperCase();
});

app.get('/', (request, response) => {
    response.render(('index.hbs'), {
        pageTitle: 'Home Page',
        welcomeMessage: 'Welcome to the website'
    });
});

app.get(('/about'), (req, res) => {
    res.render('about.hbs', {
        pageTitle: 'About Page'
    });
});

app.get(('/bad'), (req, res) => {
    return res.send({
        errorMessage: 'Error Occured'
    });
});

app.listen(3000, () => {
    console.log('server is up on port 3000.');
});