import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { DraftDialogComponent } from './draft-dialog.component'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { ReactiveFormsModule, FormsModule } from '@angular/forms'
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material'

describe('DraftDialogComponent', () => {
  let component: DraftDialogComponent
  let fixture: ComponentFixture<DraftDialogComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DraftDialogComponent],
      imports: [
        CUSTOM_ELEMENTS_SCHEMA,
        ReactiveFormsModule,
        FormsModule,
        MatDialogModule,
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: {} },
      ],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(DraftDialogComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
