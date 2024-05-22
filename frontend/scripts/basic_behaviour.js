
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




var counter = 0;
var counterButton = document.getElementById('counter1');
var adderButton = document.getElementById('adder1');
var removerButton = document.getElementById('remover1');

adderButton.addEventListener('click', function() {
    counter++;
    counterButton.textContent = counter;
});

removerButton.addEventListener('click', function() {
    if (counter > 0) {
        counter--;
        counterButton.textContent = counter;
    }
});