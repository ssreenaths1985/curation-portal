import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { ListOfUsersComponent } from './list-of-users.component'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'

describe('ListOfUsersComponent', () => {
  let component: ListOfUsersComponent
  let fixture: ComponentFixture<ListOfUsersComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [ListOfUsersComponent],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ListOfUsersComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
