import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { CurateComponent } from './curate.component'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'

describe('CurateComponent', () => {
  let component: CurateComponent
  let fixture: ComponentFixture<CurateComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [CurateComponent],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(CurateComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
