
;
import $ from 'jquery';
import _ from 'underscore';


/* Based on code from Digital Pali Reader */
/* Made slightly less nutty */
var comparePaliAlphabet = (function(){

var reorder = [
'#','0','1','2','3','4','5','6','7','8','9',
'a','ā','i','ī','u','ū','e','o','ṃ','k','kh','g','gh','ṅ','c','ch','j',
'jh','ñ','ṭ','ṭh','ḍ','ḍh','ṇ','t','th','d','dh','n','p','ph','b','bh',
'm','y','r','l','ḷ','v','s','h'
]

var oldorder = [
'#','0','1','2','3','4','5','6','7','8','9',
'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R',
'S','T','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p',
'q','r','s','t','u','v','w','x','y','z'
]

var neworder = []
var roo = '';
for(var w = 0; w < reorder.length; w++) {
    roo = reorder[w];
    neworder[roo] = oldorder[w];
}

function sortaz(mydata){  // sort pali array

    mydata = mydata.sort(comparePaliAlphabet);
    for (i in mydata) {
        mydata[i] = mydata[i].replace(/^.*###/,''); // remove sorted words, return the rest
    }
    return mydata;
}

function sortStrip(word) {
    word = word.replace(/ṁ/g, 'ṃ');
    word = word.replace(/Ṁ/g, 'Ṃ');
    word = word.toLowerCase().replace(/[^a-zāīūṃṅñṭḍṇḷ#]/g,'');
    return word;
}

return function comparePaliAlphabet(a,b) {

    if (a.length == 0 || b.length == 0) return;

    let two = [sortStrip(a),sortStrip(b)];
    let nwo = [];
    for (let i = 0; i < two.length; i++) {
        let wordval = '';
        for (let c = 0; c < two[i].length; c++) {

            let onechar = two[i].charAt(c);
            if(onechar == '#') break;

            let twochar = onechar + two[i].charAt(c+1);

            if (neworder[twochar]) {
                wordval+=neworder[twochar];
                c++;
            }
            else if (neworder[onechar]) {
                wordval+=neworder[onechar];
            }
            else {
                wordval+=onechar;
            }
        }
        two[i] = wordval;
        nwo[i] = wordval;
    }
    nwo.sort();
    //dalert(a+' '+nwo+' '+b+' ' + two+' '+(nwo[0] == two[0]));
    if(nwo[0] != two[0]) return 1;
    else return -1;

}
})();

function debugmsg(msg){
    console.log('SuttaCentral: ' + msg);
}

window.suttacentral = {
    paliLookupFetchPromise: null,
    init: function() {
        debugmsg("running init")
        const self = window.suttacentral,
            sidebar = $('.translate-left');
        sidebar.find('#tm').remove();

        let dev = false;

        if ($('.translation-text[lang=pi]').length) {
          if (suttacentral.lookupUtility) {
            suttacentral.lookupUtility.popupClass.removeAllNow({removeProtected: true});
            this.activateGlossary(suttacentral.lookupUtility);
          } else {
            let settings = {
              main: 'body',
              lookupWorkerSrc: '/assets/js/lookup/lookup-worker-1.2.js',
              fromLang: 'pi',
              toLang: 'en',
              dataFile: '/assets/js/lookup/pi2en-entries-1.0.json',
              glossaryFile: '/assets/js/lookup/pi2en-glossary-1.0.json',
              selectorClass: 'lookup'
            }
            $.ajax('/assets/js/lookup/lookup-1.2.js').then( () => {
              let lookupUtility = this.activatePaliLookup(settings);
              lookupUtility.ready.then( () => {
                this.activateGlossary(lookupUtility);
                $('body').on('click', '.view-row, input', function(e){
                  if ($(e.currentTarget).parents('.text-popup')) {
                    return
                  }
                })
              })
            })
          }

        }

        /* Shortcuts */
        let currentIndex = parseInt($('#item-number').val(), 10),
            maxIndex = parseInt($('#items-count').text(), 10);

        /*
        // Create a version of gotoIndex which can only be calld once
        // otherwise extreme problems occur if the keyboard shortcut is
        // invoked more than once.
        var gotoIndex = _.once(_.bind(PTL.editor.gotoIndex, PTL.editor));

        shortcut.add('ctrl+shift+up', function(e) {
            gotoIndex(Math.max(1, currentIndex - 10));
        });

        shortcut.add('ctrl+shift+down', function(e) {
            gotoIndex(Math.min(currentIndex + 10, maxIndex));
        });

        shortcut.add('shift+pageup', function(e) {
            gotoIndex(1);
        });
        shortcut.add('shift+pagedown', function(e) {
            gotoIndex(maxIndex);
        });
        */


    },
    /* Automatically convert ascii punctuation to unicode */
    unicodeify: function(e) {
        var element = $(e.target),
            text = element.val(),
            caret = element.caret();
        var newtext = text.replace(/(^| )"/g, '$1“')
                   .replace(/([^ ])"/g, '$1”')
                   .replace(/(^| )'/g, '$1‘')
                   .replace(/([^ ])'/g, '$1’');
        if (newtext != text) {
            element.val(newtext);
            element.caret(caret);
        }
    },
    activatePaliLookup: function(settings) {
      this.lookupUtility = new LookupUtility(settings);
      this.lookupUtility.ready.then(() => {
        this.lookupUtility.markupGenerator.shouldExclude = function(element) {
          if (!$(element).is(':lang(pi)')) return true
          if ($(element).is('.highlight, .highlight-html')) return true
        }
         this.lookupUtility.markupGenerator.startMarkupOnDemand({
             targetSelector: '.translate-focus .translation-text[lang=pi]',
             exclusions: '.highlight, .hightlight-html'});
       })
      return this.lookupUtility;
    },
    activateGlossary: function(lookupUtility) {
        var tmPanel = $('<div id="tm" class="sidebar" dir="ltr">\
            <div class="sidetitle" lang="en-gb">Terminology:</div>\
        </div>');

        var tmUnitTmpl = $('<div class="tm-unit js-editor-copytext" title="Insert the translated term into the editor">\
          <span class="tm-original" dir="ltr" lang="pi"></span>\
          <span class="tm-translation" dir="ltr" lang="en"></span>\
        </div>');

        var text = $('.translate-focus .translation-text').text();
        let words = new Set(text.split(this.lookupUtility.markupGenerator.splitRex));
        words.delete('');
        if (words.length == 0) return;
        lookupUtility.glossary.getEntries([...words]).then(function(results) {

            results.sort(function(a, b) {return comparePaliAlphabet(a.term, b.term)});
            results.forEach(function(hit) {
                var tmUnit = tmUnitTmpl.clone();
                var term = hit.term;
                if (hit.context) {
                    term += '<span style="font-weight: normal"> (' + hit.context + ')</span>';
                }
                tmUnit.find('.tm-original').html(term);
                tmUnit.find('.tm-translation').text(hit.gloss);
                tmUnit.data('translation-aid', hit.gloss + ' ');
                tmPanel.append(tmUnit);
            })
            if (tmPanel.children().length > 1) {
                $('.translate-left').append(tmPanel);
            }
        })
    },
    addAcceptShortcut: function() {
        // Accept TM suggestion
        var TMSuggestions = $('[id^=tm] .js-editor-copytext').has('.suggestion-translation'),
            TMSuggestionPlace = 0,
            resetTimeout;

        if (TMSuggestions.length > 0) {
            shortcut.add('ctrl+m', function() {
                var suggestion = TMSuggestions[TMSuggestionPlace];
                TMSuggestionPlace += 1;
                TMSuggestionPlace %= TMSuggestions.length;
                $(suggestion).click().css('background', '#fff');
                setTimeout(function(){$(suggestion).css('background', "")}, 150);
            });
            if (resetTimeout != null) clearTimeout(resetTimeout);
            resetTimeout = setTimeout(function(){TMSuggestionPlace = 0}, 9000);
        }
    },
}

$(document).on('change keyup', 'textarea.translation', suttacentral.unicodeify);

$(document).on('editor_ready', () => {
  try {
    suttacentral.init();
  } catch (error) {
    console.error("SuttaCentral Init Failed ", error.message);
  }
});
