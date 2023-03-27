import {
  Component,
  OnInit,
  OnChanges,
  Input,
  ViewChild,
  ElementRef,
  ViewEncapsulation,
  Output,
  EventEmitter,
} from '@angular/core'
import { DomSanitizer, SafeHtml } from '@angular/platform-browser'

@Component({
  selector: 'ws-widget-svg-editor',
  templateUrl: './svg-editor.component.html',
  styleUrls: ['./svg-editor.component.scss'],
  // tslint:disable-next-line
  encapsulation: ViewEncapsulation.None,
})
export class SvgEditorComponent implements OnInit, OnChanges {
  @ViewChild('wrapper', { static: true }) wrapper!: ElementRef
  @ViewChild('insert', { static: true }) insert!: ElementRef
  @Input() svg!: string
  @Output() svgChange = new EventEmitter<string>()

  isChecked = true
  state!: string
  svgSafe!: SafeHtml
  activeElement!: HTMLElement
  details!: string
  // tslint:disable-next-line: max-line-length
  correctPath = 'M14.84,17.3l.19-.12c1.59-1,2.29-2.09,2.1-3.29S15.69,11.71,14.34,11a8.4,8.4,0,0,0,1.8-4.49,3.7,3.7,0,0,0-1.53-3,4.27,4.27,0,0,0-2.46-.66,6.09,6.09,0,0,0-5.23,4.8C6.78,8.59,6.8,10.89,10,12l.12,0,.33.08a43.4,43.4,0,0,1-5.19,4.7L6.7,18.64a45.25,45.25,0,0,0,6.17-5.73c1.15.5,1.92,1,2,1.35,0,0,0,.35-1,1a2.49,2.49,0,0,0-1.33,1.65,3.24,3.24,0,0,0,1,2.45A15.5,15.5,0,0,0,15.4,21l.72-1.39.43-.6c-.2-.15-1.18-1-1.32-1.18A4.18,4.18,0,0,1,14.84,17.3Zm-2.71-7.12c-.56-.18-1.06-.3-1.39-.38C9,9.19,9.15,8.29,9.19,8a3.86,3.86,0,0,1,3-2.85,2.33,2.33,0,0,1,1,.2,1.41,1.41,0,0,1,.63,1.21A6.94,6.94,0,0,1,12.13,10.18Z'

  incorrectStr = '18 8 16 6 12 10 8 6 6 8 10 12 6 16 8 18 12 14 16 18 18 16 14 12 18 8'

  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit() { }

  ngOnChanges(changes: any) {
    const svg = changes.svg.currentValue

    if (svg) {
      this.svgSafe = this.sanitizer.bypassSecurityTrustHtml(this.svg)
      // this.wrapper.nativeElement.innerHTML = this.svgSafe
    }
  }

  action(event: any) {
    this.activeElement = event.target

    this.details = event.target.id
    const states = event.target.closest('.states')

    if (states) {
      states.parentElement.removeChild(states)
    } else if (this.isChecked) {
      this.addIcons(event)
      // this.isChecked = false
    }
  }

  addIcons(event: any) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')

    g.classList.add('states')
    if (event.target && event.target.id) {
      g.classList.add(event.target.id)
    }

    const svg = this.wrapper.nativeElement.querySelector('svg')
    const viewBox = svg.getAttribute('viewBox').split(' ')
    const offset = svg.getBoundingClientRect()
    const ratio = (viewBox[2]) / offset.width

    const x = Math.floor((event.pageX - offset.x) * ratio + -viewBox[0])
    const y = Math.floor((event.pageY - offset.y) * ratio + -viewBox[1])

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
    circle.setAttribute('cx', (x + 2 * viewBox[0]).toString())
    circle.setAttribute('cy', (y + 2 * viewBox[1]).toString())
    circle.setAttribute('r', '3')
    circle.setAttribute('fill', 'none')

    g.appendChild(circle)
    /*
        const tp = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        tp.setAttribute('fill', 'F7931E')
        tp.setAttribute('stroke', '#000')
        tp.setAttribute('d', 'M37,17v15H14V17z M50,0H0v50h50z')
        tp.setAttribute('transform', `scale(.1) translate(${x}, ${y})`)
        svg.appendChild(tp)
      */

    /*
          const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')

          path.setAttribute('fill', 'green')
          path.setAttribute('d', this.correctPath)
          path.setAttribute('style', 'transform-origin: center')

          g.appendChild(path)
          let tpo = path.getBoundingClientRect()

          let cw = tpo.width * ratio - .5
          let ch = tpo.height/1.5 * ratio - .4

          path.setAttribute('transform', `translate(${x - cw - 12}, ${y - ch - 12}) scale(.25)`)
      */

    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon')

    // const tpo = polygon.getBoundingClientRect()
    // tslint:disable
    // const cw = tpo.width * ratio
    // const ch = tpo.height * ratio
    // tslint:enable
    polygon.setAttribute('fill', 'red')
    polygon.setAttribute('points', this.transformCross(x, y))// this.transformCross(x , y ))
    // polygon.setAttribute('style', 'transform-origin: center')
    polygon.setAttribute('transform', 'scale(1)')
    g.appendChild(polygon)
    // polygon.setAttribute('transform', `translate(${x - cw - 12}, ${y - ch - 12}) scale(.3)`)

    svg.appendChild(g)

    this.svgChange.emit(this.wrapper.nativeElement.innerHTML)
  }

  transformCross(x: any, y: any): string {
    const coords = this.incorrectStr.split(' ')
    let output = ''

    for (let i = 0; i < coords.length; i += 2) {
      // console.log('XXXX: ' + x + ' -> ' + parseInt(coords[i] + ' ==== ' + (x + coords[i])))
      output += ` ${x + parseInt(coords[i], 10)} ${y + parseInt(coords[i + 1], 10)}`
    }
    // console.log(output)
    return output
  }

  update(event: any): void {
    const value = event.target.value
    this.activeElement.id = value
    this.svgChange.emit(this.wrapper.nativeElement.innerHTML)
  }
}
