import { Pipe, PipeTransform } from '@angular/core'

@Pipe({ name: 'usrSerch' })
export class UserFilterPipe implements PipeTransform {
  public transform(users: any[], searchText: any): any {
    if (searchText == null || users == null) {
      return users
    }
    return users.filter(hero => hero.name.toLowerCase().indexOf(searchText.toLowerCase()) !== -1)
  }
}
