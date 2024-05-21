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

  public updateData(id: string, values: any): Observable<any> {
    if (values.dueDate instanceof Date) {
      values.dueDate = values.dueDate.toISOString().split('T')[0];
    }
    return this.http.patch(`http://localhost:3000/tasks/${encodeURIComponent(id)}`, values)
    
  }

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

  public addData(id: string, values: any): Observable<any> {
    console.log("bla")
    const newTaskValues = {
      boardId: id,
      subject: null,
      status: null,
      priority: null,
      dueDate: null,
      completion: null
    };
    
    if (values.dueDate instanceof Date) {
      values.dueDate = values.dueDate.toISOString().split('T')[0];
    }
    return this.http.post(`http://localhost:3000/tasks`, { ...newTaskValues })
    
  }
}
