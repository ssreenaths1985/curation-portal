import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { DetailedAreaComponent } from './detailed-area.component'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'

describe('DetailedAreaComponent', () => {
  let component: DetailedAreaComponent
  let fixture: ComponentFixture<DetailedAreaComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [DetailedAreaComponent],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailedAreaComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
