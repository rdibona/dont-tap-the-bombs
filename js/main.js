/* global tizen, Velocity */

var playing = false;
var difficulty = 1; // gets higher as score increases, adds more items to click
var smileys = ["&#xE814;","&#xE812;","&#xE812;","&#xE813;","&#xE815;"];
var plus_one = "&#xE800;";
var screen_time = 2000; // how much time before bombs automatically blow up
var min_screen_time = 1000; // never dip below this speed for fuses
var total_quads = 2; // 2 or 4 segments
var score = 0;
var highscore = 0;
var num_good_quads = 1;  // how many clickable items on each level
var num_clicked = 0;
var timerID;			 // used for resetting timer if items are clicked in time
var deviceWidth = 360;
var deviceHeight = 360;
var possible_quads2 = ['12', '13', '14', '23', '24', '34'];  // possible item quadrants
var possible_quads3 = ['123', '124', '234', '134'];
var good_quads = "";
var items = ["&#xE84E;","&#xE84F;","&#xE851;","&#xE853;","&#xE855;","&#xE869;","&#xE8F6;","&#xE872;","&#xE926;","&#xE87A;","&#xE87B;","&#xE87C;","&#xE87D;"
            ,"&#xE90D;","&#xE885;","&#xE88A;","&#xE891;","&#xE894;","&#xE90F;","&#xE897;","&#xE91B;","&#xE925;","&#xE91D;","&#xE91E;","&#xE8AD;"
            ,"&#xE8B6;","&#xE8DC;","&#xE8DB;","&#xE8F4;","&#xE8F9;","&#xE029;","&#xE063;","&#xE0B0;","&#xE0BE;","&#xE0DA;"
            ,"&#xE14E;","&#xE14F;","&#xE150;","&#xE153;","&#xE195;","&#xE1AC;","&#xE226;","&#xE227;"
            ,"&#xE6DD;","&#xE243;","&#xE25F;","&#xE24E;","&#xE2C2;","&#xE310;","&#xE312;","&#xE320;","&#xE32A;","&#xE32D;"
            ,"&#xE332;","&#xE334;","&#xE3A1;","&#xE3A8;","&#xE3AE;","&#xE3AF;"
            ,"&#xE3B0;","&#xE3B7;","&#xE3B8;","&#xE3E3;","&#xE3E4;","&#xE3E7;","&#xE43A;","&#xE407;","&#xE416;","&#xE41C;"
            ,"&#xE52E;","&#xE52F;","&#xE532;","&#xE530;","&#xE531;","&#xE566;"
            ,"&#xE536;","&#xE540;","&#xE541;","&#xE556;","&#xE545;","&#xE546;","&#xE54D;","&#xE558;","&#xE55B;","&#xE56C;"
            ,"&#xE565;","&#xE63D;","&#xEB3B;","&#xEB3E;","&#xEB40;","&#xEB41;"
            ,"&#xEB42;","&#xEB43;","&#xEB45;","&#xEB48;","&#xEB4C;","&#xE7E9;","&#xE80B;","&#xE80E;"];
var item_length = items.length;

var header = document.getElementById('header');
var footer = document.getElementById('footer');
var intro = document.getElementById('intro');
var quads = document.getElementsByClassName("quad");
var quad1 = document.getElementById('quad1');
var quad2 = document.getElementById('quad2');
var quad3 = document.getElementById('quad3');
var quad4 = document.getElementById('quad4');

window.addEventListener("load", function load(event){

	document.addEventListener('tizenhwkey', function(e) {
	    if(e.keyName === "back") {
			try {
				tizen.power.release("SCREEN");
			    tizen.application.getCurrentApplication().exit();
			} catch (ignore) {
			}
	    }
	});

  if (localStorage.getItem("highscore") === null) {
    // first time playing
    localStorage.setItem("highscore", 0);
  } else {
    highscore = localStorage.getItem("highscore");
  }

    try {
        tizen.systeminfo.getPropertyValue("DISPLAY", function(disp) {
            deviceWidth = disp.resolutionWidth;
            deviceHeight = disp.resolutionHeight;
        });
    } catch (e) {
        console.log("caught tizen error...");
        deviceWidth = 360;
        deviceHeight = 360;
    } finally {
        // set header and footer size

        var main = document.getElementById('main');
        setElementSize(main, deviceWidth, deviceHeight);

        setElementSize(header, deviceWidth, deviceHeight * 0.15);
        setElementSize(footer, deviceWidth, deviceHeight * 0.15);

        showIntro();
    }


    console.log("detected", deviceWidth, deviceHeight);
    var quad;

    for (var i = 1; i <= 4; i++) {
        quad = document.getElementById('quad' + i);
        quad.addEventListener("click", quadClicked, false);
    }


},false);

function showIntro() {

    var html = "<div class='title'>Don't Tap<br />the Bombs!</div>"
             + "<div style='margin-top: 15px;' id='start'><u>START</u></div>"
    		 + "<div style='margin-top: 15px;' id='high-score'></div>"
    		 + "<div style='font-size: 8px; margin-top: 25px;'>&copy; Copyright 2016</div>";
    clearQuads();

    if (timerID) {
        clearInterval(timerID);
    }

    header.innerHTML = "";
    footer.innerHTML = "";

    intro.innerHTML = html;
    intro.style.opacity = 1;
    setElementSize(intro, deviceWidth, deviceHeight * 0.7);
    setElementPos(intro, deviceHeight * 0.30, 0);
    displayHighScore();

    var start = document.getElementById('start');
    start.addEventListener("click", startClicked, false);
}

function clearQuads() {

	var quad;

    for (var i = 1; i <= total_quads; i++) {
        quad = document.getElementById('quad' + i);
        quad.innerHTML = "";
        setElementPos(quad, 0, 0);
        setElementSize(quad, 0, 0);
    }
}

function startClicked(event) {

    event.preventDefault();
    clearQuads();
    tizen.power.request("SCREEN", "SCREEN_NORMAL");
    navigator.vibrate(1000);
    difficulty = -1;
    score = 0;
    screen_time = 2000;

    // "callout.shake"
    Velocity(intro, "fadeOut", {
        display: null,
        duration: 500,
        complete: nextLevel
    });
}

function nextLevel() {

    intro.innerHTML = "";
    setElementPos(intro, 0, 0);
    setElementSize(intro, 0, 0);

	if (score > 40) {
		if (difficulty < 4) {
			difficulty = 4;
			total_quads = 4;
			num_good_quads = 3;
			screen_time = 1800;
		}
		screen_time -= 40;
	} else if (score > 20) {
		if (difficulty < 3) {
			difficulty = 3;
			total_quads = 4;
			num_good_quads = 2;
			screen_time = 1800;
		}
		screen_time -= 45;
	} else if (score > 5) {
		difficulty = 2;
		total_quads = 4;
		num_good_quads = 1;
		screen_time -= 50;
	} else {
		difficulty = 1;
		total_quads = 2;
		num_good_quads = 1;
		screen_time -= 50;
	}

	if (screen_time < min_screen_time) {
		// minimum of a second to do it
		screen_time = min_screen_time;
	}
	populateScreen();
}

function populateScreen() {

	var quad;
    var itemID;
    var bodyHeight = deviceHeight * 0.7;
    var offsetTop = deviceHeight * 0.15 + 20;

    if (timerID) {
        clearInterval(timerID);
    }

    header.innerHTML = '<div class="vert-align" id="score"></div>';
    footer.innerHTML = '<a href="javascript:void(0)" id="quit">QUIT</a>';
    var quit = document.getElementById('quit');
    quit.addEventListener("click", showIntro, false);

	good_quads = getGoodQuads();
	num_clicked = 0;

    clearQuads();

    if (total_quads == 2) {
        setElementPos(quad1, deviceHeight / 2 - bodyHeight / 2 + offsetTop, 0);
        setElementPos(quad2, deviceHeight / 2 - bodyHeight / 2 + offsetTop, deviceWidth / 2);
    } else {
        setElementPos(quad1, offsetTop, 0);
        setElementPos(quad2, offsetTop, deviceWidth / 2);

        setElementSize(quad3, deviceWidth / 2, bodyHeight / 2);
        setElementPos(quad3, offsetTop + bodyHeight / 2, 0);

        setElementSize(quad4, deviceWidth / 2, bodyHeight / 2);
        setElementPos(quad4, offsetTop + bodyHeight / 2, deviceWidth / 2);
    }

    setElementSize(quad1, deviceWidth / 2, bodyHeight / 2);
    setElementSize(quad2, deviceWidth / 2, bodyHeight / 2);

	for (var i = 1; i <= total_quads; i++) {
		quad = document.getElementById('quad' + i);

		if (good_quads.indexOf(i) >= 0) {
			itemID = Math.floor(Math.random() * item_length);
//            console.log("item: " + items[itemID]);
			quad.innerHTML = '<i class="material-icons">' + items[itemID] + '</i>';
		} else {
			quad.innerHTML = '<img src="img/ornament.svg" />';
		}

        quad.style.opacity = 1;
	}

    Velocity(quads, "callout.swing", {
        display: null,
        duration: 300
    });

	updateScore();
    classSetData(quads, 'clicked', false);

    playing = true;
//	console.log("screen time...", screen_time);
	timerID = setTimeout(function () {
		// Fail! Find the good quads and display the sad face
		var q;
        playing = false;

		for (var i = 0; i < num_good_quads; i++) {
			q = document.getElementById("quad" + good_quads[i]);

			if (q.dataset.clicked == "false") {
				q.innerHTML = '<i class="material-icons">' + smileys[0] + '</i>';

                Velocity(q, "callout.shake", {
                    display: null,
                    duration: 400
                });

			}
		}
		levelFailed();
	}, screen_time);
}

function quadClicked(event) {

    var quad;

    event.preventDefault();

    if (playing === false) {
        return;
    }

    quad = event.currentTarget.dataset.quad;
    var q = document.getElementById("quad" + quad);

    if (good_quads.indexOf(quad) >= 0) {
        num_clicked++;

        if (num_clicked >= num_good_quads) {
            clearInterval(timerID);
            window.setTimeout(nextLevel, 1000);
        }

        q.innerHTML = '<i class="material-icons">' + plus_one + '</i>';
        q.dataset.clicked = true;
        score++;
        updateScore();
    } else {
        levelFailed();
        q.innerHTML = '<i class="material-icons">' + smileys[0] + '</i>';
    }
}

function levelFailed() {

    playing = false;
    clearInterval(timerID);

    footer.innerHTML = '<a href="javascript:void(0)" id="retry" style="padding-bottom: 7px;">RETRY</a>';

    var retry = document.getElementById('retry');
    retry.addEventListener("click", startClicked, false);

    header.innerHTML += '<br /><span id="high-score"></span>';
    displayHighScore();
}

function updateScore() {
	var sc = document.getElementById("score");
  var score_out = "";
  var smiley = "";

/*
  if (difficulty > 0) {
      smiley = ' <i class="material-icons" style="font-size: 36px">'
                  + smileys[difficulty] + '</i>';
  }
*/
  score_out = smiley + " SCORE: " + score + smiley;
  sc.innerHTML = score_out;

	if (score > highscore) {
		localStorage.setItem("highscore", score);
		highscore = score;
	}
}

function displayHighScore() {
    var hs = document.getElementById('high-score');

    hs.innerHTML = "HI-SCORE: " + highscore;
}

function getGoodQuads() {

	var quadidx;
	var gq;

	switch (num_good_quads) {

		case 1:
			gq = String(Math.floor(Math.random() * total_quads) + 1); // Make a string
			break;

		case 2:
			quadidx = Math.floor(Math.random() * 6); // six possible combos
			gq = possible_quads2[quadidx];
			break;

		case 3:
			quadidx = Math.floor(Math.random() * 4); // four possible combos
			gq = possible_quads3[quadidx];
			break;
	}

//	console.log("good quads are " + gq + " idx is " + quadidx);
	return gq;
}

function setElementSize(ele, w, h) {
    ele.style.width = Math.floor(w) + "px";
    ele.style.height = Math.floor(h) + "px";
}

function setElementPos(ele, top, left) {
    ele.style.top = Math.floor(top) + "px";
    ele.style.left = Math.floor(left) + "px";
}

function classSetData(cls, name, val) {
    [].forEach.call(cls, function(cl) {
        cl.dataset[name] = val;
    });
}
