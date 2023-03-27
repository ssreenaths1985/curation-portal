import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { IprDialogComponent } from './ipr-dialog.component'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'

describe('IprDialogComponent', () => {
  let component: IprDialogComponent
  let fixture: ComponentFixture<IprDialogComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [IprDialogComponent],
      imports: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: {} },
      ],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(IprDialogComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
