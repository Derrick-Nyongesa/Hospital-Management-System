import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { map } from 'rxjs/operators';
import { DoneService } from '../tasks-services/done.service';
import { Task } from '../task';
import { AngularFireDatabase } from '@angular/fire/database';

@Component({
  selector: 'app-done-task',
  templateUrl: './done-task.component.html',
  styleUrls: ['./done-task.component.css']
})
export class DoneTaskComponent implements OnInit {

  @Input() task?: Task;

  @Output() edit = new EventEmitter<Task>();
  done: Task[];
  len = 0;

  currentTask: Task = {
    title: '',
    owner: '',
    dateDue: 1,
    status: 'todo'
  };
  message = '';

  constructor(private service: DoneService, private db: AngularFireDatabase) { }

  ngOnInit(): void {
    this.message = '';
    this.retrieveDoneTasks();
  }

  // tslint:disable-next-line: use-lifecycle-interface
  ngOnChanges(): void{
    this.message = '';
    this.currentTask = { ...this.task};
  }


  deleteTask(): void{
    if (this.currentTask.key){
      this.service.delete(this.currentTask.key).then(() => {

        this.message = 'task deleted successfully!';
      }).catch(err => console.log(err));
    }
  }



  // tslint:disable-next-line: typedef
  retrieveDoneTasks(){
    this.service.getAll().snapshotChanges().pipe(
      map(changes => changes.map(c => ({
        key: c.payload.key, ...c.payload.val()
      })))
    ).subscribe(data => {
      this.done = data;
      this.len = this.done.length;
    });
  }
  // tslint:disable-next-line: typedef
  end(task: Task){
    this.service.delete(task.key);
  }

  // tslint:disable-next-line: typedef
  createTask(task: Task){
    this.service.create(task);
  }
  // tslint:disable-next-line: typedef
  clear(){
    this.service.clearAll();
  }
}
