import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { ContentInsightsComponent } from './content-Insights.component'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'

describe('ContentInsightsComponent', () => {
  let component: ContentInsightsComponent
  let fixture: ComponentFixture<ContentInsightsComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [ContentInsightsComponent],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentInsightsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
