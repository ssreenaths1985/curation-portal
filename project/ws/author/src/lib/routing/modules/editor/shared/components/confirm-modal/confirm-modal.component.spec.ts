import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { ConfirmModalComponent } from './confirm-modal.component'
import { MatDialogRef } from '@angular/material'

describe('ConfirmModalComponent', () => {
  let component: ConfirmModalComponent
  let fixture: ComponentFixture<ConfirmModalComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ConfirmModalComponent],
      providers: [MatDialogRef],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmModalComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })
  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
