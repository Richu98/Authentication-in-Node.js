const express = require('express');

const app= express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const usersData = [];
 
  app.post("/register", (req, res) => {
 if(req.body.username && req.body.password && req.body.name &&  req.body.college && req.body['year-of-graduation'])
 {
    var found = false;
    for(var i = 0; i < usersData.length; i++) {
        if (usersData[i].username == req.body.username) {
            found = true;
            break;
        }
    }
    if (found==false){
        const currentUserData = {
            "username":req.body.username,  
            "password":req.body.password,
            "name": req.body.name,
            "college": req.body.college,
            "year-of-graduation": req.body['year-of-graduation']
          };
          usersData.push(currentUserData);
          console.log(usersData)
          res.send({message: "Successfully registered!"});
    }
    else{
        res.status(400).json({message: "username exists!"});
        }

}
else{
    res.status(400).json({message: "Fill all details!"});
}
   
  })

  app.get("/profiles", (req, res) => {
    const usersDataCopy = JSON.parse(JSON.stringify(usersData));
    usersDataCopy.map(user => delete user['password']);
    res.json(usersDataCopy);
  })

  app.put("/profile", (req, res) => {
    if(req.body.username && req.body.password && req.body.name &&  req.body.college && req.body['year-of-graduation'])
    {
 
    let isValid = false;
    let requestedUserIndexInGlobalArray = -1;
 
    for (let i = 0; i < usersData.length; i ++) {
      const currentUser = usersData[i];

      if(currentUser.username==req.body.username && currentUser.password == req.body.password)
    isValid=true;
    requestedUserIndexInGlobalArray = i;
    }
 
    if (!isValid) {
      res.status(401).json({message: "Invalid username or password!"});
    }
    else {
      usersData[requestedUserIndexInGlobalArray].name = req.body.name;
      usersData[requestedUserIndexInGlobalArray].college = req.body.college;
      usersData[requestedUserIndexInGlobalArray]['year-of-graduation'] = req.body['year-of-graduation'];
      res.send({message: "Successfully updated!"});
    }
}
  });






app.listen(7050);


