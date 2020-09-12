const {to} = require('await-to-js')
const {Sequelize, Datatypes, DataTypes} = require('sequelize')

let connection = new Sequelize(
    'CRUD',
    'root',
    'Pawni@123',
    {
        host     : 'localhost',
        dialect  : 'mysql' 
});

const coursesModel = connection.define('courses', {
    id : {
        type: DataTypes.BIGINT(11),
        autoIncrement:true,
        allowNull: false,
        primaryKey: true 
    },
    name:{
        type: DataTypes.STRING,
        notEmpty: true,
        notNull: true
    },
    slots:{
          type: DataTypes.INTEGER,
          isInt: true,
          notNull: true
    }
})

const studentsModel = connection.define('students', {
    id:{
        type: DataTypes.BIGINT(11),
        autoIncrement:true,
        allowNull: false,
        primaryKey: true
    },
    email:{
        type: DataTypes.STRING,
        notEmpty: true,
        notNull: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        notNull: true
    },
    username:{
        type: DataTypes.STRING,
        allowNull: false,
        notNull: true
    },
    password:{
        type: DataTypes.STRING,
        notEmpty: true,
        notNull: true
    }
})

const enrolled_studentsModel = connection.define('enrolled_students', {
    course_id :{
        type: DataTypes.BIGINT(11),
        allowNull:false,
        references:{
            model: coursesModel,
            key: 'id'
        }
    },
    student_name :{
        type: DataTypes.BIGINT(11),
        allowNull:false,
        references:{
            model: studentsModel,
            key: 'name'
        }
    }
})


const connect = async () =>{
    let [err, res] = await to ( connection.sync( {alter:true} ) )
    if (err){
        console.log('Error connecting to DB')
        return
    }
    console.log('Successfully connected to DB')
}

module.exports = {
    connect, coursesModel, studentsModel, enrolled_studentsModel
}