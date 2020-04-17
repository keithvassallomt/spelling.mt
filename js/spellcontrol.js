var dictionary;
var spellingErrors = [];
var mt_check;
var selectedText;
var DEBUG = true;

$( document ).ready(function() {
  dictionary = new Typo("mt_MT", false, false, {
    dictionaryPath: "js/typo/dictionaries",
    asyncLoad: true,
    loadedCallback: onDictLoaded
  });
});

function onDictLoaded() {
  $('#loading_dict').remove();
  checkSpelling();
  bindListeners();
}

function bindListeners() {
  mt_check = $('.mt_check').highlightWithinTextarea({
    highlight: highlightWords
  });
  $('.mt_check').keyup(function(e) {
      if(e.keyCode == 32 || e.keyCode == 8 || e.keyCode == 46) { // space/backspace/delete
          checkSpelling();
      }
  });
  $(".mt_check").on('paste', function(e) {
    checkSpelling();
    setTimeout(checkSpelling, 1000); // Ugly hack to wait for DOM
  });

  $('.mt_check').on('long-press', function(e){
    e.preventDefault();
    selectedText = getTouchSelectionText();
    suggestions = getSuggestions(selectedText);
    showContextMenu(suggestions);
  });

  // All of the below is for the context menu
  // Show the menu when a word in the textarea is right-clicked
  $(".mt_check").bind("contextmenu", function(event) {
    event.preventDefault();
    selectedText = getSelectionText();
    suggestions = getSuggestions(selectedText);
    showContextMenu(suggestions);
  });

  // Hide the menu if anywhere else is clicked
  $(document).bind("mousedown", function(e) {
    if (!$(e.target).parents(".custom-menu").length > 0) {
      $(".custom-menu").hide(100);
    }
  });

  // If the menu element is clicked
  $(document).on('click', 'ul.custom-menu li', function(){
    switch ($(this).attr("data-action")) {
      case "no":
        break;
      case "search":
        window.open('https://www.google.com/search?q='+selectedText, '_blank');
        break;
      default:
        let userText = $('.mt_check').val();
        let replacementWord = $(this).attr("data-action");
        let re = new RegExp("\\b" + selectedText + "\\b", "g");
        userText = userText.replace(re, replacementWord);
        $('.mt_check').val(userText);
        $('.mt_check').highlightWithinTextarea('update');
        break;
    }
    $(".custom-menu").hide(100);
  });
}

function showContextMenu(suggestions) {
  let menuEntries = "";
  $.each(suggestions, function(i, suggested){
    menuEntries += "<li data-action='" + suggested + "'>" + suggested + "</li>";
  });
  if (menuEntries == "") {
    menuEntries = "<li data-action='no'>No suggestions</li>";
  }
  menuEntries += "<li data-action='search'>Search Google for ''" + selectedText + "''</li>";
  $('.custom-menu').html(menuEntries);

  // Show contextmenu
  $(".custom-menu").finish().toggle(100).css({
    top: (event.pageY - $('#mt_spell_cont').position().top) + "px",
    left: (event.pageX - parseInt($('#mt_spell_cont').css('marginLeft'))) + "px"
  });
}

function sanitizeText(text) {
  wordList = [];

  // Trim
  text = text.trim();

  // Remove carriage returns and new lines
  text = text.replace(/[\r\n]+/gm, "");

  // Split by whitespace and fullstops/periods.
  text = text.split(/[\s,\.]+/);

  // Articles
  // When a word contains an article, move the article to the first part of 
  // the word. For example, bil-Malti becomes 'bil-' and 'Malti'.
  let articles = /\'|\-|\’/g;
  for (word of text) {
    let containsArticle = false;
    
    while((match = articles.exec(word)) !=  null) {
      containsArticle = true;
      let article = word[match.index]; // The article that was found
      multi_part_word = word.split(article);
      for (let i=0; i<multi_part_word.length; i++) {
        wordPart = i == 0 ? multi_part_word[i] + article : multi_part_word[i];
        wordList.push(wordPart);
      }
    }

    if (!containsArticle) {
      wordList.push(word);
    }
  }

  // Clean the words
  wordList.forEach((o, i, a) => a[i] = 
    a[i].trim().replace(/[.,?!\s]/g, '').replace(/’/g, "'"));

  return wordList;
}

function checkSpelling() {
  debug("-----------------------------NEW WORD---------------------------------------")
  spellingErrors = [];
  
  let rawText = $('.mt_check').val();
  debug("RAW TEXT: " + rawText);

  wordList = sanitizeText(rawText);

  for (word of wordList) {
    debug("PROCESSING WORD: " + word)
    if (word != '' && word != ' ' && word.length > 1 && !dictionary.check(word)) {
      debug("ERROR FOUND: " + word)
      spellingErrors.push(word);
    }
    debug("-----")
  }

  $(mt_check).highlightWithinTextarea('update');
  updateSummary(spellingErrors);
}

function updateSummary(spellingErrors) {
  if (spellingErrors.length == 0) {
    $('#summaryTable').html('');
    return;
  }

  summaryTable = "<table class='summaryTable'><thead><tr><td>Word/Kelma</td><td>Suggestions / Suġġerimenti</td></tr><thead><tbody>";
  for (error of spellingErrors) {
    let suggestions = getSuggestions(error);
    summaryTable += "<tr><td>" + error + "</td><td>" + suggestions.join(', ') + "</td></tr>";
  }
  summaryTable += "</tbody></table>";
  $('#summaryTable').html(summaryTable);
}

function highlightWords() {
  if (spellingErrors.length == 0) return;

  let highlightArr = [];
  $.each(spellingErrors, function(i, word) {
    let highlightObj = {};
    let regex = '\\b' + word + '\\b';
    highlightObj.highlight = new RegExp(regex)
    highlightObj.className = 'red';
    highlightArr.push(highlightObj);
  });
  console.log(highlightArr)
  return highlightArr;
}

function getSuggestions(word) {
  return dictionary.suggest(word);
}

function getSelectionText() {
  var text = "";
  var activeEl = document.activeElement;
  var activeElTagName = activeEl ? activeEl.tagName.toLowerCase() : null;
  if (
    (activeElTagName == "textarea" || activeElTagName == "input") &&
    /^(?:text|search|password|tel|url)$/i.test(activeEl.type) &&
    (typeof activeEl.selectionStart == "number")
  ) {
    text = activeEl.value.slice(activeEl.selectionStart, activeEl.selectionEnd);
  } else if (window.getSelection) {
    text = window.getSelection().toString();
  }
  return text;
}

function getTouchSelectionText() {
  var sel_obj = window.getSelection();
  sel_obj.modify("move","forward","character");
  sel_obj.modify("extend","backward","word");

  sel_obj.modify("move","backward","character");
  sel_obj.modify("extend","forward","word");

  var text = sel_obj.toString().trim();
  text = text.replace(/(^,)|(,$)|(^\.)|(\.$)/g, ""); // remove commas and fullstops
  return text;
}

function debug(text) {
  if (DEBUG) {
    console.log(text)
  }
}