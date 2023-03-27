import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { ChipsComponent } from './chips.component'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'

describe('ChipsComponent', () => {
  let component: ChipsComponent
  let fixture: ComponentFixture<ChipsComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [ChipsComponent],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ChipsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
