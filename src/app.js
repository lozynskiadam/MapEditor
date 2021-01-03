var App = {

  Tool: null, // 0 = pointer, 1 = brush, 2=eraser
  BrushSize: null,
  Items: [],
  Area: {},
  Canvas: {
    General: null,
    Floor: {}
  },

  SelectedItem: null,
  SecondaryItem: null,
  HighlightedItem: null,

  ShiftDown: false,
  CursorPosition: {
    X: 0,
    Y: 0,
  },
  CurrentFloor: 0,

  MapRangeX: {},
  MapRangeY: {},

  init: function () {
    App.MapRangeX = {From: 100, To: 149};
    App.MapRangeY = {From: 100, To: 149};
    App.Canvas.General = document.getElementById('map');
    App.updateCanvasSize();
    App.loader();
  },

  updateCanvasSize: function() {
    App.Canvas.General.width = document.querySelector('.map-container').clientWidth;
    App.Canvas.General.height = document.querySelector('.map-container').clientHeight;
  },

  loader: function () {
    typeof window.LoadingIndex == 'undefined' ? window.LoadingIndex = 1 : window.LoadingIndex++;
    let L = window.LoadingIndex;

    L === 1 && App.loadItems();
    L === 2 && App.fillPalette();
    L === 3 && App.setFloors();
    L === 4 && App.setArea();
    L === 5 && App.setKeyboardEvents();
    L === 6 && App.setMouseEvents();
    L === 7 && App.finishLoading();
  },

  finishLoading: function () {
    App.setTool('pointer');
    App.setBrushSize(1);
    App.selectItem(0);
    App.selectSecondaryItem(0);
    $('#loader', document).fadeOut('fast');
  },

  loadItems: function () {
    $.get(Config.ItemsURL + '?v=' + Date.now(), function (data) {
      for(const item of data) {
        let image = new Image();
        image.src = 'data:image/png;base64,' + item.image;
        item.image = image;
        App.Items.push(item);
      }
      App.loader();
    });
  },

  fillPalette: function () {
    let html = [];
    for(const item of App.Items) {
      html = [];
      html.push('<div class="item-select" data-item-layer="' + item.layer + '" data-item-id="' + item.id + '" data-item-name="' + item.name + '">');
      html.push('  <img src="' + item.image.src + '"/>');
      html.push('</div>');
      $('.item-list', document).append(html.join(''));
    }
    $('.item-select', document).on('click', function () {
      $('.item-select', document).removeClass('active');
      $(this).addClass('active');
      App.selectItem($(this).data('item-id'));
      App.setTool('brush');
    });
    $('.item-container', document).on('click mouseup mousedown mouseenter mouseout', function () {
      App.Dragging = false;
    });
    $('#Layer', document).on('change', App.refreshPalette).trigger('change');
    App.loader();
  },

  setTool: function (tool) {
    $('.menu-button', document).removeClass('active');
    App.HighlightedItem = null;
    if (tool === 'pointer') {
      App.Tool = 0;
    }
    if (tool === 'brush') {
      App.Tool = 1;
    }
    if (tool === 'eraser') {
      App.Tool = 2;
    }
    $('.menu-button[data-tool="' + tool + '"]', document).addClass('active');
    App.render();
  },

  setBrushSize: function (size) {
    App.BrushSize = size;
    App.render();
  },

  refreshPalette: function () {
    let layer = $('#Layer', document).val();
    $('.item-select', document).hide();
    $('.item-select', document).each(function () {
      let itemLayer = $(this).data('item-layer');
      if (itemLayer === layer) {
        $(this).show();
      }
    });
  },

  getItem: function(id) {
    return App.Items.filter(item => {
      return item.id.toString() === id.toString()
    })[0];
  },

  getTile: function(x,y,z) {
    if(!App.Area[z] || !App.Area[z][y] || !App.Area[z][y][x]) {
      return null;
    }
    return App.Area[z][y][x];
  },

  selectItem: function (id) {
    let item = App.getItem(id);
    if (!item) return;
    App.SelectedItem = item;
    $('.actual-item-image', document).html('<img alt="' + item.id + '" src="' + item.image.src + '"/>');
    $('.actual-item-details', document).html(item.name + ' (' + item.id + ')');
  },

  selectSecondaryItem: function (id) {
    let item = App.getItem(id);
    if (!item) return;
    App.SecondaryItem = item;
    $('.secondary-item-image', document).html('<img alt="' + item.id + '" src="' + item.image.src + '"/>');
  },

  setFloors: function () {
    for (let z = Config.MinFloor; z <= Config.MaxFloor; z++) {
      App.Canvas.Floor[z] = document.createElement('canvas');
      App.Canvas.Floor[z].width = App.Canvas.General.width;
      App.Canvas.Floor[z].height = App.Canvas.General.height;
    }
    App.loader();
  },

  setArea: function () {
    App.Area = {};
    for (let z = Config.MinFloor; z <= Config.MaxFloor; z++) {
      App.Area[z] = {};
      for (let y = App.MapRangeY.From; y <= App.MapRangeY.To; y++) {
        App.Area[z][y] = {};
        for (let x = App.MapRangeX.From; x <= App.MapRangeX.To; x++) {
          App.Area[z][y][x] = [];
        }
      }
    }
    // App.getTile(110, 110, 0).push(1010);
    App.loader();
  },

  setKeyboardEvents: function () {
    $(document).on("keydown", function (e) {

      // [x] -> toggle primary/secondary item
      if (e.keyCode === 88) {
        e.preventDefault();
        let SelectedItem = App.SelectedItem;
        let SecondaryItem = App.SecondaryItem;
        if (SecondaryItem) {
          App.selectItem(SecondaryItem.id);
        }
        if (SelectedItem) {
          App.selectSecondaryItem(SelectedItem.id);
        }
        $('#item-preview', document).remove();
        App.setTool('brush');
      }

      // [tab] -> select hovered/highlighted item
      if (e.keyCode === 9) {
        e.preventDefault();
        if (App.HighlightedItem) {
          App.selectItem(App.HighlightedItem.Item.id);
        } else {
          let x = App.CursorPosition.X;
          let y = App.CursorPosition.Y;
          let z = App.CurrentFloor;
          if (!App.getTile(x,y,z) || App.getTile(x,y,z).length === 0) {
            return;
          }
          let itemId = App.getTile(x,y,z).slice(-1)[0];
          App.selectItem(itemId);
        }
        App.setTool('brush');
      }

      // [+] -> level up
      if (e.keyCode === 107) {
        e.preventDefault();
        App.CurrentFloor = App.CurrentFloor + 1 > Config.MaxFloor ? App.CurrentFloor : App.CurrentFloor + 1;
        $('.pos-z', document).text('Z: ' + App.CurrentFloor);
        App.render();
      }

      // [-] -> level down
      if (e.keyCode === 109) {
        e.preventDefault();
        App.CurrentFloor = App.CurrentFloor - 1 < Config.MinFloor ? App.CurrentFloor : App.CurrentFloor - 1;
        $('.pos-z', document).text('Z: ' + App.CurrentFloor);
        App.render();
      }

      // [shift] -> allow stacking items on same layer while drawing
      if (e.keyCode === 16) {
        e.preventDefault();
        App.ShiftDown = true;
        $('body').css('cursor', 'alias');
      }

      // [delete] -> remove highlighted item
      if (e.keyCode === 46) {
        if (App.HighlightedItem) {
          App.getTile(App.HighlightedItem.X,App.HighlightedItem.Y,App.HighlightedItem.Z).pop();
          App.HighlightedItem = null;
          App.render();
        }
      }
    });
    $(document).on('keyup', function (e) {
      if (e.keyCode === 16) {
        e.preventDefault();
        App.ShiftDown = false;
        $('body').css('cursor', 'default');
      }
    });
    App.loader();
  },

  setMouseEvents: function () {
    $(document).on("mousedown mouseup click focus blur contextmenu mousewheel DOMMouseScroll wheel", function (e) {
      if (e.which === 3) {
        e.preventDefault();
        e.stopPropagation();
      }
    });

    $(document).on('mousedown', function (e) {
      App.Dragging = e.which === 1;
    });

    $(document).on('mouseup', function () {
      App.Dragging = false;
    });

    $('#map', document).on('mousemove', function (event) {
      let bounds = event.target.getBoundingClientRect();
      let x = (parseInt((event.clientX - bounds.left) / Config.TileSize) - (Config.MaxFloor - App.CurrentFloor));
      let y = (parseInt((event.clientY - bounds.top) / Config.TileSize) - (Config.MaxFloor - App.CurrentFloor));
      x = App.MapRangeX.From + x;
      y = App.MapRangeY.From + y;
      x = x < App.MapRangeX.From ? App.MapRangeX.From : x;
      y = y < App.MapRangeY.From ? App.MapRangeY.From : y;
      x = x > App.MapRangeX.To ? App.MapRangeX.To : x;
      y = y > App.MapRangeY.To ? App.MapRangeY.To : y;
      if (App.CursorPosition.X !== x || App.CursorPosition.Y !== y) {
        App.CursorPosition = {X: x, Y: y};
        $('.pos-x', document).text('X: ' + x);
        $('.pos-y', document).text('Y: ' + y);
        $('.pos-z', document).text('Z: ' + App.CurrentFloor);
        if (App.Dragging) {
          if (App.Tool === 1 && App.BrushSize === 1) {
            App.drawOnTile(App.CurrentFloor, App.CursorPosition.Y, App.CursorPosition.X);
          }
          if (App.Tool === 1 && App.BrushSize === 3) {
            for (let i = -1; i <= 1; i++) {
              for (let j = -1; j <= 1; j++) {
                App.drawOnTile(App.CurrentFloor, App.CursorPosition.Y + i, App.CursorPosition.X + j);
              }
            }
          }
          if (App.Tool === 2 && App.BrushSize === 1) {
            App.eraseOnTile(App.CurrentFloor, App.CursorPosition.Y, App.CursorPosition.X);
          }
          if (App.Tool === 2 && App.BrushSize === 3) {
            for (let i = -1; i <= 1; i++) {
              for (let j = -1; j <= 1; j++) {
                App.eraseOnTile(App.CurrentFloor, App.CursorPosition.Y + i, App.CursorPosition.X + j, true);
              }
            }
          }
        }
        App.render();
      }
    });

    $('#map', document).on('mousedown', function (e) {
      if (e.which === 3) {
        App.setTool('pointer');
        App.highlightOnTile(App.CurrentFloor, App.CursorPosition.Y, App.CursorPosition.X);
        return;
      }
      if (!(e.which === 1)) {
        return;
      }
      if (App.Tool === 1 && App.BrushSize === 1) {
        App.drawOnTile(App.CurrentFloor, App.CursorPosition.Y, App.CursorPosition.X);
      }
      if (App.Tool === 1 && App.BrushSize === 3) {
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            App.drawOnTile(App.CurrentFloor, App.CursorPosition.Y + i, App.CursorPosition.X + j);
          }
        }
      }
      if (App.Tool === 0) {
        App.highlightOnTile(App.CurrentFloor, App.CursorPosition.Y, App.CursorPosition.X);
      }
      if (App.Tool === 2 && App.BrushSize === 1) {
        App.eraseOnTile(App.CurrentFloor, App.CursorPosition.Y, App.CursorPosition.X);
      }
      if (App.Tool === 2 && App.BrushSize === 3) {
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            App.eraseOnTile(App.CurrentFloor, App.CursorPosition.Y + i, App.CursorPosition.X + j, true);
          }
        }
      }
      App.render();
    });

    $('.menu-button[data-tool="pointer"]', document).on('click', function () {
      App.setTool('pointer');
    });
    $('.menu-button[data-tool="brush"]', document).on('click', function () {
      App.setTool('brush');
    });
    $('.menu-button[data-tool="eraser"]', document).on('click', function () {
      App.setTool('eraser');
    });
    $('#BrushSize', document).on('change', function () {
      App.setBrushSize(parseInt($(this).val()));
    });
    $('.menu-button[data-action="save"]', document).on('click', function () {
      App.save();
    });

    App.loader();
  },

  drawOnTile: function (z, y, x) {
    if (!App.getTile(x,y,z) || !App.SelectedItem || App.Tool !== 1) {
      return;
    }
    let drawn = false;

    // Map editor allows to draw only one item of type on each tile (unless its not a ground and "shift" is pressed)
    if (!App.ShiftDown) {
      for (let key in App.Area[z][y][x]) if (App.Area[z][y][x].hasOwnProperty(key)) {
        let item = App.getItem(App.Area[z][y][x][key]);
        if (item.layer === App.SelectedItem.layer) {
          if (!drawn) {
            App.getTile(x,y,z)[key] = App.SelectedItem.id;
            drawn = true;
          } else {
            App.getTile(x,y,z).splice(key, 1);
          }
        }
      }
    }

    if (!drawn) {
      if (App.SelectedItem.layer === 'ground') {
        App.getTile(x,y,z).unshift(App.SelectedItem.id);
      } else {
        App.getTile(x,y,z).push(App.SelectedItem.id);
      }
    }
  },

  eraseOnTile: function (z, y, x, hardClear = false) {
    let tile = App.getTile(x,y,z);
    if (!tile || tile.length === 0 || App.Tool !== 2) {
      return;
    }
    let itemId = App.getTile(x,y,z)[(tile.length - 1)];
    if (!hardClear && App.getItem(itemId).layer === 'ground') {
      return;
    }
    hardClear ? tile.length = 0 : tile.pop();
  },

  highlightOnTile: function (z, y, x) {
    if (!App.Area[z] || !App.Area[z][y] || !App.Area[z][y][x] || App.Area[z][y][x].length === 0) {
      return;
    }
    App.HighlightedItem = {Item: App.getItem(App.Area[z][y][x].slice(-1)[0]), X: x, Y: y, Z: z};
    App.render();
  },

  load: function (data) {
    $('#wait', document).fadeIn('fast');

    let area = JSON.parse(data);
    App.MapRangeX = {From: fromX, To: toX};
    App.MapRangeY = {From: fromY, To: toY};
    App.setArea();

    for (let z in area) if (area.hasOwnProperty(z)) {
      for (let y in area[z]) if (area[z].hasOwnProperty(y)) {
        for (let x in area[z][y]) if (area[z][y].hasOwnProperty(x)) {
          App.Area[z][y][x] = area[z][y][x];
        }
      }
    }
    App.render();

    $('#wait', document).fadeOut('fast');
  },

  save: function () {
    if (typeof App.MapRangeX.From == 'undefined' || typeof App.MapRangeX.To == 'undefined' || typeof App.MapRangeY.From == 'undefined' || typeof App.MapRangeX.To == 'undefined') {
      alert('undefined zone');
      return;
    }
    $('#wait').fadeIn('fast');
    $.ajax({
      type: "POST",
      url: 'src/SaveArea.php',
      data: {
        Area: JSON.stringify(App.Area),
        BackupMapVersions: Config.BackupMapVersions
      },
      success: function (data) {
        alert(data);
        $('#wait').fadeOut('fast');
      }
    });
  },

  render: function () {
    let CTX;
    for (let z = Config.MinFloor; z <= Config.MaxFloor; z++) {

      // do not render not visible floors
      if (!(App.CurrentFloor - z < 5) || (App.CurrentFloor >= 0 && z < 0)) {
        continue;
      }

      CTX = App.Canvas.Floor[z].getContext('2d');
      CTX.clearRect(0, 0, App.Canvas.Floor[z].width, App.Canvas.Floor[z].height);
      CTX.globalAlpha = 0.50;
      CTX.fillStyle = "#000000";
      CTX.fillRect(0, 0, App.Canvas.Floor[z].width, App.Canvas.Floor[z].height);
      CTX.globalAlpha = 1;

      for (let y = App.MapRangeY.From; y <= App.MapRangeY.To; y++) {
        for (let x = App.MapRangeX.From; x <= App.MapRangeX.To; x++) {
          for (let stack in App.Area[z][y][x]) if (App.Area[z][y][x].hasOwnProperty(stack)) {
            let item = App.getItem(App.Area[z][y][x][stack]);
            let drawX = (x - App.MapRangeX.From) * Config.TileSize + (Config.TileSize - item.image.width);
            let drawY = (y - App.MapRangeY.From) * Config.TileSize + (Config.TileSize - item.image.height);

            // if highlighted
            if (App.HighlightedItem && x == App.HighlightedItem.X && y == App.HighlightedItem.Y && z == App.HighlightedItem.Z && item.id == App.HighlightedItem.Item.id && (parseInt(stack) + 1) === App.getTile(x,y,z).length) {
              CTX.drawImage(item.image, drawX - 6, drawY - 6);
              CTX.globalCompositeOperation = 'lighter';
              CTX.drawImage(item.image, drawX - 6, drawY - 6);
              CTX.globalCompositeOperation = 'source-over';
            } else {
              CTX.drawImage(item.image, drawX, drawY);
            }
          }
        }
      }

      // render cursor
      if (z === App.CurrentFloor) {
        let x = ((App.CursorPosition.X - App.MapRangeX.From) * Config.TileSize);
        let y = ((App.CursorPosition.Y - App.MapRangeY.From) * Config.TileSize);

        // tool pointer
        if (App.Tool === 0) {
          CTX.lineWidth = 1;
          CTX.strokeStyle = "#ffffff";
          CTX.strokeRect(x + 0.5, y + 0.5, (Config.TileSize-1), (Config.TileSize-1));
          CTX.strokeStyle = "#000000";
          CTX.strokeRect(x + 1, y + 1, (Config.TileSize-1), (Config.TileSize-1));
        }

        // tool brush/eraser
        if (App.Tool === 1 || App.Tool === 2) {
          if (App.BrushSize === 1) {
            if (App.Tool === 1 && App.SelectedItem) {
              CTX.drawImage(App.SelectedItem.image,
                x + Config.TileSize - App.SelectedItem.image.width, // right down corner of tile
                y + Config.TileSize - App.SelectedItem.image.height // right down corner of tile
              );
            }
            CTX.lineWidth = 1;
            CTX.strokeStyle = App.Tool === 1 ? "#ffffff" : '#ff0000';
            CTX.strokeRect(x + 0.5, y + 0.5, (Config.TileSize-1), (Config.TileSize-1));
            CTX.strokeStyle = "#000000";
            CTX.strokeRect(x + 1, y + 1, (Config.TileSize-1), (Config.TileSize-1));
          }
          if (App.BrushSize === 3) {
            if (App.Tool === 1 && App.SelectedItem) {
              for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                  CTX.drawImage(
                    App.SelectedItem.image,
                    x + Config.TileSize - App.SelectedItem.image.width + (i * Config.TileSize),
                    y + Config.TileSize - App.SelectedItem.image.height + (j * Config.TileSize)
                  );
                }
              }
            }
            CTX.lineWidth = 1;
            CTX.strokeStyle = App.Tool === 1 ? "#ffffff" : '#ff0000';
            CTX.strokeRect(x - Config.TileSize + 0.5, y - Config.TileSize + 0.5, (Config.TileSize-1) + (Config.TileSize*2), (Config.TileSize-1) + (Config.TileSize*2));
            CTX.strokeStyle = "#000000";
            CTX.strokeRect(x - Config.TileSize + 1, y - Config.TileSize + 1, (Config.TileSize-1) + (Config.TileSize*2), (Config.TileSize-1) + (Config.TileSize*2));
          }
        }
      }
    }

    let margin = (Config.MaxFloor - Config.MinFloor) * Config.TileSize;
    CTX = App.Canvas.General.getContext('2d');
    CTX.clearRect(0, 0, App.Canvas.General.width, App.Canvas.General.height);

    for (let z = Config.MinFloor; z <= Config.MaxFloor; z++) {
      // do not apply not visible floors
      if (!(App.CurrentFloor - z >= 5) && !(App.CurrentFloor >= 0 && z < 0)) {
        CTX.drawImage(App.Canvas.Floor[z], margin, margin);
      }
      margin = margin - Config.TileSize;
      if (z === App.CurrentFloor) {
        break;
      }
    }
  },

};
