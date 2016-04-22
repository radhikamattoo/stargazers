## Instructions for Milestone 2

# Add data & Research Topic  - localhost:3000

Clone the directory and npm install inside the stargazers directory. Then nodemon bin/www
and go to localhost:3000. This is the login/signup page for the project.


To demonstrate adding a User document to the users collection, you can
sign up with whatever username/password combo you like. The code for adding a user
is in login.js.

To demonstrate implementation of Passport, one of my research topics, you can login to the existing account, which passport will verify and console.log("Authenticated!"). I'm still working on implementing Passport for Facebook. The configuration code for Passport is in
app.js, the logic for implementing it is in login.js

Go to localhost:3000
Click the "Already a user? Sign In" button.
Login with:

username: radhika
password: helloWorld

# Reading data - localhost:3000/radhika/nasa/archive
After signing up/in, you'll be directed to a workshopped profile page, with a link
to the NASA Archive. Clicking this link will bring you to a page of the entire dataset,
and will let you query it using a GET form. The code for this is in user.js
