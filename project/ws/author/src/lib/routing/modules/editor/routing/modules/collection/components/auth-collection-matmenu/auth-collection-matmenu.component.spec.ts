import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { AuthCollectionMatmenuComponent } from './auth-collection-matmenu.component'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'

describe('AuthCollectionMatmenuComponent', () => {
  let component: AuthCollectionMatmenuComponent
  let fixture: ComponentFixture<AuthCollectionMatmenuComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [AuthCollectionMatmenuComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthCollectionMatmenuComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
