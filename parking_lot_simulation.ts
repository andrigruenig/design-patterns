import { ParkingLot } from "./parking_lot.ts";
import type { ParkingLotEvent, Subscriber } from "./parking_lot.ts";

const maxFillIntervalMillis = 1000;
const maxEmptyIntervalMillis = 2000;
const initialFillPhaseMillis = 5000;

const sleep = (millis: number) => new Promise((r) => setTimeout(r, millis));

const rand = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1));

class Display implements Subscriber {
  public update(event: ParkingLotEvent) {
    const action = event.action === "entered" ? "entered" : "left";
    console.log(
      `A car ${action} the lot ${event.name}: ${event.occupied}/${event.capacity} occupied.`,
    );
  }
}

const fill = async (lot: ParkingLot) => {
  while (!lot.isFull()) {
    await sleep(rand(0, maxFillIntervalMillis));
    lot.enter();
  }
};

const empty = async (lot: ParkingLot) => {
  while (!lot.isEmpty()) {
    await sleep(rand(0, maxEmptyIntervalMillis));
    lot.exit();
  }
};

const bahnhofParking = new ParkingLot("Bahnhof Parking", 100);
const screen = new Display();
bahnhofParking.subscribe(screen);
const filler = fill(bahnhofParking);
await sleep(initialFillPhaseMillis);
const emptier = empty(bahnhofParking);
await filler;
await emptier;
