import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { PageEditorComponent } from './page-editor.component'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'

describe('PageEditorComponent', () => {
  let component: PageEditorComponent
  let fixture: ComponentFixture<PageEditorComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [PageEditorComponent],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(PageEditorComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
