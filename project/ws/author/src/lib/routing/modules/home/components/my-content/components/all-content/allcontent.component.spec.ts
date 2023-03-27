import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { AllContentComponent } from './all-content.component'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'

describe('AllContentComponent', () => {
  let component: AllContentComponent
  let fixture: ComponentFixture<AllContentComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [AllContentComponent],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AllContentComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
