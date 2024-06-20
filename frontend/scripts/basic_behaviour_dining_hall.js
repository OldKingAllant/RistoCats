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
async function set_table_status(option, b){
	var select = option.parentNode;
	var selectid = select.id;
	var id = selectid.charAt(selectid.length - 1);
	var sito = "/tables/" + id + "/status";
	
	const res = await fetch(sito, {
		method: "POST",
		headers: myHeaders, 
		body: JSON.stringify({
			free: b,
		}),
	}).then()
	if (statusCode != 200){
			alert("AN ERROR HAS OCURRED!");
		} else {
			list = res.list;
	}
	
	console.log(await res.json());
}

async function get_all_tables(){
	const res = await fetch("/tables/all_tables", {
			method: "GET",
			headers: myHeaders,
		}).then()
		const statusCode = res.status;
		if (statusCode != 200){
			alert("AN ERROR HAS OCURRED!");
		} else {
			list = res.list;
		}
		//const data = res.json();
		get_all_tables2();
		
}

async function get_all_tables2(){
	
	const tab = "Table";
	for(let i = 0; i < 3; i++){
		var object = list[i].toString();
		var identificatore = tab.toString() + list[i].tableid.toString();
		var numero = identificatore + ":";
		var tavolo = list[i].free;
		
		var currentDiv = document.getElementById("Tables");
		
		var select = document.createElement('select');
		select.id = identificatore;
		select.classList.add("dropdown-toggle");
		
		var option1 = document.createElement('option');
		option1.text = 'Available';
		option1.onclick = 'set_table_status(this, true)';
		select.add(option1);
		
		var option2 = document.createElement('option');
		option2.text = 'Occupied';
		option2.onclick = 'set_table_status(this, false)';
		
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









