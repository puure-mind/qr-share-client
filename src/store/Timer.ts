import { makeAutoObservable } from 'mobx';

class Timer {
  secondsPassed = 0;

  constructor() {
    makeAutoObservable(this);
  }

  increase(): void {
    this.secondsPassed += 1;
  }
}

const timer = new Timer();

export default timer;
