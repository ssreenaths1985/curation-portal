import { Directive, ElementRef, HostListener } from '@angular/core'

@Directive({
  selector: '[wsAuthNoSpecialChar]',
})
export class NoSpecialCharDirective {

  constructor(private _el: ElementRef) { }

  @HostListener('input', ['$event']) onInputChange(event: any) {
    const initalValue = this._el.nativeElement.value
    const noSpecialChar = new RegExp(/[&\#,+@`~%^"=;*?<>{}|]/g)
    this._el.nativeElement.value = initalValue.replace(noSpecialChar, '')
    if (initalValue !== this._el.nativeElement.value) {
      event.stopPropagation()
    }
  }

}
