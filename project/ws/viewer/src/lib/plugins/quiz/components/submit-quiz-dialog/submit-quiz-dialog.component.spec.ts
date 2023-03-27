import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { SubmitQuizDialogComponent } from './submit-quiz-dialog.component'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material'

describe('SubmitQuizDialogComponent', () => {
  let component: SubmitQuizDialogComponent
  let fixture: ComponentFixture<SubmitQuizDialogComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SubmitQuizDialogComponent],
      imports: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [{ provide: MAT_DIALOG_DATA, useValue: {} },
      { provide: MatDialogRef, useValue: {} },
      ],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(SubmitQuizDialogComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
