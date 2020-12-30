const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');

app.set('views','./views');
app.set('view engine','pug');
app.use(express.static(path.join(__dirname, "static")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'pug')

const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://vikasgo:Vikas0903@cluster0.gsfst.mongodb.net/<dbname>?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true });

app.get("/", (req, res) => {
    res.render('index')
})

app.get("/createStudent" ,(req, res)=>{
    res.render('createStudent')
})

app.get("/createMentor",(req, res)=> {
    res.render('createMentor')
})

app.get("/assignMentor", (req, res)=>{
    let resultObj = {};
    client.connect(err => {
        const collection = client.db("student-mentor").collection("students");
              collection.find({status:null}).toArray(function(err, result) {
                if (err) throw err;
                resultObj["students"]= result;
              })
        const collectionOne = client.db("student-mentor").collection("mentor");
            collectionOne.find({}).toArray(function(err, result) {
                if (err) throw err;
                resultObj["mentors"]= result;
                console.log(resultObj)
                res.render('assignMentor', {'data':resultObj});
        })
    })  
})

app.get("/changeMentor", (req, res) => {
    let resultObj = {};
    client.connect(err => {
        const collection = client.db("student-mentor").collection("students");
              collection.find({status:{$ne:null}}).toArray(function(err, result) {
                if (err) throw err;
                resultObj["students"]= result;
              })
        const collectionOne = client.db("student-mentor").collection("mentor");
            collectionOne.find({}).toArray(function(err, result) {
                if (err) throw err;
                resultObj["mentors"]= result;
                console.log(resultObj)
                res.render('changeMentor', {'data':resultObj});
              })
          }) 
})

app.post("/student",(req, res)=>{
    client.connect(err => {
        const collection = client.db("student-mentor").collection("students");
        collection.estimatedDocumentCount().then((value) => {
        const studentInfo = {
            _id:value+1,
            name:req.body.studentName,
            email:req.body.emailValue
            }
        collection.insertOne(studentInfo);
        });
        res.send("Thanks, Student Data Added")
    });
})

app.post("/mentor",(req, res)=>{
    client.connect(err => {
        const collection = client.db("student-mentor").collection("mentor");
        collection.estimatedDocumentCount().then((value) => {
        const mentorInfo = {
            _id:value+1,
            name:req.body.mentorName,
            subject:req.body.subjectName
            }
        collection.insertOne(mentorInfo);
        });
        res.send("Thanks, Mentor Data Added")
    });
})

app.post("/assigned",(req, res) => {
    console.log(req.body.student, req.body.mentor)
    client.connect(err => {
        const collection = client.db("student-mentor").collection("student-mentor-map");
        collection.estimatedDocumentCount().then((value) => {
        const assignInfo = {
            _id:value+1,
            student:req.body.student,
            mentor:req.body.mentor
            }
        collection.insertOne(assignInfo);
        })
        const collectionOne = client.db("student-mentor").collection("students");
        collectionOne.updateOne({name:req.body.student},{$set:{status:'assigned'}}, function(err, result) {
            if (err) throw err;
            console.log("1 document updated");
          });
        });
    res.send("Thanks, Mentor Assigned to Student")
})

app.post("/changed",(req, res) => {
    console.log(req.body.student, req.body.mentor)
    client.connect(err => {
        const collection = client.db("student-mentor").collection("student-mentor-map");
        collection.updateOne({student:req.body.student},{$set:{'mentor':req.body.mentor}}, function(err, result) {
            
            if (err) throw err;
            console.log("1 document updated");
          });
        });
        res.send("Thanks, Re-Assigned to the new Mentor")
})

app.get("/viewStudents",(req, res) => {
    client.connect(err => {
        const collection = client.db("student-mentor").collection("mentor");
        collection.find({}).toArray(function(err, result) {
            res.render('viewStudents', {'data':result})
        })
    })
})

app.post("/viewList",(req, res) => {
    client.connect(err => {
        const collection = client.db("student-mentor").collection("student-mentor-map");
        collection.find({mentor:req.body.mentor}).toArray(function(err, result) {
            console.log(result[0].student)
            res.render('viewList', {'data':result})
        })
    })
})
app.listen(8000);