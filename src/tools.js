var Tools = [

  {
    name: 'pointer',
    sizing: false,
    onClick: function(x, y, z) {
      App.highlightOnTile(x, y, z);
    },
    onRender: function(x, y, z, CTX) {
      CTX.lineWidth = 1;
      CTX.strokeStyle = "#ffffff";
      CTX.strokeRect(x + 0.5, y + 0.5, (Config.TileSize-1), (Config.TileSize-1));
      CTX.strokeStyle = "#000000";
      CTX.strokeRect(x + 1, y + 1, (Config.TileSize-1), (Config.TileSize-1));
    }
  },

  {
    name: 'brush',
    sizing: true,
    onClick: function(x, y, z) {
      for (let i = -(App.BrushSize-1); i <= (App.BrushSize-1); i++) {
        for (let j = -(App.BrushSize-1); j <= (App.BrushSize-1); j++) {
          App.drawOnTile(x + j, y + i, z);
        }
      }
    },
    onDrag: function(x, y, z) {
      for (let i = -(App.BrushSize-1); i <= (App.BrushSize-1); i++) {
        for (let j = -(App.BrushSize-1); j <= (App.BrushSize-1); j++) {
          App.drawOnTile(x + j, y + i, z);
        }
      }
    },
    onRender: function(x, y, z, CTX) {
      if (App.SelectedItem) {
        for (let i = -(App.BrushSize-1); i <= (App.BrushSize-1); i++) {
          for (let j = -(App.BrushSize-1); j <= (App.BrushSize-1); j++) {
            CTX.drawImage(
              App.SelectedItem.image,
              x + Config.TileSize - App.SelectedItem.image.width + (i * Config.TileSize),
              y + Config.TileSize - App.SelectedItem.image.height + (j * Config.TileSize)
            );
            CTX.strokeStyle = "#ffffff";
            CTX.strokeRect(x + (i * Config.TileSize) + 0.5, y + (j * Config.TileSize) + 0.5, (Config.TileSize-1), (Config.TileSize-1));
            CTX.strokeStyle = "#000000";
            CTX.strokeRect(x + (i * Config.TileSize) + 1, y + (j * Config.TileSize) + 1, (Config.TileSize-1), (Config.TileSize-1));
          }
        }
      }
    }
  },

  {
    name: 'eraser',
    sizing: true,
    onClick: function(x, y, z) {
      for (let i = -(App.BrushSize-1); i <= (App.BrushSize-1); i++) {
        for (let j = -(App.BrushSize-1); j <= (App.BrushSize-1); j++) {
          App.eraseOnTile(x + j, y + i, z, App.BrushSize > 1);
        }
      }
    },
    onDrag: function(x, y, z) {
      for (let i = -(App.BrushSize-1); i <= (App.BrushSize-1); i++) {
        for (let j = -(App.BrushSize-1); j <= (App.BrushSize-1); j++) {
          App.eraseOnTile(x + j, y + i, z, App.BrushSize > 1);
        }
      }
    },
    onRender: function(x, y, z, CTX) {
      for (let i = -(App.BrushSize-1); i <= (App.BrushSize-1); i++) {
        for (let j = -(App.BrushSize-1); j <= (App.BrushSize-1); j++) {
          CTX.strokeStyle = "#ff0000";
          CTX.strokeRect(x + (i * Config.TileSize) + 0.5, y + (j * Config.TileSize) + 0.5, (Config.TileSize-1), (Config.TileSize-1));
          CTX.strokeStyle = "#000000";
          CTX.strokeRect(x + (i * Config.TileSize) + 1, y + (j * Config.TileSize) + 1, (Config.TileSize-1), (Config.TileSize-1));
        }
      }
    }
  },

  {
    name: 'sampler',
    sizing: false,
    cursor: 'crosshair',
    onClick: function(x, y, z) {
      if (!App.getTile(x,y,z) || App.getTile(x,y,z).length === 0) {
        return;
      }
      let itemId = App.getTile(x,y,z).slice(-1)[0];
      App.selectItem(itemId);
    },
    onDrag: function(x, y, z) {
      if (!App.getTile(x,y,z) || App.getTile(x,y,z).length === 0) {
        return;
      }
      let itemId = App.getTile(x,y,z).slice(-1)[0];
      App.selectItem(itemId);
    },
    onRender: function(x, y, z, CTX) {
      CTX.lineWidth = 1;
      CTX.strokeStyle = "#ffffff";
      CTX.strokeRect(x + 0.5, y + 0.5, (Config.TileSize-1), (Config.TileSize-1));
      CTX.strokeStyle = "#000000";
      CTX.strokeRect(x + 1, y + 1, (Config.TileSize-1), (Config.TileSize-1));
    }
  },
];
