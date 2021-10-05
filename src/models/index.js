import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';
import Sequelize from 'sequelize';
import { fileURLToPath } from 'url';

dotenv.config();

const {DATABASE, DATABASE_HOST, USRENAME, PASSWORD} = process.env;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.resolve();

const basename = path.basename(__filename);
const db = {};

const sequelize = new Sequelize(DATABASE, USRENAME, PASSWORD, {
    host: DATABASE_HOST,
    dialect: 'mysql',
    // logging: false
});

sequelize.authenticate().then(() => {
    console.log("연결 성공");
}).catch(err => {
    console.log("연결 실패: ", err);
});

fs.readdirSync(__dirname).filter(file => {
    return (file.indexOf(".") !== 0) && (file !== basename) && (file.slice(-3) === ".js");
}).forEach(file => {
    let model = sequelize["import"](path.join(__dirname, file));
    db[model.name] = model;
    console.log(db);
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db