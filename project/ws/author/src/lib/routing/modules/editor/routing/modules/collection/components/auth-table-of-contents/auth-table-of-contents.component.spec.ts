import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { AuthTableOfContentsComponent } from './auth-table-of-contents.component'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'

describe('AuthTableOfContentsComponent', () => {
  let component: AuthTableOfContentsComponent
  let fixture: ComponentFixture<AuthTableOfContentsComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [AuthTableOfContentsComponent],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthTableOfContentsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
