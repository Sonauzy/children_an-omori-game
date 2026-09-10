(function() {
  var game;
  var ui;
    var typewriterNodes = [];
    var typewriterQueue = [];
    var typewriterTimer = null;
    var typewriterActive = false;
    window.typewriterEnabled = localStorage.getItem('children_typewriter') === 'true';

  var DateOptions = {hour: 'numeric',
                 minute: 'numeric',
                 second: 'numeric',
                 year: 'numeric',
                 month: 'short',
                 day: 'numeric' };

  var main = function(dendryUI) {
    ui = dendryUI;
    game = ui.game;

    // Add your custom code here.
  };

  var TITLE = "" + '_' + "";

  window.showStats = function() {
    if (window.dendryUI.dendryEngine.state.sceneId.startsWith('stats')) {
        window.dendryUI.dendryEngine.goToScene('backSpecialScene');
    } else {
        window.dendryUI.dendryEngine.goToScene('stats');
    }
  };
  
  window.showOptions = function() {
      var save_element = document.getElementById('options');
      window.populateOptions();
      save_element.style.display = "block";
      if (!save_element.onclick) {
          save_element.onclick = function(evt) {
              var target = evt.target;
              var save_element = document.getElementById('options');
              if (target == save_element) {
                  window.hideOptions();
              }
          };
      }
  };

  window.hideOptions = function() {
      var save_element = document.getElementById('options');
      save_element.style.display = "none";
  };

  window.disableBg = function() {
      window.dendryUI.disable_bg = true;
      document.body.style.backgroundImage = 'none';
      window.dendryUI.saveSettings();
  };

  window.enableBg = function() {
      window.dendryUI.disable_bg = false;
      window.dendryUI.setBg(window.dendryUI.dendryEngine.state.bg);
      window.dendryUI.saveSettings();
  };

  window.disableAnimate = function() {
      window.dendryUI.animate = false;
      window.dendryUI.saveSettings();
  };

  window.enableAnimate = function() {
      window.dendryUI.animate = true;
      window.dendryUI.saveSettings();
  };

  window.disableAnimateBg = function() {
      window.dendryUI.animate_bg = false;
      window.dendryUI.saveSettings();
  };

  window.enableAnimateBg = function() {
      window.dendryUI.animate_bg = true;
      window.dendryUI.saveSettings();
  };

  window.disableTypewriter = function() {
      window.typewriterEnabled = false;
      window.finishTypewriter();
      window.saveTypewriterSetting();
  };

  window.enableTypewriter = function() {
      window.typewriterEnabled = true;
      window.saveTypewriterSetting();
      window.startTypewriter();
  };

  window.saveTypewriterSetting = function() {
      localStorage.setItem('children_typewriter', window.typewriterEnabled);
  };

  window.finishTypewriter = function() {
      if (typewriterTimer) {
          window.clearInterval(typewriterTimer.id);
          typewriterTimer.node.nodeValue = typewriterTimer.text;
      }
      typewriterQueue.forEach(function(item) {
          item.node.nodeValue = item.text;
      });
      typewriterTimer = null;
      typewriterQueue = [];
      typewriterActive = false;
  };

  window.startTypewriter = function() {
      if (!window.typewriterEnabled) {
          return;
      }

      queueTypewriterContent();
      scheduleNextTypewriterNode();
  };

  function queueTypewriterContent() {
      var content = document.getElementById('content');
      if (typewriterTimer && !content.contains(typewriterTimer.node)) {
          window.clearInterval(typewriterTimer.id);
          typewriterTimer = null;
          typewriterQueue = [];
          typewriterActive = false;
      }
      var walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT);
      var node;
      while (node = walker.nextNode()) {
          if (!node.nodeValue.trim() || typewriterNodes.indexOf(node) !== -1 ||
              node.parentElement.closest('.choices')) {
              continue;
          }

          typewriterNodes.push(node);
          typewriterQueue.push({node: node, text: node.nodeValue});
          node.nodeValue = '';
      }
  };

  function scheduleNextTypewriterNode() {
      if (typewriterActive || typewriterQueue.length === 0) {
          return;
      }

      var item = typewriterQueue.shift();
      var node = item.node;
      var text = item.text;
      var index = 0;
      typewriterActive = true;
      var timer = window.setInterval(function() {
          node.nodeValue = text.slice(0, ++index);
          if (index >= text.length) {
              window.clearInterval(timer);
              typewriterTimer = null;
              typewriterActive = false;
              scheduleNextTypewriterNode();
          }
      }, 30);
      typewriterTimer = {id: timer, node: node, text: text};
  }
  
  window.disableAudio = function() {
      window.dendryUI.toggle_audio(false);
      window.dendryUI.saveSettings();
  };

  window.enableAudio = function() {
      window.dendryUI.toggle_audio(true);
      window.dendryUI.saveSettings();
  };

  window.enableImages = function() {
      window.dendryUI.show_portraits = true;
      window.dendryUI.saveSettings();
  };

  window.disableImages = function() {
      window.dendryUI.show_portraits = false;
      window.dendryUI.saveSettings();
  };

  window.enableLightMode = function() {
      window.dendryUI.dark_mode = false;
      document.body.classList.remove('dark-mode');
      window.dendryUI.saveSettings();
  };
  window.enableDarkMode = function() {
      window.dendryUI.dark_mode = true;
      document.body.classList.add('dark-mode');
      window.dendryUI.saveSettings();
  };

  // populates the checkboxes in the options view
  window.populateOptions = function() {
    var disable_bg = window.dendryUI.disable_bg;
    var animate = window.dendryUI.animate;
    var animate_bg = window.dendryUI.animate_bg;
    if (disable_bg) {
        $('#backgrounds_no')[0].checked = true;
    } else {
        $('#backgrounds_yes')[0].checked = true;
    }
    if (animate) {
        $('#animate_yes')[0].checked = true;
    } else {
        $('#animate_no')[0].checked = true;
    }
    if (animate_bg) {
        $('#animate_bg_yes')[0].checked = true;
    } else {
        $('#animate_bg_no')[0].checked = true;
    }
    if (window.typewriterEnabled) {
        $('#typewriter_yes')[0].checked = true;
    } else {
        $('#typewriter_no')[0].checked = true;
    }
    if (window.dendryUI.dark_mode) {
        $('#dark_mode')[0].checked = true;
    } else {
        $('#light_mode')[0].checked = true;
    }
  };
  
  // This function allows you to modify the text before it's displayed.
  // E.g. wrapping chat-like messages in spans.
  window.displayText = function(text) {
      return text;
  };

  // This function allows you to do something in response to signals.
  window.handleSignal = function(signal, event, scene_id) {
  };
  
  // This function runs on a new page. Right now, this auto-saves.
  window.onNewPage = function() {
    var scene = window.dendryUI.dendryEngine.state.sceneId;
    if (scene != 'root' && !window.justLoaded) {
        window.dendryUI.autosave();
    }
    if (window.justLoaded) {
        window.justLoaded = false;
    }
    window.startTypewriter();
  };

  window.updateSidebar = function() {
      $('#qualities').empty();
      var scene = dendryUI.game.scenes.status;
      var displayContent = dendryUI.dendryEngine._makeDisplayContent(scene.content, true);
      $('#qualities').append(dendryUI.contentToHTML.convert(displayContent));
  };

  window.onDisplayContent = function() {
      window.updateSidebar();
      queueTypewriterContent();
      window.setTimeout(window.startTypewriter, 0);
  };

  window.justLoaded = true;
  window.dendryModifyUI = main;
  console.log("Modifying stats: see dendryUI.dendryEngine.state.qualities");

  window.hideSidebarAndNotebook = function() {
    document.getElementById('stats_sidebar').style.display = 'none';
}

  window.showSidebarAndNotebook = function() {
    document.getElementById('stats_sidebar').style.display = '';

};

  window.onload = function() {
    window.dendryUI.loadSettings();
    if (window.dendryUI.dark_mode) {
        document.body.classList.add('dark-mode');
    }
  };

}());
