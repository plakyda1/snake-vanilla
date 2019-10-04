const CELL_TYPES = {
  SNAKE_TAIL: {
    name: 'SNAKE_TAIL',
    className: 'tail'
  },
  SNAKE_HEAD: {
    name: 'SNAKE_HEAD',
    className: 'head'
  },
  SNAKE_BODY: {
    name: 'SNAKE_BODY',
    className: 'body'
  }
};

const GAME_MODES = {
  easy: {
    speed: 200,
    size: {
      x: 15,
      y: 15
    }
  }
};

const DIRECTIONS = {
  left: {
    name: 'left',
    newAxis: 'y',
    plus: -1
  },
  up: {
    name: 'up',
    newAxis: 'x',
    plus: -1
  },
  right: {
    name: 'right',
    newAxis: 'y',
    plus: +1
  },
  down: {
    name: 'down',
    newAxis: 'x',
    plus: +1
  }
};

const CODES_DIRECTIONS = {
  37: 'left',
  38: 'up',
  39: 'right',
  40: 'down',
};

class Game {
  constructor(mode = GAME_MODES.easy) {
    this.mode = mode;
    this.Field = new Field(this.mode.size);
    this.Snake = new Snake({size: 4});

    this.Snake.setFieldSize(this.mode.size);
    this.startGame({speed: this.mode.speed});
  }

  startGame({speed}){
    this.Field.drawFigure(this.Snake.currentSnakePosition);

    this.moveSnake(speed)
  }

  moveSnake(speed){
    setInterval(()=>{
      this.Field.clearFigure(this.Snake.currentSnakePosition);
      this.Snake.moveExistingSnake();
      this.Field.drawFigure(this.Snake.currentSnakePosition);
    }, speed)
  }


  endGame(){

  }
}

class Field {
  constructor({x, y}) {
    this.x = x;
    this.y = y;
    this.fieldElementsObj = {};

    this.fieldDOM = document.getElementById('field');
    this.field = Field.generateField({x, y});
    this._renderField(this.field);
  }

  static generateField({x, y}){
    const field = [];

    for(let i = 0; i < x; i++){
      let row = [];

      for (let j = 0;  j < y; j++ ){
        row.push({x: i, y: j})
      }

      field.push(row)
    }

    return field;
  }

  _renderField(field){
    const wrapper = document.createElement('div');

    field.forEach((row) => {
     let rowNode = this._createRow(row);
     wrapper.appendChild(rowNode)
    });

    this.fieldDOM.appendChild(wrapper);
  }

  _createRow(list){
    let row = document.createElement('div');
    row.classList.add('row');

    list.forEach((cellCoords) => {
      let cell = Cell.createCell(cellCoords);
      let cellKey = Cell.getCellKey(cellCoords);

      this.fieldElementsObj[cellKey] = row.appendChild(cell);
    });

    return row;
  }

  _drawCell({x, y, cellType}){
      const key = Cell.getCellKey({x, y});

      const cellElement = this.fieldElementsObj[key];
      
      cellElement.classList.add(CELL_TYPES[cellType].className);
      cellElement.dataset.cellType = cellType; 
  }

  _clearCell({x, y}){
    const key = Cell.getCellKey({x, y});

    const cellElement = this.fieldElementsObj[key];
    const cellType = cellElement.dataset.cellType || false;

    if (cellType) cellElement.classList.remove(CELL_TYPES[cellType].className);
  }

  drawFigure(arrayOfCells = []){
    if(!Array.isArray(arrayOfCells)) return console.error('Only Arrays');

    arrayOfCells.forEach((cellObj) => this._drawCell(cellObj))
  }

  clearFigure(arrayOfCells = []){
    arrayOfCells.forEach((cellObj) => this._clearCell(cellObj))
  }

}

class Cell {

  static createCell({x, y}){
    let cell = document.createElement('div');

    cell.dataset.x = x;
    cell.dataset.y = y;

    return cell
  }

  static getCellKey({x, y}){
    // if(!x || !y){
    //   console.error('No all data to generate key');
    // }
    return `${x}_${y}`
  }

  static parseCellKey(key){
    let [x,y] = key.split('_');
    return {x, y}
  }
}

class Snake {
  constructor({size}){
    this.size = size;
    this.snake = [];
    this.direction = DIRECTIONS.down;

    this.snake = this.generateSnake({size});
    this.addKeyEventsLiteners();
  }

  setFieldSize(size){
    this.fieldSize = size;
  }

  get currentSnakePosition() {
    return this.snake;
  }

  _getSnakeStartPosition(){
    return {x: 0, y: 0}
  }

  generateSnake({size}){
    let snakeTailCoords = this._getSnakeStartPosition();

    let snakeHeadCoords = {
      x: size+snakeTailCoords.x-1,
      y: snakeTailCoords.y
    };

    let snakeFiguresArray = [];

    for (let i = snakeTailCoords.x; i <= snakeHeadCoords.x; i++) {
      let type = CELL_TYPES.SNAKE_BODY.name;
      if (i === snakeTailCoords.x) type = CELL_TYPES.SNAKE_TAIL.name;
      if (i === snakeHeadCoords.x) type = CELL_TYPES.SNAKE_HEAD.name;

      snakeFiguresArray.push({
        x: i,
        y: snakeTailCoords.y,
        cellType: type,
        direction: this.direction
      })
    }

    return snakeFiguresArray;
  }

  moveExistingSnake(direction = this.direction){
    this.snake = this.snake.map(({cellType, direction, ...coords}, i) => {
      let newDirectionObj = this.snake[i+1] && this.snake[i+1].direction || this.direction;
      let changeableAxisName = newDirectionObj.newAxis;
      let otherAxisName = changeableAxisName === 'x' ? 'y' : 'x';
      let newChangeableAxisNameValue = coords[changeableAxisName]+newDirectionObj.plus;

      // задаємо 0 позицію якщо нова позиція більша розміру поля цієї осі
      if (newChangeableAxisNameValue >= this.fieldSize[changeableAxisName])  { newChangeableAxisNameValue = 0; }
      // задаємо "розмір осі -1" позицію якщо нова позиція менше початку осі (0)
      if (newChangeableAxisNameValue < 0) { newChangeableAxisNameValue = this.fieldSize[changeableAxisName]-1; }

      let newData = {
        [changeableAxisName]: newChangeableAxisNameValue,
        [otherAxisName]: coords[otherAxisName],
        cellType: cellType,
        direction: newDirectionObj,
      };

      console.log(newData);

      return newData;
    });
  }

  renderSnake(){}

  addKeyEventsLiteners(){
    window.onkeyup = (e) => {
      const key = e.keyCode.toString();
      if(!CODES_DIRECTIONS[key]) return;

      this.direction = DIRECTIONS[CODES_DIRECTIONS[key]];
    }
  }

  moveSnake(direction){}

}


window.onload = () => {
  window.game  = new Game()
};

