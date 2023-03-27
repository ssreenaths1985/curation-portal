import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { LogoutComponent } from './logout.component'
import { MatDialogRef } from '@angular/material'
import { KeycloakService } from 'keycloak-angular'
import { HttpClient, HttpHandler } from '@angular/common/http'

describe('LogoutComponent', () => {
  let component: LogoutComponent
  let fixture: ComponentFixture<LogoutComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LogoutComponent],
      providers: [KeycloakService, HttpClient, HttpHandler,
        { provide: MatDialogRef, useValue: {} },
      ],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(LogoutComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })
  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
