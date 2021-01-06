var App = {

  Items: [],
  Map: {},
  Canvas: {
    General: null,
    Floor: {}
  },
  CursorPosition: {
    X: 0,
    Y: 0,
  },

  SelectedTool: null,
  SelectedItem: null,
  SecondaryItem: null,
  HighlightedItem: null,
  BrushSize: null,
  ShiftDown: false,
  CurrentFloor: 0,
  RenderFromX: 0,
  RenderFromY: 0,

  init: function () {
    App.Canvas.General = document.getElementById('map');
    App.loader();
  },

  setCanvasSize: function() {
    App.Canvas.General.width = document.querySelector('.content').clientWidth;
    App.Canvas.General.height = document.querySelector('.content').clientHeight;
    for (let z in App.Canvas.Floor) if(App.Canvas.Floor.hasOwnProperty(z)) {
      App.Canvas.Floor[z].width = App.Canvas.General.width;
      App.Canvas.Floor[z].height = App.Canvas.General.height;
    }
    App.render();
  },

  loader: function () {
    typeof window.LoadingIndex == 'undefined' ? window.LoadingIndex = 1 : window.LoadingIndex++;
    let L = window.LoadingIndex;

    L === 1 && App.loadItems();
    L === 2 && App.fillPalette();
    L === 3 && App.setFloors();
    L === 4 && App.finishLoading();
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
    let layers = [];

    for(const item of App.Items) {
      html = [];
      html.push('<div class="item-select" data-item-layer="' + item.layer + '" data-item-id="' + item.id + '" data-item-name="' + item.name + '">');
      html.push('  <img src="' + item.image.src + '"/>');
      html.push('</div>');
      if(!layers.includes(item.layer)) layers.push(item.layer);
      $('.palette', document).append(html.join(''));
    }
    for(const layer of layers) {
      $('.layer-list', document).append($('<option/>').attr('value', layer).text(layer));
    }
    App.refreshPalette();

    App.loader();
  },

  setFloors: function () {
    for (let z = Config.MinFloor; z <= Config.MaxFloor; z++) {
      App.Canvas.Floor[z] = document.createElement('canvas');
    }
    App.loader();
  },

  finishLoading: function () {
    App.setTool('pointer');
    App.setBrushSize(1);
    App.setCanvasSize();
    Events();
    $('body', document).removeClass('loading');
  },

  setBrushSize: function (size) {
    if(size < 1 || size > 4) {
      return;
    }
    App.BrushSize = size;
    $('#BrushSize', document).val(size);
    App.render();
  },

  refreshPalette: function () {
    let layer = $('.layer-list', document).val();
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
    if(!App.Map[z] || !App.Map[z][y] || !App.Map[z][y][x]) {
      return null;
    }
    return App.Map[z][y][x];
  },

  selectItem: function (id) {
    let item = App.getItem(id);
    if (!item) return;
    App.SelectedItem = item;
    $('.selected-item-image', document).html('<img alt="' + item.id + '" src="' + item.image.src + '"/>');
    $('.selected-item-details', document).html(item.name + ' (' + item.id + ')');
  },

  selectSecondaryItem: function (id) {
    let item = App.getItem(id);
    if (!item) return;
    App.SecondaryItem = item;
    $('.secondary-item-image', document).html('<img alt="' + item.id + '" src="' + item.image.src + '"/>');
  },

  setTool: function(name) {
    let tool = Tools.filter(tool => tool.name === name)[0];
    if(!tool) return;

    App.SelectedTool = tool;
    App.HighlightedItem = null;
    tool.sizing ? $('#BrushSize', document).show() : $('#BrushSize', document).hide();
    $('[data-tool]', document).removeClass('active');
    $('[data-tool="' + tool.name + '"]', document).addClass('active');
    App.render();
  },

  setCurrentFloor: function(z) {
    if(z < Config.MinFloor || z > Config.MaxFloor) return;
    App.CurrentFloor = z;
    $('.pos-z', document).text('Z: ' + App.CurrentFloor);
    App.render();
  },

  drawOnTile: function (x, y, z) {
    if (!App.SelectedItem || x < 0 || y < 0 || z < Config.MinFloor || z > Config.MaxFloor) {
      return;
    }
    if (!App.getTile(x,y,z)) {
        App.Map[z] = App.Map[z] || {};
        App.Map[z][y] = App.Map[z][y] || {};
        App.Map[z][y][x] = App.Map[z][y][x] || [];
    }
    let drawn = false;

    // Map editor allows to draw only one item of type on each tile (unless its not a ground and "shift" is pressed)
    if (!App.ShiftDown) {
      for (let key in App.Map[z][y][x]) if (App.Map[z][y][x].hasOwnProperty(key)) {
        let item = App.getItem(App.Map[z][y][x][key]);
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

  eraseOnTile: function (x, y, z, hardClear = false) {
    let tile = App.getTile(x,y,z);
    if (!tile || tile.length === 0) {
      return;
    }
    let itemId = App.getTile(x,y,z)[(tile.length - 1)];
    if (!hardClear && App.getItem(itemId).layer === 'ground' && !App.HighlightedItem) {
      return;
    }
    hardClear ? tile.length = 0 : tile.pop();

    if(tile.length === 0) {
      delete App.Map[z][y][x];
      if(Object.keys(App.Map[z][y]).length === 0) delete App.Map[z][y];
      if(Object.keys(App.Map[z]).length === 0) delete App.Map[z];
    }
  },

  highlightOnTile: function (x, y, z) {
    if (!App.Map[z] || !App.Map[z][y] || !App.Map[z][y][x] || App.Map[z][y][x].length === 0) {
      return;
    }
    App.HighlightedItem = {Item: App.getItem(App.Map[z][y][x].slice(-1)[0]), X: x, Y: y, Z: z};
    App.render();
  },

  import: function () {
    let file = document.createElement("input")
    file.type = "file"
    file.accept = "application/JSON"
    file.addEventListener('change', (event) => {
      let reader = new FileReader();
      reader.onload = function(event) {
        try {
          App.Map = JSON.parse(event.target.result);
        } catch(e) {
          alert('Selected file is not a valid map editor file');
        }
        App.RenderFromX = 0;
        App.RenderFromY = 0;
        App.render();
      };
      reader.readAsText(event.target.files[0]);
    });
    file.click();
  },

  export: function () {
    let file = document.createElement("a")
    file.download = "map.json"
    file.href = URL.createObjectURL(new Blob([JSON.stringify(App.Map, null, 2)]))
    file.click()
  },

  render: function () {
    let CTX;
    for (let z = Config.MinFloor; z <= Config.MaxFloor; z++) {

      // do not render not visible floors
      if (!(App.CurrentFloor - z < 5) || (App.CurrentFloor >= 0 && z < 0)) {
        continue;
      }

      CTX = App.Canvas.Floor[z].getContext('2d');
      CTX.lineWidth = 1;
      CTX.clearRect(0, 0, App.Canvas.Floor[z].width, App.Canvas.Floor[z].height);
      if(z !== 0 && z !== Config.MinFloor) {
        CTX.globalAlpha = 0.50;
      }
      CTX.fillStyle = "#000000";
      CTX.fillRect(0, 0, App.Canvas.Floor[z].width, App.Canvas.Floor[z].height);
      CTX.globalAlpha = 1;

      for (let y = App.RenderFromY; y <= App.RenderFromY + 100; y++) {
        for (let x = App.RenderFromX; x <= App.RenderFromX + 100; x++) {
          if(!App.getTile(x,y,z)) {
            continue;
          }
          for (let stack in App.Map[z][y][x]) if (App.Map[z][y][x].hasOwnProperty(stack)) {
            let item = App.getItem(App.Map[z][y][x][stack]);
            let drawX = (x - App.RenderFromX) * Config.TileSize + (Config.TileSize - item.image.width);
            let drawY = (y - App.RenderFromY) * Config.TileSize + (Config.TileSize - item.image.height);

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

      // render tool
      if (z === App.CurrentFloor && App.SelectedTool.onRender) {
        let x = ((App.CursorPosition.X - App.RenderFromX) * Config.TileSize);
        let y = ((App.CursorPosition.Y - App.RenderFromY) * Config.TileSize);
        App.SelectedTool.onRender(x,y,z,CTX);
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
