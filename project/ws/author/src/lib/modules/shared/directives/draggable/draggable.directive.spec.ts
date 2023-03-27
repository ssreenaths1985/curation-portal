import { DraggableDirective } from './draggable.directive'
import { TestBed } from '@angular/core/testing'
import { ElementRef } from '@angular/core'

describe('DraggableDirective', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [ElementRef],
  }))
  it('should create an instance', () => {
    // const directive = new DraggableDirective()
    const directive = TestBed.get(DraggableDirective)
    expect(directive).toBeTruthy()
  })
})
