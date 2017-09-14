import {
  Component, Input, ElementRef, AfterViewInit, ViewChild, HostListener, OnInit, OnDestroy
} from '@angular/core';

import { Subscription } from "rxjs/Subscription";
import 'rxjs/add/observable/fromEvent';
import { Observable } from "rxjs/Observable";



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
  @Input() public width = 400;
  @Input() public height = 400;

  key;

  position = {
    x: 200,
    y: 200
  }

  snakeLength = [
    {x: 200, y: 200}, {x: 201, y: 200}, {x: 202, y: 200}
  ]

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
    //this.captureEvents(canvasEl);
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
    let newPosition = { ...this.position };
    if (event.key === 'ArrowLeft') { // left
      this.direction = 'left'
    } else if (event.key === 'ArrowUp') { // up
      this.direction = 'up'
    } else if (event.key === 'ArrowRight') { // right
      this.direction = 'right'
    } else if (event.key === 'ArrowDown') { // down
      this.direction = 'down'
    }

    this.drawOnCanvas(this.position, newPosition)
    this.position = newPosition;
  }

  drawNewPosition() {
    const newPosition = { ...this.position };
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

    this.snakeLength.unshift();
    this.snakeLength.push(this.position);
    this.drawSnake();
    this.position = newPosition;
  }


  drawSnake() {
    this.cx.clearRect(0, 0, this.width, this.height);
    this.snakeLength.forEach((point, i) => {
      if ((i + 1) < this.snakeLength.length) {
        this.drawOnCanvas(point, this.snakeLength[i + 1])
      }
    })
  }


  reset(): void {
    this.cx.clearRect(0, 0, this.width, this.height);
    this.position = {
      x: 200,
      y: 200
    }
    this.direction = null;

    setInterval(() => {
      this.drawNewPosition(); }, 16);
    }

}


