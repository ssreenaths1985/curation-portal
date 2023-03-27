import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { ViewReviewCommentDialogComponent } from './view-review-comment-dialog.component'

describe('ViewReviewCommentDialogComponent', () => {
  let component: ViewReviewCommentDialogComponent
  let fixture: ComponentFixture<ViewReviewCommentDialogComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ViewReviewCommentDialogComponent],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewReviewCommentDialogComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
