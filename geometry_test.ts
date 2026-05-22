import { RectangleAdapter, Square } from "./geometry.ts";
import { Calculator } from "./geometry_third_party.ts";
import { assertEquals } from "@std/assert";

Deno.test("RectangleAdapter adapts Quadratic as a Rectangular object", () => {
  const square = new Square(3);
  const adapted = new RectangleAdapter(square);
  assertEquals(Calculator.getArea(adapted), 9);
  assertEquals(Calculator.getWidthHeightRatio(adapted), 1);
  assertEquals(Calculator.getPerimeter(adapted), 12);
  assertEquals(Calculator.getDiagonal(adapted), Math.sqrt(18));
});
