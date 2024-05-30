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
            "enabled": dish.tags.includes('Si'),
            "statistics": dish.qthistory
        };
    }

    async connect() {
        await this.client.connect();
        this.db = this.client.db(this.dbname);
        this.collection = this.db.collection("default");
        this.is_connected = true;
    }

    async getUserByMail(email) {
        let result = await this.collection.findOne({
            tags: 'User', mail: email
        });

        return result;
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
            return result.insertedId.toHexString();

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

    async getOrders() {
        let result = await this.collection.find({tags: 'Order'}).toArray();

        return result;
    }

    async getOrderDetails(id) {
        let result = await this.collection.findOne({
            tags: 'Order', _id: new mongodb.ObjectId(id) });

        return result;
    }

    async removeDishFromOrder(orderid, dishid, quantity) {
        let order = await this.getOrderDetails(orderid);

        if(order == null) {
            return false;
        }


        let dish_index = order.dishes.findIndex((dish) => dish.id == dishid);

        if(dish_index == -1) {
            return false;
        }

        let dish_entry = order.dishes[dish_index];

        let filter = { _id: new mongodb.ObjectId(orderid) };

        if(quantity > dish_entry.quantity) {
            quantity = dish_entry.quantity;
        }

        dish_entry.quantity -= quantity;

        let result = null;

        if(dish_entry.quantity == 0 && order.dishes.length == 1) {
            result = await this.collection.deleteOne(filter);
        } else {
            if(dish_entry.quantity == 0) {
                order.dishes.splice(dish_index, 1);
            }

            result = await this.collection.updateOne(filter, 
                { $set: {'dishes': order.dishes } }
            );
        }

        return result.acknowledged;
    }

    async getFreeTables() {
        let result = await this.collection.find({
            tags: 'Table', free: true
        }).toArray();

        return result;
    }

    async getAllTables() {
        let result = await this.collection.find({
            tags: 'Table'
        }).toArray();

        return result;
    }

    async setTableStatus(table_id, set_free) {
        let filter = { tags: 'Table', tableid: table_id };

        let result = await this.collection.updateOne(filter, 
            { $set: {free: set_free} }
        );

        return result.acknowledged && result.modifiedCount == 1;
    }
}

module.exports = DatabaseDriver;