import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { SliderComponent } from './slider.component'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'

describe('SliderComponent', () => {
  let component: SliderComponent
  let fixture: ComponentFixture<SliderComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [SliderComponent],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(SliderComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
