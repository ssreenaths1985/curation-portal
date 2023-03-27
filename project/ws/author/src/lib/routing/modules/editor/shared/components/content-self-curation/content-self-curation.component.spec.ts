import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { ContentSelfCurationComponent } from './content-self-curation.component'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'

describe('ContentSelfCurationComponent', () => {
  let component: ContentSelfCurationComponent
  let fixture: ComponentFixture<ContentSelfCurationComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ContentSelfCurationComponent],
      imports: [CUSTOM_ELEMENTS_SCHEMA],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentSelfCurationComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
