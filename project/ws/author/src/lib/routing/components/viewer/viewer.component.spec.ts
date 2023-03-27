import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { ViewerComponent } from './viewer.component'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'

describe('ViewerComponent', () => {
  let component: ViewerComponent
  let fixture: ComponentFixture<ViewerComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [ViewerComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewerComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
