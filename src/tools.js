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
      if (App.BrushSize === 1) {
        App.drawOnTile(x, y, z);
      }
      if (App.BrushSize === 3) {
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            App.drawOnTile(x + j, y + i, z);
          }
        }
      }
    },
    onDrag: function(x, y, z) {
      if (App.BrushSize === 1) {
        App.drawOnTile(x, y, z);
      }
      if (App.BrushSize === 3) {
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            App.drawOnTile(x + j, y + i, z);
          }
        }
      }
    },
    onRender: function(x, y, z, CTX) {
      if (App.BrushSize === 1) {
        if (App.SelectedItem) {
          CTX.drawImage(App.SelectedItem.image,
            x + Config.TileSize - App.SelectedItem.image.width, // right down corner of tile
            y + Config.TileSize - App.SelectedItem.image.height // right down corner of tile
          );
        }
        CTX.lineWidth = 1;
        CTX.strokeStyle = "#ffffff";
        CTX.strokeRect(x + 0.5, y + 0.5, (Config.TileSize-1), (Config.TileSize-1));
        CTX.strokeStyle = "#000000";
        CTX.strokeRect(x + 1, y + 1, (Config.TileSize-1), (Config.TileSize-1));
      }
      if (App.BrushSize === 3) {
        if (App.SelectedItem) {
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
        CTX.strokeStyle = "#ffffff";
        CTX.strokeRect(x - Config.TileSize + 0.5, y - Config.TileSize + 0.5, (Config.TileSize-1) + (Config.TileSize*2), (Config.TileSize-1) + (Config.TileSize*2));
        CTX.strokeStyle = "#000000";
        CTX.strokeRect(x - Config.TileSize + 1, y - Config.TileSize + 1, (Config.TileSize-1) + (Config.TileSize*2), (Config.TileSize-1) + (Config.TileSize*2));
      }
    }
  },

  {
    name: 'eraser',
    sizing: true,
    onClick: function(x, y, z) {
      if (App.BrushSize === 1) {
        App.eraseOnTile(x, y, z);
      }
      if (App.BrushSize === 3) {
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            App.eraseOnTile(x + j, y + i, z, true);
          }
        }
      }
    },
    onDrag: function(x, y, z) {
      if (App.BrushSize === 1) {
        App.eraseOnTile(x, y, z);
      }
      if (App.BrushSize === 3) {
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            App.eraseOnTile(x + j, y + i, z, true);
          }
        }
      }
    },
    onRender: function(x, y, z, CTX) {
      if (App.BrushSize === 1) {
        CTX.lineWidth = 1;
        CTX.strokeStyle = '#ff0000';
        CTX.strokeRect(x + 0.5, y + 0.5, (Config.TileSize-1), (Config.TileSize-1));
        CTX.strokeStyle = "#000000";
        CTX.strokeRect(x + 1, y + 1, (Config.TileSize-1), (Config.TileSize-1));
      }
      if (App.BrushSize === 3) {
        CTX.lineWidth = 1;
        CTX.strokeStyle = '#ff0000';
        CTX.strokeRect(x - Config.TileSize + 0.5, y - Config.TileSize + 0.5, (Config.TileSize-1) + (Config.TileSize*2), (Config.TileSize-1) + (Config.TileSize*2));
        CTX.strokeStyle = "#000000";
        CTX.strokeRect(x - Config.TileSize + 1, y - Config.TileSize + 1, (Config.TileSize-1) + (Config.TileSize*2), (Config.TileSize-1) + (Config.TileSize*2));
      }
    }
  },
];
