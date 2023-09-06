const express = require('express');
const http = require('http');
const bcrypt = require('bcrypt');
const path = require("path");
const bodyParser = require('body-parser');
const users = require('./data').userDB;
const fs = require('fs'); // Require the fs module
const app = express();
const server = http.createServer(app);

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname,'./public')));


app.get('/',(req,res) => { 
    res.sendFile(path.join(__dirname,'./public/index.html'));
});


app.post('/register', async (req, res) => { 
    try {
        let foundUser = users.find((data) => req.body.email === data.email);
        if (!foundUser) {

            let hashPassword = await bcrypt.hash(req.body.password, 10);

            let newUser = {
                id: Date.now(),
                username: req.body.username,
                email: req.body.email,
                password: hashPassword,
            };
            users.push(newUser); // Add the new user to the database
            console.log('New User', newUser);
            saveUsersToFile(); // Save the updated users array to the file

            res.send(`<div align ='center' style="background-color: #191b2a;"><h2>Registration successful</h2></div><br><br><div align='center'><a href='./login.html'>login</a></div><br><br><div align='center'><a href='./registration.html'>Register another user</a></div>`);
            //     
        } else {
            res.send(`<div align ='center' style="background-color: #191b2a;"><h2>Email already used</h2></div><br><br><div align='center'><a href='./registration.html'>Register again</a></div>`);
        
        }
    } catch(error){
        res.send("Internal server error");
    }
});
function saveUsersToFile() {
    const usersData = 'module.exports = ' + JSON.stringify({ userDB: users }, null, 2) + ';';
    fs.writeFileSync('./data.js', usersData, 'utf-8');
}

app.post('/login', async (req, res) => { 
    try{
        let foundUser = users.find((data) => req.body.email === data.email);
        if (foundUser) {
    
            let submittedPass = req.body.password; 
            let storedPass = foundUser.password; 
    
            const passwordMatch = await bcrypt.compare(submittedPass, storedPass);
            if (passwordMatch) {
                let usrname = foundUser.username;
                res.send(`<div align ='center' style="background-color: #191b2a;"><h2>login successful</h2></div><br><br><br><div align ='center'><h3>Hello ${usrname}</h3></div><br><br><div align='center'><a href='./login.html'>logout</a></div>`);
            } else {
            res.send(`<div align ='center' style="background-color: #191b2a;"><h2>Invalid email or password</h2></div><br><br><div align ='center'><a href='./login.html'>login again</a></div>`);
            }
        }
        else {
    
            let fakePass = `$2b$$10$ifgfgfgfgfgfgfggfgfgfggggfgfgfga`;
            await bcrypt.compare(req.body.password, fakePass);
    
            res.send("<div align ='center'><h2>Invalid email or password</h2></div><br><br><div align='center'><a href='./login.html'>login again<a><div>");
        }
    } catch(error){
        res.send("Internal server error");
    }
});


server.listen(3000, function(){
    console.log("server is listening on port: 3000");
});
