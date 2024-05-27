const mongodb = require('mongodb')

//Put driver here
class DatabaseDriver {
    constructor(url, db_name) {
        this.client = new mongodb.MongoClient(url);
        this.dbname = db_name;
        this.is_connected = false;
    }

    extractDishInfo(dish) {
        return {
            "id": dish._id,
            "name": dish.nome,
            "image": "",
            "ingredients": dish.desc,
            "price": 0,
            "calories": 0,
            "allergens": "",
            "enabled": dish.tags.includes('Si')
        };
    }

    async connect() {
        await this.client.connect();
        this.db = this.client.db(this.dbname);
        this.collection = this.db.collection("default");
        this.is_connected = true;
    }

    async getUserByMail(mail) {

    }

    async getMenu() {
        let menu = await this.collection.find({ tags: ["Piatto", "Si"] }).toArray();
        return menu.map((entry) => {
            return this.extractDishInfo(entry);
        })
    }

    async getDish(id) {
        let dish = await this.collection.findOne({ _id: new mongodb.ObjectId( id ) });

        if(dish == null) {
            return null;
        }

        return this.extractDishInfo(dish);
    }

    async placeOrder(order) {
        order.tags = ["Order"];
        order._id = mongodb.ObjectId.createFromTime(Math.floor(Date.now() / 1000))
        let result = await this.collection.insertOne(order);

        if(result.acknowledged)
            return result.insertedId;

        return null;
    }

    async enableDish(id, enable) {
        let enable_string = 'Si';

        if(!enable) {
            enable_string = 'No';
        }

        let result = await this.collection.updateOne(
            { _id: new mongodb.ObjectId(id), tags: 'Piatto' }, 
            { $set: { tags: ['Piatto', enable_string] } }
        );

        return result.acknowledged && result.modifiedCount == 1;
    }

    async getAllDishes() {
        let result = await this.collection.find({ tags: 'Piatto' }).toArray();

        return result.map((dish) => this.extractDishInfo(dish));
    }
}

module.exports = DatabaseDriver;