import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { IapAssessmentComponent } from './iap-assessment.component'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'

describe('IapAssessmentComponent', () => {
  let component: IapAssessmentComponent
  let fixture: ComponentFixture<IapAssessmentComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [IapAssessmentComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(IapAssessmentComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
