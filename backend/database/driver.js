const mongodb = require('mongodb')

//Put driver here
class DatabaseDriver {
    constructor(url, db_name) {
        this.client = new mongodb.MongoClient(url);
        this.dbname = db_name;
        this.is_connected = false;
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
            return {
                "id": entry._id,
                "name": entry.nome,
                "image": "",
                "ingredients": entry.desc,
                "price": 0,
                "calories": 0,
                "allergens": ""
            };
        })
    }

    async getDish(id) {
        let dish = await this.collection.findOne({ _id: new mongodb.ObjectId( id ) });

        if(dish == null) {
            return null;
        }

        return {
            "id": dish._id,
            "name": dish.nome,
            "image": "",
            "ingredients": dish.desc,
            "price": 0,
            "calories": 0,
            "allergens": ""
        };
    }

    async placeOrder(order) {
        order.tags = ["Order"];
        order._id = mongodb.ObjectId.createFromTime(Math.floor(Date.now() / 1000))
        let result = await this.collection.insertOne(order);

        if(result.acknowledged)
            return result.insertedId;

        return null;
    }
}

module.exports = DatabaseDriver;