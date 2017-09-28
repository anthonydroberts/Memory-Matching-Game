/*
Anthony Roberts
*/

//js script for game logic
var nameFlag = 0; //flags whether name was prompted for yet
var userName;
var size;
var cardsLeft;  // global to remember how many cards are still unsolved

$(document).ready(function(){
	runGame();
});

function runGame(){
	var activeCard = 0; //holder for active card object,set to 0 whenever no active card exists
	var activeCardNum = 0;// holder for number of active cards (should be between 0 and 2 always)
	var guessNum = 0;//holder for the number of guesses

	$(document).ready(function(){
		if(nameFlag == 0){ //only ask for name once
			userName = prompt("What's your name?")||"User";
			nameFlag = 1;
			size = 4; // new user starts out with a size of 4
		}
		$.ajax({
			type: "GET",
			url: "/memory/intro",
			data: {username:userName, size:size},
			async: false
			});
		
		// set the number of cards to test for
		cardsLeft = size*size;//holder for the amount of cards left in the game (square of size)

		//setting the cards grid
		var body = document.getElementsByTagName("body")[0];
		var tbl = document.createElement("table");
		tbl.setAttribute("id", "board");
		var tbl_body = document.createElement("tbody");
		for(var i = 0; i < size; i++){
			var tr = document.createElement("tr");
			for(var j = 0; j < size; j++){
				var card = document.createElement("div");
				card.className = "div_class_card";
				card.addEventListener("click",function() {cardFlip(event,userName)});
				jQuery.data(card, "row", i);
				jQuery.data(card, "column", j);
				jQuery.data(card, "flipped", 0); //tracks whether the card is face up (1) or face down(0)
				jQuery.data(card, "value", -1);//tracks the value on the card
				//var td = document.createElement("td");
				//card.appendChild(td); // insert the cell into the div element
				tr.appendChild(card); // add div to row
			}	
			tbl_body.appendChild(tr);
		}
		tbl.appendChild(tbl_body);
		body.appendChild(tbl);
		
		
	});

	function cardFlip(event,userName) {
		var targetDiv = event.target;
		// if clicked on a SPAN then adjust target element
		if(targetDiv.tagName == "SPAN"){
			targetDiv = event.target.parentElement;
		}

		if(jQuery.data(targetDiv).flipped == 1){//if the card was faced up when clicked
			return;//do nothing
		}
		
		else if(jQuery.data(targetDiv).flipped == 0 && activeCardNum == 0){ //card was faced down, and no other active cards
			
			targetDiv.className = "div_class_card_flipped";
			jQuery.data(targetDiv).flipped = 1;//set the card to flipped/faced up
			
			var data = $.ajax({
				type: "GET",
				url: "/memory/card",
				data: {username:userName,row: jQuery.data(targetDiv).row, col: jQuery.data(targetDiv).column},
				async: false
				});
			
			var cardSpan = document.createElement("span");
			cardSpan.innerHTML = data.responseText;
			cardSpan.className = "span_class_cardtext";
			event.target.append(cardSpan);
			jQuery.data(targetDiv).value = data.responseText;
			// set the active card to the card that was revealed
			activeCard = targetDiv;
			activeCardNum = 1;
		}
		
		//card was faced down and 1 other active card
		else if(jQuery.data(targetDiv).flipped == 0 && activeCardNum == 1){ 
			activeCardNum = 2; //there are now 2 active cards
			guessNum++; //add one to the number of guesses
			//set the card to flipped/faced up
			targetDiv.className = "div_class_card_flipped";
			jQuery.data(targetDiv).flipped = 1; 
			
			var data = $.ajax({
				type: "GET",
				url: "/memory/card",
				data: {username:userName,row: jQuery.data(targetDiv).row, col: jQuery.data(targetDiv).column},
				async: false
				});
			
			var cardSpan = document.createElement("span");
			cardSpan.innerHTML = data.responseText;
			cardSpan.className = "span_class_cardtext";
			event.target.append(cardSpan);
			jQuery.data(targetDiv).value = data.responseText;
			
			//done getting second card data
			
			if(data.responseText == jQuery.data(activeCard).value){//if the two cards have the same value, match them
				activeCardNum = 0;//set number of active cards back to 0
				activeCard = 0;// set active card back to 0
				cardsLeft = cardsLeft - 2;
				if(cardsLeft == 0){//if there are no more cards after this match
					alert("You took: " + guessNum + " guesses!");
					// clear the table element and all the cells
					var tbl = document.getElementById("board");
					tbl.parentElement.removeChild(tbl);
					// increase board size before running the next game
					if (size <= 8) size += 2;
					// start a new game
					runGame();
				}
			}
			else { //the card's values do not match
				setTimeout(function(){
					activeCard.className = "div_class_card";
					targetDiv.className = "div_class_card";
					jQuery.data(targetDiv).flipped = 0;
					jQuery.data(activeCard).flipped = 0;
					activeCard.innerHTML = "";
					targetDiv.innerHTML = "";
					//set the cards back to face down
					activeCardNum = 0; //set number of active cards back to 0
					activeCard = 0;    // set active card back to 0
				},500);
			}
			
		}
		else if(jQuery.data(targetDiv).flipped == 0 && activeCardNum == 1){ // card is flipped down, but there is 2 other active cards
			return; // do nothing
		}
		else{//if none of the above
			//do nothing
		}
	}
}