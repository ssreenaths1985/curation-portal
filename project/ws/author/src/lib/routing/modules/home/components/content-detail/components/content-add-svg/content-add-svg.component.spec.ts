import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { AddContentSVGComponent } from './content-add-svg.component'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'

describe('AddContentSVGComponent', () => {
  let component: AddContentSVGComponent
  let fixture: ComponentFixture<AddContentSVGComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [AddContentSVGComponent],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AddContentSVGComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
