import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { SurveysBaseComponent } from './surveys-base.component'

describe('SurveysBaseComponent', () => {
  let component: SurveysBaseComponent
  let fixture: ComponentFixture<SurveysBaseComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SurveysBaseComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(SurveysBaseComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
