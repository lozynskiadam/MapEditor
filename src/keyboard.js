var Keyboard = {

  // [Cursor up] -> move map
  38: function() {
    if(App.RenderFromY === 0) return;
    App.RenderFromY--;
    App.render();
  },

  // [Cursor down] -> move map
  40: function() {
    App.RenderFromY++;
    App.render();
  },

  // [Cursor left] -> move map
  37: function() {
    if(App.RenderFromX === 0) return;
    App.RenderFromX--;
    App.render();
  },

  // [Cursor right] ->  move map
  39: function() {
    App.RenderFromX++;
    App.render();
  },

  // [Q] -> set tool pointer
  81: function() {
    App.setTool('pointer');
  },

  // [W] -> set tool brush
  87: function() {
    App.setTool('brush');
  },

  // [E] -> set tool eraser
  69: function() {
    App.setTool('eraser');
  },
  
  // [X] -> toggle primary/secondary item
  88: function() {
    let SelectedItem = App.SelectedItem;
    let SecondaryItem = App.SecondaryItem;
    if (SecondaryItem) {
      App.selectItem(SecondaryItem.id);
    }
    if (SelectedItem) {
      App.selectSecondaryItem(SelectedItem.id);
    }
    App.setTool('brush');
  },
  
  // [Tab] -> select hovered/highlighted item
  9: function() {
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
  },
  
  // [PgUp] -> higher floor
  33: function() {
    App.setCurrentFloor(App.CurrentFloor + 1);
  },
  
  // [PgDown] -> lower floor
  34: function() {
    App.setCurrentFloor(App.CurrentFloor - 1);
  },

  // [+] -> increase brush size
  61: function() {
    App.setBrushSize(App.BrushSize+1);
  },

  // [-] -> reduce brush size
  173: function() {
    App.setBrushSize(App.BrushSize-1);
  },

  // [Num. +] -> increase brush size
  107: function() {
    App.setBrushSize(App.BrushSize+1);
  },

  // [Num. -] -> reduce brush size
  109: function() {
    App.setBrushSize(App.BrushSize-1);
  },
  
  // [Shift] -> allow stacking items on same layer while drawing
  16: function() {
    App.ShiftDown = true;
    $('.content', document).css('cursor', 'alias');
  },
  
  // [Delete] -> remove highlighted item
  46: function() {
    if (App.HighlightedItem) {
      App.eraseOnTile(App.HighlightedItem.X,App.HighlightedItem.Y,App.HighlightedItem.Z);
      App.HighlightedItem = null;
    }
    else {
      App.eraseOnTile(App.CursorPosition.X,App.CursorPosition.Y,App.CurrentFloor);
    }
    App.render();
  },
}