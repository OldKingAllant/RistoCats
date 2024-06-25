function indexto(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

function generatepopup(id, closer, note) {
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

    var notearea = document.getElementById('note_area');
    notearea.innerText = note;
    
}

var modifyButton = document.querySelector('.modify');

modifyButton.addEventListener('click', function() {
    var dialog = document.createElement('dialog');
    dialog.innerHTML = `
        <div class="popup_background" >
            <textarea class="name" style="background-color: #f1dfbb; resize: none;" >Lorem ipsum</textarea>
            <div class="center">
                <div class="image">Img here</div>
                <div class="description">
                    <textarea class="text" style="background-color: #f1dfbb; resize: none;" >Lorem ipsum</textarea>
                    <textarea class="cost" style="background-color: #f1dfbb; resize: none;">$ 14.99</textarea>
                </div>
            </div>
            <div class="footer">
                <button class="save_button">Save</button>
            </div>
        </div>
    `;
    document.body.appendChild(dialog);
    dialog.showModal();

    var saveButton = dialog.querySelector('.save_button');
    saveButton.addEventListener('click', function() {
        dialog.close();
    });
});

var addNewButton = document.querySelector('.addnew');

addNewButton.addEventListener('click', function() {
    var dialog = document.createElement('dialog');
    dialog.innerHTML = `
        <div class="popup_background" >
            <textarea class="name" style="background-color: #f1dfbb; resize: none;" >New Entry</textarea>
            <div class="center">
                <div class="image">Img here</div>
                <div class="description">
                    <textarea class="text" style="background-color: #f1dfbb; resize: none;" >Lorem ipsum</textarea>
                    <textarea class="cost" style="background-color: #f1dfbb; resize: none;">$ 14.99</textarea>
                </div>
            </div>
            <div class="footer">
                <button class="save_button">Save</button>
            </div>
        </div>
    `;
    document.body.appendChild(dialog);
    dialog.showModal();

    var saveButton = dialog.querySelector('.save_button');
    saveButton.addEventListener('click', function() {
        dialog.close();
    });
});


/*fetches the orders and puts them in a list*/
async function fetchOrders(){

    let list = [];      //list of the orders

        const res = await fetch("/orders/remaining", {                                      //fetch of orders
			method: "GET",
			headers: {
                'Authorization': `Bearer ${window.localStorage.getItem('jwt')}`,
            }
	});

	const statusCode = res.status;
	if (statusCode != 200){
		if(statusCode == 401) {
			window.location.href = '/static/pages/login.html';
		} else {
			alert("AN ERROR HAS OCURRED!");
		}
	} else {
		list = ( await res.json()).list;
	}
	
	console.log(JSON.stringify(list));
    orderdisplay(list);                                  

}

/*takes the list from fetchOrders() and  */
async function orderdisplay(list){

    let fish;                       //this variable stores the information (properties) of the dishes that have been ordered
    

    for(let i = 0; i < list.length; i++){                       //this for cycles through the various orders in the db
        for(let j = 0; j < list[i].dishes.length; j++){             //this for cycles through the dishes present in the currently selected order

            const res = await fetch("/menu/"+list[i].dishes[j].id+"/properties?lang=en", {      //fetch of the dishes properties
                    method: "GET",
                    headers: {
                        'Authorization': `Bearer ${window.localStorage.getItem('jwt')}`,
                    }
            });

            const statusCode = res.status;
            if (statusCode != 200){
                if(statusCode == 401) {
                    window.location.href = '/static/pages/login.html';
                } else {
                    alert("AN ERROR HAS OCURRED!");
                }
            } else {
                fish = await res.json();
            }

            console.log(JSON.stringify(fish));

            let entry_container = document.createElement('div');                //these following lines create a div for each entry
            entry_container.className = 'entry';                                //which contain the dishes property and buttons to view notes
            entry_container.innerHTML =                                         //and remove the single dish from the order list
            `
                <div class="sawsbuck">${fish.name}</div>
                <div class="volcarona">${list[i].dishes[j].quantity}</div>
                <div class="chandelure">${list[i].tableid}</div>
                <div class="text">
                <button class="notes" onclick="generatepopup('popup', 'close', '${list[i].dishes[j].infos}')"></button>
                </div>
                <button class="reuniculus" onclick="removedish('${list[i]._id}', '${list[i].dishes[j].id}', ${list[i].dishes[j].quantity})">complete</button>
            `
            let orders_container = document.getElementById('orders_container');
            orders_container.appendChild(entry_container);                      //this appends the entry in the proper place

        }
	}

}

/*removes dish from the order list */
async function removedish(id_order, id_dish, quantity){

    const res = await fetch("/orders/"+id_order+"/dish/"+id_dish+"?quantity="+quantity, {   //the delete
            method: "DELETE",
            headers: {
                'Authorization': `Bearer ${window.localStorage.getItem('jwt')}`,
            }
            
    });

    const statusCode = res.status;
    if (statusCode != 200){
        if(statusCode == 401) {
            window.location.href = '/static/pages/login.html';
        } else {
            alert("AN ERROR HAS OCURRED!");
        }
    } else {
        window.location.reload();                  //reload of the page to display changes
    }

}

let qdishes = 0;            


/*this fetches the menu for the modify menu*/
async function fetchMenu(){

    let list = [];

    const res = await fetch("/menu/all_dishes?lang=en", {           //fetch of every dish in the db
        method: "GET",
        headers: {
            'Authorization': `Bearer ${window.localStorage.getItem('jwt')}`,
        }
    });

    const statusCode = res.status;
    if (statusCode != 200){
        if(statusCode == 401) {
            window.location.href = '/static/pages/login.html';
        } else {
            alert("AN ERROR HAS OCURRED!");
        }
    } else {
        list = ( await res.json()).list;
    }

    console.log(JSON.stringify(list));
    modMenuDisplay(list);

}

/*this creates a div for every dish in the db with its properties */
async function modMenuDisplay(list){

    window.qdishes=list.length;

    for(let i = 0; i < list.length; i++){

            let entry_container = document.createElement('div');
            entry_container.className = 'entry';
            entry_container.innerHTML =             //it also creates a checkbox for every dish that is checked \ unchecked if the dish is in the menu or not
            `
                <div class="text">
                    <div class="noselect" id="entry_text">${list[i].name}</div>
                </div>

                <div class="includer">
                    <input type="checkbox" id="myCheckbox_${i}" ${list[i].enabled ? 'checked' : ''} data-dish="${list[i].id}">
                    <label for="myCheckbox_${i}" class="customcheckbox">
                        <div class="noselect"><span class="checkmark">&#10003;</span></div>
                        
                    </label>
                </div>
            `
            let mod_menu_container = document.getElementById('mod_menu_container');
            mod_menu_container.appendChild(entry_container);

        
	}
}

/*this saves the changes of the modify menu */
async function saveMod(){

    let list= [];

    for(let i = 0; i< window.qdishes; i++){         //cycles through every dish

        let checkvar = document.getElementById(`myCheckbox_${i}`);      //takes the status of every checkbox and puts them in a list
        let iddish = checkvar.getAttribute("data-dish"); 
        let checkervalue = checkvar.checked; 
        let skibidicheck = 'N';
        if(checkervalue){
            skibidicheck='Y';
        }
        console.log(iddish);
        list.push({"id": iddish, "enable": skibidicheck});
    }

    const res = await fetch("/menu/modify", {           //fetch to modify the menu with the selected dishes
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${window.localStorage.getItem('jwt')}`,
        },
        body: JSON.stringify({"list": list})
    });

    const statusCode = res.status;
    if (statusCode != 200){
        if(statusCode == 401) {
            window.location.href = '/static/pages/login.html';
        } else {
            alert("AN ERROR HAS OCURRED!");
        }
    } else {
        window.location.reload();           //reload to display changes
    }

}