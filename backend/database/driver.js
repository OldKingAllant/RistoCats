const mongodb = require('mongodb')

//Put driver here
class DatabaseDriver {
    /**
     * Creates MongoDB client but
     * does not create connection
     * @param {*} url Connection string
     * @param {*} db_name Database name in cluster
     */
    constructor(url, db_name) {
        this.client = new mongodb.MongoClient(url);
        this.dbname = db_name;
        this.is_connected = false;
    }

    extractDishInfo(dish, lang) {
        return {
            "id": dish._id,
            "name": dish.nome,
            "image": dish.image,
            "ingredients": dish.desc[lang],
            "price": dish.price,
            "allergens": dish.tn[lang],
            "enabled": dish.tags.includes('Si'),
            "statistics": dish.qthistory,
            "type": dish.type
        };
    }

    /**
     * Finalize connection
     */
    async connect() {
        await this.client.connect();
        this.db = this.client.db(this.dbname);
        this.collection = this.db.collection("default");
        this.is_connected = true;
    }

    /**
     * Retrieves user from database using the email.
     * The returned record has the same structure
     * as the one on the database
     * 
     * @param {*} email User email
     * @returns The user
     */
    async getUserByMail(email) {
        let result = await this.collection.findOne({
            tags: 'User', mail: email
        });

        return result;
    }

    /**
     * Retrieves list of all active dishes in the menu,
     * with description depending on lang
     * 
     * @param {*} lang Language
     * @returns The menu
     */
    async getMenu(lang) {
        let menu = await this.collection.find({ tags: ["Piatto", "Si"] }).toArray();
        return menu.map((entry) => {
            return this.extractDishInfo(entry, lang);
        })
    }

    /**
     * Retrieves single dish using the unique id
     * 
     * @param {*} id Unique dish id
     * @param {*} lang Language
     * @returns The dish
     */
    async getDish(id, lang) {
        let dish = await this.collection.findOne({ _id: new mongodb.ObjectId( id ) });

        if(dish == null) {
            return null;
        }

        return this.extractDishInfo(dish, lang);
    }

    /**
     * Places a single order with unique id created from timestamp and 
     * returns the inserted id
     * 
     * @param {*} order Order struct
     * @returns Inserted id
     */
    async placeOrder(order) {
        order.tags = ["Order"];
        order._id = mongodb.ObjectId.createFromTime(Math.floor(Date.now() / 1000))
        let result = await this.collection.insertOne(order);

        if(result.acknowledged)
            return result.insertedId.toHexString();

        return null;
    }

    /**
     * Insert/remove dish from the menu
     * 
     * @param {*} id Unique dish id
     * @param {*} enable true/false
     * @returns If the dish status has been modified successfully
     */
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


    /**
     * Retrieves all dishes, even if not in the menu
     * 
     * @param {*} lang Language
     * @returns All dishes
     */
    async getAllDishes(lang) {
        let result = await this.collection.find({ tags: 'Piatto' }).toArray();

        return result.map((dish) => this.extractDishInfo(dish, lang));
    }

    /**
     * @returns All placed and incomplete orders
     */
    async getOrders() {
        let result = await this.collection.find({tags: 'Order'}).toArray();

        return result;
    }

    /**
     * Retrieves details of a single order
     * @param {*} id Unique id
     * @returns The order
     */
    async getOrderDetails(id) {
        let result = await this.collection.findOne({
            tags: 'Order', _id: new mongodb.ObjectId(id) });

        return result;
    }

    /**
     * Decrements count of a given dish inside an order, 
     * removes the dish if its quantity reaches 0 and
     * removes the order alltogether if not dishes remain
     * 
     * @param {*} orderid Unique order id
     * @param {*} dishid  Unique dish id
     * @param {*} quantity Quantity to remove
     * @returns Request ok
     */
    async removeDishFromOrder(orderid, dishid, quantity) {
        //Get order
        let order = await this.getOrderDetails(orderid);

        if(order == null) { //Order does not exist
            return false;
        }


        //Find dish in order
        let dish_index = order.dishes.findIndex((dish) => dish.id == dishid);

        if(dish_index == -1) { //Dish not present
            return false;
        }

        let dish_entry = order.dishes[dish_index];

        let filter = { _id: new mongodb.ObjectId(orderid) };

        //Clamp decrement to max
        if(quantity > dish_entry.quantity) {
            quantity = dish_entry.quantity;
        }

        //Remove quantity
        dish_entry.quantity -= quantity;

        let result = null;

        if(dish_entry.quantity == 0 && order.dishes.length == 1) {
            result = await this.collection.deleteOne(filter); //Dish quantity is now zero and there are no other dishes 
                                                              //remaining, delete the order
        } else {
            if(dish_entry.quantity == 0) {
                order.dishes.splice(dish_index, 1); //Remove dish from list
            }

            //Replace list on db with the modified one
            result = await this.collection.updateOne(filter, 
                { $set: {'dishes': order.dishes } }
            );
        }

        return result.acknowledged;
    }

    /**
     * 
     * @returns All tables marked as free
     */
    async getFreeTables() {
        let result = await this.collection.find({
            tags: 'Table', free: true
        }).toArray();

        return result;
    }

    /**
     * 
     * @returns All tables
     */
    async getAllTables() {
        let result = await this.collection.find({
            tags: 'Table'
        }).toArray();

        return result;
    }

    /**
     * Sets table status in DB
     * 
     * @param {*} table_id Numeric table id
     * @param {*} set_free True/False
     * @returns Reuqest ok
     */
    async setTableStatus(table_id, set_free) {
        let filter = { tags: 'Table', tableid: table_id };

        let result = await this.collection.updateOne(filter, 
            { $set: {free: set_free} }
        );

        return result.acknowledged;
    }

    /**
     * Adds 'quantity' to dish stats
     * @param {*} dishid Unique dish id
     * @param {*} quantity Quantity to add
     */
    async updateStats(dishid, quantity) {
        let filter = { _id: new mongodb.ObjectId(dishid) };
        await this.collection.updateOne(filter, { $inc: {"qthistory": quantity} });
    }
}

module.exports = DatabaseDriver;