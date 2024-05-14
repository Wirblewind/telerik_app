import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, lastValueFrom, map, tap } from 'rxjs';
import { guid } from '@progress/kendo-angular-common';

@Injectable({
  providedIn: 'root'
})
export class BoardService {

  private apiUrl = 'http://localhost:3000'; // Pfad zur API
  private boardsSubject = new BehaviorSubject<any[]>([]);
  public boards$ = this.boardsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadInitialData();
  }

  private loadInitialData() {
    this.http.get<any[]>(this.apiUrl + '/boards').subscribe(data => {
      this.boardsSubject.next(data);
    }, error => {
      console.error('Failed to load initial board data', error);
    });
  }

  // update: (key, values) => {
  //   return lastValueFrom(
  //     this.httpClient.patch(`http://localhost:3000/tasks/${encodeURIComponent(key)}`, values)
  //   ).then(() => {
  //     this.calculateDashboardData();
  //   })
  //   .catch(() => { throw 'Update failed' });
  // }

  public updateData(id: string, values: any): Observable<any> {
    // dave due date in the format of "2023-05-15", not like a dataobject "2023-05-15T00:00:00.000Z"
    if (values.dueDate instanceof Date) {
      values.dueDate = values.dueDate.toISOString().split('T')[0];
    }
    return this.http.patch(`http://localhost:3000/tasks/${encodeURIComponent(id)}`, values)
    // ).then(() => {
    //   // this.calculateDashboardData();
    // })
    // .catch(() => { throw 'Update failed' });
    
  }

  // remove: async (key) => {
  //   await lastValueFrom(
  //     this.httpClient.delete(`http://localhost:3000/tasks/${encodeURIComponent(key)}`)
  //   ).then(() => {
  //     this.calculateDashboardData();
  //   })
  //   .catch(() => { throw 'Deletion failed' });
  // },

  public removeData(id: string): Observable<any>{
    return this.http.delete(`http://localhost:3000/tasks/${encodeURIComponent(id)}`)
  }


  public getTasksForBoard(boardId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/tasks?boardId=${boardId}`);
  }

  public refreshData() {
    console.log("should refrash data now")
    this.loadInitialData()
  }

  public getBoardTitleById(boardId: string): Observable<string> {
    return this.boards$.pipe(
      map(boards => boards.find(board => board.id === boardId)),
      map(board => board ? board.name : '')
    );
  }

  public updateBoardTitle(boardId: string, newName: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/boards/${boardId}`, { name: newName }).pipe(
      tap(() => {
        // Nachdem die Aktualisierung erfolgreich war, aktualisiere die Daten in boardsSubject
        const updatedBoards = this.boardsSubject.value.map(board => {
          if (board.id === boardId) {
            return { ...board, name: newName };
          }
          return board;
        });
        this.boardsSubject.next(updatedBoards);
      })
    );
  }

  createBoard(board: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/boards`, board).pipe(
      tap((newBoard) => {
        this.boardsSubject.next([...this.boardsSubject.value, newBoard]);
      }),
      catchError(error => {
        console.error('Insertion failed', error);
        throw 'Insertion failed';
      })
    );
  }

  deleteBoard(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/boards/${id}`).pipe(
      tap(() => {
        this.boardsSubject.next(this.boardsSubject.value.filter(board => board.id !== id));
      }),
      catchError(error => {
        console.error('Deletion failed', error);
        throw 'Deletion failed';
      })
    );
  }

  // insert: (values) => {
  //   const boardId = this.route.snapshot.params['id'];
  //   return lastValueFrom(
  //     this.httpClient.post(`http://localhost:3000/tasks`, { ...values, boardId })
  //   ).then(() => {
  //     this.calculateDashboardData();
  //   })
  //   .catch(() => { throw 'Insertion failed' });
  // },

  public addData(id: string, values: any): Observable<any> {
    // dave due date in the format of "2023-05-15", not like a dataobject "2023-05-15T00:00:00.000Z"

    console.log("bla")
    const newTaskValues = {
      boardId: id, // Example default, or use an empty string if needed
      subject: null, // Default to an empty string if no subject is provided
      status: null, // Default status
      priority: null, // Default priority
      dueDate: null,
      completion: null // Default completion
    };
    
    if (values.dueDate instanceof Date) {
      values.dueDate = values.dueDate.toISOString().split('T')[0];
    }
    return this.http.post(`http://localhost:3000/tasks`, { ...newTaskValues })
    // ).then(() => {
    //   // this.calculateDashboardData();
    // })
    // .catch(() => { throw 'Update failed' });
    
  }
}
