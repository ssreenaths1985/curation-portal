import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { ContentInsightsRainComponent } from './content-insights-rain.component'

describe('ContentInsightsRainComponent', () => {
  let component: ContentInsightsRainComponent
  let fixture: ComponentFixture<ContentInsightsRainComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ContentInsightsRainComponent],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentInsightsRainComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
