import { TestBed } from '@angular/core/testing'
import { DraggableHelperDirective } from './draggable-helper.directive'
import { ViewContainerRef, TemplateRef } from '@angular/core'
import { DraggableDirective } from './draggable.directive'
import { Overlay } from '@angular/cdk/overlay'
class TestViewContainerRef extends ViewContainerRef {
  get element(): import('@angular/core').ElementRef<any> {
    throw new Error('Method not implemented.')
  }
  get injector(): import('@angular/core').Injector {
    throw new Error('Method not implemented.')
  }
  get parentInjector(): import('@angular/core').Injector {
    throw new Error('Method not implemented.')
  }
  clear(): void {
    throw new Error('Method not implemented.')
  }
  get(_index: number): import('@angular/core').ViewRef {
    throw new Error('Method not implemented.')
  }
  get length(): number {
    throw new Error('Method not implemented.')
  }
  // tslint:disable-next-line: max-line-length
  createEmbeddedView<C>(_templateRef: import('@angular/core').TemplateRef<C>, _context?: C, _index?: number): import('@angular/core').EmbeddedViewRef<C> {
    throw new Error('Method not implemented.')
  }
  // tslint:disable-next-line: max-line-length
  createComponent<C>(_componentFactory: import('@angular/core').ComponentFactory<C>, _index?: number, _injector?: import('@angular/core').Injector, _projectableNodes?: any[][], _ngModule?: import('@angular/core').NgModuleRef<any>): import('@angular/core').ComponentRef<C> {
    throw new Error('Method not implemented.')
  }
  insert(_viewRef: import('@angular/core').ViewRef, _index?: number): import('@angular/core').ViewRef {
    throw new Error('Method not implemented.')
  }
  move(_viewRef: import('@angular/core').ViewRef, _currentIndex: number): import('@angular/core').ViewRef {
    throw new Error('Method not implemented.')
  }
  indexOf(_viewRef: import('@angular/core').ViewRef): number {
    throw new Error('Method not implemented.')
  }
  remove(_index?: number): void {
    throw new Error('Method not implemented.')
  }
  detach(_index?: number): import('@angular/core').ViewRef {
    throw new Error('Method not implemented.')
  }

}
describe('DraggableHelperDirective', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [DraggableDirective, Overlay, TestViewContainerRef, TemplateRef],
  }))
  it('should create an instance', () => {
    const directive = TestBed.get(DraggableHelperDirective)
    // const directive = new DraggableHelperDirective(
    //   DraggableDirective, new TemplateRef(), new TestViewContainerRef(), new Overlay({}))
    expect(directive).toBeTruthy()
  })
})
