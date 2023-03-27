import { TestBed } from '@angular/core/testing'

import { WidgetResolverService } from './widget-resolver.service'
import { ComponentFactoryResolver } from '@angular/core'
import { DomSanitizer } from '@angular/platform-browser'
import { WIDGET_RESOLVER_GLOBAL_CONFIG, WIDGET_RESOLVER_SCOPED_CONFIG } from './widget-resolver.constant'

describe('WidgetResolverService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      DomSanitizer,
      ComponentFactoryResolver,
      { provide: WIDGET_RESOLVER_GLOBAL_CONFIG },
      { provide: WIDGET_RESOLVER_SCOPED_CONFIG },
    ],
    imports: [],
    declarations: [],
  }))

  it('should be created', () => {
    const service: WidgetResolverService = TestBed.get(WidgetResolverService)
    expect(service).toBeTruthy()
  })
})
