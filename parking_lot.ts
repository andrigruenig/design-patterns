export type ParkingLotEvent = Readonly<{
  action: "entered" | "left";
  name: string;
  occupied: number;
  capacity: number;
}>;

export interface Subscriber {
  update(event: ParkingLotEvent): void;
}

export interface Publisher {
  subscribe(subscriber: Subscriber): void;
  unsubscribe(subscriber: Subscriber): void;
}

export class ParkingLot implements Publisher {
  public occupied: number = 0;
  private subscribers: Subscriber[] = [];

  constructor(
    public name: string,
    public capacity: number,
  ) {}

  public subscribe(subscriber: Subscriber) {
    this.subscribers.push(subscriber);
  }

  public unsubscribe(subscriber: Subscriber) {
    this.subscribers = this.subscribers.filter((item) => item !== subscriber);
  }

  public enter() {
    if (!this.isFull()) {
      this.occupied++;
      this.notify("entered");
    } else {
      throw new Error(`the parking lot is full`);
    }
  }

  public exit() {
    if (!this.isEmpty()) {
      this.occupied--;
      this.notify("left");
    } else {
      throw new Error(`the parking lot is empty`);
    }
  }

  public isFull() {
    return this.occupied == this.capacity;
  }

  public isEmpty() {
    return this.occupied == 0;
  }

  private notify(action: ParkingLotEvent["action"]) {
    const event: ParkingLotEvent = {
      action,
      name: this.name,
      occupied: this.occupied,
      capacity: this.capacity,
    };
    for (const subscriber of this.subscribers) {
      subscriber.update(event);
    }
  }
}
