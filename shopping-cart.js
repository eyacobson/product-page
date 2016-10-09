var quantities = document.getElementsByName("amount");
var buyButtons = document.getElementsByClassName("buy");
var toggleButton = document.getElementById("toggle");
var shoppingCart = document.getElementById("shopping-cart");
var promoButton = document.getElementById("promoButton");
var onsale = ["Stretch Till Ya Kvetch", "Do Squats Till Ya Plotz", "Tae Bo Till Ya Crybo"];
var baselineGrandTotal;
var promoFlag1, promoFlag2, promoFlag3;

//Event listeners for buy buttons
for (var i = 0; i < buyButtons.length; i++) {
	buyButtons[i].addEventListener("click", function() {
		/*"Add" button's ID corresponds to index of product in array
		   of all available products*/
		var productID = Number(this.id); //Grabs button's ID
		var product = collectProducts()[productID]; //Grabs product
		addToCart(product);
		calculateTotal();
		baselineGrandTotal = getTotal();
	});
}

//Event listener for toggle button
toggleButton.addEventListener("click", function() {
	if (shoppingCart.style.display === "block") {
		shoppingCart.style.display = "none";
	} else {
		shoppingCart.style.display = "block";
		var top = shoppingCart.offsetTop - 20;
		window.scrollTo(0, top);
	}
});

//Event listeners to validate product listing's quantity inputs
for (var i = 0; i < quantities.length; i++) {
	quantities[i].addEventListener("input", function(event) {
		if (this.validity.valid === false) {
			this.value = "";
		}
	});
}

//Event listener for button to add promo code
promoButton.addEventListener("click", function() {
	applyPromo();
});

/*Grab however many products are on the page & add them to an array
  of objects, where each object is a product*/
function collectProducts() {
	var productObjects = [];
	var productNodes = document.getElementsByTagName("li");

	for (var i = 0; i < productNodes.length; i++) {

		var title = productNodes[i].getElementsByTagName("h2")[0].childNodes[0].nodeValue;

		var image = productNodes[i].getElementsByClassName("image_container")[0].getElementsByTagName("img")[0].getAttribute("src");

		var price = productNodes[i].getElementsByTagName("h3")[0].childNodes[0].nodeValue;

		var quantity = productNodes[i].getElementsByTagName("div")[1].getElementsByTagName("input")[0].value;

		var product = {};

		product.title = title;
		product.image = image;
		product.origPrice = price;
		
		//Once promo has been applied, can add to cart w/ new promo price
		if (title === "Sweat Till Ya Fret" && promoFlag1) {
			product.price = "$" + (parsePrice(price) - (parsePrice(price) * 0.10)).toFixed(2);
		} else if (onsale.indexOf(title) > -1 && promoFlag2) {
			product.price = "$" + (parsePrice(price) - (parsePrice(price) * 0.15)).toFixed(2);
		} else {
			product.price = price;
		}
		
		product.quantity = quantity;

		productObjects.push(product);
	}

	return productObjects;
}

/*Add product to cart, passed in as object argument from click event.
  The ID on the new item comes from whatever the length of the
  array of "remove" buttons is at the time of addition*/
function addToCart(product) {
	var itemsDiv = document.getElementById("items");
	var addedID = document.getElementsByClassName("remove").length;
	var subtotal = multiplyPrice(product.price, product.quantity);

	var cartItem = '<div class="cart-item"><div class="col product_column"><img src="' + product.image + '" alt="" title="' + product.title + '"><p class="title">' + product.title + '</p></div><div class="col price_column"><p>' + product.price + '</p></div><div class="col quantity_column"><button class="subtract"><span>-</span></button><input class="amount" type="text" value="' + product.quantity + '"><button class="add"><span>+</span></button><button id="' + addedID + '" class="remove">Remove</button><p class="error">Quantity not valid!</p></div><div class="col total_column"><p>' + subtotal + '</p></div></div>';

	var titleNodesInCart = document.getElementsByClassName("title");
	var titlesInCart = [];

	//Figure out what titles are already in the cart
	for (var i = 0; i < titleNodesInCart.length; i++) {
		titlesInCart.push(titleNodesInCart[i].childNodes[0].nodeValue);
	}

	/*Only add brand new row if item isn't already in cart ... if it
	  is, then increase its quantity*/
	if (titlesInCart.indexOf(product.title) > -1) {
		var position = titlesInCart.indexOf(product.title);
		var amountInputs = document.getElementsByClassName("amount");
		amountInputs[position].value = Number(amountInputs[position].value) + Number(product.quantity);

		var newPrice = multiplyPrice(product.price, amountInputs[position].value);
		document.getElementsByClassName("total_column")[position + 1].getElementsByTagName("p")[0].childNodes[0].nodeValue = newPrice;
	} else {
		itemsDiv.insertAdjacentHTML("beforeend", cartItem);

		/*Part of adding an item to the cart is adding functionality
		  to its buttons (remove, add, & subtract) & the quantity
		  input fields!*/
		var removeButton = document.getElementsByClassName("remove")[addedID];
		removeButton.addEventListener("click", function() {
			removeFromCart(Number(this.id));
		});

		var addButton = document.getElementsByClassName("add")[addedID];
		var subtractButton = document.getElementsByClassName("subtract")[addedID];
		var amountInput = document.getElementsByClassName("amount")[addedID];
		amountInput.scrollLeft = amountInput.scrollWidth;

		addButton.addEventListener("click", function() {
			if (promoFlag1 && product.title === "Sweat Till Ya Fret") {
				var discountPrice = "$" + (parsePrice(product.origPrice) - parsePrice(product.origPrice) * 0.10).toFixed(2);
			} else if (promoFlag2 && onsale.indexOf(product.title) > -1) {
				var discountPrice = "$" + (parsePrice(product.origPrice) - parsePrice(product.origPrice) * 0.15).toFixed(2);
			} else if (promoFlag3) {
				calculateTotal();
			}
			changeQuantity(this, discountPrice || product.price);
			baselineGrandTotal = getTotal();
		});
		
		subtractButton.addEventListener("click", function() {
			if (promoFlag1 && product.title === "Sweat Till Ya Fret") {
				var discountPrice = "$" + (parsePrice(product.origPrice) - parsePrice(product.origPrice) * 0.10).toFixed(2);
			} else if (promoFlag2 && onsale.indexOf(product.title) > -1) {
				var discountPrice = "$" + (parsePrice(product.origPrice) - parsePrice(product.origPrice) * 0.15).toFixed(2);
			} else if (promoFlag3) {
				calculateTotal();
			}
			changeQuantity(this, discountPrice || product.price);
			baselineGrandTotal = getTotal();
		});

		//Calculate subtotals & grand total as you type
		amountInput.addEventListener("input", function() {
			//Change subtotals as user types into input
			if (this.value > 0) {
				if (promoFlag1 && product.title === "Sweat Till Ya Fret") { //If promo applied, calculate discount price
					var discountPrice = "$" + (parsePrice(product.origPrice) - parsePrice(product.origPrice) * 0.10).toFixed(2);
				} else if (promoFlag2 && onsale.indexOf(product.title) > -1) {
					var discountPrice = "$" + (parsePrice(product.origPrice) - parsePrice(product.origPrice) * 0.15).toFixed(2);
				}
				
				//Use discountPrice, if it exists, as argument to multiplyPrice()
				var newPrice = multiplyPrice(discountPrice || product.price, this.value);
				document.getElementsByClassName("total_column")[addedID + 1].getElementsByTagName("p")[0].childNodes[0].nodeValue = newPrice;
				calculateTotal();
			}

			validate(this, addedID, document.getElementsByClassName("error")); //Also validate typed quantity
			baselineGrandTotal = getTotal();
		});
	}
	shoppingCart.style.display = "block";
}

/*Remove button's ID corresponds to index of cart item in array of
  all current cart items*/
function removeFromCart(removeButtonID) {
	//Gets specific cart item to remove based on remove button's ID
	var itemToRemove = document.getElementsByClassName("cart-item")[removeButtonID];

	document.getElementById("items").removeChild(itemToRemove);

	/*Adjusts other remove buttons' IDs to correspond w/ indices of
	  newly shortened array of items in cart, once some are removed*/
	var removeButtons = document.getElementsByClassName("remove");
	for (var i = removeButtonID; i < removeButtons.length; i++) {
		removeButtons[i].id = removeButtons[i].id - 1;
	}

	calculateTotal();
	baselineGrandTotal = getTotal();
}

function changeQuantity(button, price) {
	/*Makes array instead of NodeList ... NodeLists have no
	  .indexOf() method*/
	var addButtons = Array.prototype.slice.call(document.getElementsByClassName("add"));
	var subtractButtons = Array.prototype.slice.call(document.getElementsByClassName("subtract"));
	var amountInputs = document.getElementsByClassName("amount");

	/* The index of the add or subtract button in the array of all
	   such buttons is also the index of the amount input that
	   needs to be altered */
	if (button.className === "add") {
		//Button only works if value is a number
		var newValue = Number(amountInputs[addButtons.indexOf(button)].value) + 1;
		if (!isNaN(newValue)) {
			amountInputs[addButtons.indexOf(button)].value = newValue;
			var newPrice = multiplyPrice(price, newValue);

			/*The +1 is because there's a "total_column" <div> in
			  the header which is always first & never what we want*/
			document.getElementsByClassName("total_column")[addButtons.indexOf(button) + 1].getElementsByTagName("p")[0].childNodes[0].nodeValue = newPrice;
		}
	} else if (button.className === "subtract") {
		var newValue = Number(amountInputs[subtractButtons.indexOf(button)].value) - 1;

		/*Button only works if value is a number above 0.
		  Removal will occur if 0 is passed on the way down, but
		  not on the way up (w/ the add button)*/
		if (newValue === 0) {
			var removeButtonID = document.getElementsByClassName("remove")[subtractButtons.indexOf(button)].id;
			removeFromCart(removeButtonID);
		} else if (newValue > 0 && !isNaN(newValue)) {
			amountInputs[subtractButtons.indexOf(button)].value = newValue;
			var newPrice = multiplyPrice(price, newValue);
			document.getElementsByClassName("total_column")[subtractButtons.indexOf(button) + 1].getElementsByTagName("p")[0].childNodes[0].nodeValue = newPrice;
		}
	}

	calculateTotal();
}

//Parse strings like "$1,250.95" etc. into usable numbers
function parsePrice(price) {
	return Number(price.replace(/[^0-9\.]+/g, ""));
}

function multiplyPrice(price, factor) {
	var priceNum = parsePrice(price);
	var newPrice = (priceNum * factor).toFixed(2);

	return "$" + newPrice;
}

function getTotal() {
	return parsePrice((document.getElementById("tothead").childNodes[0].nodeValue).slice(7));
}

function calculateTotal() {
	var totcols = document.getElementsByClassName("total_column");
	var subtotals = [];

	for (var i = 1; i < totcols.length; i++) {
		var subtotal = totcols[i].getElementsByTagName("p")[0].childNodes[0].nodeValue;
		subtotals.push(parsePrice(subtotal));
	}

	//NOTE: .reduce() method doesn't exist in IE8
	var grandTotal = subtotals.reduce(function(a, b) {
		return a + b;
	}, 0); //Need 0 or else empty cart will fail to change total

	if (promoFlag3) {
		document.getElementById("tothead").childNodes[0].nodeValue = "Total: $" + (grandTotal - (grandTotal * 0.05)).toFixed(2);
	} else {
		document.getElementById("tothead").childNodes[0].nodeValue = "Total: $" + grandTotal.toFixed(2);
	}
}

function collectCartItems(availableProducts) {
	var cartObjects = [];
	var cartItemNodes = document.getElementsByClassName("cart-item");
	
	for (var i = 0; i < cartItemNodes.length; i++) {
		var itemTitle = cartItemNodes[i].childNodes[0].childNodes[1].childNodes[0].nodeValue;
		for (var j = 0; j < availableProducts.length; j++) {
			if (availableProducts[j].title === itemTitle) {
				var price = parsePrice(availableProducts[j].origPrice);
			}
		}
		var quantity = Number(cartItemNodes[i].getElementsByClassName("quantity_column")[0].getElementsByTagName("input")[0].value);
		
		var cartObject = {};
		
		cartObject.title = itemTitle;
		cartObject.origPrice = price;
		cartObject.quantity = quantity;
		cartObject.subtotal = Number((price * quantity).toFixed(2));
		
		cartObjects.push(cartObject);
	}
	
	return cartObjects;
}

function applyPromo() {
	var products = collectProducts();
	var promoValue = document.getElementsByName("promo")[0].value;
	var currentTotal = getTotal(); //This total IS affected by any applied discounts
	var discountedTotal;
	var itemFound = false;
	
	if (promoValue === "Code1" && !promoFlag1) {
		var discount = 0;
		var noPromosTotal = 0;
		var cartItems = collectCartItems(products);
		var itemIndex;
		
		for (var i = 0; i < cartItems.length; i++) {
			noPromosTotal += cartItems[i].subtotal;
			if (cartItems[i].title === "Sweat Till Ya Fret") {
				discount += Number((cartItems[i].subtotal * 0.10).toFixed(2));
				itemFound = true;
				itemIndex = i;
			}
		}
		
		/* Calculate discounted total from original "baseline" total, which
		  only changes when what's in the cart is altered, NOT when any
		  discounts are applied */
		discountedTotal = Number((noPromosTotal - discount).toFixed(2));
		
		if (itemFound && discountedTotal <= currentTotal) {
			unapplyPromos();
			var itemPrice = parsePrice(document.getElementsByClassName("price_column")[itemIndex + 1].childNodes[0].childNodes[0].nodeValue);
			var promoPrice = (itemPrice - (itemPrice * 0.10)).toFixed(2);
			document.getElementsByClassName("price_column")[itemIndex + 1].childNodes[0].childNodes[0].nodeValue = "$" + promoPrice;
			
			var promoSubtotal = parsePrice(document.getElementsByClassName("price_column")[itemIndex + 1].childNodes[0].childNodes[0].nodeValue) * document.getElementsByClassName("quantity_column")[itemIndex + 1].getElementsByTagName("input")[0].value;
			document.getElementsByClassName("total_column")[itemIndex + 1].childNodes[0].childNodes[0].nodeValue = "$" + promoSubtotal;
			document.getElementById("discount").childNodes[0].nodeValue = "Code applied: Code1";
			calculateTotal();
			itemFound = false;
			promoFlag1 = true;
		}
	} else if (promoValue === "Code2" && !promoFlag2) {
		var discount = 0;
		var cartItems = collectCartItems(products);
		var indices = [];
		var noPromosTotal = 0;
		
		//Get positions in cart of any items on sale & find discount
		for (var i = 0; i < cartItems.length; i++) {
			noPromosTotal += cartItems[i].subtotal;
			if (onsale.indexOf(cartItems[i].title) > -1) {
				indices.push(i);
				discount += Number((cartItems[i].subtotal * 0.15).toFixed(2));
			}
		}
		
		discountedTotal = Number((noPromosTotal - discount).toFixed(2));
		
		if (indices.length > 0 && discountedTotal <= currentTotal) {
			unapplyPromos();
			for (var i = 0; i < indices.length; i++) {
				var itemPrice = parsePrice(document.getElementsByClassName("price_column")[indices[i] + 1].childNodes[0].childNodes[0].nodeValue);
				var promoPrice = (itemPrice - (itemPrice * 0.15)).toFixed(2);
				document.getElementsByClassName("price_column")[indices[i] + 1].childNodes[0].childNodes[0].nodeValue = "$" + promoPrice;
				
				var promoSubtotal = parsePrice(document.getElementsByClassName("price_column")[indices[i] + 1].childNodes[0].childNodes[0].nodeValue) * document.getElementsByClassName("quantity_column")[indices[i] + 1].getElementsByTagName("input")[0].value;
				document.getElementsByClassName("total_column")[indices[i] + 1].childNodes[0].childNodes[0].nodeValue = "$" + promoSubtotal;
			}
			
			document.getElementById("discount").childNodes[0].nodeValue = "Code applied: Code2";
			calculateTotal();
			promoFlag2 = true;
		}
	} else if (promoValue === "Code3" && !promoFlag3) {
		var noPromosTotal = 0;
		var cartItems = collectCartItems(products);
		
		for (var i = 0; i < cartItems.length; i++) {
			noPromosTotal += cartItems[i].subtotal;
		}
		
		var discount = Number((noPromosTotal * 0.05).toFixed(2));
		var discountedTotal = Number((noPromosTotal - discount).toFixed(2));
		
		if (discountedTotal <= currentTotal && currentTotal != 0) {
			unapplyPromos();
			document.getElementById("tothead").childNodes[0].nodeValue = "Total: $" + discountedTotal;
			promoFlag3 = true;
			document.getElementById("discount").childNodes[0].nodeValue = "Code applied: Code3";
		}
		
	}
}

function unapplyPromos() {
	var allProducts = collectProducts();
	var titleNodes = document.getElementsByClassName("title");
	
	for (var i = 0; i < titleNodes.length; i++) {
		var itemTitle = titleNodes[i].childNodes[0].nodeValue;
		for (var j = 0; j < allProducts.length; j++) {
			if (allProducts[j].title === itemTitle) {
				var price = allProducts[j].origPrice;
				document.getElementsByClassName("price_column")[i + 1].childNodes[0].childNodes[0].nodeValue = price;
				var subtotal = parsePrice(document.getElementsByClassName("price_column")[i + 1].childNodes[0].childNodes[0].nodeValue) * document.getElementsByClassName("quantity_column")[i + 1].getElementsByTagName("input")[0].value;
				document.getElementsByClassName("total_column")[i + 1].childNodes[0].childNodes[0].nodeValue = "$" + subtotal;
			}
		}
	}
	
	promoFlag1 = false, promoFlag2 = false, promoFlag3 = false;
	document.getElementById("discount").childNodes[0].nodeValue = " ";
	calculateTotal();
}

//Validate inputs
function validate(input, ID, errElement) {
	if (typeof document.createElement("input").reportValidity === "function") { //Only Chrome has this method
		if (Number(input.value) < 1 || isNaN(Number(input.value))) {
			input.setCustomValidity("Ordering 0, negative, or a non-numeric amount of weird workout tapes is impossible in this life, sorry dude.");
			input.reportValidity();
		} else {
			input.setCustomValidity("");
		}
	} else { //For non-Chrome
		if (Number(input.value) < 1 || isNaN(Number(input.value))) {
			errElement[ID].style.display = "block";
		} else {
			errElement[ID].style.display = "none";
		}
	}
}