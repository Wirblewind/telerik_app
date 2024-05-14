import { Component, ElementRef, ViewChild } from '@angular/core';
import { BoardService } from '../../services/board.service';
import { Router } from '@angular/router';
import { tellAFriendBoxIcon } from '@progress/kendo-svg-icons';
import { DrawerComponent } from '@progress/kendo-angular-layout';
import { TextBoxComponent } from '@progress/kendo-angular-inputs';

@Component({
  selector: 'app-side-navigation-menu',
  templateUrl: './side-navigation-menu.component.html',
  styleUrl: './side-navigation-menu.component.css'
})
export class SideNavigationMenuComponent {

  @ViewChild('drawer', {static: false}) drawer!: DrawerComponent;

  @ViewChild('boardTitleTextBox', {static: false}) boardTitleTextBox!: TextBoxComponent;

  isAddingBoard: boolean;

  private _items!: any[];
  get items() {
    return this._items;
  }

  constructor(private elementRef: ElementRef, private boardService: BoardService, private router: Router) {
    this.isAddingBoard = false;
  }

  private _homeNavigation: any[] = [];


  get homeNavigation() {
    return this._homeNavigation;
  }

  ngOnInit(): void {

    this._homeNavigation.push({
      text: 'Home',
      url: '/home'
    })
    
    this.boardService.boards$.subscribe(boards => {
      this._items = boards.map(board => ({
        text: board.name,
        url: `/boards/${board.id}`,
      }));

    });
  }

  public onNodeClick(event: any): void {
    const item = event.item.dataItem;
    if (item.url) {
      this.router.navigate([item.url]);
    }
  }

  public onHomeClick(): void {
    this.router.navigate(['/home']);
  }

  public startAddingBoard(): void {
    this.isAddingBoard = true;
  }

  public onBlurIsAddingBoardSet(): void {
    this.isAddingBoard = false;
  }

  public async createNewBoard(pressedKey: any): Promise<void> {
    if (pressedKey.key==="Enter") {
      await this.boardService.createBoard({name: this.boardTitleTextBox.value}).subscribe()
      this.isAddingBoard = false;
    }
  }
}
