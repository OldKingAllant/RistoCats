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