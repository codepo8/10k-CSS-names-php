(function(){
  function $(x) { return document.querySelector(x);}
  var levels = $('#levels');
  var query = $('#query');
  var result = $('#result');
  var gameover = $('#gameover');
  var resultslist = $('#list');
  var gamedata = {};
  function trap(ev) { ev.preventDefault(); }
  function set(prop, value) { gamedata[prop] = value; }
  function get(prop) { return gamedata[prop]; }
  function game(ev){
    if (ev.target.tagName !== 'BUTTON') { return; }
    $('#intro').style.display = 'none';
    gameover.innerHTML = '';
    var leveldata = ev.target.getAttribute('data-level').split('-');
    fetch('api.php?showlist=' + leveldata[1]);
    set('amount', leveldata[1]);
    set('moves', leveldata[2]);
    set('level', leveldata[0]);    
    set('corrects', 0);
  }
  function showresults(col) {
    query.innerHTML = '<p>Find the colour ' + get('name') +' - ' + get('moves') + ' tries left</p>';
    if (col) {
        result.innerHTML = '<p>Nope… ' + gamedata.colours[col] +'</p>';
        document.body.classList.add('fault');
        window.setTimeout(function(){document.body.classList.remove('fault');}, 1000);
    } else {
        result.innerHTML = '';
    }
  }
  function check(ev) {
    if (ev.target.tagName !== 'BUTTON') { return; }
    var col = (ev.target.value);
    if (col === get('value')) {
      set('corrects', get('corrects') + 1);
      fetch('api.php?showlist=' + get('amount'));
    } else {
      if (get('moves') > 1) {
        set('moves', get('moves') - 1);   
        showresults(col);
        result.style.top = ev.target.offsetTop + 40 + 'px';
      } else {
        result.innerHTML = '';
        query.innerHTML = '';
        resultslist.innerHTML = '';
        gameover.innerHTML = '' +
        '<h2>Game over!</h2>' +
        '<p>You recognised ' + get('corrects') + ' colours on the ' +
          get('level') + ' level. Try again?</p>';
        levels.style.display = 'block';
      }
    }
  }
  function listready(list){
    levels.style.display = 'none';
    set('name', list.match(/data-target="([^"]*)"/)[1].split('x')[1]);
    set('value', list.match(/data-target="([^"]*)"/)[1].split('x')[0]);
    set('colours', JSON.parse(list.match(/\{[^\}]*\}/)[0]));
    list = list.replace(/{.*}/,'');
    showresults();
    resultslist.innerHTML = list;
    resultslist.querySelector('button').focus();
  }

  function keynav(ev) {
    var codes = {39:1, 37:-1, 38:-8, 40:8};
    var t = ev.target;
    var c = +t.getAttribute('data-count');
    if (t.tagName === 'BUTTON') {
      if (codes[ev.keyCode]) {
        movetobutton(c + codes[ev.keyCode])
      }
    }
  }
  function movetobutton(i) {
    if (resultslist.querySelectorAll('button')[i]) {
      resultslist.querySelectorAll('button')[i].focus()
    }
  }
  resultslist.addEventListener('keyup', keynav);

  function fetch(url){
    var request = new XMLHttpRequest();
    request.open('get',url,true);
    request.onreadystatechange=function() {
      if(request.readyState == 4){
        if (request.status && /200|304/.test(request.status)) {
          listready(request.responseText);
        } 
      }
    }
    request.setRequestHeader('If-Modified-Since','Wed, 05 Apr 2006 00:00:00 GMT');
    request.send(null);
  }
  list.addEventListener('click',check);
  $('form').addEventListener('submit',trap);
  $('#levelbuttons').addEventListener('click',game);
})();