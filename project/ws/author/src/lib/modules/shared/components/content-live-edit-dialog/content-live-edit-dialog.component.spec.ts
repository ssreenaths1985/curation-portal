import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { ContentLiveEditDialogComponent } from './content-live-edit-dialog.component'

describe('ContentLiveEditDialogComponent', () => {
  let component: ContentLiveEditDialogComponent
  let fixture: ComponentFixture<ContentLiveEditDialogComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ContentLiveEditDialogComponent],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentLiveEditDialogComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
