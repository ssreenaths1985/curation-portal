import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { EditMetaComponent } from './edit-meta.component'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'

describe('EditMetaComponent', () => {
  let component: EditMetaComponent
  let fixture: ComponentFixture<EditMetaComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [EditMetaComponent],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(EditMetaComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
