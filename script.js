function addProduct() {
    let name = document.getElementById("name").value;
    let category = document.getElementById("category").value;
    let price = document.getElementById("price").value;
    let quantity = document.getElementById("quantity").value;

    if (name === "" || category === "" ||
        price === "" || quantity === "") {
        alert("Please fill all fields");
        return;
    }

    let table = document.getElementById("productList");

    let row = table.insertRow();

    row.insertCell(0).innerText = name;
    row.insertCell(1).innerText = category;
    row.insertCell(2).innerText = price;
    row.insertCell(3).innerText = quantity;

    let action = row.insertCell(4);

    let btn = document.createElement("button");
    btn.innerText = "Delete";

    btn.onclick = function() {
        row.remove();
    };

    action.appendChild(btn);

    document.getElementById("name").value = "";
    document.getElementById("category").value = "";
    document.getElementById("price").value = "";
    document.getElementById("quantity").value = "";
}
