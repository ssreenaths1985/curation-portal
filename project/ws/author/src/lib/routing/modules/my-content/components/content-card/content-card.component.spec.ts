import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { ContentCardComponent } from './content-card.component'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'

describe('ContentCardComponent', () => {
  let component: ContentCardComponent
  let fixture: ComponentFixture<ContentCardComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [ContentCardComponent],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentCardComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
