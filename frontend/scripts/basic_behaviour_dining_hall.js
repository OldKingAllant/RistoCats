function indexto(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

var element = document.getElementById("example");
//Creando la list
let list = [];
list.push({ ID: 1, NUM: true });
list.push({ ID: 2, NUM: false });
list.push({ ID: 3, NUM: true });

/*
id: ID del tavolo
b: true se occupato, false se libero
*/
async function set_table_status(option, b){
	var select = option.parentNode;
	var selectid = select.id;
	var id = selectid.charAt(selectid.length - 1);
	
	/*Codice per mandare al server*/
}

async function get_all_tables(){
	
	const tab = "Table";
	for(let i = 0; i < 3; i++){
		var object = list[i].toString();
		var identificatore = tab.toString() + list[i].ID.toString();
		var numero = identificatore + ":";
		var tavolo = list[i].NUM;
		
		var currentDiv = document.getElementById("Tables");
		
		var select = document.createElement('select');
		select.id = identificatore;
		select.classList.add("dropdown-toggle");
		
		var option1 = document.createElement('option');
		option1.text = 'Available';
		option1.onclick = 'set_table_status(this, false)';
		select.add(option1);
		
		var option2 = document.createElement('option');
		option2.text = 'Occupied';
		option2.onclick = 'set_table_status(this, true)';
		
		if (tavolo == true){
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











