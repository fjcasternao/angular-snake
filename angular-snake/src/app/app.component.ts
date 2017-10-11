import {
  Component, Input, ElementRef, AfterViewInit, ViewChild, HostListener, OnInit, OnDestroy
} from '@angular/core';

import 'rxjs/add/observable/fromEvent';
import { Point, Vector } from 'app/utils/vector';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  // tslint:disable-next-line:use-host-property-decorator
  host: {
    '(document:keydown)': 'handleKeyboardEvent($event)'
  }
})

export class AppComponent implements AfterViewInit {
  // a reference to the canvas element from our template
  @ViewChild('canvas') public canvas: ElementRef;

  // setting a width and height for the canvas
  @Input() public width = 200;
  @Input() public height = 200;

  snakePool: Snake[] = [];
  timer;
  applePosition = new Point(0, 0);

  private cx: CanvasRenderingContext2D;

  public ngAfterViewInit() {
    // get the context
    const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
    this.cx = canvasEl.getContext('2d');

    // set the width and height
    canvasEl.width = this.width;
    canvasEl.height = this.height;

    // set some default properties about the line
    this.cx.lineWidth = 3;
    this.cx.lineCap = 'round';
    this.cx.strokeStyle = '#000';

    // we'll implement this method to start capturing mouse events
    // this.captureEvents(canvasEl);
  }

  /*   private captureEvents(canvasEl: HTMLCanvasElement) {
      Observable
        // this will capture all mousedown events from teh canvas element
        .vent(canvasEl, 'mousedown')
        .switchMap((e) => {
          return Observable
            // after a mouse down, we'll record all mouse moves
            .vent(canvasEl, 'mousemove')
            // we'll stop (and unsubscribe) once the user releases the mouse
            // this will trigger a mouseUp event
            .takeUntil(Observable.vent(canvasEl, 'mouseup'))
            // pairwise lets us get the previous value to draw a line from
            // the previous point to the current point
            .pairwise()
        })
        .subscribe((res) => {
          const rect = canvasEl.getBoundingClientRect();

          // previous and current position with the offset
          const prevPos = {
            x: res[0].clientX - rect.left,
            y: res[0].clientY - rect.top
          };

          const currentPos = {
            x: res[1].clientX - rect.left,
            y: res[1].clientY - rect.top
          };

          // this method we'll implement soon to do the actual drawing
          this.drawOnCanvas(prevPos, currentPos);
        });
    } */

  private drawOnCanvas(
    prevPos: { x: number, y: number },
    currentPos: { x: number, y: number },
    color: string
  ) {
    // incase the context is not set
    if (!this.cx) { return; }

    // start our drawing path
    this.cx.beginPath();
    this.cx.strokeStyle = color // Math.round(Math.random()) > 0 ? color : 'white';
    // we're drawing lines so we need a previous position
    if (prevPos) {
      // sets the start point
      this.cx.moveTo(prevPos.x, prevPos.y); // from

      // draws a line from the start pos until the current position
      this.cx.lineTo(currentPos.x, currentPos.y);

      // strokes the current path with the styles we set earlier
      this.cx.stroke();
    }
  }

  @HostListener('document:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {

    if (event.key === 'ArrowLeft') { // left
      if (this.snakePool[0].direction !== 'right') {
        this.snakePool[0].direction = 'left'
      }
    } else if (event.key === 'ArrowUp') { // up
      if (this.snakePool[0].direction !== 'down') {
        this.snakePool[0].direction = 'up'
      }
    } else if (event.key === 'ArrowRight') { // right
      if (this.snakePool[0].direction !== 'left') {
        this.snakePool[0].direction = 'right'
      }
    } else if (event.key === 'ArrowDown') { // down
      if (this.snakePool[0].direction !== 'up') {
        this.snakePool[0].direction = 'down'
      }
    }

    switch (event.key) {
      case 'd': // d
        if (this.snakePool[1].direction !== 'left') {
          this.snakePool[1].direction = 'right'
        }
        break;
      case 's': // s
        if (this.snakePool[1].direction !== 'up') {
          this.snakePool[1].direction = 'down'
        }
        break;
      case 'a': // a
        if (this.snakePool[1].direction !== 'right') {
          this.snakePool[1].direction = 'left'
        }
        break;
      case 'w': // w

        if (this.snakePool[1].direction !== 'down') {
          this.snakePool[1].direction = 'up'
        }
        break;
    }

    //this.drawOnCanvas(this.snakeLength[this.snakeLength.length - 1], newPosition)
  }

  drawNewPosition(snake: Snake) {

    const newPosition = snake.getHead().clone();
    if (snake.direction === 'left') {
      newPosition.x -= 1;
    } else if (snake.direction === 'up') {
      newPosition.y -= 1;
    } else if (snake.direction === 'right') {
      newPosition.x += 1;
    } else if (snake.direction === 'down') {
      newPosition.y += 1;
    } else {
      return;
    }

    if (!snake.growthCount) {
      snake.snakeLength.shift();
    } else {
      snake.growthCount--;
    }

    if (this.isValidPosition(newPosition)) {
      snake.snakeLength.push(newPosition);
      this.drawSnake(snake);
      this.checkAppleEating(snake);
    } else {

      clearInterval(this.timer);
      //this.removeSnake(snake);
    }

  }


  drawSnake(snake: Snake) {
    snake.snakeLength.forEach((point, i) => {
      if ((i + 1) < snake.snakeLength.length) {
        this.drawOnCanvas(point, snake.snakeLength[i + 1], snake.color)
      }
    })
  }

  checkAppleEating(snake: Snake) {
    const snakeHead = snake.getHead();
    if (Math.abs(snakeHead.x - this.applePosition.x) < 3 && Math.abs(snakeHead.y - this.applePosition.y) < 3) {
      // Eat apple
      snake.score++;
      snake.growthCount += 10;
      this.generateApple();
    }
    this.drawApple(this.applePosition);
  }

  isValidPosition(destPoint: Point): boolean {

    if (destPoint.x > this.width || destPoint.x < 0 || destPoint.y < 0 || destPoint.y > this.height) {
      return false;
    }

    for (let i = 0; i < this.snakePool.length; i++) {
      const snake = this.snakePool[i];
      if (snake.hasPoint(destPoint)) {
        return false;
      }
    }
    return true;
  }

  generateApple() {
    this.applePosition = new Point(Math.round(Math.random() * 200), Math.round(Math.random() * 200));
  }

  drawApple(applePosition) {
    this.cx.fillStyle = 'red';
    this.cx.fillRect(applePosition.x, applePosition.y, 3, 3); // fill in the pixel at (10,10)
  }


  reset(): void {
    this.cx.clearRect(0, 0, this.width, this.height);

    this.snakePool = [];

    const colors = ['#e61cdd', '#7a520b', 'green', 'yellow', 'black'];

    for (let i = 0; i < 1; i++) {
      const snake = new Snake(new Point(30 * i, 30 * i), colors[i], i);
      this.snakePool.push(snake);
    }

    /*  const snake1 = new Snake(new Point(1, 1), '#1dcfbf');
        this.snakePool.push(snake1);

        const snake2 = new Snake(new Point(100, 1), 'blue');
        this.snakePool.push(snake2);
     */
    this.generateApple();
    this.drawApple(this.applePosition);

    clearInterval(this.timer);

    this.timer = setInterval(() => {
      this.cx.clearRect(0, 0, this.width, this.height);
      this.snakePool.forEach((snake, index) => {
        //this.cx.clearRect(0, 0, this.width, this.height);
        //this.snakeIA(snake);
        this.drawNewPosition(snake);
      })
    }, 16);
  }

  snakeIA(snake: Snake): void {
    const snakeHead = snake.getHead();
    const positions = this.getOptimumPositions(snake.direction, snakeHead, this.applePosition);

    let validPosition = false;
    for (let i = 0; i < positions.length; i++) {
      const possiblePosition = positions[i];
      if (this.isValidPosition(possiblePosition)) {
        if (possiblePosition.x - snakeHead.x !== 0) {
          (possiblePosition.x - snakeHead.x) < 0 ? snake.direction = 'left' : snake.direction = 'right'
        } else if (possiblePosition.y - snakeHead.y !== 0) {
          (possiblePosition.y - snakeHead.y) < 0 ? snake.direction = 'up' : snake.direction = 'down'
        }
        validPosition = true;
        break;
      }
    }
    if (!validPosition) {
      console.error('Sin movimientos')
      this.removeSnake(snake);
      //  TODO: sacar la culebra del array
      if (this.snakePool.length === 0) {
        clearInterval(this.timer);
      }
    }
  }

  removeSnake(snake: Snake) {
    this.snakePool.splice(this.snakePool.indexOf(snake), 1);
  }

  getOptimumPositions(direction: string, presentPosition: Point, desiredPosition: Point) {
    const posiblePositions = this.getPossiblePositions(direction, presentPosition);
    const dirVector = new Vector(desiredPosition.x - presentPosition.x, desiredPosition.y - presentPosition.y);
    const minDirection = dirVector.maxAxis();

    let sortingPre
    if (minDirection === 'x') {
      sortingPre = presentPosition[minDirection] - desiredPosition[minDirection] < 0 ? '-' : ''
    } else {
      sortingPre = presentPosition[minDirection] - desiredPosition[minDirection] < 0 ? '-' : ''
    }
    return posiblePositions.sort(this.dynamicSort(sortingPre + minDirection));
  }

  dynamicSort(property) {
    let sortOrder = 1;
    if (property[0] === '-') {
      sortOrder = -1;
      property = property.substr(1);
    }
    return function (a, b) {
      const result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
      return result * sortOrder;
    }
  }


  getPossiblePositions(direction: string, presentPosition: Point): Point[] {
    switch (direction) {
      case 'left':
        return [
          new Point(presentPosition.x - 1, presentPosition.y),
          new Point(presentPosition.x, presentPosition.y + 1),
          new Point(presentPosition.x, presentPosition.y - 1),
        ];
      case 'right':
        return [
          new Point(presentPosition.x + 1, presentPosition.y),
          new Point(presentPosition.x, presentPosition.y + 1),
          new Point(presentPosition.x, presentPosition.y - 1),
        ];

      case 'up':
        return [
          new Point(presentPosition.x, presentPosition.y - 1),
          new Point(presentPosition.x + 1, presentPosition.y),
          new Point(presentPosition.x - 1, presentPosition.y),
        ];

      case 'down':
        return [
          new Point(presentPosition.x, presentPosition.y + 1),
          new Point(presentPosition.x + 1, presentPosition.y),
          new Point(presentPosition.x - 1, presentPosition.y),
        ];
      default:
        return [
          new Point(presentPosition.x, presentPosition.y - 1),
          new Point(presentPosition.x, presentPosition.y + 1),
          new Point(presentPosition.x + 1, presentPosition.y),
        ];
    }

  }


}


export class Snake {
  snakeLength: Point[] = [];
  growthCount = 0;
  score: 0;
  color: string;
  id: number;
  _direction = 'down';

  constructor(startingPoint: Point, color: string, id: number) {
    this.initSnake(startingPoint);
    this.color = color;
    this.id = id;
  }

  private initSnake(startingPoint: Point) {
    this.snakeLength = [];
    for (let i = 0; i < 5; i++) {
      this.snakeLength.push(new Point(startingPoint.x + i, startingPoint.y));
    }
  }

  hasPoint(destPoint: Point): boolean {
    for (let i = 0; i < this.snakeLength.length; i++) {
      const snakeBody = this.snakeLength[i];
      if (snakeBody.isEqual(destPoint)) {
        return true;
      }
    }
    return false;
  }

  getHead(): Point {
    return this.snakeLength[this.snakeLength.length - 1];
  }

  public get direction(): string {
    return this._direction;
  }

  public set direction(value: string) {
    this._direction = value;
  }

}



