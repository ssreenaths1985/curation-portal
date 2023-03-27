import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { AddUsersFormMetaComponent } from './add-users-form-meta.component'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'

describe('AddUsersFormMetaComponent', () => {
  let component: AddUsersFormMetaComponent
  let fixture: ComponentFixture<AddUsersFormMetaComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [AddUsersFormMetaComponent],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AddUsersFormMetaComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
