const express = require('express');
const fs = require('fs');
const app = express.Router();
const { to } = require("await-to-js");
const auth = require('./../middleware/verify');
const Sequelize  = require('./../data/db');

app.get("/", async(req, res) => {
    let [err, result] = await to( mysql.coursesModel.findAll() )
    if (err){
      return res.json({"Data":null, "Error": err});
    }
    else{
      return res.json({ result });
    }
});

app.get("/enrolledStudents", async(req, res) => {
  let [err, result] = await to( mysql.enrolled_studentsModel.findAll() )
  if (err){
    return res.json({"Data":null, "Error": err});
  }
  else{
    return res.json({ result });
  }
});

app.get("/:id", async(req, res) => {
    let [err, result] = await to( mysql.coursesModel.findAll({
      where: {
          id: req.params.id
      }
  }) );
    if(!err) {
      if(result && result.length > 0) {
          res.json({ result });
      } else {
          res.json({
              message: `No course with id:${req.params.id}`
          });
      }
    } else {
      res.json({
        'Data':null,
        'Error': err
      })
    }
});

app.post("/", async(req, res) => {
    let name = req.body.name;
    let slots = parseInt(req.body.slots);

    if (!name || !slots){
      return res.status(400).send({ 
        data: null, error: `Fill the required fields` 
      });
    } 

    let [err, result] = await to( mysql.coursesModel.findAll() );
    courseId = result.length+1;

    if ((slots) > 0 && req.body.email === "admin@system.com"){
      let [err, result] = await to( mysql.coursesModel.create({
        id: courseId,
        name: name,
        slots: slots
      }) );
      if (err){
        return res.json({"Data":null, "Error": err});
      }
      else{
        res.json({ success: true });
      } 
    }   
});

app.post("/:id/enroll", auth, async(req, res) => {
    const courseId = parseInt(req.params.id);
    const studentId = parseInt(req.body.studentId);

    let [err, result] = await to( mysql.coursesModel.findAll({
      where:{
        id: courseId
      }
    }) );
    if(result == null){
      res.json({
        message: `No course with id:${courseId}`
      });
    } 

    slots = result[0].slots;

    [err, result] = await to( mysql.studentsModel.findAll({
      where:{
        id: studentId
      }
    }) );
    student = result[0];
    if(student == null){
      res.json({
        message: `No student with id:${studentId}`
      });
    } 
    
    [err, result] = await to(
      mysql.enrolled_studentsModel.findAll({
        where:{
          course_id: courseId,
          student_name: student.name
        }
      })
    );
    if (result.length > 0){
      res.json({ message : "Student already enrolled " })
    } else if(err){
      return res.status(500).send({ "data":null, error })
    }

    if (slots > 0 && result.length==0){
      [err, result] = await to( mysql.enrolled_studentsModel.create({
        course_id: courseId,
        student_name: student.name
      }) );
      if(!err){
        slots -=1;
        mysql.coursesModel.update({ slots: slots, where: {
          id: courseId
        } });
        res.json({ "Message": "Student enrolled successfully" })
      }
    } else{
      return res.json({ "data":null, error:"No slots available" })
    }
});

app.put("/:id/deregister", auth, async(req, res) => {
  const courseId = parseInt(req.params.id);
  const studentId = parseInt(req.body.studentId);

  let [err, result] = await to( mysql.coursesModel.findAll({
    where:{
      id: courseId
    }
  }) );
  course = result[0];
  if(course == null){
    res.json({
      message: `No course with id:${courseId}`
    });
  }
  
  [err, result] = await to( mysql.studentsModel.findAll({
    where:{
      id: studentId
    }
  }) );
  student = result[0];
  if(student == null){
    res.json({
      message: `No student with id:${studentId}`
    });
  } 

  let slots = course.slots;

  [err, result] = await to( 
    mysql.enrolled_studentsModel.findAll({
      where:{
        course_id: courseId,
        student_name: student.name
      }
    })
  );
  if (result.length == 0){
    return res.status(400).send({ 
      message: "No such student enrolled" 
    })
  } 
  if(err) {
    return res.status(500).send({ "data":null, error })
  }

  [err, result] = await to(
        mysql.enrolled_studentsModel.destroy({
          where:{
            course_id: courseId,
            student_name: student.name
          }
        })
  );
  if(!err){
    slots +=1;
      mysql.coursesModel.update({ slots: slots, where: {
        id: courseId
      } })
    res.json({ "Message": "Student deregistered successfully" })
  } else {
    return res.status(500).send({ data: null, err });
  }
});
module.exports = app;