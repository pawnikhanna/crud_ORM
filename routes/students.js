const express = require('express');
const fs = require('fs');
const app = express.Router();
const mysql = require('./../data/db');
const { to } = require("await-to-js");

app.get("/", async(req, res) => {
  let [err, result] = await to( mysql.studentsModel.findAll() );
  if (err){
    return res.json({"Data":null, "Error": err});
  }
  else{
    return res.json({ result });
  }
});

app.get("/:id", async(req, res) => {
  let [err, result] = await to( mysql.studentsModel.findAll({
    where:{
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

module.exports = app;
