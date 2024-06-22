
/*Scrolls page until it reaches a given element*/
function indexto(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

let is_dish = false;
let dish_index = 0;
let dish_notes = {};
let order_list = {};

/**
 * Bring popup modal into view
 * @param {*} id Id of the modal
 * @param {*} closer Id of object that is used to hide the modal
 */
function generatepopup(id, closer) {
    var modal = document.getElementById(id);
    var span = document.getElementsByClassName(closer)[0];

    let notes = "";

    if(dish_notes[dish_index] != undefined) {
        notes = dish_notes[dish_index];
    }

    let text_area = document.getElementById('submitted_text');
    text_area.value = notes;
    
    modal.style.display = 'block';

    span.onclick = function() {
        modal.style.display = 'none';
        if (is_dish){
            is_dish = false;
            let notes_text= document.getElementById('submitted_text');
            dish_notes[dish_index] = notes_text.value;
            window.localStorage.setItem('current_notes', JSON.stringify(dish_notes));
        }
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
            if (is_dish){
                is_dish = false;
                let notes_text= document.getElementById('submitted_text');
                dish_notes[dish_index] = notes_text.value;
                window.localStorage.setItem('current_notes', JSON.stringify(dish_notes));
            }
        }
    }
}

/**
 * Retrieves nut. properties of the given dish and 
 * modifies the content of the hidden modal 
 * @param {*} index Index of the dish inside global menu array
 */
function set_nutritional_info(index) {
    let table = document.getElementById('table_content');
    let dish = window.dishes[index];
    table.innerHTML = `
    <div>${dish.allergens}</div>
    `;

    //Bring up the modal
    generatepopup('nutritionaltable', 'closing');
}

/**
 * Puts all the dishes retrieved with GET /menu/overview in the
 * correct positions on the page. It also sets the language
 * of the buttons depending on config
 * @param {*} menu Array of dishes retrieved with the API
 */
function create_menu_entries(menu) {
    let app_container = document.getElementById('appetizers_container');
    let main_container = document.getElementById('maindish_container');
    let second_container = document.getElementById('secondcourse_container');
    let dess_container = document.getElementById('dessert_container');

    let _info = ['Nutritional info', 'Valori nutrizionali'];
    let _remove = ['Remove', 'Rimuovi'];
    let _add = ['Add', 'Aggiungi'];

    let langs = ['en', 'it'];
    let selected_index = langs.indexOf(window.localStorage.getItem('lang'));

    //save array of dishes in global variable
    window.dishes = menu;

    //generate all dish containers
    menu.forEach((dish, index) => {
        let dish_container = document.createElement('div');
        dish_container.className = 'template';
        dish_container.innerHTML = 
        `
        <div class="title">${dish.name}</div>
        <div class="left-image">
            <img src="../assets/images/${dish.image}" alt="some_dish" class="left-image">
        </div>
        <div class="text">
            ${dish.ingredients}
        </div>
        <button class="nutritional_info" onclick="set_nutritional_info(${index})">${_info[selected_index]}</button>
        <button class="remover" onclick="remove_from_order(${index})" id="remover_${index}">${_remove[selected_index]}</button>
        <button class="counter" id="counter_${index}">0</button>
        <button class="adder" onclick="add_to_order(${index})" id="adder_${index}">${_add[selected_index]}</button>
        `;


        //Put dish in correct position
        if(dish.type == 'A') {
            app_container.appendChild(dish_container);
        } else if(dish.type == 'M') {
            main_container.appendChild(dish_container);
        } else if(dish.type == 'S') {
            second_container.appendChild(dish_container);
        } else {
            dess_container.appendChild(dish_container);
        }
    });

    //Restore order from previous session
    for(const [index, quant] of Object.entries(order_list)) {
        if(quant <= 0) {
            delete order_list[index];
        } else {
            let total_container = document.createElement('div');
            total_container.id = `total_entry_${index}`;
            total_container.className = 'total_entries';
            total_container.innerHTML = 
            `
            <div class="records_name">${window.dishes[index].name}</div>
            <div class="quantity" id="quantity_${index}">${order_list[index]}</div>
            <div class="price">${window.dishes[index].price}</div>
            <button class="notes" onclick="is_dish = true;dish_index = ${index};generatepopup('popup', 'close')"></button>
            `
            let sunto_container = document.getElementById('suino');
            sunto_container.appendChild(total_container);

            let counter = document.getElementById(`counter_${index}`);
            counter.innerText = quant;
        }
    }

    compute_subtotal();

}

window.onload = (ev) => {
    //Change lang image depending on config
    let lang_img = document.getElementById('lang_img');
    let curr_lang = window.localStorage.getItem('lang');

    console.log(`Selected lang: ${curr_lang}`);

    if(curr_lang == null) {
        lang_img.src = '/static/assets/images/en_flag.png';
    } else {
        let img_name = `/static/assets/images/${curr_lang}_flag.png`;
        lang_img.src = img_name;
    }

    //Set temporary lang in global variable
    window.selected_lang = curr_lang;

    //Retrieve menu from /menu/overview
    fetch(`/menu/overview?lang=${curr_lang}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${window.localStorage.getItem('jwt')}`
        }
    })
    .then((resp) => {
        if(resp.status != 200) {
            if(resp.status == 401) {
                //Token invalid/expired
                window.location.href = '/static/pages/login.html';
            } else {
                //This branch is unexpected (internal server error/server does not respond)
                alert('Server responded with ' + resp.status);
                resp.json()
                .then((body) => console.log(JSON.stringify(body)));
            }
        } else {
            resp.json()
            .then((body) => {
                console.log(JSON.stringify(body));
                create_menu_entries(body.dishes);
            })
            .catch((err) => {
                //Server should always return json responses
                console.log(JSON.stringify(err));
                alert('An error occurred');
            })
        }
    })
    .catch((err) => {
        console.log(JSON.stringify(err));
        alert('An error occurred');
    })

    /*Translate various things*/

    let submit_btn = document.getElementById('submit_text');
    let app = document.getElementById('appetizers');
    let main = document.getElementById('maindish');
    let second = document.getElementById('secondcourse');
    let welcome = document.getElementById('welcome_text');

    let id_app = document.getElementById('indexer_app');
    let id_main = document.getElementById('indexer_main');
    let id_second = document.getElementById('indexer_second');
    let id_total = document.getElementById('indexer_total');

    let clear_btn = document.getElementById('btn_clear');

    let subtotal = document.getElementById('subtotal');

    submit_btn.innerText = curr_lang == 'en' ? 'Submit' : 'Conferma';
    app.innerText = curr_lang == 'en' ? 'Appetizers' : 'Antipasti';
    main.innerText = curr_lang == 'en' ? 'Main Course' : 'Primi';
    second.innerText = curr_lang == 'en' ? 'Second Course' : 'Secondi';

    let total = document.getElementById('total_text');
    total.innerText = curr_lang == 'en' ? 'Total' : 'Totale';

    let order = document.getElementById('btn_order');
    order.innerText = curr_lang == 'en' ? 'Order' : 'Ordina';

    welcome.innerText = curr_lang == 'en' ? 'Welcome!' : 'Benvenuto!';

    id_app.innerText = curr_lang == 'en' ? 'Appetizers' : 'Antipasti';
    id_main.innerText = curr_lang == 'en' ? 'Main Course' : 'Primi';
    id_second.innerText = curr_lang == 'en' ? 'Second Course' : 'Secondi';
    id_total.innerText = curr_lang == 'en' ? 'Total' : 'Totale';

    clear_btn.innerText = curr_lang == 'en' ? 'Clear' : 'Cancella';
    subtotal.innerText = curr_lang == 'en' ? 'Subtotal' : 'Subtotale';

    //Retrieve old order if present
    let old_notes = window.localStorage.getItem('current_notes');

    dish_notes = old_notes != null ? JSON.parse(old_notes) : {};

    let old_list = window.localStorage.getItem('current_order');

    order_list = old_list != null ? JSON.parse(old_list) : {};
};

/**
 * Generates menu with language select
 */
function change_lang() {
    let langs = ['en', 'it'];
    let readable_name = ['English', 'Italiano'];
    let selected_index = langs.indexOf(window.localStorage.getItem('lang'));

    let _selected = ['Currently selected', 'Selezionato'];
    let _save = ['Save', 'Salva'];
    let _close = ['Close', 'Annulla'];

    if(selected_index == -1)
        selected_index = 0;

    //If first time executing this function, create
    //language select menu
    if(document.getElementById('lang_select') == null) {
        let list_popup = document.createElement('div');

        list_popup.id = 'lang_select';
        list_popup.className = 'lang_select_list';

        //Text that shows currently selected lang
        let selected_text = document.createElement('div');
        selected_text.id = 'lang_select_text';
        selected_text.style.color = '#c50d0d';
        selected_text.style.fontSize = '40px';
        selected_text.innerText = _selected[selected_index]  + `: ${readable_name[selected_index]}`;
        list_popup.appendChild(selected_text);

        //This could be used to generate arbitrary language selection,
        //but we only have eng and ita
        langs.forEach((lang, index) => {
            //Create button to select a given language
            let lang_div = document.createElement('div');
            let lang_button = document.createElement('button');
            lang_button.id = `${lang}_btn`;
            lang_button.style.padding = '40px';
            lang_button.style.borderColor = '#f1dfbb';
            lang_button.style.borderRadius = '25px';
            lang_button.style.width = '100%';

            //Set color depending if selected or not
            if(selected_index == index) {
                lang_button.style.backgroundColor = '#cbcf91';
            } else {
                lang_button.style.backgroundColor = '#f1dfbb';
            }

            lang_button.style.color = '#c50d0d';
            lang_button.style.fontSize = '30px';
            lang_button.innerText = readable_name[index];
            lang_button.style.alignItems = 'center';

            //Show country flag associated with lang
            let img = document.createElement('img');
            img.src = `/static/assets/images/${lang}_flag.png`;
            lang_button.appendChild(img);
            img.style.position = 'relative';
            img.style.width = '60px';
            img.style.height = '60px';
            img.style.alignSelf = 'center';

            lang_div.appendChild(lang_button);
            list_popup.appendChild(lang_div);

            lang_button.onclick = (ev) => {
                //If the button of a certain lang is clicked
                //Retrieve old selection
                let current_select = window.selected_lang == undefined ? window.localStorage.getItem('lang') : window.selected_lang;
                let other_button = document.getElementById(`${current_select}_btn`);
                //Invert highlight color
                other_button.style.backgroundColor = '#f1dfbb';
                lang_button.style.backgroundColor = '#cbcf91';
                //Set global temp lang
                window.selected_lang = lang;
                //Change selection text
                let text = document.getElementById('lang_select_text');
                text.innerText = _selected[index]  + `: ${readable_name[index]}`;
            };
        });

        //Button used to confirm changes
        let close_btn = document.createElement('button');
        close_btn.className = 'lang_list_closer';
        close_btn.innerText = _save[selected_index];
        close_btn.style.alignSelf = 'right';
        close_btn.style.marginRight = '20px';
        close_btn.style.float = 'right';

        close_btn.onclick = () => {
            list_popup.style.display = 'none';
            //Modify config in persistent storage and reload page
            if(window.selected_lang != window.localStorage.getItem('lang')) {
                window.localStorage.setItem('lang', window.selected_lang);
                window.location.reload();
            }
        };

        //Button used to rollback language changes
        let close_no_save = document.createElement('button');
        close_no_save.className = 'lang_list_closer';
        close_no_save.innerText = _close[selected_index];
        close_no_save.style.alignSelf = 'right';
        close_no_save.style.marginRight = '20px';
        close_no_save.style.float = 'right';

        close_no_save.onclick = () => {
            let lang = window.localStorage.getItem('lang');

            //Change color/highlight of the buttons
            let current_select = window.selected_lang == undefined ? lang : window.selected_lang;
            let shadow_select = document.getElementById(`${lang}_btn`);
            let other_button = document.getElementById(`${current_select}_btn`);
            other_button.style.backgroundColor = '#f1dfbb';
            shadow_select.style.backgroundColor = '#cbcf91';

            //Reset global variable with temp language and reset selection text
            list_popup.style.display = 'none';
            window.selected_lang = lang;
            let selected_index = langs.indexOf(lang);
            let text = document.getElementById('lang_select_text');
            text.innerText = _selected[selected_index]  + `: ${readable_name[selected_index]}`;
        }

        list_popup.appendChild(close_btn);
        list_popup.appendChild(close_no_save);
        document.body.appendChild(list_popup);
    }
    
    //Show the language select menu
    let list_popup = document.getElementById('lang_select');
    list_popup.style.display = 'block';
}

function add_to_order(index) {
    if (order_list[index] == undefined) {
        order_list[index] = 1;

        let total_container = document.createElement('div');
        total_container.id = `total_entry_${index}`;
        total_container.className = 'total_entries';
        total_container.innerHTML = 
        `
        <div class="records_name">${window.dishes[index].name}</div>
        <div class="quantity" id="quantity_${index}">${order_list[index]}</div>
        <div class="price">${window.dishes[index].price}</div>
        <button class="notes" onclick="is_dish = true;dish_index = ${index};generatepopup('popup', 'close')"></button>
        `
        let sunto_container = document.getElementById('suino');
        sunto_container.appendChild(total_container);
        
    } else {
        order_list[index] += 1;
        let total_quantity = document.getElementById(`quantity_${index}`)
        total_quantity.innerText = order_list[index];
    }
    let counter = document.getElementById(`counter_${index}`);
    counter.innerText = order_list[index];

    compute_subtotal(); 

    //Save in persistent storage in case the page is reloaded
    window.localStorage.setItem('current_order', JSON.stringify(order_list));
}

function remove_from_order(index) {
    let counter = document.getElementById(`counter_${index}`);
    if (order_list[index] != undefined && order_list[index] > 0) {
        order_list[index] -= 1;
        if (order_list[index] == 0) {
            let total_entry = document.getElementById(`total_entry_${index}`);
            let sunto_container = document.getElementById('suino');
            sunto_container.removeChild(total_entry);
            delete order_list[index];
            counter.innerText = 0;
            if(dish_notes[index] != undefined){
                delete dish_notes[index];
            }
        }else{
            counter.innerText = order_list[index];
            let total_quantity = document.getElementById(`quantity_${index}`)
            total_quantity.innerText = order_list[index];
        }

    }

    compute_subtotal();

     //Save in persistent storage in case the page is reloaded
    window.localStorage.setItem('current_order', JSON.stringify(order_list));
    window.localStorage.setItem('current_notes', JSON.stringify(dish_notes));
}

function clear_order() {
    window.localStorage.removeItem('current_order');
    window.localStorage.removeItem('current_notes');
    window.location.reload();
}

function compute_subtotal() {
    let total = 0;
    for (const [index, quant] of Object.entries(order_list)) {
        total += window.dishes[index].price * quant;
    }
    let subtotal = document.getElementById('total_price');
    subtotal.innerText = total;
}

function place_order() {
    let order = [];
    for (const [index, quant] of Object.entries(order_list)) {
        let dish = window.dishes[index];
        order.push({id: dish.id, quantity: quant, infos: dish_notes[index]==undefined ? "" : dish_notes[index]});
    }

    if(order.length == 0) {
        alert('No dishes selected');
        return;
    }

    let id_table = window.localStorage.getItem('table_id');

    fetch(`/order/${id_table}/place`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${window.localStorage.getItem('jwt')}`
        },
        body: JSON.stringify(order)
    })
    .then((resp) => {
        if(resp.status != 200) {
            if(resp.status == 401) {
                //Token invalid/expired
                window.location.href = '/static/pages/login.html';
            } else {
                //This branch is unexpected (internal server error/server does not respond)
                alert('Server responded with ' + resp.status);
                resp.json()
                .then((body) => console.log(JSON.stringify(body)));
            }
        } else {
            resp.json()
            .then((body) => {
                console.log(JSON.stringify(body));
                alert('Order placed successfully');
                window.localStorage.removeItem('current_order');
                window.localStorage.removeItem('current_notes');
                window.location.reload();
            })
            .catch((err) => {
                //Server should always return json responses
                console.log(JSON.stringify(err));
                alert('An error occurred');
            })
        }
    })
    .catch((err) => {
        console.log(JSON.stringify(err));
        alert('An error occurred');
    })
}