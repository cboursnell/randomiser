// TODO
// get mouse click coordinates in the canvas
// relate those x and y to a card
// draw a border around the card
// allow for requiring and banning cards
// add generate button
// pick 10 cards from all the ones while adhering to rules

// display the card images for dominion on startup
// when a new expansion is selected or deselected
// update the card list from the json file and display all cards from the selected sets
// only have one button called 'generate kingdom' and it will pull from all the available cards

// when 10 cards are showing for a kingdom then show the 'replace selected' button
// selecting cards in the kingdom screen gives them a yellow border

// globals
var sets = new Array();
var all_cards = new Array();
var owned_cards = new Array();
var owned_events = new Array();
var kingdom_cards = new Array();
var kingdom_events = new Array();
var kingdom_bane = null;
var extras = new Object();
var mode = "Cards";
var bottom = -1000;
var difference = 0;
var repeater = null;
var ctrlKey = false;

function load() {
  $$("redraw").hide();
  $$("store").hide();
  loadingScreen();
  // console.log("Calling load() method");
	getSets();
	loadCards();
  loadStorage();
  addInputEvents();
  drawXTimes(10);
}

function loadingScreen() {

  var canvas = document.getElementById('cardCanvas');
  var context = canvas.getContext('2d');
  context.font = "28px Arial";
  context.fillStyle = 'black';
  context.fillText("Loading cards...", 30, 50);
}

document.addEventListener("DOMContentLoaded", load);

function getSets() {
  sets = [];
  if ($$("check01").getValue()===1) {
    sets.push("dominion2ndEdition")
  }
  if ($$("check02").getValue()===1) {
    sets.push("intrigue2ndEdition")
  }
  if ($$("check03").getValue()===1) {
    sets.push("seaside")
  }
  if ($$("check04").getValue()===1) {
    sets.push("alchemy")
  }
  if ($$("check05").getValue()===1) {
    sets.push("prosperity")
  }
  if ($$("check06").getValue()===1) {
    sets.push("hinterlands")
  }
  if ($$("check07").getValue()===1) {
    sets.push("cornucopia")
  }
  if ($$("check08").getValue()===1) {
    sets.push("dark ages")
  }
  if ($$("check09").getValue()===1) {
    sets.push("guilds")
  }
  if ($$("check10").getValue()===1) {
    sets.push("adventures")
  }
  if ($$("check11").getValue()===1) {
    sets.push("empires")
  }
  sets.push("promo");
  var msg = "Owned sets: "
  for(var i = 0 ;  i < sets.length; i++) {
    msg = msg + sets[i] +" "
  }
  console.log(msg);
}

function loadCards() {
  var req = new XMLHttpRequest;
  req.overrideMimeType("application/json");
  url = "https://raw.githubusercontent.com/cboursnell/randomiser/master/cards_db.json"
  req.open('GET', url, true);
  var target = this;
  req.onload  = function() { parseJSON(req, url) }; // target.parseJSON(req, url) }
  req.send(null);
  console.log("Cards loaded");
}

function parseJSON(req, url) {
  all_cards = []
  if (req.status == 200) {
    var text = req.responseText
    var jsonResponse = JSON.parse(req.responseText);
    for(var i = 0 ; i < jsonResponse.length ; i++) {
      var obj = jsonResponse[i];
      var card = new Object();
      if (obj.hasOwnProperty("card_tag")) {
        card['name'] = obj["card_tag"];
        // console.log("Card name is "+card.name);
      } else {
        console.log("Couldn't get name info for "+obj);
      }
      if (obj.hasOwnProperty("cost")) {
        card['cost'] = obj["cost"];
      }
      if (obj.hasOwnProperty("debtcost")) {
        card['debtcost'] = obj["debtcost"];
      }
      if (obj.hasOwnProperty("cardset_tags")) {
        card['sets'] = obj["cardset_tags"];
      }
      if (obj.hasOwnProperty("types")) {
        card['types'] = obj["types"];
      }
      if (obj.hasOwnProperty("group_tag")) {
        card['group'] = obj["group_tag"];
      }
      if (obj.hasOwnProperty("group_top")) {
        card['group_top'] = obj["group_top"];
      }
      if (obj.hasOwnProperty("url")) {
        card['url'] = obj["url"];
      }
      card['toggle'] = 0;
      // console.log(card.name+" "+card.cost+" "+card.sets+" "+card.types);
      if (card.url === undefined || card.url === null) {
        console.log("Not adding "+card.name+" because it's undefined or null")
      } else {
        all_cards.push(card);
      }
    }
  } else {
    confirm("There was a problem getting the JSON");
  }
  // confirm("Info for "+all_cards.length+" cards was loaded");
  // console.log(all_cards);
  getOwnedCards();
  // console.log("All cards:" + all_cards.length +" owned_cards:"+owned_cards.length);
  // console.log("<parseJSON> drawing images for the first time");
  drawImagesFirst();
}

function getOwnedCards() {
  var card_count = 0;
  owned_cards = [];
  owned_events = [];
  // console.log(all_cards);
  text_filter = $$("search").getValue();
  for(var i = 0 ; i < all_cards.length; i++) {
    var card = all_cards[i];
    card_count++;
      // only select cards that are in expansions that are ticked
      // remove ruins, shelters, spoils, travellers, prizes
    var supply = false;
    for(var j = 0 ; j < card.sets.length ; j++) {
      var set = card.sets[j];
      for(var k=0; k < sets.length; k++) {
        var owned_set = sets[k];
        // console.log(owned_set+" "+set);
        if (owned_set === set && owned_set != "promo") {
          supply = true
          // console.log(card.name+" "+card.cost+" "+card.sets+" "+card.types);
        }
      }
    }
    if ($$("checkBlackmarket").getValue()===1 && card.name === "Black Market") {
      supply = true;
    }
    if ($$("checkEnvoy").getValue()===1 && card.name === "Envoy") {
      supply = true;
    }
    if ($$("checkSauna").getValue()===1 && card.name === "Sauna") {
      supply = true;
    }
    if ($$("checkWalledvillage").getValue()===1 && card.name === "Walled Village") {
      supply = true;
    }
    if ($$("checkGovernor").getValue()===1 && card.name === "Governor") {
      supply = true;
    }
    if ($$("checkStash").getValue()===1 && card.name === "Stash") {
      supply = true;
    }
    if ($$("checkPrince").getValue()===1 && card.name === "Prince") {
      supply = true;
    }
    if ($$("checkSummon").getValue()===1 && card.name === "Summon") {
      supply = true;
    }
    if (card.sets.includes("base")) {
      supply = false;
    }
    for(var j=0; j < card.types.length; j++) {
      var type = card.types[j];
      if (type === "Ruins" || type === "Shelter" || type === "Prize") {
        supply = false;
      }
    }
    if (card.hasOwnProperty("group") && card.group.indexOf("-") >= 0) { // is a traveler or hermit/madman
      if (card.hasOwnProperty("group_top")) { // is the first traveler

      } else {
        supply = false;
      }
    }
    if (card.name === "Spoils") {
      supply = false;
    }
    if (text_filter.length > 0) {
      // console.log("text filter is "+text_filter);
      var type_search = false;
      for(var t=0;t<card.types.length;t++) { //mark
        if (card.types[t].toUpperCase().match(text_filter.toUpperCase())) {
          type_search = true;
        }
      }
      if (card.name.toUpperCase().match(text_filter.toUpperCase()) || type_search === true || card.cost.match(text_filter)) {
        // console.log(card.name + " matches "+text_filter);
      } else {
        supply = false;
      }
    }
    if (supply===true) {
      // console.log("  This card goes into thate owned set: "+card.name);
      // console.log(card);
      if (card.hasOwnProperty("image")) {
        // that's good
      } else {

      }
      if (card.types.includes("Event") || card.types.includes("Landmark")) {
        owned_events.push(card);
        // console.log(card.name+" "+card.cost+" "+card.sets+" "+card.types+" "+card.group);
      } else {
        // console.log(card.name+" "+card.cost+" "+card.sets+" "+card.types+" "+card.group);
        owned_cards.push(card);
      }
    }
  } // for loop over all_cards
  var owned_count = 0;
  for(var i = 0; i < owned_cards.length; i++) {
    owned_count++;
  }
  console.log("There are " + owned_count + " cards that you own, out of " + card_count);
  console.log("There are " + owned_events.length + " owned events");
  owned_cards.sort(cardCompareCost);
  owned_events.sort(cardCompareCost);
  if (owned_count===0) {
    $$("generate").disable();
  } else {
    $$("generate").enable();
  }
  if (owned_events.length===0) {
    $$("eventcounter").hide();
  } else {
    // $$("eventcounter").setValue(1);
    $$("eventcounter").show();
  }
}

function addInputEvents() {
  var canvas = document.getElementById("cardCanvas");
  var ctx = canvas.getContext("2d");
  canvas.addEventListener("mousewheel", _.throttle(MouseWheelHandler, 16));
  canvas.addEventListener("mousedown", MouseDownHandler, false);
  canvas.addEventListener("touchmove", TouchMoveHandler, false);
  canvas.addEventListener("touchend", TouchEndHandler, false);

  $$("check01").attachEvent("onChange", ChangeHandler);
  // $$("check01").attachEvent("onItemClick", CheckBoxClickHandler);
  // $$("check01").attachEvent("onKeyPress", CtrlKeyHandler);
  $$("check02").attachEvent("onChange", ChangeHandler);
  $$("check03").attachEvent("onChange", ChangeHandler);
  $$("check04").attachEvent("onChange", ChangeHandler);
  $$("check05").attachEvent("onChange", ChangeHandler);
  $$("check06").attachEvent("onChange", ChangeHandler);
  $$("check07").attachEvent("onChange", ChangeHandler);
  $$("check08").attachEvent("onChange", ChangeHandler);
  $$("check09").attachEvent("onChange", ChangeHandler);
  $$("check10").attachEvent("onChange", ChangeHandler);
  $$("check11").attachEvent("onChange", ChangeHandler);

  $$("checkBlackmarket").attachEvent("onChange", ChangeHandler);
  $$("checkEnvoy").attachEvent("onChange", ChangeHandler);
  $$("checkSauna").attachEvent("onChange", ChangeHandler);
  $$("checkWalledvillage").attachEvent("onChange", ChangeHandler);
  $$("checkGovernor").attachEvent("onChange", ChangeHandler);
  $$("checkStash").attachEvent("onChange", ChangeHandler);
  $$("checkPrince").attachEvent("onChange", ChangeHandler);
  $$("checkSummon").attachEvent("onChange", ChangeHandler);

  $$("eventcounter").attachEvent("onChange", EventCounterChangeHandler);

  // $$("search").attachEvent("onChange", TextChangeHandler);
  $$("search").attachEvent("onTimedKeyPress", TextChangeHandler);

  window.addEventListener("resize", ResizeHandler);
  window.addEventListener("keydown", CtrlKeyDownHandler);
  window.addEventListener("keyup", CtrlKeyUpHandler);


}

var canvasScroll=0;
var scale=1.0;

function drawImages() {
  // console.log("Calling drawImages()");
  scale = ((window.innerWidth-232)/5)/200;
  if (scale > 1.0) {
    scale = 1.0;
  }
  if (scale < 0.5) {
    scale = 0.5;
  }
  var pos = {}
  pos['x']=0
  pos['y']=0
  pos['width']=200*scale;
  pos['height']=320*scale;
  pos['update'] = function(canvas) {
    this.x += this.width;
    if (this.x > window.innerWidth-this.width-230 ) { // start new row || this.x > this.width*4
      this.x = 0;
      this.y += this.height;
    }
    if (this.y+this.height > canvas.height) {
      canvas.height += this.height;
      console.log("Height of canvas increased to "+canvas.height);
    }
    if (canvas.height < window.innerHeight) {
      canvas.height = window.innerHeight;
      console.log("Height of canvas set to window height: " + window.innerHeight);
    }
    if (this.x+this.width > canvas.width) {
      canvas.width += this.width;
      console.log("Width of canvas increased to "+canvas.width);
    }
  }
  var canvas = document.getElementById('cardCanvas');
  var context = canvas.getContext('2d');
  // console.log("window width: "+window.innerWidth);

  context.save();
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.restore();
  if (mode === "Cards") {
    if (owned_cards.length+owned_events.length===0) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.font = "28px Arial";
      context.fillStyle = 'black';
      blankPage(context);
    }
    for(var i = 0; i < owned_cards.length; i++) {
      if (pos.y+pos.height+canvasScroll > 0 && pos.y+canvasScroll < window.innerHeight) {
        context.drawImage(owned_cards[i].image, pos.x, pos.y, pos.width, pos.height);
      }

      owned_cards[i]['drawX']=pos.x
      owned_cards[i]['drawY']=pos.y
      toggle = owned_cards[i].toggle;
      if (toggle===1) {
        // draw a green box - require
        context.beginPath();
        context.lineWidth="4";
        context.strokeStyle="green";
        context.rect(pos.x+2,pos.y+2,pos.width-4,pos.height-4);
        context.stroke();
      } else if (toggle===2) {
        // draw a red box - ban
        context.beginPath();
        context.lineWidth="4";
        context.strokeStyle="red";
        context.rect(pos.x+2,pos.y+2,pos.width-4,pos.height-4);
        context.stroke();
      }

      pos.update(canvas);
    } // end owned cards

    if (owned_cards.length > 0 && pos.x > 0) {
      pos.y += pos.height;
    }
    pos.width = 320*scale;
    pos.height = 200*scale;
    pos.x = 0;
    for(var i = 0; i < owned_events.length; i++) {
      if (pos.y+pos.height+canvasScroll > 0 && pos.y+canvasScroll < window.innerHeight) {
        context.drawImage(owned_events[i].image, pos.x, pos.y, pos.width, pos.height);
      }
      owned_events[i]['drawX']=pos.x
      owned_events[i]['drawY']=pos.y
      toggle = owned_events[i].toggle;
      if (toggle===1) {
        // draw a green box - require
        context.beginPath();
        context.lineWidth="4";
        context.strokeStyle="green";
        context.rect(pos.x+2,pos.y+2,pos.width-4,pos.height-4);
        context.stroke();
      } else if (toggle===2) {
        // draw a red box - ban
        context.beginPath();
        context.lineWidth="4";
        context.strokeStyle="red";
        context.rect(pos.x+2,pos.y+2,pos.width-4,pos.height-4);
        context.stroke();
      }
      pos.update(canvas);
    }
    bottom = -pos.y + window.innerHeight - 360;
    if (bottom > 0) {
      bottom = 0;
    }
    if (pos.y < -canvasScroll) {
      // console.log("Y is less than -canvasScroll. Scrolling up");
      canvasScroll = 0;
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.translate(0, canvasScroll);
    }
    // console.log("drawImages setting bottom to "+bottom);
  } else { // mode === "Kingdom"
    kingdom_cards.sort(cardCompareCost);
    for(var i = 0; i < kingdom_cards.length; i++) {
      context.drawImage(kingdom_cards[i].image, pos.x, pos.y, pos.width, pos.height);

      kingdom_cards[i]['drawX']=pos.x
      kingdom_cards[i]['drawY']=pos.y
      if (kingdom_cards[i].hasOwnProperty("selected")) {
        var selected = kingdom_cards[i].selected;
      } else {
        var selected = false;
      }
      if (selected===true) {
        // draw a yellow box - require
        context.beginPath();
        context.lineWidth="4";
        context.strokeStyle="yellow";
        context.rect(pos.x+2,pos.y+2,pos.width-4,pos.height-4);
        context.stroke();
      }

      pos.update(canvas);
    }

    if (pos.x>0) {
      pos.y += pos.height; // for if the last row wasn't finished
    }
    pos.width = 320*scale;
    pos.height = 200*scale;
    pos.x = 0;
    for(var i = 0; i < kingdom_events.length; i++) {
      context.drawImage(kingdom_events[i].image, pos.x, pos.y, pos.width, pos.height);
      kingdom_events[i]['drawX']=pos.x
      kingdom_events[i]['drawY']=pos.y
      if (kingdom_events[i].hasOwnProperty("selected")) {
        var selected = kingdom_events[i].selected;
      } else {
        var selected = false;
      }
      if (selected===true) {
        // draw a yellow box - require
        context.beginPath();
        context.lineWidth="4";
        context.strokeStyle="yellow";
        context.rect(pos.x+2,pos.y+2,pos.width-4,pos.height-4);
        context.stroke();
      }
      pos.update(canvas);
    }
    if (kingdom_events.length > 0 && pos.x > 0) {
      pos.y += pos.height;
    }
    // draw horizontal line
    pos.y+=20;
    context.beginPath();
    context.moveTo(20,pos.y);
    // context.lineTo(canvas.width-20,pos.y);
    // console.log("width = "+pos.width*5);
    context.lineTo(pos.height*5-20, pos.y);
    context.lineWidth="2";
    context.strokeStyle="black";
    context.stroke();
    pos.y+=20;
    pos.x=0;
    pos.width = 200*scale;
    pos.height = 320*scale;
    // RECOMMENDED CARDS
    if (kingdom_bane!==null) {
      var tx=pos.x;
      var ty=pos.y;
      drawExtra(pos, kingdom_bane.name);
      context.fillStyle="#000000";
      context.fillRect(tx+75, ty+150-14, 50, 18);
      context.font = "15px serif";
      context.fillStyle = 'white';
      context.fillText("BANE", tx+75, ty+150);
    }
    drawExtra(pos, "Copper");
    drawExtra(pos, "Silver");
    drawExtra(pos, "Gold");
    drawExtra(pos, "Estate");
    drawExtra(pos, "Duchy");
    drawExtra(pos, "Province");
    drawExtra(pos, "Curse");
    if (extras.hasOwnProperty("spoils") && extras.spoils===true) {
      drawExtra(pos,"Spoils");
    }
    if (extras.hasOwnProperty("platinum") && extras.platinum===true) {
      drawExtra(pos, "Platinum");
    }
    if (extras.hasOwnProperty("colonies") && extras.colonies===true) {
      drawExtra(pos, "Colony");
    }
    if (extras.hasOwnProperty("potions") && extras.potions===true) {
      drawExtra(pos, "Potion");
    }
    if (extras.hasOwnProperty("shelters") && extras.shelters===true) {
      drawExtra(pos, "Hovel");
      drawExtra(pos, "Necropolis");
      drawExtra(pos, "Overgrown Estate");
    } // end shelters

    if (extras.hasOwnProperty("ruins") && extras.ruins===true) {
      drawExtra(pos, "Abandoned Mine");
      drawExtra(pos, "Ruined Library");
      drawExtra(pos, "Ruined Village");
      drawExtra(pos, "Ruined Market");
      drawExtra(pos, "Survivors");
    } //ruins

    if (extras.hasOwnProperty("prizes") && extras.prizes === true) {
      drawExtra(pos, "Bag of Gold")
      drawExtra(pos, "Diadem");
      drawExtra(pos, "Followers");
      drawExtra(pos, "Princess");
      drawExtra(pos, "Trusty Steed");
    }

    if (extras.hasOwnProperty("page") && extras.page === true) {
      drawExtra(pos, "Treasure Hunter")
      drawExtra(pos, "Warrior");
      drawExtra(pos, "Hero");
      drawExtra(pos, "Champion");
    }

    if (extras.hasOwnProperty("peasant") && extras.peasant === true) {
      drawExtra(pos, "Soldier");
      drawExtra(pos, "Fugitive");
      drawExtra(pos, "Disciple")
      drawExtra(pos, "Teacher");
    }

    bottom = -pos.y + window.innerHeight - 360;
    if (bottom > 0) {
      bottom = 0;
    }
    // console.log("drawImages setting bottom to "+bottom);

  }
}

function blankPage(context) {
  context.font = "28px Arial";
  context.fillStyle = 'black';
  // context.font("PT Sans");
  context.fillText("Dominion Randomiser", 30, 50);
  context.font = "16px Arial";
  context.fillStyle = 'black';
  // view all cards from expansions
  context.fillText("Select expansions to display cards", 30, 100);
  // mark cards as required (green) or banned (red)
  context.fillText("Click on cards to mark them as required (green) or banned (red)", 30, 130);
  // generate a kingdom
  context.fillText("Generate a kingdom of 10 cards and show other supply piles needed", 30, 400);
  // select cards to replace them individually,
  context.fillText("Select cards (yellow) and replace them individually", 30, 420);
  // history
  context.fillText("Remember what cards were used.", 30, 455);
  context.fillText("Less likely to choose the same cards again next time", 30, 475);
  // search for cards by name
  context.fillText("Search for cards by name, cost or type (Attack, Duration etc)", 30, 510);
}

function drawExtra(pos, name) {
  var canvas = document.getElementById('cardCanvas');
  var context = canvas.getContext('2d');
  var card = getCard(name);
  if (card === null || card === undefined) {
    console.log("Can't find card " + name + " in all_cards");
  } else {
    context.drawImage(getCard(name).image, pos.x, pos.y, pos.width, pos.height);
  }
  pos.update(canvas);
  // pos.x += pos.width;
  // if (pos.x > canvas.width-50) {
  //   pos.x = 0;
  //   pos.y += pos.height;
  //   if (pos.y > canvas.height) {
  //     canvas.height += pos.height;
  //   }
  // }

}

function getCard(name) {
  for(var x = 0; x < all_cards.length; x++) {
    if (all_cards[x].name === name) {
      return all_cards[x];
    }
  }
  return null;
}

function chooseBaneCard() {
  // choose a card that costs either 2 or 3
  // is in owned_cards
  // isn't in kingdom_cards
  possible_bane = []
  for(var i = 0; i < owned_cards.length; i++) {
    var sCost = owned_cards[i].cost;
    var iCost = parseInt(sCost);
    if (iCost !== NaN) {
      if (iCost >= 2 && iCost <= 3) {
        if (!containsCard(kingdom_cards, owned_cards[i])) {
          possible_bane.push(owned_cards[i]);
        }
      }
    } else {
      console.log("Cost couldn't be parsed: "+sCost);
    }

  }
  // console.log("There are "+possible_bane.length+" possible bane cards");
  if (possible_bane.length===0) {
    console.log("Can't find a bane card. Suggest removing Young Witch, or a 2-3 cost card from the kingdom");
    return null;
  } else {
    var rand_i = Math.floor(Math.random()*possible_bane.length);
    return possible_bane[rand_i];
  }

}

// function loadImages() {
function loadImages(callback) {
  // var images = [];
  var loadedImages = 0;
  var numImages = 0;
  // get num of sources
  numImages = all_cards.length;
  for(var i = 0 ; i < all_cards.length; i++) {
    // console.log("Loading "+all_cards[i].name +" from "+all_cards[i].url);
    all_cards[i]['image'] = new Image();
    // images[i]['name'] = all_cards[i].name;
    all_cards[i]['image'].onload = function() {
      // console.log("loaded:"+loadedImages+"/"+numImages+" i:"+i+" card:"+all_cards[i].name);
      if(++loadedImages >= numImages) {
        // console.log("calling back to function");
        callback(); // calling code in drawimagesfirst function
      }
      // TODO draw progress bar of cards loading
    };
    all_cards[i]['image'].src = all_cards[i].url;
  }
} // end

function drawImagesFirst() {
  // console.log("Drawing images for the first time <266>");
  // console.log("Owned cards: "+ owned_cards.length);
  // var x = 0;
  // var y = 0;
  // var width = 200*scale;
  // var height = 320;
  var canvas = document.getElementById('cardCanvas');
  var context = canvas.getContext('2d');

  // loadImages();

  loadImages(function() {
    // context.save();
    // context.setTransform(1, 0, 0, 1, 0, 0);
    // context.clearRect(0, 0, canvas.width, canvas.height);
    // console.log("drawing white rectangle for the first time");
    // context.restore();
    // if (owned_cards.length===0) {
    //   context.clearRect(0, 0, canvas.width, canvas.height);
    //   context.font = "28px Arial";
    //   context.fillStyle = 'black';
    //   // context.font("PT Sans");
    //   context.fillText("Select Expansions", 30, 50);
    // }
    // for(var i = 0; i < owned_cards.length; i++) {
    //   context.drawImage(owned_cards[i].image, x, y, width, height);
    //   // there are the same number of images as owned cards and they are in the same order

    //   // console.log("setting "+owned_cards[i].name+" to "+x+" "+y);
    //   x += width;
    //   if (x > 850) {
    //     x = 0;
    //     y += height;
    //   }
    // }
  });

}

function MouseWheelHandler(e) {
  var canvas = document.getElementById("cardCanvas");
  var context = canvas.getContext("2d");
  canvasScroll += e.wheelDelta;
  if (canvasScroll > 0) {
    canvasScroll = 0;
  }
  if (canvasScroll < bottom) {
    canvasScroll = bottom;
    //console.log("setting canvasScroll to bottom: "+bottom);
  }
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.translate(0, canvasScroll);

  // console.log("canvasScroll " + canvasScroll);
  drawImages();
}

var prevY=null;
function TouchMoveHandler(e) {
  // clearInterval(repeater);
  var canvas = document.getElementById("cardCanvas");
  var context = canvas.getContext("2d");
  var touches = e.changedTouches;
  // console.log("There are "+ touches.length +" touches");
  var y = touches[0].pageY;
  //console.log("X: " + touches[0].pageX +" Y:"+ touches[0].pageY);
  if (prevY===null) {
    //console.log("prevY is null. setting prevY to "+touches[0].pageY);
    prevY=touches[0].pageY;
  } else {
    difference = y-prevY;
    //console.log("Difference: "+(difference));
    canvasScroll += difference;
    // context.translate(0, difference);

    // console.log("difference: "+difference+" canvasScroll: "+canvasScroll+" window.innerHeight:"+window.innerHeight);
    if (canvasScroll > 0) {
      // context.translate(0,-canvasScroll);
      canvasScroll = 0;
    }
    // var bottom = -canvas.height+window.innerHeight-(320*scale);
    // var bottom = -window.innerHeight+(320*scale);
    // console.log("bottom is "+bottom);
    if (canvasScroll < bottom) {
      // context.translate(0,-canvasScroll+bottom);
      canvasScroll = bottom;
      //console.log("setting canvasScroll to bottom: "+bottom);
    }

    context.setTransform(1, 0, 0, 1, 0, 0);
    context.translate(0, canvasScroll);
    // console.log("setting context translate to "+canvasScroll);

    // console.log("canvasScroll " + canvasScroll);
    drawImages();
    prevY=y;
  }
}

function TouchEndHandler(e) {
  // var y = e.changedTouches[0].pageY;
  // var difference = y-prevY;
  // console.log("starting momentum with "+difference);
  // momentum(difference);
  prevY=null;
  //console.log("setting prev Y position to null");
}

function MouseDownHandler(e) {
  var canvas = document.getElementById("cardCanvas");
  var ctx = canvas.getContext("2d");

  var offX = e.pageX - canvas.offsetLeft;
  var offY = e.pageY - canvas.offsetTop - canvasScroll;
  //console.log("Mouse down at "+offX+" "+offY);
  if (mode === "Cards") {
    for(var i = 0; i < owned_cards.length; i++) {
      var x = owned_cards[i].drawX;
      var y = owned_cards[i].drawY;
      // console.log(owned_cards[i].name + "  X:"+x+" Y:"+y);
      if (offX > x && offX < x+(200*scale) && offY > y && offY < y+(320*scale)) {
        //console.log("Click on "+owned_cards[i].name + " toggle:"+owned_cards[i].toggle);
        owned_cards[i].toggle++;
        owned_cards[i].toggle = owned_cards[i].toggle%3;
        //console.log("Toggle set to " + owned_cards[i].toggle);
      }
    }
    for(var i = 0 ; i < owned_events.length; i++) {
      var x = owned_events[i].drawX;
      var y = owned_events[i].drawY;
      // console.log(owned_events[i].name + "  X:"+x+" Y:"+y);
      if (offX > x && offX < x+(320*scale) && offY > y && offY < y+(200*scale)) {
        //console.log("Click on "+owned_events[i].name + " toggle:"+owned_events[i].toggle);
        owned_events[i].toggle++;
        owned_events[i].toggle = owned_events[i].toggle%3;
        //console.log("Toggle set to " + owned_events[i].toggle);
      }

    }
  } else if (mode === "Kingdom") {

    for(var i = 0; i < kingdom_cards.length ; i++) {
      var x = kingdom_cards[i].drawX;
      var y = kingdom_cards[i].drawY;
      // console.log(kingdom_cards[i].name + "  X:"+x+" Y:"+y);
      if (offX > x && offX < x+(200*scale) && offY > y && offY < y+(320*scale)) {
        // console.log("Click on "+kingdom_cards[i].name + " toggle:"+kingdom_cards[i].toggle);
        if (kingdom_cards[i].hasOwnProperty("selected")) {
          if (kingdom_cards[i].selected===true) {
            kingdom_cards[i].selected = false;
          } else {
            kingdom_cards[i].selected = true;
          }
        } else {
          kingdom_cards[i]['selected'] = true;
        }
        // kingdom_cards[i].toggle++;
        // kingdom_cards[i].toggle = kingdom_cards[i].toggle%3;
        // console.log("Toggle set to " + kingdom_cards[i].toggle);

      }

    } // for in kingdom_cards

    for(var i = 0; i < kingdom_events.length ; i++) {
      var x = kingdom_events[i].drawX;
      var y = kingdom_events[i].drawY;
      // console.log(kingdom_events[i].name + "  X:"+x+" Y:"+y);
      if (offX > x && offX < x+(320*scale) && offY > y && offY < y+(200*scale)) {
        // console.log("Click on "+kingdom_events[i].name + " toggle:"+kingdom_events[i].toggle);
        if (kingdom_events[i].hasOwnProperty("selected")) {
          if (kingdom_events[i].selected===true) {
            kingdom_events[i].selected = false;
          } else {
            kingdom_events[i].selected = true;
          }
        } else {
          kingdom_events[i]['selected'] = true;
        }
        // kingdom_events[i].toggle++;
        // kingdom_events[i].toggle = kingdom_events[i].toggle%3;
        // console.log("Toggle set to " + kingdom_events[i].toggle);
        // countSelected();
      }

    } // for in kingdom_events
    countSelected();

    // console.log("selected count: "+selected_count);
  }
  drawImages();
}

function countSelected() {
  var selected_count = 0;
  for(var i = 0; i < kingdom_cards.length ; i++) {
    if (kingdom_cards[i].selected===true){
      selected_count++;
    }
  }
  for(var i = 0; i < kingdom_events.length ; i++) {
    if (kingdom_events[i].selected===true){
      selected_count++;
    }
  }
  if (selected_count===0) {
    $$("redraw").setValue("Redraw All");
    $$("redraw").refresh();
  } else {
    $$("redraw").setValue("Redraw Selected");
    $$("redraw").refresh();
  }
  return selected_count;
}

function cardCompareCost(a,b) {
  if (a.cost < b.cost) {
    return -1;
  }
  if (a.cost > b.cost) {
    return 1;
  }
  if (a.cost === b.cost) {
    if (a.name < b.name) {
      return -1;
    }
    if (a.name > b.name) {
      return 1;
    }
  }
  return 0;
}

function cardCompareName(a, b) {
  if (a.name < b.name) {
    return -1;
  }
  if (a.name > b.name) {
    return 1;
  }
  return 0;
}

function switchMode() {
  if (mode === "Kingdom") {
    mode = "Cards";
    //console.log("Switched to Cards mode");
    $$("generate").setValue("Show Kingdom");
    $$("generate").refresh();
    $$("redraw").hide();
    $$("search").show();
    $$("store").hide();
  } else if (mode === "Cards") {
    mode = "Kingdom";
    //console.log("Switched to Kingdom mode");
    $$("generate").setValue("Show Cards");
    $$("generate").refresh();
    $$("redraw").show();
    $$("search").hide();
    $$("store").show();
    if (canvasScroll < -500) {
      var canvas = document.getElementById('cardCanvas');
      var context = canvas.getContext('2d');
      context.translate(0, -canvasScroll);
      canvasScroll = 0;
    } else {
      //console.log("when switching modes canvasScroll is " + canvasScroll);
    }
    generate();
  }
  drawXTimes(15);
}

function containsCard(listOfCards, card) {
  result = false;
  if (listOfCards.length > 0) {
    for (var i = 0 ; i < listOfCards.length; i++) {
      if (listOfCards[i].name === card.name) {
        result = true;
      }
    }
  }
  return result;
}

function containsCardName(listOfCards, cardName) {
  result = false;
  if (listOfCards.length > 0) {
    for (var i = 0 ; i < listOfCards.length; i++) {
      if (listOfCards[i].name === cardName) {
        result = true;
      }
    }
  }
  return result;
}

function recommendations() {
  // console.log("getting recommendations");
  // var extras = {}
  // shelters
  // var rand_i = Math.floor(Math.random()*kingdom_cards.length);
  // if (kingdom_cards[rand_i].sets.includes("dark ages")) {
    // extras['shelters']=true;
  // }
  if (chooseRandomX(kingdom_cards, false).sets.includes("dark ages")) {
    extras['shelters']=true;
  } else {
    extras['shelters']=false;
  }
  // ruins
  extras['ruins']=false;
  for(var i = 0; i < kingdom_cards.length; i++) {
    if (kingdom_cards[i].types.includes("Looter")) {
      extras['ruins']=true;
    }
  }
  // curses - always use curses
  // potion
  extras['potions']=false;
  for(var i = 0; i < kingdom_cards.length; i++) {
    if (kingdom_cards[i].sets.includes("alchemy")) {
      extras['potions']=true;
    }
  }
  // platinum /colonies

  var rand_i = Math.floor(Math.random()*kingdom_cards.length);
  if (kingdom_cards[rand_i].sets.includes("prosperity")) {
    extras['platinum']=true;
    extras['colonies']=true;
  } else {
    extras['platinum']=false;
    extras['colonies']=false;
  }
  // spoils // bandit camp, marauder, pillage

  extras['spoils']=false;
  for(var i = 0; i < kingdom_cards.length; i++) {
    if (kingdom_cards[i].name === "Bandit Camp" || kingdom_cards[i].name === "Marauder" || kingdom_cards[i].name === "Pillage") {
      extras['spoils']=true;
    }
  }

  // tournament
  // page
  extras['prizes']=false;
  extras['page']=false;
  for(var i = 0; i < kingdom_cards.length; i++) {
    if (kingdom_cards[i].name === "Tournament") {
      extras['prizes']=true;
    }
    if (kingdom_cards[i].name === "Page") {
      extras['page']=true;
    }
    if (kingdom_cards[i].name === "Peasant") {
      extras['peasant']=true;
    }
  }

  // young witch / bane
  // console.log("Choose a kingdom card from the owned cards that is not in the kingdom that costs 2-3");
  return extras;
}

function generate() {
  //console.log("Pressed generate button");
  // go through the owned cards
  // pick out ones that have toggle === 1 (ie green)
  // add them to the kingdom
  // if the kingdom size > 10 then
  //   randomly remove cards until you have 10
  // else
  //   pick cards randomly from owned_cards (ignoring any with toggle===2)
  //   and add them to the kingdom
  $$("search").setValue("");
  getOwnedCards();

  var canvas = document.getElementById('cardCanvas');
  var context = canvas.getContext('2d');
  countSelected();
  if (mode === "Kingdom") {
    // CHOOSING CARDS /////////////////////
    if (kingdom_cards.length==0) {
      // generate new kingdom
      for(var i = 0 ; i < owned_cards.length; i++) {
        if (owned_cards[i].toggle === 1) { // required
          //console.log("Adding required card "+owned_cards[i].name+" to kingdom");
          kingdom_cards.push(owned_cards[i]);
        }
      }
      // if there were too many required cards remove some
      while (kingdom_cards.length > 10) {
        var rand_i = Math.floor(Math.random()*kingdom_cards.length);
        //console.log("Removing "+kingdom_cards[rand_i].name+" from over filled kingdom");
        kingdom_cards[rand_i].selected = false;
        kingdom_cards.splice(rand_i, 1);
      }
      //
      while (kingdom_cards.length < 10) {
        // choose random card and add it to the kingdom if it's not
        // var rand_i = Math.floor(Math.random()*owned_cards.length);
        var random_card = chooseRandomX(owned_cards, true);
        if (!containsCard(kingdom_cards, random_card)) {
          if (random_card.toggle < 2) {
            kingdom_cards.push(random_card);
          }
        }
      }

      if (containsCardName(kingdom_cards, "Young Witch")) {
        kingdom_bane = chooseBaneCard();
      } else {
        kingdom_bane = null;
      }
    } // end of when there are 0 cards in the kingdom

    // CHOOSING EVENTS ///////////////////////////
    chooseKingdomEvents();
    $$("redraw").show();
    recommendations();
    drawImages();
  }
  // else {
  //   $$("redraw").hide();
  //   if (kingdom_cards.length==0) {
  //     $$("generate").setValue("Generate Kingdom");
  //     $$("generate").refresh();
  //   } else {
  //     $$("generate").setValue("Show Kingdom");
  //     $$("generate").refresh();
  //   }
  //   drawImages();
  // }

}

// TODO add chooseRandomCard method

function chooseKingdomEvents() {

    var numEvents = $$("eventcounter").getValue();
    if (owned_events.length === 0) {
      numEvents = 0;
    }
    // console.log("should have "+numEvents+" events");

    // if the number of events is less than wanted
    if (kingdom_events.length < numEvents) {
      // make a list of required events
      //console.log("there are not enough events")
      var requiredEvents = []
      for(var i = 0 ; i < owned_events.length; i++) {
        if (owned_events[i].toggle === 1) { // required
          if (!containsCard(kingdom_events, owned_events[i])) {
            //console.log("adding "+owned_events[i].name+" to the list of required events");
            requiredEvents.push(owned_events[i]);
          }
        }
      }
      if (kingdom_events.length + requiredEvents.length <= numEvents && requiredEvents.length > 0) {
        // add all the requiredEvents to the kingdom
        //console.log("there are "+kingdom_events.length+" events already and " + requiredEvents.length +" required events so adding them all");
        for(var i = 0; i < requiredEvents.length; i++) {
          kingdom_events.push(requiredEvents[i]);
        }
      } else if (requiredEvents.length > 0) {
        // add some of the requiredEvents to the kingdom
        //console.log("there are "+kingdom_events.length+" events already and " + requiredEvents.length +" required events so adding some of them");
        while (kingdom_events.length < numEvents && requiredEvents.length > 0) {
          // choose a random required event from the list and add it to the kingdom
          var rand_i = Math.floor(Math.random()*requiredEvents.length);
          //console.log("Choosing "+requiredEvents[rand_i].name+" to add to the kingdom")
          kingdom_events.push(requiredEvents[rand_i]);
          requiredEvents.splice(rand_i,1);
        }

      }

      // pick randomly from list of required events
      // are there enough required events to make up the number
      // pick randomly from other events
      count=0;
      while (kingdom_events.length < numEvents && count < 1000) {
        // console.log(kingdom_events.length +" < "+numEvents);
        // var rand_i = Math.floor(Math.random()*owned_events.length);
        var random_event = chooseRandomX(owned_events, true);
        if (!containsCard(kingdom_events, random_event)) {  // not already in kingdom
          if (random_event.toggle < 2) {                    // isn't banned
            //console.log("adding event "+random_event.name);
            kingdom_events.push(random_event);
          }
        }
        count++;
      }
    }

    // if the number of events is more than wanted
    while (kingdom_events.length > numEvents) {
      //console.log("there are too many events ("+kingdom_events.length+") and only need " + numEvents +" so removing some");
      var requiredEvents = [];
      for(var i = 0 ; i < owned_events.length; i++) {
        if (owned_events[i].toggle === 1) { // required
          //console.log("adding "+owned_events[i].name+" to the list of required events");
          requiredEvents.push(owned_events[i]);
        }
      }
      if (requiredEvents.length < kingdom_events.length && requiredEvents.length > 0) {
        //console.log("There are "+requiredEvents.length+" required events");
        // remove some events that aren't required
        var rand_i = Math.floor(Math.random()*kingdom_events.length);
        while (containsCard(requiredEvents, kingdom_events[rand_i])) {
          var rand_i = Math.floor(Math.random()*kingdom_events.length);
        }
        kingdom_events.splice(rand_i, 1);
      } else {
        var rand_i = Math.floor(Math.random()*kingdom_events.length);
        kingdom_events.splice(rand_i, 1);
      }
    }

}

function redrawSelected() {
  cardsToAdd = []
  if (countSelected()===0) {
    // REDRAW ALL CARDS AND EVENTS
    // choose new cards that aren't in that list
    // fill cardsToAdd with required cards first. this works if the number of required cards is <10 or >10
    for(var i = 0 ; i < owned_cards.length; i++) {
      if (owned_cards[i].toggle===1) { // is required
        cardsToAdd.push(owned_cards[i]);
      }
    }
    while (cardsToAdd.length > 10) {
      var rand_i = Math.floor(Math.random()*cardsToAdd.length);
      cardsToAdd.splice(rand_i, 1);
    }
    count = 0;
    while (cardsToAdd.length < 10 && count < 1000) {
      // add more cards that aren't cardsToAdd, and aren't in kingdomCards
      var card = chooseRandomX(owned_cards, true);
      if (!containsCard(cardsToAdd, card)) {
        if (!containsCard(kingdom_cards, card)) {
          if (card.toggle < 2) {
            cardsToAdd.push(card);
          }
        }
      }
      count++;
    }

    count = 0;
    while (cardsToAdd.length < 10 && count < 1000) {
      // add more cards that aren't cardsToAdd, and might be in kingdomCards if there aren't enough
      var card = chooseRandomX(owned_cards, true);
      if (!containsCard(cardsToAdd, card)) {
        if (card.toggle < 2) {
          cardsToAdd.push(card);
        }
      }
      count++;
    }

    kingdom_cards=[];
    for(var i = 0 ; i < cardsToAdd.length; i++) {
      kingdom_cards.push(cardsToAdd[i]);
    }
    // choose new events that aren't in the list
    chooseKingdomEvents();
  } else {
    // REDRAW JUST SELECTED CARDS
    var cardsToRemove = []; // list of cards, not list of card names
    var cardsToAdd = []; // list of card objects, not strings of card names
    for(var i = 0; i < kingdom_cards.length; i++) {
      if (kingdom_cards[i].selected === true) {
        cardsToRemove.push(kingdom_cards[i]);
      }
    }
    count=0;
    while (cardsToAdd.length < cardsToRemove.length && count < 1000) {
      var rand_i = Math.floor(Math.random()*owned_cards.length);
      if (!containsCard(cardsToAdd, owned_cards[rand_i])) {
        if (!containsCard(kingdom_cards, owned_cards[rand_i])) {
          if(!containsCard(cardsToRemove, owned_cards[rand_i])) {
            if (owned_cards[rand_i].toggle < 2) {
              cardsToAdd.push(owned_cards[rand_i]);
            }
          }
        }
      }
      count++;
    }
    count=0;
    while (cardsToAdd.length < cardsToRemove.length && count < 1000) {
      var rand_i = Math.floor(Math.random()*owned_cards.length);
      if (!containsCard(cardsToAdd, owned_cards[rand_i])) {
        if (!containsCard(kingdom_cards, owned_cards[rand_i])) {
          if (owned_cards[rand_i].toggle < 2) {
            cardsToAdd.push(owned_cards[rand_i]);
          }
        }
      }
      count++;
    }
    // remove cards from kingdom
    for(var i = 0; i < cardsToRemove.length; i++) {
      for(var j = 0; j < kingdom_cards.length; j++) {
        if (cardsToRemove[i].name === kingdom_cards[j].name) {
          kingdom_cards[j].selected = false;
          kingdom_cards.splice(j,1);
          j--;
        }
      }
    }
    // add new cards to kingdom
    for(var i = 0; i < cardsToAdd.length; i++) {
      kingdom_cards.push(cardsToAdd[i]);
    }
    // REMOVE SELECTED EVENTS

    var eventsToRemove = []; // list of cards, not list of card names
    for(var i = 0; i < kingdom_events.length; i++) {
      if (kingdom_events[i].selected === true) {
        // eventsToRemove.push(kingdom_events[i]);
        kingdom_events[i].selected = false;
        kingdom_events.splice(i,1);
        i--;
      }
    }
    chooseKingdomEvents();
  } // end if else
  if (containsCardName(kingdom_cards, "Young Witch")) {
    kingdom_bane = chooseBaneCard();
  } else {
    kingdom_bane = null;
  }
  countSelected();
  recommendations();
  drawXTimes(3);
}

function chooseRandomX(array, weighted) { // returns card object
  if (weighted===true && $$("history").getValue()===1) {
    var count = 0;
    var total = 0
    for(var i = 0; i < array.length; i++) {
      if (array[i].used) {
        count = array[i].used;
      } else {
        count = 0;
      }
      total += 1.0/(count+1);
    }
    var r = Math.random() * total;

    var choose = -1;
    total = 0;
    for(var i = 0; i < array.length; i++) {
      if (array[i].used) {
        count = array[i].used;
      } else {
        count = 0;
      }
      total += 1.0/(count+1);
      if (r < total) {
        choose = i;
        i = array.length;
      }
    }
    //console.log("choosing random card ("+array[choose].name+") from weighted list");
    return array[choose];
  } else {
    var rand_i = Math.floor(Math.random()*array.length);
    return array[rand_i];
  }
}

function drawXTimes(x) {
  drawImages();
  var callCount = 1;
  var repeater = setInterval(function () {
    if (callCount < x) {
      // console.log("calling drawImages on a timer: "+callCount);
      drawImages();
      callCount += 1;
    } else {
      clearInterval(repeater);
    }
  }, 100);
}

function momentum(speed) {
  //console.log("starting momentum with "+speed);
  var canvas = document.getElementById('cardCanvas');
  var context = canvas.getContext('2d');
  var scroll = speed;
  repeater = setInterval(function () {
    //console.log("absolule scroll :"+Math.abs(scroll));
    if (Math.abs(scroll) > 2) {
      // console.log("calling drawImages on a timer: "+scroll);
      canvasScroll += scroll;
      if (canvasScroll > 0) {
        canvasScroll = 0;
      }
      if (canvasScroll < bottom) {
        canvasScroll = bottom;
      }
      //console.log("momentum speed "+scroll);
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.translate(0, canvasScroll);
      scroll *= 0.8;
      //console.log("reducing scroll to "+scroll);
      drawImages();
    } else {
      //console.log("clearing momentum repeater");
      clearInterval(repeater);
    }
  }, 25);

}

// function CheckBoxClickHandler(e) {
//   console.log("click!")
//   if (e.ctrlKey) {
//     // console.log("ctrl key was pressed!");
//   } else {
//     console.log("ctrl key not detected");
//   }
// }

function CtrlKeyDownHandler(e) {
  // console.log("key press!");
  if (e.ctrlKey) {
    //console.log("ctrl key was pressed!");
    ctrlKey = true;
  } else {
    // console.log("ctrl key not detected");
  }

}
function CtrlKeyUpHandler(e) {
  // console.log("key press!");
  ctrlKey = false;
  //console.log("key was released");
  // if (e.ctrlKey) {
    // console.log("ctrl key was pressed!");
  // } else {
    // console.log("ctrl key not detected");
  // }

}

function ChangeHandler(e) { // for checkboxes
  // console.log("Change!");
  var canvas = document.getElementById('cardCanvas');
  var context = canvas.getContext('2d');
  context.translate(0, -canvasScroll);
  canvasScroll = 0;
  //console.log("ctrlKey:"+ctrlKey);
  if (ctrlKey) {
    // var target = e.target || e.srcElement;
    // console.log("event:"+e);
    // console.log("set all other checkboxes to be equal to the state of this check box: "+target.getValue());
    $$("check01").setValue(e);
    $$("check02").setValue(e);
    $$("check03").setValue(e);
    $$("check04").setValue(e);
    $$("check05").setValue(e);
    $$("check06").setValue(e);
    $$("check07").setValue(e);
    $$("check08").setValue(e);
    $$("check09").setValue(e);
    $$("check10").setValue(e);
    $$("check11").setValue(e);
  }

  getSets();
  getOwnedCards();
  // drawImages();
  drawXTimes(5);
}

function EventCounterChangeHandler(e) {
  //console.log("counter is now " + $$("eventcounter").getValue());
  generate();
}

function TextChangeHandler(e) {
  //console.log("text changed");
  getOwnedCards();
  drawXTimes(1);
}

function ResizeHandler(e) {
  var canvas = document.getElementById('cardCanvas');
  var context = canvas.getContext('2d');
  // context.translate(0, -canvasScroll);
  canvasScroll = 0;
  context.setTransform(1, 0, 0, 1, 0, 0);
  drawXTimes(3);
}

function store() {
  // stringify the kingdom as json

  var answer = confirm("Would you like to store this Kingdom");
  //console.log(answer);
  if (answer===true) {
    var kingdom = [];

    for(var i=0;i<kingdom_cards.length;i++) {
      kingdom.push(kingdom_cards[i].name);
    }
    for(var i=0;i<kingdom_events.length;i++) {
      kingdom.push(kingdom_events[i].name);
    }
    var string = JSON.stringify(kingdom);
    //console.log(string);

    for(var i = 0; i<kingdom.length; i++) {
      name = kingdom[i];
      if (localStorage[name]) {
        var value = parseInt(localStorage[name]);
        value++;
        localStorage[name]=value;
      } else {
        localStorage[name]=1;
      }
    }
    //console.log(localStorage);

  } else {
    //console.log("Kingdom not stored");
  }
}

function loadStorage() {
  //console.log("Local Storage");
  for(var x in localStorage) {
    for(var y = 0; y < owned_cards.length; y++) {
      if (owned_cards[i].name === x) {
        //console.log(x+" "+localStorage[x]);
        owned_cards[i]['used'] = localStorage[x];
      }
    }
  }
  console.log("loaded localStorage:");
  console.log(localStorage);
}
