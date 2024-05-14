import { Component, ViewChild } from '@angular/core';
import { BoardService } from '../../services/board.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Observable, Subject, filter, lastValueFrom, takeUntil } from 'rxjs';
import { CancelEvent, EditEvent, GridComponent, RemoveEvent, SaveEvent } from '@progress/kendo-angular-grid';
import { FormControl, FormGroup } from '@angular/forms';
import { TextBoxComponent } from '@progress/kendo-angular-inputs';

import {
  SVGIcon,
  cartIcon,
  anchorIcon,
  codeIcon,
} from "@progress/kendo-svg-icons";

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.css'
})
export class TasksComponent {

  //https://www.telerik.com/kendo-angular-ui/components/grid/editing/inline-editing/

  dataSource: any[] = [];
  @ViewChild('grid', { static: false }) grid!: GridComponent;
  private destroy$: Subject<void> = new Subject<void>();

  boardTitle: string = '';
  isEditingTitle: boolean;
  editedBoardTitle: string = '';

  boardModes: any[];
  isDashboardMode: boolean;
  defaultItem: any[];

  priority: any[];
  statusDataSource: any[];

  statusData: any[];
  priorityData: any[];
  dueDateData: any[];
  
  @ViewChild('boardTitleTextBox', {static: false}) boardTitleTextBox!: TextBoxComponent;

  constructor(
    private boardService: BoardService,
    private route: ActivatedRoute,
    private router: Router
  ) {

    this.isEditingTitle = false;
    this.isDashboardMode = false;

    this.statusData = [];
    this.priorityData = [];
    this.dueDateData = [];

    this.boardModes = [{
      ID: 1,
      Name: 'Tasks',
    }, {
      ID: 2,
      Name: 'Dashboard',
    }];

    this.defaultItem = this.boardModes.at(0)
    
    this.priority = [
      { name: 'High', value: 4 },
      { name: 'Urgent', value: 3 },
      { name: 'Normal', value: 2 },
      { name: 'Low', value: 1 }
    ];

    this.statusDataSource = [
      { value: 1, name: 'Active' },
      { value: 2, name: 'Pending' },
      { value: 3, name: 'Completed' },
      { value: 4, name: 'Delayed' }
    ];
    
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      if(this.grid?.data){
        this.updateGridData();
        this.calculateDashboardData();

        const id = this.route.snapshot.params['id'];
        this.boardService.getBoardTitleById(id).subscribe((title) => {
          this.boardTitle = title;
        });
      }
    });
  }

  ngOnInit(){
    this.fetchTaskData()
    const id = this.route.snapshot.params['id'];
    this.boardService.getBoardTitleById(id).subscribe((title) => {
      this.boardTitle = title;
    });
    this.calculateDashboardData();
  }

  async fetchTaskData() {
    const id = this.route.snapshot.params['id'];
    this.dataSource = await lastValueFrom(this.boardService.getTasksForBoard(id))
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public startEditingTitle(): void {
    this.isEditingTitle = true;
    this.editedBoardTitle = this.boardTitle;
    setTimeout(() => {
      if (this.boardTitleTextBox) {
        this.boardTitleTextBox.focus();
      }
    }, 0);
  }

  public editHandler(args: EditEvent): void {
    const group = new FormGroup({
        'subject': new FormControl(args.dataItem.subject),
        'status': new FormControl(args.dataItem.status),
        'priority': new FormControl(args.dataItem.priority),
        'dueDate': new FormControl(args.dataItem.dueDate ? new Date(args.dataItem.dueDate) : null),
        'completion': new FormControl(args.dataItem.completion)

    });

    args.sender.editRow(args.rowIndex, group);
  }
  public async saveHandler(args: SaveEvent): Promise<void> {
    await this.boardService.updateData(args.dataItem.id, args.formGroup.value).subscribe(() => {
      this.updateGridData();
    })
    args.sender.closeRow(args.rowIndex);
  }

  public cancelHandler(args: CancelEvent): void {
    args.sender.closeRow(args.rowIndex);
}

  public async removeHandler(args: RemoveEvent): Promise<void> {
    // this.editService.remove(args.dataItem);
    await this.boardService.removeData(args.dataItem.id).subscribe(() => {
      this.updateGridData();
    })
  }

  public updateGridData(): void {
    this.fetchTaskData();
    this.grid.data = this.dataSource
  }

  public onBlurIsAddingBoardSet(): void {
    this.boardTitleTextBox.value = '';
    this.isEditingTitle = false;
  }

  public async saveEditedTitle(): Promise<void>{
    const id = this.route.snapshot.params['id'];
    await this.boardService.updateBoardTitle(id, this.boardTitleTextBox.value).subscribe()

    this.boardService.getBoardTitleById(id).subscribe((title) => {
      this.boardTitle = title;
    });

    this.isEditingTitle = false;
  }

  public async deleteBoard(): Promise<void>{
    const id = this.route.snapshot.params['id'];
    await this.boardService.deleteBoard(id).subscribe()
    this.router.navigate([''])
  }

  public onSelectBoxChanged(event: any): void{
    // console.log(event.ID)
    // event.value = items.ID
    switch(event.ID){
      case 1: {
        this.isDashboardMode = false;
        break;
      }
      case 2: {
        this.isDashboardMode = true;
        break;
      }
      default: {
        break;
      }
    }
  }

  getStatusName(value: number): string {
    const status = this.statusDataSource.find(s => s.value === value);
    return status ? status.name : 'Unknown';
  }
  
  getPriorityName(value: number): string {
    const priority = this.priority.find(p => p.value === value);
    return priority ? priority.name : 'Unknown';
  }

  private calculateDashboardData(): void{
    this.calculatePriorityData();
    this.calculateDueDateData();
    this.calculateStatusData();
  }

  private async calculatePriorityData() {
    const id = this.route.snapshot.params['id'];
    try {
      const tasks = (await this.boardService.getTasksForBoard(id).toPromise()) ?? [];
      const prioritiesCount: { [key: string]: number } = {
        High: 0,
        Urgent: 0,
        Normal: 0,
        Low: 0
      };

      tasks.forEach(task => {
        switch (task.priority) {
          case 1:
            prioritiesCount['Low']++;
            break;
          case 2:
            prioritiesCount['Normal']++;
            break;
          case 3:
            prioritiesCount['Urgent']++;
            break;
          case 4:
            prioritiesCount['High']++;
            break;
          default:
            break;
        }
      });

      this.priorityData = Object.keys(prioritiesCount).map(key => ({
        name: key,
        value: prioritiesCount[key]
      }));

    } catch (error) {
      console.error('Failed to fetch tasks for board', error);
    }
  }

  private async calculateStatusData() {
    const id = this.route.snapshot.params['id'];
    try {
      const tasks = (await this.boardService.getTasksForBoard(id).toPromise()) ?? [];
      const statusCount: { [key: string]: number } = {
        Active: 0,
        Pending: 0,
        Completed: 0,
        Delayed: 0
      };

      tasks.forEach(task => {
        switch (task.status) {
          case 1:
            statusCount['Active']++;
            break;
          case 2:
            statusCount['Pending']++;
            break;
          case 3:
            statusCount['Completed']++;
            break;
          case 4:
            statusCount['Delayed']++;
            break;
          default:
            break;
        }
      });

      this.statusData = Object.keys(statusCount).map(key => ({
        name: key,
        value: statusCount[key]
      }));
    } catch (error) {
      console.error('Failed to fetch tasks for board', error);
    }
  }

  private async calculateDueDateData() {
    const id = this.route.snapshot.params['id'];
    try {
      const tasks = (await this.boardService.getTasksForBoard(id).toPromise()) ?? [];
      const dueDateCounts: { [key: string]: number } = {};

      tasks.forEach(task => {
        const dueDate = task.dueDate.split('T')[0];
        if (dueDateCounts[dueDate]) {
          dueDateCounts[dueDate]++;
        } else {
          dueDateCounts[dueDate] = 1;
        }
      });

      this.dueDateData = Object.keys(dueDateCounts).map(date => ({
        date,
        count: dueDateCounts[date]
      }));

      console.log(this.dueDateData);
    } catch (error) {
      console.error('Failed to fetch tasks for board', error);
    }
  }

  public labelContentPieChart(e: any): string {
    return `${e.dataItem.name}: ${e.value}`;
  }

  async addRow() {
    console.log("asd")
    const boardId = this.route.snapshot.params['id'];
    await this.boardService.addData(boardId, '').subscribe()
    this.updateGridData();
  }
}
