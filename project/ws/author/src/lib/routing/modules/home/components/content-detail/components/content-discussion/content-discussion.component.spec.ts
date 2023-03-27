import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { ContentDiscussionComponent } from './content-discussion.component'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'

describe('ContentDiscussionComponent', () => {
  let component: ContentDiscussionComponent
  let fixture: ComponentFixture<ContentDiscussionComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [ContentDiscussionComponent],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentDiscussionComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
