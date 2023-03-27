import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { InputV2Component } from './input-v2.component'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material'

describe('InputV2Component', () => {
  let component: InputV2Component
  let fixture: ComponentFixture<InputV2Component>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CUSTOM_ELEMENTS_SCHEMA, MatDialogModule],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: {} },
      ],
      declarations: [InputV2Component],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(InputV2Component)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
