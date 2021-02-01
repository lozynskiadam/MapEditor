var Events = function() {
  $(window).resize(function () {
    App.setCanvasSize();
  });

  $(document).on('mousedown', function (e) {
    App.Dragging = e.which === 1;
  });

  $(document).on('mouseup', function () {
    App.Dragging = false;
  });

  $(document).on('wheel', '.content', function(e) {
    if (e.originalEvent.deltaY < 0) {
      App.setBrushSize(App.BrushSize+1);
    }
    else {
      App.setBrushSize(App.BrushSize-1);
    }
  });

  $(document).on('click.tool', '[data-tool]', function () {
    App.setTool($(this).data('tool'));
  });

  $(document).on('change', '#BrushSize', function () {
    App.setBrushSize(parseInt($(this).val()));
  });

  $(document).on('click mouseup mousedown mouseenter mouseout', '.sidebar', function () {
    App.Dragging = false;
  });

  $(document).on("mousedown mouseup click focus blur contextmenu mousewheel DOMMouseScroll wheel", function (e) {
    if (e.which === 3) {
      e.preventDefault();
      e.stopPropagation();
    }
  });

  $(document).on('click.item', '.item-select', function () {
    $('.item-select', document).removeClass('active');
    $(this).addClass('active');
    App.selectItem($(this).data('item-id'));
    App.setTool('brush');
  });

  $(document).on('change.layer', '.layer-list', App.refreshPalette);
  $(document).on('click.new', '[data-action="new"]', App.new);
  $(document).on('click.open', '[data-action="open"]', App.open);
  $(document).on('click.save', '[data-action="save"]', App.save);
  $(document).on('click.help', '[data-action="help"]', App.help);

  $(document).on('mousemove.map', '#map', function (event) {
    let bounds = event.target.getBoundingClientRect();
    let x = (parseInt((event.clientX - bounds.left) / Config.TileSize) - (Config.MaxFloor - App.CurrentFloor));
    let y = (parseInt((event.clientY - bounds.top) / Config.TileSize) - (Config.MaxFloor - App.CurrentFloor));
    x = App.RenderFromX + x;
    y = App.RenderFromY + y;
    x = x < App.RenderFromX ? App.RenderFromX : x;
    y = y < App.RenderFromY ? App.RenderFromY : y;
    if (App.CursorPosition.X !== x || App.CursorPosition.Y !== y) {
      App.CursorPosition = {X: x, Y: y};
      $('.pos-x', document).text('X: ' + x);
      $('.pos-y', document).text('Y: ' + y);
      $('.pos-z', document).text('Z: ' + App.CurrentFloor);
      if (App.Dragging && App.SelectedTool.onDrag) {
        App.SelectedTool.onDrag(App.CursorPosition.X, App.CursorPosition.Y, App.CurrentFloor);
        App.render('current');
      }
      else {
        App.render('GUI');
      }
    }
  });

  $(document).on('mousedown', '#map', function (e) {
    if (e.which === 3) {
      App.setTool('pointer');
      App.highlightOnTile(App.CursorPosition.X, App.CursorPosition.Y, App.CurrentFloor);
      return;
    }
    if (!(e.which === 1)) {
      return;
    }
    if(App.SelectedTool.onClick) {
      App.SelectedTool.onClick(App.CursorPosition.X, App.CursorPosition.Y, App.CurrentFloor);
    }
    App.render('current');
  });

  $(document).on("keydown", function (e) {
    if(Keyboard[e.keyCode]) {
      e.preventDefault();
      Keyboard[e.keyCode]();
    }
  });

  $(document).on('keyup', function (e) {
    if (e.keyCode === 16) {
      e.preventDefault();
      window.ShiftDown = false;
      $('.content', document).css('cursor', 'default');
    }
  });

  $(document).on('keyup', function (e) {
    if (e.keyCode === 9) {
      e.preventDefault();
      window.TabDown = false;
      App.setTool('brush');
    }
  });

  $(document).tooltip({
    show: {
      delay: 400,
      duration: 200
    },
    hide: {
      duration: 200
    }
  });

};