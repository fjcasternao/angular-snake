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

  key;

  snakeLength: Point[] = [];
  score = 0;
  timer;
  growthCount = 0;
  applePosition = new Point(0, 0);

  direction = null

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
    currentPos: { x: number, y: number }
  ) {
    // incase the context is not set
    if (!this.cx) { return; }

    // start our drawing path
    this.cx.beginPath();

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
    this.key = event.key;
    const newPosition = this.snakeLength[this.snakeLength.length - 1].clone();
    if (event.key === 'ArrowLeft') { // left
      this.direction = 'left'
    } else if (event.key === 'ArrowUp') { // up
      this.direction = 'up'
    } else if (event.key === 'ArrowRight') { // right
      this.direction = 'right'
    } else if (event.key === 'ArrowDown') { // down
      this.direction = 'down'
    }

    this.drawOnCanvas(this.snakeLength[this.snakeLength.length - 1], newPosition)
  }

  drawNewPosition() {
    const newPosition = this.snakeLength[this.snakeLength.length - 1].clone();
    if (this.direction === 'left') {
      newPosition.x -= 1;
    } else if (this.direction === 'up') {
      newPosition.y -= 1;
    } else if (this.direction === 'right') {
      newPosition.x += 1;
    } else if (this.direction === 'down') {
      newPosition.y += 1;
    } else {
      return;
    }

    if (!this.growthCount) {
      this.snakeLength.shift();
    } else {
      this.growthCount--;
    }

    console.log(newPosition)
    this.snakeLength.push(newPosition);
    this.drawSnake();
    this.checkAppleEating();
  }


  drawSnake() {
    this.cx.clearRect(0, 0, this.width, this.height);
    this.snakeLength.forEach((point, i) => {
      if ((i + 1) < this.snakeLength.length) {
        this.drawOnCanvas(point, this.snakeLength[i + 1])
      }
    })
  }

  checkAppleEating() {
    const snakeHead = this.snakeLength[this.snakeLength.length - 1];
    if (Math.abs(snakeHead.x - this.applePosition.x) < 3 && Math.abs(snakeHead.y - this.applePosition.y) < 3) {
      // Eat apple
      this.score++;
      this.growthCount += 10;
      this.generateApple();
    }
    this.drawApple(this.applePosition);
  }

  isValidPosition(destPoint: Point): boolean {

    if (destPoint.x > this.width || destPoint. x < 0 || destPoint.y < 0 || destPoint.y > this.height) {
      return false;
    }

    for (let i = 0; i < this.snakeLength.length; i++) {
      const snakeBody = this.snakeLength[i];
      if (snakeBody.isEqual(destPoint)) {
        console.log('Invalid position');
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

  initSnake() {
    this.snakeLength = [];
    for (let i = 0; i < 5; i++) {
      this.snakeLength.push(new Point(1 + i, 1));
    }
  }

  reset(): void {
    this.cx.clearRect(0, 0, this.width, this.height);
    this.direction = null;
    this.initSnake();
    this.generateApple();
    this.drawApple(this.applePosition);

    clearInterval(this.timer);

    this.timer = setInterval(() => {
      this.snakeIA();
      this.drawNewPosition();
    }, 8);
  }

  snakeIA(): void {
    const snakeHead = this.snakeLength[this.snakeLength.length - 1];
    const positions = this.getOptimumPositions(this.direction, snakeHead, this.applePosition);

    let validPosition = false;

    for (let i = 0; i < positions.length; i++) {
      const possiblePosition = positions[i];
      if (this.isValidPosition(possiblePosition)) {
        if (possiblePosition.x - snakeHead.x !== 0) {
          (possiblePosition.x - snakeHead.x) < 0 ? this.direction = 'left' : this.direction = 'right'
        } else if (possiblePosition.y - snakeHead.y !== 0) {
          (possiblePosition.y - snakeHead.y) < 0 ? this.direction = 'up' : this.direction = 'down'
        }
        console.log(positions[i]);
        validPosition = true;
        break;
      }
    }
    if (!validPosition) {
      console.error('Sin movimientos')
      clearInterval(this.timer);
    }
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



