import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { RequestCompetencyComponent } from './request-competency.component'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'

describe('RequestCompetencyComponent', () => {
  let component: RequestCompetencyComponent
  let fixture: ComponentFixture<RequestCompetencyComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [RequestCompetencyComponent],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestCompetencyComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
