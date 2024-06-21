
function indexto(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

function generatepopup(id, closer) {
    var modal = document.getElementById(id);
    var span = document.getElementsByClassName(closer)[0];

    modal.style.display = 'block';

    span.onclick = function() {
        modal.style.display = 'none';
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }
}

function set_nutritional_info(index) {
    let table = document.getElementById('table_content');
    let dish = window.dishes[index];
    table.innerHTML = `
    <div>${dish.allergens}</div>
    `;
    generatepopup('nutritionaltable', 'closing');
}

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

    window.dishes = menu;

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
        <button class="remover" id="remover_${index}">${_remove[selected_index]}</button>
        <button class="counter" id="counter_${index}"></button>
        <button class="adder" id="adder_${index}">${_add[selected_index]}</button>
        `;

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
}

var counter = 0;
var counterButton = document.getElementById('counter1');
var adderButton = document.getElementById('adder1');
var removerButton = document.getElementById('remover1');

window.onload = (ev) => {
    let lang_img = document.getElementById('lang_img');
    let curr_lang = window.localStorage.getItem('lang');

    console.log(`Selected lang: ${curr_lang}`);

    if(curr_lang == null) {
        lang_img.src = '/static/assets/images/en_flag.png';
    } else {
        let img_name = `/static/assets/images/${curr_lang}_flag.png`;
        lang_img.src = img_name;
    }

    window.selected_lang = curr_lang;

    fetch(`/menu/overview?lang=${curr_lang}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${window.localStorage.getItem('jwt')}`
        }
    })
    .then((resp) => {
        if(resp.status != 200) {
            if(resp.status == 401) {
                window.location.href = '/static/pages/login.html';
            } else {
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
                console.log(JSON.stringify(err));
                alert('An error occurred');
            })
        }
    })
    .catch((err) => {
        console.log(JSON.stringify(err));
        alert('An error occurred');
    })

    let submit_btn = document.getElementById('submit_text');
    let app = document.getElementById('appetizers');
    let main = document.getElementById('maindish');
    let second = document.getElementById('secondcourse');
    let welcome = document.getElementById('welcome_text');

    let id_app = document.getElementById('indexer_app');
    let id_main = document.getElementById('indexer_main');
    let id_second = document.getElementById('indexer_second');
    let id_total = document.getElementById('indexer_total');

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
};

function change_lang() {
    let langs = ['en', 'it'];
    let readable_name = ['English', 'Italiano'];
    let selected_index = langs.indexOf(window.localStorage.getItem('lang'));

    let _selected = ['Currently selected', 'Selezionato'];
    let _save = ['Save', 'Salva'];
    let _close = ['Close', 'Annulla'];

    if(selected_index == -1)
        selected_index = 0;

    if(document.getElementById('lang_select') == null) {
        let list_popup = document.createElement('div');

        list_popup.id = 'lang_select';
        list_popup.className = 'lang_select_list';

        let selected_text = document.createElement('div');
        selected_text.id = 'lang_select_text';
        selected_text.style.color = '#c50d0d';
        selected_text.style.fontSize = '40px';
        selected_text.innerText = _selected[selected_index]  + `: ${readable_name[selected_index]}`;
        list_popup.appendChild(selected_text);

        langs.forEach((lang, index) => {
            let lang_div = document.createElement('div');
            let lang_button = document.createElement('button');
            lang_button.id = `${lang}_btn`;
            lang_button.style.padding = '40px';
            lang_button.style.borderColor = '#f1dfbb';
            lang_button.style.borderRadius = '25px';
            lang_button.style.width = '100%';

            if(selected_index == index) {
                lang_button.style.backgroundColor = '#cbcf91';
            } else {
                lang_button.style.backgroundColor = '#f1dfbb';
            }

            lang_button.style.color = '#c50d0d';
            lang_button.style.fontSize = '30px';
            lang_button.innerText = readable_name[index];
            lang_button.style.alignItems = 'center';

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
                let current_select = window.selected_lang == undefined ? window.localStorage.getItem('lang') : window.selected_lang;
                let other_button = document.getElementById(`${current_select}_btn`);
                other_button.style.backgroundColor = '#f1dfbb';
                lang_button.style.backgroundColor = '#cbcf91';
                window.selected_lang = lang;
                let text = document.getElementById('lang_select_text');
                text.innerText = _selected[index]  + `: ${readable_name[index]}`;
            };
        });

        let close_btn = document.createElement('button');
        close_btn.className = 'lang_list_closer';
        close_btn.innerText = _save[selected_index];
        close_btn.style.alignSelf = 'right';
        close_btn.style.marginRight = '20px';
        close_btn.style.float = 'right';

        close_btn.onclick = () => {
            list_popup.style.display = 'none';
            if(window.selected_lang != window.localStorage.getItem('lang')) {
                window.localStorage.setItem('lang', window.selected_lang);
                window.location.reload();
            }
        };

        let close_no_save = document.createElement('button');
        close_no_save.className = 'lang_list_closer';
        close_no_save.innerText = _close[selected_index];
        close_no_save.style.alignSelf = 'right';
        close_no_save.style.marginRight = '20px';
        close_no_save.style.float = 'right';

        close_no_save.onclick = () => {
            let lang = window.localStorage.getItem('lang');

            let current_select = window.selected_lang == undefined ? lang : window.selected_lang;
            let shadow_select = document.getElementById(`${lang}_btn`);
            let other_button = document.getElementById(`${current_select}_btn`);
            other_button.style.backgroundColor = '#f1dfbb';
            shadow_select.style.backgroundColor = '#cbcf91';

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
    
    let list_popup = document.getElementById('lang_select');
    list_popup.style.display = 'block';
}