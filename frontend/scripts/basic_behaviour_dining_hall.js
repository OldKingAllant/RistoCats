/*Header da inserire nella richiesta, contiene il token*/
const myHeaders = {
  'Authorization': `Bearer ${window.localStorage.getItem('jwt')}`,
  'Content-Type': "application/json"
  
};

/*Si occupa di far scorrere la pagina*/
function indexto(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

var element = document.getElementById("example");
//Creando la list
let list = [];

/*
id: ID del tavolo
b: true se libero, false se occupato
*/
async function set_table_status(id, isfree){
	var sito = "/tables/" + id + "/status";

	console.log(sito);
	
	const res = await fetch(sito, {
		method: "POST",
		headers: myHeaders, 
		body: JSON.stringify({
			free: isfree ? 'Y' : "N"
		}),
	});

	if (res.status != 200) {
		if(res.status == 401) {
			window.location.href = '/static/pages/login.html';
		} else {
			alert("AN ERROR HAS OCURRED!");
		}
	}
	
	console.log(await res.json());
}

async function get_all_tables(){
	const res = await fetch("/tables/all_tables", {
			method: "GET",
			headers: myHeaders,
	});

	const statusCode = res.status;
	if (statusCode != 200){
		if(statusCode == 401) {
			window.location.href = '/static/pages/login.html';
		} else {
			alert("AN ERROR HAS OCURRED!");
		}
	} else {
		list = (await res.json()).list;
	}
	
	console.log(JSON.stringify(list));
	get_all_tables2();
}

function change_status_clicked(id, element) {
	let value = element.value;
	console.log(`Change table ${id} status to ${value}`);

	set_table_status(id, value == 'Available' ? true : false);
}

async function get_all_tables2(){
	
	const tab = "Table";
	for(let i = 0; i < list.length; i++){
		var identificatore = tab.toString() + list[i].tableid.toString();
		var numero = identificatore + ":";
		var tavolo = list[i].free;
		
		var currentDiv = document.getElementById("Tables");
		
		var select = document.createElement('select');
		select.id = identificatore;
		select.classList.add("dropdown-toggle");
		select.onchange = () => { change_status_clicked(i, select) };
		
		var option1 = document.createElement('option');
		option1.text = 'Available';
		select.add(option1);
		
		var option2 = document.createElement('option');
		option2.text = 'Occupied';
		
		if (tavolo == false){
			option2.setAttribute("selected", "selected");
		} else {
			option1.setAttribute("selected", "selected");
		}
		select.add(option2);
		
		currentDiv.parentNode.insertBefore(select, currentDiv.nextSibling);
		
		var lab = document.createElement('label');
		lab.setAttribute('for', 'identificatore');
		lab.textContent = numero;
		
		var br = document.createElement("br");
		currentDiv.parentNode.insertBefore(lab, currentDiv.nextSibling);
		currentDiv.parentNode.insertBefore(br, currentDiv.nextSibling);
	}
}

async function show_statistics() {
	let all_dishes = await fetch('/menu/all_dishes?lang=en', {
		headers: myHeaders,
		method: 'GET'
	});

	if(all_dishes.status != 200) {
		if(all_dishes.status == 401) {
			window.location.href = '/static/pages/login.html';
		} else {
			alert("AN ERROR HAS OCURRED!");
		}
	}

	let dish_list = await all_dishes.json();

	console.log(JSON.stringify(dish_list));

	let names = document.getElementById('stat_dish_name');
	let quants = document.getElementById('stat_dish_quant');

	dish_list.list.forEach((dish, index) => {
		let name = document.createElement('div');
		let stat = document.createElement('div');

		name.innerText = dish.name;
		stat.innerText = dish.statistics;

		names.appendChild(name);
		quants.appendChild(stat);
	})
}





