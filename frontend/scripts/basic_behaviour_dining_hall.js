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

/**
 * 
 * @param {*} id Numeric table id
 * @param {*} isfree True=set as available
 * 
 * Changes table status on the server
 */
async function set_table_status(id, isfree){
	var sito = "/tables/" + id + "/status";
	if(list[id].free == isfree) {
		return;
	}

	list[id].free = isfree;

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
	
	console.log(JSON.stringify(await res.json()));

	let status_button = document.getElementById(`status_${id}`);
	status_button.innerText = isfree ? "Available" : "Occupied";
}

/**
 * Retrieves all tables from the server
 */
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


async function get_all_tables2(){
	const tab = "Table";

	for(let i = 0; i < list.length; i++){
		let table_list = document.createElement('div');
        table_list.className = 'entry';
        table_list.innerHTML = 
        `
		<div class="name">Table ${i+1}</div> 
		<div class="dropdown">
			<button class="dropbtn" id="status_${i}">${list[i].free == true ? "Available" : "Occupied"}</button>
			<div class="dropdown-content">
				<a href="javascript:set_table_status(${i}, true)">Available</a>
				<a href="javascript:set_table_status(${i}, false)">Occupied</a>
			</div>
		</div>
        `
		let table_container = document.getElementById('body_tables');
        table_container.appendChild(table_list);
	}
}



/**
 * Generates list with dish name and dish statistics
 */
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

	for(let i = 0; i < dish_list.list.length; i++){
		let stat_list = document.createElement('div');
			stat_list.className = 'entry';
			stat_list.innerHTML = 
			`
			<div class="name">${dish_list.list[i].name}</div>
			<div class="counter">${dish_list.list[i].statistics}</div>
			`
		let statistic_entry = document.getElementById('statistics_tables');
		statistic_entry.appendChild(stat_list);
	}
}
